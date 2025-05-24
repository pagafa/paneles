
'use server';

import { NextResponse } from 'next/server';
import { getClassesDb, getAnnouncementsDb, getSchoolEventsDb } from '@/lib/db';
import type { SchoolClass } from '@/types';

// GET a single class by ID (using classId from params)
export async function GET(request: Request, { params }: { params: { classId: string } }) {
  try {
    if (!params.classId) {
      return NextResponse.json({ message: 'Class ID is required' }, { status: 400 });
    }
    const db = await getClassesDb();
    const schoolClass = await db.findOne({ id: params.classId });
    
    if (schoolClass) {
      return NextResponse.json(schoolClass);
    }
    return NextResponse.json({ message: 'Class not found' }, { status: 404 });
  } catch (error) {
    console.error(`[API GET /api/classes/${params.classId}] Error:`, error);
    return NextResponse.json({ message: 'Error fetching class', error: (error as Error).message }, { status: 500 });
  }
}

// PUT (update) a class (using classId from params)
export async function PUT(request: Request, { params }: { params: { classId: string } }) {
  try {
    const classIdFromParams = params.classId; // Use params.classId
    if (!classIdFromParams) {
        return NextResponse.json({ message: 'Class ID is required' }, { status: 400 });
    }

    const requestBody: Partial<Omit<SchoolClass, 'id'>> = await request.json();
    
    const updatePayload: Partial<SchoolClass> = {};
    
    if (requestBody.name !== undefined) updatePayload.name = requestBody.name;
    if (requestBody.delegateId !== undefined) {
        updatePayload.delegateId = requestBody.delegateId === "" ? undefined : requestBody.delegateId;
    }
    if (requestBody.isHidden !== undefined) {
      updatePayload.isHidden = requestBody.isHidden;
    }
    
    if (Object.keys(updatePayload).length === 0) {
        const dbCheck = await getClassesDb();
        const existingDoc = await dbCheck.findOne({ id: classIdFromParams });
        if(existingDoc) {
            return NextResponse.json(existingDoc);
        }
        // If no fields to update AND class not found, it's more like a 404.
        return NextResponse.json({ message: 'No updatable fields provided or class not found' }, { status: 400 });
    }

    const db = await getClassesDb();
    const numAffected = await db.update({ id: classIdFromParams }, { $set: updatePayload });

    if (numAffected === 0) {
      const existingClass = await db.findOne({ id: classIdFromParams });
      if (!existingClass) {
        console.error(`[API PUT /api/classes/${classIdFromParams}] Update failed: Class not found after attempting update.`);
        return NextResponse.json({ message: 'Class not found, cannot update' }, { status: 404 });
      }

      let noMeaningfulChange = true;
      if (updatePayload.name !== undefined && updatePayload.name !== existingClass.name) noMeaningfulChange = false;
      if (updatePayload.delegateId !== undefined && updatePayload.delegateId !== existingClass.delegateId) noMeaningfulChange = false;
      if (updatePayload.isHidden !== undefined && updatePayload.isHidden !== existingClass.isHidden) noMeaningfulChange = false; 

      if (noMeaningfulChange) {
        return NextResponse.json(existingClass);
      } else {
        // This case means we attempted to set a value to its current value, or a mix.
        // The data is effectively "updated" to the intended state.
        return NextResponse.json({ ...existingClass, ...updatePayload });
      }
    }

    const updatedClass = await db.findOne({ id: classIdFromParams });
    if (!updatedClass) {
        console.error(`[API PUT /api/classes/${classIdFromParams}] Class updated in DB but failed to retrieve for response.`);
        return NextResponse.json({ message: 'Class updated but failed to retrieve' }, { status: 500 });
    }
    return NextResponse.json(updatedClass);

  } catch (error) {
    console.error(`[API PUT /api/classes/${params.classId}] Error:`, error);
    return NextResponse.json({ message: 'Error updating class', error: (error as Error).message }, { status: 500 });
  }
}

// DELETE a class (using classId from params)
export async function DELETE(request: Request, { params }: { params: { classId: string } }) {
  try {
    const classIdToDelete = params.classId; // Use params.classId
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
      // If an announcement becomes orphaned (no target classes left), 
      // it will be handled by the admin or future logic.
      // For now, just update its targetClassIds.
      // Per new rules, an announcement *must* have target classes.
      // If newTargetClassIds is empty, the announcement is now invalid.
      // Admin will need to re-assign or delete. We update it to an empty array.
      await announcementsDb.update({ id: ann.id }, { $set: { targetClassIds: newTargetClassIds } });
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
    return NextResponse.json({ message: 'Class deleted successfully and related data (announcements, school events) updated/removed.' }, { status: 200 });
  } catch (error) {
    console.error(`[API DELETE /api/classes/${params.classId}] Error:`, error);
    return NextResponse.json({ message: 'Error deleting class', error: (error as Error).message }, { status: 500 });
  }
}
