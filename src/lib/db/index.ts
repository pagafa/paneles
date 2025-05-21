
'use server';

import Datastore from 'nedb-promises';
import path from 'path';
import fs from 'fs/promises';
import type { Announcement, SchoolClass, User, SchoolEvent } from '@/types';
import { mockClasses, mockUsers, mockSchoolEvents, mockAnnouncements } from '@/lib/placeholder-data';

const dataDir = path.join(process.cwd(), 'data');

// Promises to ensure initialization runs only once per datastore
let announcementsDbInitializationPromise: Promise<Datastore<Announcement>> | null = null;
let classesDbInitializationPromise: Promise<Datastore<SchoolClass>> | null = null;
let usersDbInitializationPromise: Promise<Datastore<User>> | null = null;
let schoolEventsDbInitializationPromise: Promise<Datastore<SchoolEvent>> | null = null;

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
  
  const count = await db.count({});
  if (count === 0 && mockAnnouncements && mockAnnouncements.length > 0) {
    try {
      await db.insert(mockAnnouncements);
      console.log('Announcements DB seeded with mockAnnouncements.');
    } catch (seedError) {
      console.error('Error seeding announcements DB:', seedError);
    }
  }
  announcementsDbInstance = db;
  return db;
}

export async function getAnnouncementsDb(): Promise<Datastore<Announcement>> {
  if (announcementsDbInstance) {
    return announcementsDbInstance;
  }
  if (!announcementsDbInitializationPromise) {
    announcementsDbInitializationPromise = initializeAnnouncementsDatabase();
  }
  try {
    return await announcementsDbInitializationPromise;
  } finally {
    // Clear the promise once resolved or rejected to allow re-initialization on next call if failed.
    // However, for successful initialization, instance is set, so future calls hit the first `if`.
    announcementsDbInitializationPromise = null; 
  }
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
  classesDbInstance = db;
  return db;
}

export async function getClassesDb(): Promise<Datastore<SchoolClass>> {
  if (classesDbInstance) {
    return classesDbInstance;
  }
  if (!classesDbInitializationPromise) {
    classesDbInitializationPromise = initializeClassesDatabase();
  }
   try {
    return await classesDbInitializationPromise;
  } finally {
    classesDbInitializationPromise = null;
  }
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
      await db.insert(mockUsers.map(({ password, ...user }) => ({ ...user, password }))); // Ensure password is included if type allows
      console.log('Users DB seeded with mockUsers.');
    } catch (seedError) {
      console.error('Error seeding users DB:', seedError);
    }
  }
  usersDbInstance = db;
  return db;
}

export async function getUsersDb(): Promise<Datastore<User>> {
  if (usersDbInstance) {
    return usersDbInstance;
  }
  if (!usersDbInitializationPromise) {
    usersDbInitializationPromise = initializeUsersDatabase();
  }
  try {
    return await usersDbInitializationPromise;
  } finally {
    usersDbInitializationPromise = null;
  }
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
      await db.insert(mockSchoolEvents); 
      console.log('SchoolEvents DB seeded with mockSchoolEvents.');
    } catch (seedError) {
      console.error('Error seeding schoolEvents DB:', seedError);
    }
  }
  schoolEventsDbInstance = db;
  return db;
}

export async function getSchoolEventsDb(): Promise<Datastore<SchoolEvent>> {
  if (schoolEventsDbInstance) {
    return schoolEventsDbInstance;
  }
  if (!schoolEventsDbInitializationPromise) {
    schoolEventsDbInitializationPromise = initializeSchoolEventsDatabase();
  }
  try {
    return await schoolEventsDbInitializationPromise;
  } finally {
    schoolEventsDbInitializationPromise = null;
  }
}
