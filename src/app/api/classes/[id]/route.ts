
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
      return NextResponse.json(schoolClass);
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
    // Explicitly allow setting delegateId to empty string (to unset) or a value
    if (requestBody.delegateId !== undefined) updatePayload.delegateId = requestBody.delegateId === "" ? undefined : requestBody.delegateId;
    if (requestBody.language !== undefined) updatePayload.language = requestBody.language;

    if (Object.keys(updatePayload).length === 0) {
        const dbCheck = await getClassesDb();
        const existingDoc = await dbCheck.findOne({ id: classId });
        if(existingDoc) return NextResponse.json(existingDoc);
        return NextResponse.json({ message: 'No updatable fields provided or class not found' }, { status: 400 });
    }

    const db = await getClassesDb();
    const numAffected = await db.update({ id: classId }, { $set: updatePayload });

    if (numAffected === 0) {
      return NextResponse.json({ message: 'Class not found or no changes made' }, { status: 404 });
    }

    const updatedClass = await db.findOne({ id: classId });
    if (!updatedClass) {
        return NextResponse.json({ message: 'Class updated but failed to retrieve' }, { status: 500 });
    }
    return NextResponse.json(updatedClass);

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

    return NextResponse.json({ message: 'Class deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error(`Error deleting class ${params.id}:`, error);
    return NextResponse.json({ message: 'Error deleting class', error: (error as Error).message }, { status: 500 });
  }
}
