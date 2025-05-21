
'use server';

import { NextResponse } from 'next/server';
import { getAnnouncementsDb, getClassesDb, getUsersDb, getSchoolEventsDb } from '@/lib/db';
import type { User } from '@/types';

export async function POST() {
  // In a real app, add strong authentication/authorization here
  // to ensure only a super-admin can perform this action.
  try {
    const announcementsDb = await getAnnouncementsDb();
    const classesDb = await getClassesDb();
    const usersDb = await getUsersDb();
    const schoolEventsDb = await getSchoolEventsDb();

    // Remove all documents from all collections
    await announcementsDb.remove({}, { multi: true });
    await classesDb.remove({}, { multi: true });
    await usersDb.remove({}, { multi: true });
    await schoolEventsDb.remove({}, { multi: true });

    console.log('[API /admin/reset-database] All collections cleared.');

    // Create the new 'pablo' admin user
    const newAdminUser: User = {
      id: `user-admin-pablo-${Date.now()}`,
      name: 'Pablo Admin',
      username: 'pablo',
      role: 'admin',
      password: 'soypablo', // Storing plaintext for prototype as per current setup
    };

    await usersDb.insert(newAdminUser);
    console.log('[API /admin/reset-database] New admin user "pablo" created.');

    return NextResponse.json({ message: "Database reset successfully. All data cleared and 'pablo' admin user created." });
  } catch (error) {
    console.error('Error resetting database:', error);
    return NextResponse.json({ message: 'Error resetting database', error: (error as Error).message }, { status: 500 });
  }
}
