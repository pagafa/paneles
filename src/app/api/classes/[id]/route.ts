
'use server';

import { NextResponse } from 'next/server';
import { getClassesDb } from '@/lib/db';
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
      // For the specific class page, we might not want to send the password itself,
      // but an indicator if it's password protected.
      // However, for internal admin use or direct GET by ID, returning it might be acceptable if needed.
      // For now, let's return it but be mindful.
      // Let's return passwordProtected status instead for public class page.
      const { password, ...classDetailsWithoutPassword } = schoolClass;
      const classToReturn = {
        ...classDetailsWithoutPassword,
        passwordProtected: !!password && password.trim() !== '',
      };
      // If this route is also used by admin panels that need the actual password for form prefill (though not recommended for GET)
      // you might need a different strategy or a separate admin-specific endpoint.
      // For the public class page, passwordProtected is better.
      // The ManageClassesPage needs the actual password to show the key icon for classes that have one,
      // so GET /api/classes should return it for that page.
      // This specific GET /api/classes/[id] is used by the public class page.
      
      // Re-evaluating: The public class page /class/[classId] uses this GET.
      // It needs to know if it's password protected.
      // The admin edit form for a class DOES NOT use this GET; it uses the list from GET /api/classes
      // and then makes a PUT request with all data.
      // So, for this route, returning `passwordProtected` is correct.
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
    console.log(`[API PUT /api/classes/${classId}] Request body:`, requestBody); // Debugging line

    const updatePayload: Partial<SchoolClass> = {};
    
    if (requestBody.name !== undefined) updatePayload.name = requestBody.name;
    if (requestBody.delegateId !== undefined) updatePayload.delegateId = requestBody.delegateId === "" ? undefined : requestBody.delegateId;
    if (requestBody.language !== undefined) updatePayload.language = requestBody.language;
    
    // Handle password update:
    // If password field is present in requestBody, we process it.
    // If it's an empty string, it means "remove password" (set to undefined).
    // If it's a non-empty string, it means "set new password".
    // If password field is NOT in requestBody, existing password remains untouched.
    if (Object.prototype.hasOwnProperty.call(requestBody, 'password')) { // Check if password key exists, even if value is undefined/null
      if (requestBody.password && requestBody.password.trim() !== "") {
        updatePayload.password = requestBody.password.trim();
      } else {
        // If password is an empty string or null, treat as intention to remove password
        updatePayload.password = undefined; 
      }
    }
    
    console.log(`[API PUT /api/classes/${classId}] Update payload to NeDB:`, updatePayload); // Debugging line


    if (Object.keys(updatePayload).length === 0 && !Object.prototype.hasOwnProperty.call(requestBody, 'password')) {
        // If password was explicitly sent as empty/null to remove it, updatePayload might have only { password: undefined }
        // So we need to proceed if password was in requestBody.
        // This condition means truly no fields to update.
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
      // This could also mean the $set operation resulted in no change to the document
      const existingClass = await db.findOne({ id: classId });
      if (existingClass) { // If class exists, but no fields were actually different
        const { password, ...classToReturn } = existingClass;
        return NextResponse.json(classToReturn);
      }
      return NextResponse.json({ message: 'Class not found' }, { status: 404 });
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
    const classId = params.id;
    if (!classId) {
        return NextResponse.json({ message: 'Class ID is required' }, { status: 400 });
    }
    const db = await getClassesDb();
    const numRemoved = await db.remove({ id: classId }, {});

    if (numRemoved === 0) {
      return NextResponse.json({ message: 'Class not found' }, { status: 404 });
    }

    // Also remove related school events for this class
    // const schoolEventsDb = await getSchoolEventsDb(); // Assuming you have this
    // await schoolEventsDb.remove({ classId: classId }, { multi: true });

    return NextResponse.json({ message: 'Class deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error(`Error deleting class ${params.id}:`, error);
    return NextResponse.json({ message: 'Error deleting class', error: (error as Error).message }, { status: 500 });
  }
}

