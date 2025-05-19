
'use server';

import { NextResponse } from 'next/server';
import { getClassesDb } from '@/lib/db';
import type { SchoolClass } from '@/types';

// GET all classes
export async function GET() {
  try {
    const db = await getClassesDb();
    const classes = await db.find({}).sort({ name: 1 }); // Sort by name ascending
    return NextResponse.json(classes);
  } catch (error) {
    console.error('Error fetching classes:', error);
    return NextResponse.json({ message: 'Error fetching classes', error: (error as Error).message }, { status: 500 });
  }
}

// POST a new class
export async function POST(request: Request) {
  try {
    const newClassData: Omit<SchoolClass, 'id'> & { id?: string } = await request.json();
    
    if (!newClassData.name) {
      return NextResponse.json({ message: 'Missing required field: name' }, { status: 400 });
    }

    const db = await getClassesDb();
    
    const classToAdd: SchoolClass = {
      id: newClassData.id || `class-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: newClassData.name,
      delegateId: newClassData.delegateId || undefined, // Ensure it's undefined if not provided
      // language field can be added here if needed by default
    };

    const savedClass = await db.insert(classToAdd);
    return NextResponse.json(savedClass, { status: 201 });
  } catch (error) {
    console.error('Error creating class:', error);
    if ((error as Error).message.includes('unique constraint violated')) {
        return NextResponse.json({ message: 'Error creating class: ID already exists.', error: (error as Error).message }, { status: 409 });
    }
    return NextResponse.json({ message: 'Error creating class', error: (error as Error).message }, { status: 500 });
  }
}
