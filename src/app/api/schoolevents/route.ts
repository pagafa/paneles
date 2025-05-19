
'use server';

import { NextResponse } from 'next/server';
import { getSchoolEventsDb } from '@/lib/db';
import type { SchoolEvent, Exam, Deadline, Announcement } from '@/types';

// GET all school events (or filtered)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') as SchoolEvent['type'] | null;
    const classId = searchParams.get('classId');
    // const submittedByDelegateId = searchParams.get('submittedByDelegateId'); // For future filtering

    const db = await getSchoolEventsDb();
    let query: any = {};

    if (type) {
      query.type = type;
    }
    if (classId) {
      query.classId = classId; // Assumes events store classId
    }
    // if (submittedByDelegateId) {
    //   query.submittedByDelegateId = submittedByDelegateId;
    // }
    
    const events = await db.find(query).sort({ date: -1 });
    return NextResponse.json(events);
  } catch (error) {
    console.error('Error fetching school events:', error);
    return NextResponse.json({ message: 'Error fetching school events', error: (error as Error).message }, { status: 500 });
  }
}

// POST a new school event
export async function POST(request: Request) {
  try {
    const newEventData: Omit<SchoolEvent, 'id'> & { id?: string } = await request.json();
    
    if (!newEventData.title || !newEventData.date || !newEventData.type) {
      return NextResponse.json({ message: 'Missing required fields (title, date, type)' }, { status: 400 });
    }

    // Type-specific validations
    if (newEventData.type === 'exam' && !(newEventData as Exam).subject) {
        return NextResponse.json({ message: 'Missing subject for exam' }, { status: 400 });
    }
    if (newEventData.type === 'deadline' && !(newEventData as Deadline).assignmentName) {
        return NextResponse.json({ message: 'Missing assignmentName for deadline' }, { status: 400 });
    }
     if (newEventData.type === 'announcement' && !(newEventData as Announcement).content) { // Delegate announcement content
        return NextResponse.json({ message: 'Missing content for announcement' }, { status: 400 });
    }


    const db = await getSchoolEventsDb();
    
    const eventToAdd: SchoolEvent = {
      id: newEventData.id || `evt-${Date.now()}-${Math.random().toString(36).substring(2,7)}`,
      ...newEventData,
    };

    const savedEvent = await db.insert(eventToAdd);
    return NextResponse.json(savedEvent, { status: 201 });
  } catch (error) {
    console.error('Error creating school event:', error);
    if ((error as Error).message.includes('unique constraint violated')) {
        return NextResponse.json({ message: 'Error creating school event: ID already exists.', error: (error as Error).message }, { status: 409 });
    }
    return NextResponse.json({ message: 'Error creating school event', error: (error as Error).message }, { status: 500 });
  }
}
