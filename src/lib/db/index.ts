
'use server';

import Datastore from 'nedb-promises';
import path from 'path';
import fs from 'fs/promises';
import type { Announcement } from '@/types';

const dataDir = path.join(process.cwd(), 'data');
let dbInstance: Datastore<Announcement> | null = null;

// Function to ensure the data directory exists
async function ensureDataDirectory(): Promise<void> {
  try {
    await fs.mkdir(dataDir, { recursive: true });
  } catch (error) {
    console.error('Error creating data directory:', error);
    // Depending on the error, you might want to handle it or rethrow
    if ((error as NodeJS.ErrnoException).code !== 'EEXIST') {
      throw error;
    }
  }
}

// Initialize and return the database instance
async function initializeDatabase(): Promise<Datastore<Announcement>> {
  await ensureDataDirectory(); // Ensure directory exists before creating datastore
  
  const db = Datastore.create({
    filename: path.join(dataDir, 'announcements.db'),
    autoload: true,
    timestampData: true, // Automatically add createdAt and updatedAt
  });

  // Ensure index on our application-specific 'id' field for uniqueness and faster lookups
  // NeDB will create its own _id field automatically.
  try {
    await db.ensureIndex({ fieldName: 'id', unique: true });
  } catch (indexError) {
    console.error("Error ensuring index on 'id':", indexError);
    // Handle specific index error if necessary, e.g., if uniqueness is violated by existing data (not typical on init)
  }
  
  return db;
}

export async function getAnnouncementsDb(): Promise<Datastore<Announcement>> {
  if (!dbInstance) {
    dbInstance = await initializeDatabase();
  }
  return dbInstance;
}
