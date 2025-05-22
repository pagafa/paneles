
'use server';

import { NextResponse } from 'next/server';
import { getSchoolEventsDb, getClassesDb } from '@/lib/db'; // Added getClassesDb
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
    const db = await getSchoolEventsDb(); // SchoolEvents DB
    
    const existingEvent = await db.findOne({ id: eventId });
    if (!existingEvent) {
      return NextResponse.json({ message: 'School event not found for update' }, { status: 404 });
    }

    const updatePayload: Partial<SchoolEvent> = { ...requestBody };
    
    // Validate classId if provided and event type is exam or deadline
    if ((existingEvent.type === 'exam' || existingEvent.type === 'deadline') && Object.prototype.hasOwnProperty.call(requestBody, 'classId')) {
      if (requestBody.classId && requestBody.classId.trim() !== "") {
        const classesDb = await getClassesDb();
        const schoolClass = await classesDb.findOne({ id: requestBody.classId });
        if (!schoolClass) {
          return NextResponse.json({ message: `Invalid classId: Class with ID "${requestBody.classId}" does not exist.` }, { status: 400 });
        }
        updatePayload.classId = requestBody.classId;
      } else {
        // If classId is explicitly set to empty or null, remove it from the event
        updatePayload.classId = undefined;
      }
    }
    
    // Ensure type is not changed from existing event's type
    updatePayload.type = existingEvent.type; 
    
    const finalPayload = { ...existingEvent, ...updatePayload }; // Merge to ensure all fields are handled correctly

    // Type-specific validations on the final merged payload
    if (finalPayload.type === 'exam' && !finalPayload.subject) {
        return NextResponse.json({ message: 'Missing subject for exam update' }, { status: 400 });
    }
    if (finalPayload.type === 'deadline' && !finalPayload.assignmentName) {
        return NextResponse.json({ message: 'Missing assignmentName for deadline update' }, { status: 400 });
    }
    if (finalPayload.type === 'announcement' && !finalPayload.content) { // Delegate announcements
        return NextResponse.json({ message: 'Missing content for announcement update' }, { status: 400 });
    }

    const numAffected = await db.update({ id: eventId }, { $set: finalPayload });

    if (numAffected === 0) {
      // Check if it was because no actual change was made
      let noMeaningfulChange = true;
      for (const key in finalPayload) {
        if (finalPayload[key as keyof SchoolEvent] !== existingEvent[key as keyof SchoolEvent]) {
          // A deep comparison might be needed for objects/arrays if they exist in SchoolEvent
          if (typeof finalPayload[key as keyof SchoolEvent] === 'object') {
             if (JSON.stringify(finalPayload[key as keyof SchoolEvent]) !== JSON.stringify(existingEvent[key as keyof SchoolEvent])) {
                noMeaningfulChange = false;
                break;
             }
          } else {
            noMeaningfulChange = false;
            break;
          }
        }
      }
      if (noMeaningfulChange) return NextResponse.json(existingEvent);
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

    