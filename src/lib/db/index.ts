
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
    console.error('[DB Setup] Error creating data directory:', error);
    if ((error as NodeJS.ErrnoException).code !== 'EEXIST') {
      throw error;
    }
  }
}

// Helper function to create or recover a NeDB datastore
async function createOrRecoverDb<T extends { id: string }>(
  dbPath: string,
  dbNameForLog: string,
  uniqueIndexFields: Array<{ fieldName: string; unique: boolean }> = [{ fieldName: 'id', unique: true }]
): Promise<Datastore<T>> {
  let db: Datastore<T>;
  try {
    console.log(`[DB Setup] Attempting to load/create ${dbNameForLog} at ${dbPath}`);
    db = Datastore.create({
      filename: dbPath,
      autoload: true,
      timestampData: true,
    });
    for (const index of uniqueIndexFields) {
      await db.ensureIndex(index);
    }
    console.log(`[DB Setup] Successfully loaded or created ${dbNameForLog} database at ${dbPath}`);
  } catch (initializationError) {
    const err = initializationError as Error & { code?: string };
    console.warn(`[DB Recovery Attempt - ${dbNameForLog}] Initial error for ${dbPath}: ${err.message}`);

    const isCorruptError = err.message.includes("More than 10% of the data file is corrupt") ||
                           err.message.includes("unexpected end of file") ||
                           (err.code === 'ENOENT' && err.message.includes("rename") && err.message.includes(".db~"));

    if (isCorruptError) {
      console.warn(`[DB Recovery Attempt - ${dbNameForLog}] Database file (${dbPath}) appears corrupt or inconsistent. Attempting to delete and re-initialize.`);
      try {
        try {
          console.log(`[DB Recovery Attempt - ${dbNameForLog}] Attempting to delete main DB file: ${dbPath}`);
          await fs.unlink(dbPath);
          console.log(`[DB Recovery Attempt - ${dbNameForLog}] Successfully deleted main DB file: ${dbPath}`);
        } catch (unlinkError: any) {
          if (unlinkError.code !== 'ENOENT') { 
            console.warn(`[DB Recovery Attempt - ${dbNameForLog}] Failed to delete main DB file ${dbPath} (might be okay if only journal existed or file already gone):`, unlinkError.message);
          } else {
            console.log(`[DB Recovery Attempt - ${dbNameForLog}] Main DB file ${dbPath} did not exist, proceeding.`);
          }
        }

        const journalPath = `${dbPath}~`;
        try {
          console.log(`[DB Recovery Attempt - ${dbNameForLog}] Attempting to delete journal file: ${journalPath}`);
          await fs.unlink(journalPath);
          console.log(`[DB Recovery Attempt - ${dbNameForLog}] Successfully deleted journal file: ${journalPath}`);
        } catch (unlinkJournalError: any) {
          if (unlinkJournalError.code !== 'ENOENT') { 
            console.warn(`[DB Recovery Attempt - ${dbNameForLog}] Failed to delete journal file ${journalPath} (might be okay if it didn't exist):`, unlinkJournalError.message);
          } else {
            console.log(`[DB Recovery Attempt - ${dbNameForLog}] Journal file ${journalPath} did not exist.`);
          }
        }
        
        console.log(`[DB Recovery Attempt - ${dbNameForLog}] Attempting to re-create database: ${dbPath}`);
        db = Datastore.create({ filename: dbPath, autoload: true, timestampData: true });
        for (const index of uniqueIndexFields) {
          await db.ensureIndex(index);
        }
        console.log(`[DB Recovery Attempt - ${dbNameForLog}] Successfully re-initialized ${dbNameForLog} database (${dbPath}).`);
      } catch (reinitializationError) {
        console.error(`[DB Recovery Attempt - ${dbNameForLog}] Failed to re-initialize ${dbNameForLog} database (${dbPath}) after corruption attempt:`, reinitializationError);
        throw reinitializationError; 
      }
    } else {
      console.error(`[DB Setup - ${dbNameForLog}] Unhandled error initializing ${dbNameForLog} database (${dbPath}):`, err);
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
      console.log('[DB Seed] Announcements DB seeded with mockAnnouncements.');
    } catch (seedError) {
      console.error('[DB Seed] Error seeding announcements DB:', seedError);
    }
  }
  return db;
}

export async function getAnnouncementsDb(): Promise<Datastore<Announcement>> {
  if (announcementsDbInstance) return announcementsDbInstance;
  if (announcementsDbInitializationPromise) {
    console.log('[DB getAnnouncementsDb] Awaiting existing initialization promise...');
    return announcementsDbInitializationPromise;
  }
  console.log('[DB getAnnouncementsDb] Starting new initialization...');
  announcementsDbInitializationPromise = initializeAnnouncementsDatabase()
    .then(db => {
      announcementsDbInstance = db;
      console.log('[DB getAnnouncementsDb] Initialization successful.');
      return db;
    })
    .catch(err => {
      console.error('[DB getAnnouncementsDb] Initialization failed:', err);
      announcementsDbInitializationPromise = null; // Allow retry
      throw err;
    });
  return announcementsDbInitializationPromise;
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
      console.log('[DB Seed] Classes DB seeded with mockClasses.');
    } catch (seedError) {
      console.error('[DB Seed] Error seeding classes DB:', seedError);
    }
  }
  return db;
}

export async function getClassesDb(): Promise<Datastore<SchoolClass>> {
  if (classesDbInstance) return classesDbInstance;
  if (classesDbInitializationPromise) {
    console.log('[DB getClassesDb] Awaiting existing initialization promise...');
    return classesDbInitializationPromise;
  }
  console.log('[DB getClassesDb] Starting new initialization...');
  classesDbInitializationPromise = initializeClassesDatabase()
    .then(db => {
      classesDbInstance = db;
      console.log('[DB getClassesDb] Initialization successful.');
      return db;
    })
    .catch(err => {
      console.error('[DB getClassesDb] Initialization failed:', err);
      classesDbInitializationPromise = null; // Allow retry
      throw err;
    });
  return classesDbInitializationPromise;
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
      await db.insert(mockUsers);
      console.log('[DB Seed] Users DB seeded with mockUsers.');
    } catch (seedError) {
      console.error('[DB Seed] Error seeding users DB:', seedError);
    }
  }
  return db;
}

export async function getUsersDb(): Promise<Datastore<User>> {
  if (usersDbInstance) return usersDbInstance;
  if (usersDbInitializationPromise) {
    console.log('[DB getUsersDb] Awaiting existing initialization promise...');
    return usersDbInitializationPromise;
  }
  console.log('[DB getUsersDb] Starting new initialization...');
  usersDbInitializationPromise = initializeUsersDatabase()
    .then(db => {
      usersDbInstance = db;
      console.log('[DB getUsersDb] Initialization successful.');
      return db;
    })
    .catch(err => {
      console.error('[DB getUsersDb] Initialization failed:', err);
      usersDbInitializationPromise = null; // Allow retry
      throw err;
    });
  return usersDbInitializationPromise;
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
      console.log('[DB Seed] SchoolEvents DB seeded with mockSchoolEvents.');
    } catch (seedError) {
      console.error('[DB Seed] Error seeding schoolEvents DB:', seedError);
    }
  }
  return db;
}

export async function getSchoolEventsDb(): Promise<Datastore<SchoolEvent>> {
  if (schoolEventsDbInstance) return schoolEventsDbInstance;
  if (schoolEventsDbInitializationPromise) {
    console.log('[DB getSchoolEventsDb] Awaiting existing initialization promise...');
    return schoolEventsDbInitializationPromise;
  }
  console.log('[DB getSchoolEventsDb] Starting new initialization...');
  schoolEventsDbInitializationPromise = initializeSchoolEventsDatabase()
    .then(db => {
      schoolEventsDbInstance = db;
      console.log('[DB getSchoolEventsDb] Initialization successful.');
      return db;
    })
    .catch(err => {
      console.error('[DB getSchoolEventsDb] Initialization failed:', err);
      schoolEventsDbInitializationPromise = null; // Allow retry
      throw err;
    });
  return schoolEventsDbInitializationPromise;
}

    