
'use server';

import { NextResponse } from 'next/server';
import { getAnnouncementsDb, getClassesDb } from '@/lib/db'; // Added getClassesDb
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

    if (!requestBody.targetClassIds || !Array.isArray(requestBody.targetClassIds) || requestBody.targetClassIds.length === 0) {
        return NextResponse.json({ message: 'targetClassIds must be a non-empty array' }, { status: 400 });
    }

    // Verify that all target classes still exist
    const classesDb = await getClassesDb();
    const nonExistentClassIds: string[] = [];
    for (const classId of requestBody.targetClassIds) {
        const schoolClass = await classesDb.findOne({ id: classId });
        if (!schoolClass) {
            nonExistentClassIds.push(classId);
        }
    }

    if (nonExistentClassIds.length > 0) {
        const errorMessage = `Cannot update announcement. The following target class IDs do not exist: ${nonExistentClassIds.join(', ')}. Please remove them or ensure they are valid classes.`;
        return NextResponse.json({ 
            message: errorMessage,
            error: 'Invalid target classes' 
        }, { status: 400 });
    }

    const updatePayload: Partial<Announcement> = {};
    if (requestBody.title !== undefined) updatePayload.title = requestBody.title;
    if (requestBody.content !== undefined) updatePayload.content = requestBody.content;
    if (requestBody.date !== undefined) updatePayload.date = requestBody.date;
    
    updatePayload.targetClassIds = requestBody.targetClassIds; // Already validated
    updatePayload.type = 'announcement'; // Ensure type is not changed

    const db = await getAnnouncementsDb();
    const numAffected = await db.update({ id: appLevelId }, { $set: updatePayload });

    if (numAffected === 0) {
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

    const updatedAnnouncement = await db.findOne({ id: appLevelId });
    if (!updatedAnnouncement) {
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
