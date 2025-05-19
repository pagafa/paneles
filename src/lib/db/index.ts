
'use server';

import Datastore from 'nedb-promises';
import path from 'path';
import fs from 'fs/promises';
import type { Announcement, SchoolClass, User } from '@/types'; // Added SchoolClass, User
import { mockClasses, mockUsers, mockSchoolEvents } from '@/lib/placeholder-data'; // For seeding

const dataDir = path.join(process.cwd(), 'data');
let announcementsDbInstance: Datastore<Announcement> | null = null;
let classesDbInstance: Datastore<SchoolClass> | null = null;
let usersDbInstance: Datastore<User> | null = null;
let schoolEventsDbInstance: Datastore<SchoolEvent> | null = null;


// Function to ensure the data directory exists
async function ensureDataDirectory(): Promise<void> {
  try {
    await fs.mkdir(dataDir, { recursive: true });
  } catch (error) {
    console.error('Error creating data directory:', error);
    if ((error as NodeJS.ErrnoException).code !== 'EEXIST') {
      throw error;
    }
  }
}

// --- Announcements Database ---
async function initializeAnnouncementsDatabase(): Promise<Datastore<Announcement>> {
  await ensureDataDirectory();
  const dbPath = path.join(dataDir, 'announcements.db');
  const db = Datastore.create({
    filename: dbPath,
    autoload: true,
    timestampData: true,
  });
  await db.ensureIndex({ fieldName: 'id', unique: true });
  
  // Seed initial data if DB is empty (optional, for development)
  // const count = await db.count({});
  // if (count === 0 && mockAnnouncements && mockAnnouncements.length > 0) {
  //   try {
  //     await db.insert(mockAnnouncements);
  //     console.log('Announcements DB seeded.');
  //   } catch (seedError) {
  //     console.error('Error seeding announcements DB:', seedError);
  //   }
  // }
  return db;
}

export async function getAnnouncementsDb(): Promise<Datastore<Announcement>> {
  if (!announcementsDbInstance) {
    announcementsDbInstance = await initializeAnnouncementsDatabase();
  }
  return announcementsDbInstance;
}

// --- Classes Database ---
async function initializeClassesDatabase(): Promise<Datastore<SchoolClass>> {
  await ensureDataDirectory();
  const dbPath = path.join(dataDir, 'classes.db');
  const db = Datastore.create({
    filename: dbPath,
    autoload: true,
    timestampData: true, // Add createdAt, updatedAt
  });
  await db.ensureIndex({ fieldName: 'id', unique: true });

  // Seed initial data if DB is empty
  const count = await db.count({});
  if (count === 0 && mockClasses && mockClasses.length > 0) {
    try {
      await db.insert(mockClasses);
      console.log('Classes DB seeded with mockClasses.');
    } catch (seedError) {
      console.error('Error seeding classes DB:', seedError);
    }
  }
  return db;
}

export async function getClassesDb(): Promise<Datastore<SchoolClass>> {
  if (!classesDbInstance) {
    classesDbInstance = await initializeClassesDatabase();
  }
  return classesDbInstance;
}

// --- Users Database (Placeholder for future implementation) ---
async function initializeUsersDatabase(): Promise<Datastore<User>> {
  await ensureDataDirectory();
  const dbPath = path.join(dataDir, 'users.db');
  const db = Datastore.create({
    filename: dbPath,
    autoload: true,
    timestampData: true,
  });
  await db.ensureIndex({ fieldName: 'id', unique: true });
  await db.ensureIndex({ fieldName: 'username', unique: true });
  
  const count = await db.count({});
  if (count === 0 && mockUsers && mockUsers.length > 0) {
    try {
      await db.insert(mockUsers); // Note: Passwords are not hashed in mock data.
      console.log('Users DB seeded with mockUsers.');
    } catch (seedError) {
      console.error('Error seeding users DB:', seedError);
    }
  }
  return db;
}

export async function getUsersDb(): Promise<Datastore<User>> {
  if (!usersDbInstance) {
    usersDbInstance = await initializeUsersDatabase();
  }
  return usersDbInstance;
}


// --- SchoolEvents Database (Delegate Submissions) (Placeholder for future implementation) ---
async function initializeSchoolEventsDatabase(): Promise<Datastore<SchoolEvent>> {
  await ensureDataDirectory();
  const dbPath = path.join(dataDir, 'schoolevents.db');
  const db = Datastore.create({
    filename: dbPath,
    autoload: true,
    timestampData: true,
  });
  await db.ensureIndex({ fieldName: 'id', unique: true });

  const count = await db.count({});
  if (count === 0 && mockSchoolEvents && mockSchoolEvents.length > 0) {
    try {
      // Filter out admin announcements if they are handled by announcements.db
      // For simplicity now, we might seed all mockSchoolEvents.
      // Or, ensure mockSchoolEvents only contains delegate-type submissions.
      const delegateEvents = mockSchoolEvents.filter(e => e.type === 'exam' || e.type === 'deadline' || (e.type === 'announcement' && e.class)); // Basic filter
      await db.insert(delegateEvents);
      console.log('SchoolEvents DB seeded.');
    } catch (seedError) {
      console.error('Error seeding schoolEvents DB:', seedError);
    }
  }
  return db;
}

export async function getSchoolEventsDb(): Promise<Datastore<SchoolEvent>> {
  if (!schoolEventsDbInstance) {
    schoolEventsDbInstance = await initializeSchoolEventsDatabase();
  }
  return schoolEventsDbInstance;
}
