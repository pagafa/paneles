
import Datastore from 'nedb-promises';
import path from 'path';
import fs from 'fs/promises';
import type { Announcement, SchoolClass, User, SchoolEvent } from '@/types';
import { mockClasses, mockUsers, mockSchoolEvents, mockAnnouncements } from '@/lib/placeholder-data';
import bcrypt from 'bcrypt';

const dataDir = path.join(process.cwd(), 'data');
const SALT_ROUNDS = 10;

// --- Singleton Promises & Instances ---
let announcementsDbInstance: Datastore<Announcement> | null = null;
let announcementsDbInitializationPromise: Promise<Datastore<Announcement>> | null = null;

let classesDbInstance: Datastore<SchoolClass> | null = null;
let classesDbInitializationPromise: Promise<Datastore<SchoolClass>> | null = null;

let usersDbInstance: Datastore<User> | null = null;
let usersDbInitializationPromise: Promise<Datastore<User>> | null = null;

let schoolEventsDbInstance: Datastore<SchoolEvent> | null = null;
let schoolEventsDbInitializationPromise: Promise<Datastore<SchoolEvent>> | null = null;


// --- Helper Functions ---
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
    const err = initializationError as Error & { code?: string; message: string };
    console.warn(`[DB Recovery - ${dbNameForLog}] Initial error for ${dbPath}: ${err.message}`);

    const isCorruptError = err.message.includes("More than 10% of the data file is corrupt") ||
                           err.message.includes("unexpected end of file") ||
                           (err.code === 'ENOENT' && err.message.includes("rename") && err.message.includes(".db~"));

    if (isCorruptError) {
      console.warn(`[DB Recovery - ${dbNameForLog}] Database file (${dbPath}) appears corrupt or inconsistent. Attempting to delete and re-initialize.`);
      try {
        try {
          console.log(`[DB Recovery - ${dbNameForLog}] Attempting to delete main DB file: ${dbPath}`);
          await fs.unlink(dbPath);
          console.log(`[DB Recovery - ${dbNameForLog}] Successfully deleted main DB file: ${dbPath}`);
        } catch (unlinkError: any) {
          if (unlinkError.code !== 'ENOENT') { 
            console.error(`[DB Recovery - ${dbNameForLog}] CRITICAL: Failed to delete main DB file ${dbPath} during recovery:`, unlinkError.message);
            // If we can't delete the main corrupted file, re-throw the original error.
            // Further attempts to create will likely fail or operate on the bad file.
            throw err; 
          } else {
            console.log(`[DB Recovery - ${dbNameForLog}] Main DB file ${dbPath} did not exist, proceeding.`);
          }
        }

        const journalPath = `${dbPath}~`;
        try {
          console.log(`[DB Recovery - ${dbNameForLog}] Attempting to delete journal file: ${journalPath}`);
          await fs.unlink(journalPath);
          console.log(`[DB Recovery - ${dbNameForLog}] Successfully deleted journal file: ${journalPath}`);
        } catch (unlinkJournalError: any) {
          if (unlinkJournalError.code !== 'ENOENT') { 
            console.warn(`[DB Recovery - ${dbNameForLog}] Failed to delete journal file ${journalPath} (might be okay if it didn't exist):`, unlinkJournalError.message);
          } else {
            console.log(`[DB Recovery - ${dbNameForLog}] Journal file ${journalPath} did not exist.`);
          }
        }
        
        console.log(`[DB Recovery - ${dbNameForLog}] Attempting to re-create database: ${dbPath}`);
        db = Datastore.create({ filename: dbPath, autoload: true, timestampData: true });
        for (const index of uniqueIndexFields) {
          await db.ensureIndex(index);
        }
        console.log(`[DB Recovery - ${dbNameForLog}] Successfully re-initialized ${dbNameForLog} database (${dbPath}).`);
      } catch (reinitializationError) {
        console.error(`[DB Recovery - ${dbNameForLog}] Failed to re-initialize ${dbNameForLog} database (${dbPath}) after corruption attempt:`, reinitializationError);
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
    await announcementsDbInitializationPromise;
    return announcementsDbInstance!;
  }

  announcementsDbInitializationPromise = initializeAnnouncementsDatabase();
  try {
    announcementsDbInstance = await announcementsDbInitializationPromise;
  } finally {
    announcementsDbInitializationPromise = null; 
  }
  return announcementsDbInstance;
}
export function resetAnnouncementsDbInstance() {
    console.log('[DB Reset] Resetting announcementsDbInstance and promise.');
    announcementsDbInstance = null;
    announcementsDbInitializationPromise = null;
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
    } catch (seedError)
       {
      console.error('[DB Seed] Error seeding classes DB:', seedError);
    }
  }
  return db;
}

export async function getClassesDb(): Promise<Datastore<SchoolClass>> {
  if (classesDbInstance) return classesDbInstance;
  if (classesDbInitializationPromise) {
    await classesDbInitializationPromise;
    return classesDbInstance!;
  }
  
  classesDbInitializationPromise = initializeClassesDatabase();
  try {
    classesDbInstance = await classesDbInitializationPromise;
  } finally {
    classesDbInitializationPromise = null;
  }
  return classesDbInstance;
}
export function resetClassesDbInstance() {
  console.log('[DB Reset] Resetting classesDbInstance and promise.');
  classesDbInstance = null;
  classesDbInitializationPromise = null;
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
      const usersToSeedPromises = mockUsers.map(async (user) => {
        if (user.password) {
          const hashedPassword = await bcrypt.hash(user.password, SALT_ROUNDS);
          return { ...user, password: hashedPassword };
        }
        return user;
      });
      const usersToSeed = await Promise.all(usersToSeedPromises);
      await db.insert(usersToSeed);
      console.log('[DB Seed] Users DB seeded with mockUsers (passwords hashed).');
    } catch (seedError) {
      console.error('[DB Seed] Error seeding users DB:', seedError);
    }
  }
  return db;
}

export async function getUsersDb(): Promise<Datastore<User>> {
  if (usersDbInstance) return usersDbInstance;
  if (usersDbInitializationPromise) {
    await usersDbInitializationPromise;
    return usersDbInstance!;
  }

  usersDbInitializationPromise = initializeUsersDatabase();
  try {
    usersDbInstance = await usersDbInitializationPromise;
  } finally {
    usersDbInitializationPromise = null;
  }
  return usersDbInstance;
}
export function resetUsersDbInstance() {
  console.log('[DB Reset] Resetting usersDbInstance and promise.');
  usersDbInstance = null;
  usersDbInitializationPromise = null;
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
    await schoolEventsDbInitializationPromise;
    return schoolEventsDbInstance!;
  }
  
  schoolEventsDbInitializationPromise = initializeSchoolEventsDatabase();
  try {
    schoolEventsDbInstance = await schoolEventsDbInitializationPromise;
  } finally {
    schoolEventsDbInitializationPromise = null;
  }
  return schoolEventsDbInstance;
}
export function resetSchoolEventsDbInstance() {
  console.log('[DB Reset] Resetting schoolEventsDbInstance and promise.');
  schoolEventsDbInstance = null;
  schoolEventsDbInitializationPromise = null;
}
