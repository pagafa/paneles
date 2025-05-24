
'use server';

import { NextResponse } from 'next/server';
import { getClassesDb, getAnnouncementsDb, getSchoolEventsDb } from '@/lib/db';
import type { SchoolClass } from '@/types';

// GET a single class by ID
export async function GET(request: Request, { params }: { params: { classId: string } }) {
  try {
    if (!params.classId) {
      return NextResponse.json({ message: 'Class ID is required' }, { status: 400 });
    }
    const db = await getClassesDb();
    const schoolClass = await db.findOne({ id: params.classId });
    
    if (schoolClass) {
      // Password and passwordProtected logic removed. Just return the class object.
      return NextResponse.json(schoolClass);
    }
    return NextResponse.json({ message: 'Class not found' }, { status: 404 });
  } catch (error) {
    console.error(`[API GET /api/classes/${params.classId}] Error:`, error);
    return NextResponse.json({ message: 'Error fetching class', error: (error as Error).message }, { status: 500 });
  }
}

// PUT (update) a class
export async function PUT(request: Request, { params }: { params: { classId: string } }) {
  try {
    const classId = params.classId;
    if (!classId) {
        return NextResponse.json({ message: 'Class ID is required' }, { status: 400 });
    }

    const requestBody: Partial<Omit<SchoolClass, 'id'>> = await request.json();
    // console.log(`[API PUT /api/classes/${classId}] Request body:`, requestBody);
    
    const updatePayload: Partial<SchoolClass> = {};
    
    if (requestBody.name !== undefined) updatePayload.name = requestBody.name;
    if (requestBody.delegateId !== undefined) {
        updatePayload.delegateId = requestBody.delegateId === "" ? undefined : requestBody.delegateId;
    }
    // Language field was removed
    // Password field was removed
    if (requestBody.isHidden !== undefined) {
      updatePayload.isHidden = requestBody.isHidden;
    }
    
    // console.log(`[API PUT /api/classes/${classId}] Update payload to NeDB:`, updatePayload);

    if (Object.keys(updatePayload).length === 0) {
        const dbCheck = await getClassesDb();
        const existingDoc = await dbCheck.findOne({ id: classId });
        if(existingDoc) {
            return NextResponse.json(existingDoc);
        }
        return NextResponse.json({ message: 'No updatable fields provided or class not found' }, { status: 400 });
    }

    const db = await getClassesDb();
    const numAffected = await db.update({ id: classId }, { $set: updatePayload });
    // console.log(`[API PUT /api/classes/${classId}] NeDB numAffected:`, numAffected);


    if (numAffected === 0) {
      const existingClass = await db.findOne({ id: classId });
      if (!existingClass) {
        console.error(`[API PUT /api/classes/${classId}] Update failed: Class not found after attempting update.`);
        return NextResponse.json({ message: 'Class not found, cannot update' }, { status: 404 });
      }

      let noMeaningfulChange = true;
      if (updatePayload.name !== undefined && updatePayload.name !== existingClass.name) noMeaningfulChange = false;
      if (updatePayload.delegateId !== undefined && updatePayload.delegateId !== existingClass.delegateId) noMeaningfulChange = false;
      if (updatePayload.isHidden !== undefined && updatePayload.isHidden !== existingClass.isHidden) noMeaningfulChange = false; 

      if (noMeaningfulChange) {
        // console.log(`[API PUT /api/classes/${classId}] No meaningful changes detected. Returning existing class.`);
        return NextResponse.json(existingClass);
      } else {
        // console.warn(`[API PUT /api/classes/${classId}] NeDB reported 0 affected, but changes were intended. Merging and returning.`);
        // This case means we attempted to set a value to its current value.
        // The data is effectively "updated" to the intended state.
        return NextResponse.json({ ...existingClass, ...updatePayload });
      }
    }

    const updatedClass = await db.findOne({ id: classId });
    if (!updatedClass) {
        console.error(`[API PUT /api/classes/${classId}] Class updated in DB but failed to retrieve for response.`);
        return NextResponse.json({ message: 'Class updated but failed to retrieve' }, { status: 500 });
    }
    // console.log(`[API PUT /api/classes/${classId}] Successfully updated and returning:`, updatedClass);
    return NextResponse.json(updatedClass);

  } catch (error) {
    console.error(`[API PUT /api/classes/${params.classId}] Error:`, error);
    return NextResponse.json({ message: 'Error updating class', error: (error as Error).message }, { status: 500 });
  }
}

// DELETE a class
export async function DELETE(request: Request, { params }: { params: { classId: string } }) {
  try {
    const classIdToDelete = params.classId;
    if (!classIdToDelete) {
        return NextResponse.json({ message: 'Class ID is required' }, { status: 400 });
    }
    const classesDb = await getClassesDb();
    const announcementsDb = await getAnnouncementsDb();
    const schoolEventsDb = await getSchoolEventsDb();

    // Remove this classId from any announcements targeting it
    const announcementsToUpdate = await announcementsDb.find({ targetClassIds: classIdToDelete });
    for (const ann of announcementsToUpdate) {
      const newTargetClassIds = ann.targetClassIds.filter(id => id !== classIdToDelete);
      if (newTargetClassIds.length > 0) {
        await announcementsDb.update({ id: ann.id }, { $set: { targetClassIds: newTargetClassIds } });
      } else {
        // If an announcement becomes orphaned, it's now invalid by new rules.
        // Admin will need to re-assign or delete. We update it to an empty array.
        await announcementsDb.update({ id: ann.id }, { $set: { targetClassIds: [] } });
      }
      // console.log(`[API DELETE /api/classes/${classIdToDelete}] Updated announcement ${ann.id}. New targets: ${newTargetClassIds.join(', ')}`);
    }

    // Delete school events (exams, deadlines) associated with this class
    const numEventsRemoved = await schoolEventsDb.remove({ classId: classIdToDelete }, { multi: true });
    if (numEventsRemoved > 0) {
      // console.log(`[API DELETE /api/classes/${classIdToDelete}] Removed ${numEventsRemoved} school events associated with this class.`);
    }

    // Finally, delete the class itself
    const numRemoved = await classesDb.remove({ id: classIdToDelete }, {});

    if (numRemoved === 0) {
      return NextResponse.json({ message: 'Class not found' }, { status: 404 });
    }
    // console.log(`[API DELETE /api/classes/${classIdToDelete}] Class deleted successfully and references updated.`);
    return NextResponse.json({ message: 'Class deleted successfully and related data (announcements, school events) updated/removed.' }, { status: 200 });
  } catch (error) {
    console.error(`[API DELETE /api/classes/${params.classId}] Error:`, error);
    return NextResponse.json({ message: 'Error deleting class', error: (error as Error).message }, { status: 500 });
  }
}
