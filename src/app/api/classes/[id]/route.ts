
'use server';

import { NextResponse } from 'next/server';
import { getClassesDb, getAnnouncementsDb } from '@/lib/db'; // Added getAnnouncementsDb
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
        passwordProtected: !!schoolClass.password && schoolClass.password.trim() !== '',
      };
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
  try {
    const classId = params.id;
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
    
    if (Object.prototype.hasOwnProperty.call(requestBody, 'password')) { 
      if (requestBody.password && requestBody.password.trim() !== "") {
        updatePayload.password = requestBody.password.trim();
      } else {
        updatePayload.password = undefined; 
      }
    }
    
    if (Object.keys(updatePayload).length === 0 && !Object.prototype.hasOwnProperty.call(requestBody, 'password')) {
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
      if (existingClass) { 
        let noMeaningfulChange = true;
        if (updatePayload.name !== undefined && updatePayload.name !== existingClass.name) noMeaningfulChange = false;
        if (updatePayload.delegateId !== undefined && updatePayload.delegateId !== existingClass.delegateId) noMeaningfulChange = false;
        if (updatePayload.language !== undefined && updatePayload.language !== existingClass.language) noMeaningfulChange = false;
        if (Object.prototype.hasOwnProperty.call(requestBody, 'password') && updatePayload.password !== existingClass.password) noMeaningfulChange = false;

        if (noMeaningfulChange) {
            const { password, ...classToReturn } = existingClass;
            return NextResponse.json(classToReturn);
        }
      }
      return NextResponse.json({ message: 'Class not found or no changes made' }, { status: 404 });
    }

    const updatedClass = await db.findOne({ id: classId });
    if (!updatedClass) {
        return NextResponse.json({ message: 'Class updated but failed to retrieve' }, { status: 500 });
    }
    const { password, ...classToReturn } = updatedClass; 
    return NextResponse.json(classToReturn);

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

    // Find announcements targeting this class
    const announcementsToUpdate = await announcementsDb.find({ targetClassIds: classIdToDelete });

    for (const ann of announcementsToUpdate) {
      const newTargetClassIds = ann.targetClassIds.filter(id => id !== classIdToDelete);
      // If newTargetClassIds is empty, the announcement becomes "orphaned"
      // but we'll update it anyway. Admin will need to re-assign or delete.
      await announcementsDb.update({ id: ann.id }, { $set: { targetClassIds: newTargetClassIds } });
      console.log(`[API DELETE /api/classes/${classIdToDelete}] Removed class from announcement ${ann.id}. New targets: ${newTargetClassIds.join(', ')}`);
    }

    const numRemoved = await classesDb.remove({ id: classIdToDelete }, {});

    if (numRemoved === 0) {
      return NextResponse.json({ message: 'Class not found' }, { status: 404 });
    }
    console.log(`[API DELETE /api/classes/${classIdToDelete}] Class deleted successfully and references updated.`);
    return NextResponse.json({ message: 'Class deleted successfully and announcement references updated.' }, { status: 200 });
  } catch (error) {
    console.error(`Error deleting class ${params.id}:`, error);
    return NextResponse.json({ message: 'Error deleting class', error: (error as Error).message }, { status: 500 });
  }
}
