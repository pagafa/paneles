
'use server';

import { NextResponse } from 'next/server';
import { getSchoolEventsDb, getClassesDb } from '@/lib/db';
import type { SchoolEvent, Exam, Deadline, Announcement } from '@/types';

// GET all school events (or filtered)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') as SchoolEvent['type'] | null;
    const classId = searchParams.get('classId');
    
    const db = await getSchoolEventsDb();
    let query: any = {};

    if (type) {
      query.type = type;
    }
    if (classId) {
      query.classId = classId; 
    }
    
    const events = await db.find(query).sort({ date: -1 });
    return NextResponse.json(events);
  } catch (error) {
    console.error('[API GET /api/schoolevents] Error:', error);
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

    if (newEventData.type === 'exam' && !(newEventData as Exam).subject) {
        return NextResponse.json({ message: 'Missing subject for exam' }, { status: 400 });
    }
    if (newEventData.type === 'deadline' && !(newEventData as Deadline).assignmentName) {
        return NextResponse.json({ message: 'Missing assignmentName for deadline' }, { status: 400 });
    }
    if (newEventData.type === 'announcement' && !(newEventData as Announcement).content) { 
        return NextResponse.json({ message: 'Missing content for announcement' }, { status: 400 });
    }

    if ((newEventData.type === 'exam' || newEventData.type === 'deadline' || newEventData.type === 'announcement') && newEventData.classId && newEventData.classId.trim() !== "") {
      const classesDb = await getClassesDb();
      const schoolClass = await classesDb.findOne({ id: newEventData.classId });
      if (!schoolClass) {
        return NextResponse.json({ message: `Invalid classId: Class with ID "${newEventData.classId}" does not exist.` }, { status: 400 });
      }
    } else if ((newEventData.type === 'exam' || newEventData.type === 'deadline' || newEventData.type === 'announcement') && (!newEventData.classId || newEventData.classId.trim() === "")) {
        // For exams, deadlines, and delegate announcements, classId is typically expected.
        return NextResponse.json({ message: `classId is required for event type "${newEventData.type}"` }, { status: 400 });
    }

    const db = await getSchoolEventsDb();
    
    const eventToAdd: SchoolEvent = {
      id: newEventData.id || `evt-${Date.now()}-${Math.random().toString(36).substring(2,7)}`,
      ...newEventData,
    };

    const savedEvent = await db.insert(eventToAdd);
    return NextResponse.json(savedEvent, { status: 201 });
  } catch (error) {
    console.error('[API POST /api/schoolevents] Error creating school event:', error);
    const errorMessage = (error as Error).message;
    if (errorMessage.includes('unique constraint violated')) {
        return NextResponse.json({ message: `Error creating school event: ID already exists. Detail: ${errorMessage}` }, { status: 409 });
    }
    return NextResponse.json({ message: `Error creating school event: ${errorMessage}` }, { status: 500 });
  }
}
