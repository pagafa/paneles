
'use server';

import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import type { Announcement } from '@/types';

const dataFilePath = path.join(process.cwd(), 'src', 'lib', 'announcements.data.json');

async function readData(): Promise<Announcement[]> {
  try {
    const jsonData = await fs.readFile(dataFilePath, 'utf-8');
    return JSON.parse(jsonData);
  } catch (error) {
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

// GET a single announcement by ID (optional, not strictly needed by current frontend but good practice)
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const announcements = await readData();
    const announcement = announcements.find(ann => ann.id === params.id);
    if (announcement) {
      return NextResponse.json(announcement);
    }
    return NextResponse.json({ message: 'Announcement not found' }, { status: 404 });
  } catch (error) {
    return NextResponse.json({ message: 'Error fetching announcement', error: (error as Error).message }, { status: 500 });
  }
}

// PUT (update) an announcement
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const updatedAnnouncementData: Partial<Announcement> = await request.json();
    if (!params.id) {
        return NextResponse.json({ message: 'Announcement ID is required' }, { status: 400 });
    }

    let announcements = await readData();
    const announcementIndex = announcements.findIndex(ann => ann.id === params.id);

    if (announcementIndex === -1) {
      return NextResponse.json({ message: 'Announcement not found' }, { status: 404 });
    }

    // Merge existing data with new data, ensuring ID and type are preserved
    announcements[announcementIndex] = {
        ...announcements[announcementIndex],
        ...updatedAnnouncementData,
        id: params.id, // Ensure ID is not changed
        type: 'announcement', // Ensure type is 'announcement'
    };
    
    await writeData(announcements);
    return NextResponse.json(announcements[announcementIndex]);
  } catch (error) {
    return NextResponse.json({ message: 'Error updating announcement', error: (error as Error).message }, { status: 500 });
  }
}

// DELETE an announcement
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    if (!params.id) {
        return NextResponse.json({ message: 'Announcement ID is required' }, { status: 400 });
    }
    let announcements = await readData();
    const filteredAnnouncements = announcements.filter(ann => ann.id !== params.id);

    if (announcements.length === filteredAnnouncements.length) {
      return NextResponse.json({ message: 'Announcement not found' }, { status: 404 });
    }

    await writeData(filteredAnnouncements);
    return NextResponse.json({ message: 'Announcement deleted successfully' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Error deleting announcement', error: (error as Error).message }, { status: 500 });
  }
}
