
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
      // For public consumption, indicate if password protected but don't send password
      const { password, ...classDetailsWithoutPassword } = schoolClass;
      const responsePayload = {
        ...classDetailsWithoutPassword,
        passwordProtected: !!password && password.trim() !== '',
      };
      return NextResponse.json(responsePayload);
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
    
    const updatePayload: Partial<SchoolClass> = {};
    
    if (requestBody.name !== undefined) updatePayload.name = requestBody.name;
    if (requestBody.delegateId !== undefined) {
        updatePayload.delegateId = requestBody.delegateId === "" ? undefined : requestBody.delegateId;
    }
    if (requestBody.language !== undefined) updatePayload.language = requestBody.language;
    
    // Ensure isHidden is handled correctly
    if (requestBody.isHidden !== undefined) {
      updatePayload.isHidden = requestBody.isHidden;
    }
    // Password handling was removed when "classes con clave" was removed

    if (Object.keys(updatePayload).length === 0) {
        const dbCheck = await getClassesDb();
        const existingDoc = await dbCheck.findOne({ id: classId });
        if(existingDoc) {
            // Return the public-facing version without the password
            const { password, ...classDetailsWithoutPassword } = existingDoc;
            const responsePayload = {
                ...classDetailsWithoutPassword,
                passwordProtected: !!password && password.trim() !== '',
            };
            return NextResponse.json(responsePayload);
        }
        return NextResponse.json({ message: 'No updatable fields provided or class not found' }, { status: 400 });
    }

    const db = await getClassesDb();
    const numAffected = await db.update({ id: classId }, { $set: updatePayload });

    if (numAffected === 0) {
      const existingClass = await db.findOne({ id: classId });
      if (existingClass) {
        let noMeaningfulChange = true;
        if (updatePayload.name !== undefined && updatePayload.name !== existingClass.name) noMeaningfulChange = false;
        if (updatePayload.delegateId !== undefined && updatePayload.delegateId !== existingClass.delegateId) noMeaningfulChange = false;
        if (updatePayload.language !== undefined && updatePayload.language !== existingClass.language) noMeaningfulChange = false;
        if (updatePayload.isHidden !== undefined && updatePayload.isHidden !== existingClass.isHidden) noMeaningfulChange = false; // Added this check

        if (noMeaningfulChange) {
            // Return the public-facing version
            const { password, ...classDetailsWithoutPassword } = existingClass;
            const responsePayload = {
                ...classDetailsWithoutPassword,
                passwordProtected: !!password && password.trim() !== '',
            };
            return NextResponse.json(responsePayload);
        }
      }
      return NextResponse.json({ message: 'Class not found or no changes made' }, { status: 404 });
    }

    const updatedClass = await db.findOne({ id: classId });
    if (!updatedClass) {
        return NextResponse.json({ message: 'Class updated but failed to retrieve' }, { status: 500 });
    }
    // Return the public-facing version
    const { password, ...classDetailsWithoutPassword } = updatedClass;
    const responsePayload = {
        ...classDetailsWithoutPassword,
        passwordProtected: !!password && password.trim() !== '',
    };
    return NextResponse.json(responsePayload);

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
      // If newTargetClassIds is empty, the announcement is now invalid as per new rules.
      // Admin will need to re-assign or delete.
      if (newTargetClassIds.length > 0) {
        await announcementsDb.update({ id: ann.id }, { $set: { targetClassIds: newTargetClassIds } });
      } else {
        // Optionally, delete the announcement if it no longer targets any class
        // await announcementsDb.remove({ id: ann.id }, {});
        // For now, we'll leave it, and the admin can manage it.
        // Or, just update it with an empty array, and the edit form will flag it.
        await announcementsDb.update({ id: ann.id }, { $set: { targetClassIds: newTargetClassIds } });

      }
      console.log(`[API DELETE /api/classes/${classIdToDelete}] Updated announcement ${ann.id}. New targets: ${newTargetClassIds.join(', ')}`);
    }

    // Delete school events (exams, deadlines) associated with this class
    const numEventsRemoved = await schoolEventsDb.remove({ classId: classIdToDelete }, { multi: true });
    if (numEventsRemoved > 0) {
      console.log(`[API DELETE /api/classes/${classIdToDelete}] Removed ${numEventsRemoved} school events associated with this class.`);
    }

    // Finally, delete the class itself
    const numRemoved = await classesDb.remove({ id: classIdToDelete }, {});

    if (numRemoved === 0) {
      return NextResponse.json({ message: 'Class not found' }, { status: 404 });
    }
    console.log(`[API DELETE /api/classes/${classIdToDelete}] Class deleted successfully and references updated.`);
    return NextResponse.json({ message: 'Class deleted successfully and related data (announcements, school events) updated/removed.' }, { status: 200 });
  } catch (error) {
    console.error(`[API DELETE /api/classes/${params.classId}] Error:`, error);
    return NextResponse.json({ message: 'Error deleting class', error: (error as Error).message }, { status: 500 });
  }
}
