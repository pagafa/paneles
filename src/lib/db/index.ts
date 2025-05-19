
'use server';

import Datastore from 'nedb-promises';
import path from 'path';
import fs from 'fs/promises';
import type { Announcement, SchoolClass, User, SchoolEvent } from '@/types';
import { mockClasses, mockUsers, mockSchoolEvents } from '@/lib/placeholder-data';

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
  
  // No longer seeding mockAnnouncements here as admin announcements are API driven.
  // Seeding could be done via a separate script if needed, or ensure first admin creates some.
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
    timestampData: true,
  });
  await db.ensureIndex({ fieldName: 'id', unique: true });

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

// --- Users Database ---
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
      await db.insert(mockUsers); 
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


// --- SchoolEvents Database (Delegate Submissions) ---
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
      await db.insert(mockSchoolEvents); // Seed with exams, deadlines, delegate announcements
      console.log('SchoolEvents DB seeded with mockSchoolEvents.');
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
