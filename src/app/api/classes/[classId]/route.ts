
'use server';

import { NextResponse } from 'next/server';
import { getClassesDb, getAnnouncementsDb, getSchoolEventsDb } from '@/lib/db';
import type { SchoolClass } from '@/types';

// GET a single class by ID (using classId from params)
export async function GET(request: Request, { params }: { params: { classId: string } }) {
  try {
    const { classId } = params;
    if (!classId) {
      return NextResponse.json({ message: 'Class ID is required' }, { status: 400 });
    }
    const db = await getClassesDb();
    const schoolClass = await db.findOne({ id: classId });
    
    if (schoolClass) {
      // Exclude password if it exists, but include isHidden
      const { password, ...classToReturn } = schoolClass;
      return NextResponse.json(classToReturn);
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
    const { classId } = params;
    if (!classId) {
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
        const existingDoc = await dbCheck.findOne({ id: classId });
        if(existingDoc) {
            const { password, ...classToReturn } = existingDoc;
            return NextResponse.json(classToReturn);
        }
        return NextResponse.json({ message: 'No updatable fields provided or class not found' }, { status: 400 });
    }

    const db = await getClassesDb();
    const numAffected = await db.update({ id: classId }, { $set: updatePayload });

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
        const { password, ...classToReturn } = existingClass;
        return NextResponse.json(classToReturn);
      } else {
        // This case means we attempted to set a value to its current value, or a mix.
        // The data is effectively "updated" to the intended state.
         const { password, ...classToReturn } = { ...existingClass, ...updatePayload };
        return NextResponse.json(classToReturn);
      }
    }

    const updatedClass = await db.findOne({ id: classId });
    if (!updatedClass) {
        console.error(`[API PUT /api/classes/${classId}] Class updated in DB but failed to retrieve for response.`);
        return NextResponse.json({ message: 'Class updated but failed to retrieve' }, { status: 500 });
    }
    const { password, ...classToReturn } = updatedClass;
    return NextResponse.json(classToReturn);

  } catch (error) {
    console.error(`[API PUT /api/classes/${params.classId}] Error:`, error);
    return NextResponse.json({ message: 'Error updating class', error: (error as Error).message }, { status: 500 });
  }
}

// DELETE a class (using classId from params)
export async function DELETE(request: Request, { params }: { params: { classId: string } }) {
  try {
    const { classId } = params;
    if (!classId) {
        return NextResponse.json({ message: 'Class ID is required' }, { status: 400 });
    }
    const classesDb = await getClassesDb();
    const announcementsDb = await getAnnouncementsDb();
    const schoolEventsDb = await getSchoolEventsDb();

    // Remove this classId from any announcements targeting it
    const announcementsToUpdate = await announcementsDb.find({ targetClassIds: classId });
    for (const ann of announcementsToUpdate) {
      const newTargetClassIds = ann.targetClassIds.filter(id => id !== classId);
      // If an announcement becomes orphaned (no target classes left), it must be re-assigned or deleted by admin.
      // As per current rules, targetClassIds must not be empty.
      // We update it to an empty array and the admin/UI must handle this invalid state.
      await announcementsDb.update({ id: ann.id }, { $set: { targetClassIds: newTargetClassIds } });
    }
    
    // Delete school events (exams, deadlines) associated with this class
    const numEventsRemoved = await schoolEventsDb.remove({ classId: classId }, { multi: true });
    if (numEventsRemoved > 0) {
      // console.log(`[API DELETE /api/classes/${classIdToDelete}] Removed ${numEventsRemoved} school events associated with this class.`);
    }

    // Finally, delete the class itself
    const numRemoved = await classesDb.remove({ id: classId }, {});

    if (numRemoved === 0) {
      return NextResponse.json({ message: 'Class not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Class deleted successfully and related data (announcements, school events) updated/removed.' }, { status: 200 });
  } catch (error) {
    console.error(`[API DELETE /api/classes/${params.classId}] Error:`, error);
    return NextResponse.json({ message: 'Error deleting class', error: (error as Error).message }, { status: 500 });
  }
}
