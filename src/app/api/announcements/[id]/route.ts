
'use server';

import { NextResponse } from 'next/server';
import { getAnnouncementsDb } from '@/lib/db';
import type { Announcement } from '@/types';

// GET a single announcement by ID (our app-level ID)
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    if (!params.id) {
      return NextResponse.json({ message: 'Announcement ID is required' }, { status: 400 });
    }
    const db = await getAnnouncementsDb();
    const announcement = await db.findOne({ id: params.id });
    
    if (announcement) {
      return NextResponse.json(announcement);
    }
    return NextResponse.json({ message: 'Announcement not found' }, { status: 404 });
  } catch (error) {
    console.error(`Error fetching announcement ${params.id}:`, error);
    return NextResponse.json({ message: 'Error fetching announcement', error: (error as Error).message }, { status: 500 });
  }
}

// PUT (update) an announcement
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const appLevelId = params.id;
    if (!appLevelId) {
        return NextResponse.json({ message: 'Announcement ID is required' }, { status: 400 });
    }

    const requestBody: Partial<Omit<Announcement, 'id' | 'type'>> & { targetClassIds?: string[] } = await request.json();

    // Construct payload for $set, only including fields that are allowed to be updated
    const updatePayload: Partial<Announcement> = {};
    if (requestBody.title !== undefined) updatePayload.title = requestBody.title;
    if (requestBody.content !== undefined) updatePayload.content = requestBody.content;
    if (requestBody.date !== undefined) updatePayload.date = requestBody.date;
    // Ensure targetClassIds are included in the update payload if provided
    // Since targetClassIds is required by the form (min 1), it should always be in requestBody for updates.
    if (requestBody.targetClassIds !== undefined) {
        if (!Array.isArray(requestBody.targetClassIds) || requestBody.targetClassIds.length === 0) {
            return NextResponse.json({ message: 'targetClassIds must be a non-empty array' }, { status: 400 });
        }
        updatePayload.targetClassIds = requestBody.targetClassIds;
    } else {
        // This case should ideally not be reached if the form enforces targetClassIds
        return NextResponse.json({ message: 'targetClassIds is required and was not provided' }, { status: 400 });
    }
    
    // Ensure type is not changed
    updatePayload.type = 'announcement';


    if (Object.keys(updatePayload).length === 1 && updatePayload.type === 'announcement' && !updatePayload.targetClassIds) { 
        // Only type was in payload and no targetClassIds (effectively no actual change if other fields didn't change)
        const dbCheck = await getAnnouncementsDb();
        const existingDoc = await dbCheck.findOne({ id: appLevelId });
        if(existingDoc) return NextResponse.json(existingDoc); // Return existing doc if no real fields changed
        return NextResponse.json({ message: 'No updatable fields provided or announcement not found' }, { status: 400 });
    }


    const db = await getAnnouncementsDb();
    // Update the document with the given appLevelId
    // NeDB's update returns the number of documents updated.
    const numAffected = await db.update({ id: appLevelId }, { $set: updatePayload });

    if (numAffected === 0) {
      // Check if it was an attempt to set identical data
      const existingDoc = await db.findOne({ id: appLevelId });
      if (existingDoc) {
        let noMeaningfulChange = true;
        if (updatePayload.title !== undefined && updatePayload.title !== existingDoc.title) noMeaningfulChange = false;
        if (updatePayload.content !== undefined && updatePayload.content !== existingDoc.content) noMeaningfulChange = false;
        if (updatePayload.date !== undefined && updatePayload.date !== existingDoc.date) noMeaningfulChange = false;
        if (updatePayload.targetClassIds && 
            JSON.stringify(updatePayload.targetClassIds.sort()) !== JSON.stringify(existingDoc.targetClassIds.sort())) {
             noMeaningfulChange = false;
        }
        if (noMeaningfulChange) return NextResponse.json(existingDoc);
      }
      return NextResponse.json({ message: 'Announcement not found or no changes made' }, { status: 404 });
    }

    // Fetch the updated document to return it
    const updatedAnnouncement = await db.findOne({ id: appLevelId });
    if (!updatedAnnouncement) {
         // Should not happen if numAffected > 0, but as a safeguard
        return NextResponse.json({ message: 'Announcement updated but failed to retrieve' }, { status: 500 });
    }
    return NextResponse.json(updatedAnnouncement);

  } catch (error) {
    console.error(`Error updating announcement ${params.id}:`, error);
    return NextResponse.json({ message: 'Error updating announcement', error: (error as Error).message }, { status: 500 });
  }
}

// DELETE an announcement
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const appLevelId = params.id;
    if (!appLevelId) {
        return NextResponse.json({ message: 'Announcement ID is required' }, { status: 400 });
    }
    const db = await getAnnouncementsDb();
    // NeDB's remove returns the number of documents removed.
    const numRemoved = await db.remove({ id: appLevelId }, {});

    if (numRemoved === 0) {
      return NextResponse.json({ message: 'Announcement not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Announcement deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error(`Error deleting announcement ${params.id}:`, error);
    return NextResponse.json({ message: 'Error deleting announcement', error: (error as Error).message }, { status: 500 });
  }
}
