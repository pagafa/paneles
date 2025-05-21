
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
    console.log(`[DB Setup] Successfully loaded or created ${dbNameForLog} database at ${dbPath}`);
  } catch (initializationError) {
    const err = initializationError as Error;
    if (err.message.includes("More than 10% of the data file is corrupt") ||
        err.message.includes("unexpected end of file") ||
        (err.message.toLowerCase().includes("enoent") && err.message.includes("rename") && err.message.includes(".db~"))) {
      console.warn(`[DB Recovery] Database file (${dbPath}) for ${dbNameForLog} appears corrupt or inconsistent: "${err.message}". Attempting to delete and re-initialize.`);
      try {
        try {
          console.log(`[DB Recovery] Attempting to delete main DB file: ${dbPath}`);
          await fs.unlink(dbPath);
          console.log(`[DB Recovery] Successfully deleted main DB file: ${dbPath}`);
        } catch (unlinkError: any) {
          if (unlinkError.code !== 'ENOENT') { // File not found is okay here
            console.warn(`[DB Recovery] Failed to delete main DB file ${dbPath} (might be okay if only journal existed or file already gone):`, unlinkError.message);
          } else {
            console.log(`[DB Recovery] Main DB file ${dbPath} did not exist, proceeding.`);
          }
        }
        try {
          const journalPath = `${dbPath}~`;
          console.log(`[DB Recovery] Attempting to delete journal file: ${journalPath}`);
          await fs.unlink(journalPath);
          console.log(`[DB Recovery] Successfully deleted journal file: ${journalPath}`);
        } catch (unlinkJournalError: any) {
          if (unlinkJournalError.code !== 'ENOENT') { // File not found is okay here
            console.warn(`[DB Recovery] Failed to delete journal file ${dbPath}~ (might be okay if it didn't exist):`, unlinkJournalError.message);
          } else {
            console.log(`[DB Recovery] Journal file ${dbPath}~ did not exist.`);
          }
        }
        
        console.log(`[DB Recovery] Attempting to re-create database: ${dbPath}`);
        db = Datastore.create({ filename: dbPath, autoload: true, timestampData: true });
        for (const index of uniqueIndexFields) {
          await db.ensureIndex(index);
        }
        console.log(`[DB Recovery] Successfully re-initialized ${dbNameForLog} database (${dbPath}).`);
      } catch (reinitializationError) {
        console.error(`[DB Recovery] Failed to re-initialize ${dbNameForLog} database (${dbPath}) after corruption attempt:`, reinitializationError);
        throw reinitializationError;
      }
    } else {
      console.error(`[DB Setup] Error initializing ${dbNameForLog} database (${dbPath}):`, err);
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
  announcementsDbInstance = db;
  return db;
}

export async function getAnnouncementsDb(): Promise<Datastore<Announcement>> {
  if (announcementsDbInstance) return announcementsDbInstance;
  if (announcementsDbInitializationPromise) {
    try {
      await announcementsDbInitializationPromise;
      if (announcementsDbInstance) return announcementsDbInstance;
      console.warn("[getAnnouncementsDb] Awaited existing promise, but instance not set. Retrying initialization.");
    } catch (e) {
      console.warn(`[getAnnouncementsDb] Existing initialization promise failed. Error: ${(e as Error).message}. Retrying.`);
      announcementsDbInitializationPromise = null;
    }
  }
  if (!announcementsDbInstance) {
    const newPromise = initializeAnnouncementsDatabase();
    announcementsDbInitializationPromise = newPromise;
    try {
      const db = await newPromise;
      announcementsDbInstance = db;
      return db;
    } catch (error) {
      console.error(`[getAnnouncementsDb] Failed to initialize database on new attempt:`, error);
      announcementsDbInitializationPromise = null;
      throw error;
    } finally {
      if (announcementsDbInitializationPromise === newPromise) {
        announcementsDbInitializationPromise = null;
      }
    }
  }
  if (!announcementsDbInstance) throw new Error("Failed to get announcementsDb instance after all attempts.");
  return announcementsDbInstance;
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
  classesDbInstance = db;
  return db;
}

export async function getClassesDb(): Promise<Datastore<SchoolClass>> {
  if (classesDbInstance) return classesDbInstance;
  if (classesDbInitializationPromise) {
    try {
      await classesDbInitializationPromise;
      if (classesDbInstance) return classesDbInstance;
      console.warn("[getClassesDb] Awaited existing promise, but instance not set. Retrying initialization.");
    } catch (e) {
      console.warn(`[getClassesDb] Existing initialization promise failed. Error: ${(e as Error).message}. Retrying.`);
      classesDbInitializationPromise = null;
    }
  }
  if (!classesDbInstance) {
    const newPromise = initializeClassesDatabase();
    classesDbInitializationPromise = newPromise;
    try {
      const db = await newPromise;
      classesDbInstance = db;
      return db;
    } catch (error) {
      console.error(`[getClassesDb] Failed to initialize database on new attempt:`, error);
      classesDbInitializationPromise = null;
      throw error;
    } finally {
      if (classesDbInitializationPromise === newPromise) {
        classesDbInitializationPromise = null;
      }
    }
  }
  if (!classesDbInstance) throw new Error("Failed to get classesDb instance after all attempts.");
  return classesDbInstance;
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
  usersDbInstance = db;
  return db;
}

export async function getUsersDb(): Promise<Datastore<User>> {
  if (usersDbInstance) return usersDbInstance;
  if (usersDbInitializationPromise) {
    try {
      await usersDbInitializationPromise;
      if (usersDbInstance) return usersDbInstance;
      console.warn("[getUsersDb] Awaited existing promise, but instance not set. Retrying initialization.");
    } catch (e) {
      console.warn(`[getUsersDb] Existing initialization promise failed. Error: ${(e as Error).message}. Retrying.`);
      usersDbInitializationPromise = null;
    }
  }
  if(!usersDbInstance) {
    const newPromise = initializeUsersDatabase();
    usersDbInitializationPromise = newPromise;
    try {
      const db = await newPromise;
      usersDbInstance = db;
      return db;
    } catch (error) {
      console.error(`[getUsersDb] Failed to initialize database on new attempt:`, error);
      usersDbInitializationPromise = null;
      throw error;
    } finally {
      if (usersDbInitializationPromise === newPromise) {
        usersDbInitializationPromise = null;
      }
    }
  }
  if (!usersDbInstance) throw new Error("Failed to get usersDb instance after all attempts.");
  return usersDbInstance;
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
  schoolEventsDbInstance = db;
  return db;
}

export async function getSchoolEventsDb(): Promise<Datastore<SchoolEvent>> {
  if (schoolEventsDbInstance) return schoolEventsDbInstance;
  if (schoolEventsDbInitializationPromise) {
    try {
      await schoolEventsDbInitializationPromise;
      if (schoolEventsDbInstance) return schoolEventsDbInstance;
      console.warn("[getSchoolEventsDb] Awaited existing promise, but instance not set. Retrying initialization.");
    } catch (e) {
      console.warn(`[getSchoolEventsDb] Existing initialization promise failed. Error: ${(e as Error).message}. Retrying.`);
      schoolEventsDbInitializationPromise = null;
    }
  }
  if (!schoolEventsDbInstance) {
    const newPromise = initializeSchoolEventsDatabase();
    schoolEventsDbInitializationPromise = newPromise;
    try {
      const db = await newPromise;
      schoolEventsDbInstance = db;
      return db;
    } catch (error) {
      console.error(`[getSchoolEventsDb] Failed to initialize database on new attempt:`, error);
      schoolEventsDbInitializationPromise = null;
      throw error;
    } finally {
      if (schoolEventsDbInitializationPromise === newPromise) {
        schoolEventsDbInitializationPromise = null;
      }
    }
  }
  if (!schoolEventsDbInstance) throw new Error("Failed to get schoolEventsDb instance after all attempts.");
  return schoolEventsDbInstance;
}
