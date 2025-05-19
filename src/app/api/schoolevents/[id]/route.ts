
'use server';

import { NextResponse } from 'next/server';
import { getSchoolEventsDb } from '@/lib/db';
import type { SchoolEvent, Exam, Deadline, Announcement } from '@/types';

// GET a single school event by ID
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    if (!params.id) {
      return NextResponse.json({ message: 'School event ID is required' }, { status: 400 });
    }
    const db = await getSchoolEventsDb();
    const event = await db.findOne({ id: params.id });
    
    if (event) {
      return NextResponse.json(event);
    }
    return NextResponse.json({ message: 'School event not found' }, { status: 404 });
  } catch (error) {
    console.error(`Error fetching school event ${params.id}:`, error);
    return NextResponse.json({ message: 'Error fetching school event', error: (error as Error).message }, { status: 500 });
  }
}

// PUT (update) a school event
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const eventId = params.id;
    if (!eventId) {
        return NextResponse.json({ message: 'School event ID is required' }, { status: 400 });
    }

    const requestBody: Partial<Omit<SchoolEvent, 'id' | 'type'>> & {type?: SchoolEvent['type']} = await request.json();
    
    const updatePayload: Partial<SchoolEvent> = { ...requestBody };
    // Ensure type is not changed if not explicitly provided or if it's different from existing.
    // For simplicity, this PUT assumes type doesn't change. More complex logic would be needed otherwise.
    // delete updatePayload.type; // Or validate it matches existing.
    
    if (Object.keys(updatePayload).length === 0) {
        const dbCheck = await getSchoolEventsDb();
        const existingDoc = await dbCheck.findOne({ id: eventId });
        if(existingDoc) return NextResponse.json(existingDoc);
        return NextResponse.json({ message: 'No updatable fields provided or event not found' }, { status: 400 });
    }

    // Type-specific validations on update
    const db = await getSchoolEventsDb();
    const existingEvent = await db.findOne({ id: eventId });
    if (!existingEvent) {
      return NextResponse.json({ message: 'School event not found for update' }, { status: 404 });
    }

    const finalPayload = { ...existingEvent, ...updatePayload }; // Merge to ensure type and other fields are present

    if (finalPayload.type === 'exam' && !finalPayload.subject) {
        return NextResponse.json({ message: 'Missing subject for exam update' }, { status: 400 });
    }
    if (finalPayload.type === 'deadline' && !finalPayload.assignmentName) {
        return NextResponse.json({ message: 'Missing assignmentName for deadline update' }, { status: 400 });
    }
    if (finalPayload.type === 'announcement' && !finalPayload.content) {
        return NextResponse.json({ message: 'Missing content for announcement update' }, { status: 400 });
    }


    const numAffected = await db.update({ id: eventId }, { $set: finalPayload });

    if (numAffected === 0) {
      return NextResponse.json({ message: 'School event not found or no changes made' }, { status: 404 });
    }

    const updatedEvent = await db.findOne({ id: eventId });
    if (!updatedEvent) {
        return NextResponse.json({ message: 'School event updated but failed to retrieve' }, { status: 500 });
    }
    return NextResponse.json(updatedEvent);

  } catch (error) {
    console.error(`Error updating school event ${params.id}:`, error);
    return NextResponse.json({ message: 'Error updating school event', error: (error as Error).message }, { status: 500 });
  }
}

// DELETE a school event
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const eventId = params.id;
    if (!eventId) {
        return NextResponse.json({ message: 'School event ID is required' }, { status: 400 });
    }
    const db = await getSchoolEventsDb();
    const numRemoved = await db.remove({ id: eventId }, {});

    if (numRemoved === 0) {
      return NextResponse.json({ message: 'School event not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'School event deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error(`Error deleting school event ${params.id}:`, error);
    return NextResponse.json({ message: 'Error deleting school event', error: (error as Error).message }, { status: 500 });
  }
}
