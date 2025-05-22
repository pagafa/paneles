
'use server';

import { NextResponse } from 'next/server';
import { getAnnouncementsDb } from '@/lib/db';
import type { Announcement } from '@/types';

// GET all announcements
export async function GET() {
  try {
    const db = await getAnnouncementsDb();
    // Sort by date descending (newest first)
    const announcements = await db.find({}).sort({ date: -1 });
    return NextResponse.json(announcements);
  } catch (error) {
    console.error('[API GET /api/announcements] Error:', error);
    return NextResponse.json({ message: 'Error fetching announcements', error: (error as Error).message }, { status: 500 });
  }
}

// POST a new announcement
export async function POST(request: Request) {
  try {
    const newAnnouncementData: Omit<Announcement, 'id' | 'type'> & { id?: string; type?: string } = await request.json();

    if (!newAnnouncementData.title || !newAnnouncementData.content || !newAnnouncementData.date) {
      return NextResponse.json({ message: 'Missing required fields (title, content, date)' }, { status: 400 });
    }

    if (!newAnnouncementData.targetClassIds || !Array.isArray(newAnnouncementData.targetClassIds) || newAnnouncementData.targetClassIds.length === 0) {
      return NextResponse.json({ message: 'targetClassIds must be a non-empty array' }, { status: 400 });
    }

    const db = await getAnnouncementsDb();

    const announcementToAdd: Announcement = {
      id: newAnnouncementData.id || `ann-${Date.now()}`, // Ensure our app-level ID
      title: newAnnouncementData.title,
      content: newAnnouncementData.content,
      date: newAnnouncementData.date,
      type: 'announcement', // Always 'announcement' for this endpoint
      targetClassIds: newAnnouncementData.targetClassIds,
    };

    const savedAnnouncement = await db.insert(announcementToAdd);
    return NextResponse.json(savedAnnouncement, { status: 201 });
  } catch (error) {
    console.error('[API POST /api/announcements] Error creating announcement:', error);
    if ((error as Error).message.includes('unique constraint violated')) {
        return NextResponse.json({ message: 'Error creating announcement: ID already exists.', error: (error as Error).message }, { status: 409 });
    }
    return NextResponse.json({ message: 'Error creating announcement', error: (error as Error).message }, { status: 500 });
  }
}
