
'use server';

import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import type { Announcement } from '@/types';

const dataFilePath = path.join(process.cwd(), 'src', 'lib', 'announcements.data.json');

async function readData(): Promise<Announcement[]> {
  try {
    const jsonData = await fs.readFile(dataFilePath, 'utf-8');
    return JSON.parse(jsonData) as Announcement[];
  } catch (error) {
    // If file doesn't exist or other error, return empty array or handle appropriately
    console.error('Error reading announcements data file:', error);
    return [];
  }
}

async function writeData(data: Announcement[]): Promise<void> {
  try {
    await fs.writeFile(dataFilePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error writing announcements data file:', error);
    throw new Error('Could not write announcements data.');
  }
}

// GET all announcements
export async function GET() {
  try {
    const announcements = await readData();
    return NextResponse.json(announcements);
  } catch (error) {
    return NextResponse.json({ message: 'Error fetching announcements', error: (error as Error).message }, { status: 500 });
  }
}

// POST a new announcement
export async function POST(request: Request) {
  try {
    const newAnnouncement: Omit<Announcement, 'id'> & { id?: string } = await request.json();
    if (!newAnnouncement.title || !newAnnouncement.content || !newAnnouncement.date) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    const announcements = await readData();
    const announcementToAdd: Announcement = {
      ...newAnnouncement,
      id: newAnnouncement.id || `ann-${Date.now()}`, // Assign new ID if not provided
      type: 'announcement', // Ensure type is set
    };

    announcements.push(announcementToAdd);
    await writeData(announcements);
    return NextResponse.json(announcementToAdd, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: 'Error creating announcement', error: (error as Error).message }, { status: 500 });
  }
}
