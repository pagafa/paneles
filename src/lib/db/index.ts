
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

// Helper function to create or recover a NeDB datastore
async function createOrRecoverDb<T extends { id: string }>(
  dbPath: string,
  dbNameForLog: string,
  uniqueIndexFields: Array<{ fieldName: string, unique: boolean }> = [{ fieldName: 'id', unique: true }]
): Promise<Datastore<T>> {
  let db: Datastore<T>;
  try {
    db = Datastore.create({
      filename: dbPath,
      autoload: true,
      timestampData: true,
    });
    for (const index of uniqueIndexFields) {
      await db.ensureIndex(index);
    }
  } catch (initializationError) {
    const err = initializationError as Error;
    // Check for common NeDB corruption messages
    if (err.message.includes("More than 10% of the data file is corrupt") || 
        err.message.includes("unexpected end of file") ||
        err.message.toLowerCase().includes("enoent") && err.message.includes("rename") && err.message.includes(".db~")) {
      console.warn(`Database file (${dbPath}) for ${dbNameForLog} appears corrupt or inconsistent: "${err.message}". Attempting to delete and re-initialize.`);
      try {
        // Attempt to delete the main db file and any journal file (ending with ~)
        await fs.unlink(dbPath).catch(() => { /* ignore if main file doesn't exist or fails */ });
        await fs.unlink(`${dbPath}~`).catch(() => { /* ignore if journal file doesn't exist or fails */ });
        
        db = Datastore.create({ // This will create the file if it doesn't exist
          filename: dbPath,
          autoload: true, 
          timestampData: true,
        });
        for (const index of uniqueIndexFields) {
          await db.ensureIndex(index);
        }
        console.log(`Successfully re-initialized ${dbNameForLog} database (${dbPath}) after corruption attempt.`);
      } catch (reinitializationError) {
        console.error(`Failed to re-initialize ${dbNameForLog} database (${dbPath}) after corruption:`, reinitializationError);
        throw reinitializationError; // Throw the error from the second attempt
      }
    } else {
      // Not a corruption error we're attempting to handle this way
      console.error(`Error initializing ${dbNameForLog} database (${dbPath}):`, err);
      throw err;
    }
  }
  return db;
}


// --- Announcements Database ---
async function initializeAnnouncementsDatabase(): Promise<Datastore<Announcement>> {
  await ensureDataDirectory();
  const dbPath = path.join(dataDir, 'announcements.db');
  const db = await createOrRecoverDb<Announcement>(dbPath, 'Announcements', [{fieldName: 'id', unique: true}]);
  
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
    const db = await announcementsDbInitializationPromise;
    announcementsDbInstance = db; // Set instance after promise resolves
    return db;
  } catch (error) {
    announcementsDbInitializationPromise = null; // Clear promise on failure
    throw error;
  } finally {
    // Optionally clear the promise if it succeeded to allow re-init if server restarts and instance is lost
    // However, with instance check, this might not be needed unless instance becomes null elsewhere
    if (announcementsDbInstance) {
        announcementsDbInitializationPromise = null;
    }
  }
}

// --- Classes Database ---
async function initializeClassesDatabase(): Promise<Datastore<SchoolClass>> {
  await ensureDataDirectory();
  const dbPath = path.join(dataDir, 'classes.db');
  const db = await createOrRecoverDb<SchoolClass>(dbPath, 'Classes', [{fieldName: 'id', unique: true}]);

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
    const db = await classesDbInitializationPromise;
    classesDbInstance = db;
    return db;
  } catch (error) {
    classesDbInitializationPromise = null;
    throw error;
  } finally {
    if (classesDbInstance) {
        classesDbInitializationPromise = null;
    }
  }
}

// --- Users Database ---
async function initializeUsersDatabase(): Promise<Datastore<User>> {
  await ensureDataDirectory();
  const dbPath = path.join(dataDir, 'users.db');
  const db = await createOrRecoverDb<User>(dbPath, 'Users', [
    { fieldName: 'id', unique: true },
    { fieldName: 'username', unique: true }
  ]);
  
  const count = await db.count({});
  if (count === 0 && mockUsers && mockUsers.length > 0) {
    try {
      // Ensure mock users have passwords for seeding if the type allows
      const usersToSeed = mockUsers.map(u => ({...u, password: u.password || 'password'}));
      await db.insert(usersToSeed);
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
    const db = await usersDbInitializationPromise;
    usersDbInstance = db;
    return db;
  } catch (error) {
    usersDbInitializationPromise = null;
    throw error;
  } finally {
    if (usersDbInstance) {
        usersDbInitializationPromise = null;
    }
  }
}

// --- SchoolEvents Database (Delegate Submissions) ---
async function initializeSchoolEventsDatabase(): Promise<Datastore<SchoolEvent>> {
  await ensureDataDirectory();
  const dbPath = path.join(dataDir, 'schoolevents.db');
  const db = await createOrRecoverDb<SchoolEvent>(dbPath, 'SchoolEvents', [{fieldName: 'id', unique: true}]);

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
    const db = await schoolEventsDbInitializationPromise;
    schoolEventsDbInstance = db;
    return db;
  } catch (error) {
    schoolEventsDbInitializationPromise = null;
    throw error;
  } finally {
    if (schoolEventsDbInstance) {
        schoolEventsDbInitializationPromise = null;
    }
  }
}
