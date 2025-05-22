
'use server';

import { NextResponse } from 'next/server';
import { getClassesDb, getAnnouncementsDb, getSchoolEventsDb } from '@/lib/db'; // Added getSchoolEventsDb
import type { SchoolClass } from '@/types';

// GET a single class by ID
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    if (!params.id) {
      return NextResponse.json({ message: 'Class ID is required' }, { status: 400 });
    }
    const db = await getClassesDb();
    const schoolClass = await db.findOne({ id: params.id });
    
    if (schoolClass) {
      const classToReturn = {
        ...schoolClass,
        // Ensure passwordProtected is always present in the response
        passwordProtected: !!schoolClass.password && schoolClass.password.trim() !== '',
      };
      // Do not return the actual password
      delete (classToReturn as any).password; 
      return NextResponse.json(classToReturn);
    }
    return NextResponse.json({ message: 'Class not found' }, { status: 404 });
  } catch (error) {
    console.error(`Error fetching class ${params.id}:`, error);
    return NextResponse.json({ message: 'Error fetching class', error: (error as Error).message }, { status: 500 });
  }
}

// PUT (update) a class
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  // console.log(`[API PUT /api/classes/${params.id}] Received update request.`);
  try {
    const classId = params.id;
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
    if (requestBody.language !== undefined) updatePayload.language = requestBody.language;
    
    // Handle password update:
    // - If password is in requestBody and it's a non-empty string, update it.
    // - If password is in requestBody and it's an empty string, set it to undefined (remove password).
    // - If password is not in requestBody, do nothing to the password.
    if (Object.prototype.hasOwnProperty.call(requestBody, 'password')) { 
      if (requestBody.password && requestBody.password.trim() !== "") {
        updatePayload.password = requestBody.password.trim();
      } else {
        // Setting to undefined in NeDB effectively removes the field or sets it to null
        // if NeDB is configured to treat undefined as null upon insertion/update.
        // For $set, it will remove the field if it's undefined.
        updatePayload.password = undefined; 
      }
    }
    
    // console.log(`[API PUT /api/classes/${classId}] Update payload to NeDB:`, updatePayload);

    if (Object.keys(updatePayload).length === 0 && !Object.prototype.hasOwnProperty.call(requestBody, 'password')) {
        // No actual data fields to update, and password was not explicitly touched.
        // Return current class data.
        const dbCheck = await getClassesDb();
        const existingDoc = await dbCheck.findOne({ id: classId });
        if(existingDoc) {
            const { password, ...classToReturn } = existingDoc;
             const finalClassToReturn = {
                ...classToReturn,
                passwordProtected: !!password && password.trim() !== '',
            };
            return NextResponse.json(finalClassToReturn);
        }
        return NextResponse.json({ message: 'No updatable fields provided or class not found' }, { status: 400 });
    }

    const db = await getClassesDb();
    const numAffected = await db.update({ id: classId }, { $set: updatePayload });

    if (numAffected === 0) {
      // Check if it was because no actual change was made to an existing class
      const existingClass = await db.findOne({ id: classId });
      if (existingClass) { // Class exists
        let noMeaningfulChange = true;
        if (updatePayload.name !== undefined && updatePayload.name !== existingClass.name) noMeaningfulChange = false;
        if (updatePayload.delegateId !== undefined && updatePayload.delegateId !== existingClass.delegateId) noMeaningfulChange = false;
        if (updatePayload.language !== undefined && updatePayload.language !== existingClass.language) noMeaningfulChange = false;
        
        // Check password change specifically
        if (Object.prototype.hasOwnProperty.call(requestBody, 'password')) {
           // If password was in request, and the resulting updatePayload.password is different from existingClass.password
           if (updatePayload.password !== existingClass.password) noMeaningfulChange = false;
        }

        if (noMeaningfulChange) {
            const { password, ...classToReturn } = existingClass;
            const finalClassToReturn = {
                ...classToReturn,
                passwordProtected: !!password && password.trim() !== '',
            };
            return NextResponse.json(finalClassToReturn);
        }
      }
      return NextResponse.json({ message: 'Class not found or no changes made' }, { status: 404 });
    }

    const updatedClass = await db.findOne({ id: classId });
    if (!updatedClass) {
        // This should ideally not happen if numAffected > 0
        return NextResponse.json({ message: 'Class updated but failed to retrieve' }, { status: 500 });
    }
    const { password, ...classToReturn } = updatedClass; 
    const finalClassToReturn = {
        ...classToReturn,
        passwordProtected: !!password && password.trim() !== '',
    };
    return NextResponse.json(finalClassToReturn);

  } catch (error) {
    console.error(`Error updating class ${params.id}:`, error);
    return NextResponse.json({ message: 'Error updating class', error: (error as Error).message }, { status: 500 });
  }
}

// DELETE a class
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const classIdToDelete = params.id;
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
      // If newTargetClassIds is empty, the announcement becomes "orphaned"
      // but we'll update it anyway. Admin will need to re-assign or delete.
      await announcementsDb.update({ id: ann.id }, { $set: { targetClassIds: newTargetClassIds } });
      console.log(`[API DELETE /api/classes/${classIdToDelete}] Removed class from announcement ${ann.id}. New targets: ${newTargetClassIds.join(', ')}`);
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
    console.error(`Error deleting class ${params.id}:`, error);
    return NextResponse.json({ message: 'Error deleting class', error: (error as Error).message }, { status: 500 });
  }
}

    