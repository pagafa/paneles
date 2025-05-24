
'use server';

import { NextResponse } from 'next/server';
import { 
  getAnnouncementsDb, resetAnnouncementsDbInstance,
  getClassesDb, resetClassesDbInstance,
  getUsersDb, resetUsersDbInstance,
  getSchoolEventsDb, resetSchoolEventsDbInstance
} from '@/lib/db';

export async function POST() {
  console.log('[API /admin/compact-database] Received request to compact databases.');
  try {
    let compactedCount = 0;
    const errors: string[] = [];

    // Compact Announcements DB
    try {
      const announcementsDb = await getAnnouncementsDb();
      console.log('[API /admin/compact-database] Compacting announcements.db...');
      await announcementsDb.persistence.compactDatafile();
      console.log('[API /admin/compact-database] announcements.db compacted. Resetting instance.');
      resetAnnouncementsDbInstance();
      compactedCount++;
    } catch (error) {
      const errorMessage = `Error compacting announcements.db: ${(error as Error).message}`;
      console.error(`[API /admin/compact-database] ${errorMessage}`);
      errors.push(errorMessage);
    }

    // Compact Classes DB
    try {
      const classesDb = await getClassesDb();
      console.log('[API /admin/compact-database] Compacting classes.db...');
      await classesDb.persistence.compactDatafile();
      console.log('[API /admin/compact-database] classes.db compacted. Resetting instance.');
      resetClassesDbInstance();
      compactedCount++;
    } catch (error) {
      const errorMessage = `Error compacting classes.db: ${(error as Error).message}`;
      console.error(`[API /admin/compact-database] ${errorMessage}`);
      errors.push(errorMessage);
    }

    // Compact Users DB
    try {
      const usersDb = await getUsersDb();
      console.log('[API /admin/compact-database] Compacting users.db...');
      await usersDb.persistence.compactDatafile();
      console.log('[API /admin/compact-database] users.db compacted. Resetting instance.');
      resetUsersDbInstance();
      compactedCount++;
    } catch (error) {
      const errorMessage = `Error compacting users.db: ${(error as Error).message}`;
      console.error(`[API /admin/compact-database] ${errorMessage}`);
      errors.push(errorMessage);
    }

    // Compact SchoolEvents DB
    try {
      const schoolEventsDb = await getSchoolEventsDb();
      console.log('[API /admin/compact-database] Compacting schoolevents.db...');
      await schoolEventsDb.persistence.compactDatafile();
      console.log('[API /admin/compact-database] schoolevents.db compacted. Resetting instance.');
      resetSchoolEventsDbInstance();
      compactedCount++;
    } catch (error) {
      const errorMessage = `Error compacting schoolevents.db: ${(error as Error).message}`;
      console.error(`[API /admin/compact-database] ${errorMessage}`);
      errors.push(errorMessage);
    }

    if (errors.length > 0) {
      return NextResponse.json({ 
        message: `Database compaction process completed with ${errors.length} error(s). ${compactedCount} files compacted successfully.`,
        errors: errors 
      }, { status: 207 }); // Multi-Status
    }

    console.log('[API /admin/compact-database] All databases compacted successfully.');
    return NextResponse.json({ message: "All database files compacted successfully. In-memory instances have been reset and will reload on next access." });

  } catch (error) {
    console.error('[API /admin/compact-database] Unexpected error during compaction process:', error);
    return NextResponse.json({ message: 'Unexpected error during database compaction process', error: (error as Error).message }, { status: 500 });
  }
}
