
'use server';

import { NextResponse } from 'next/server';
import { getAnnouncementsDb, getClassesDb, getUsersDb, getSchoolEventsDb } from '@/lib/db';
import type { User } from '@/types';
import bcrypt from 'bcrypt'; // Import bcrypt

const SALT_ROUNDS = 10;

export async function POST() {
  try {
    const announcementsDb = await getAnnouncementsDb();
    const classesDb = await getClassesDb();
    const usersDb = await getUsersDb();
    const schoolEventsDb = await getSchoolEventsDb();

    await announcementsDb.remove({}, { multi: true });
    await classesDb.remove({}, { multi: true });
    await usersDb.remove({}, { multi: true });
    await schoolEventsDb.remove({}, { multi: true });

    console.log('[API /admin/reset-database] All collections cleared.');

    const hashedPassword = await bcrypt.hash('soypablo', SALT_ROUNDS);
    const newAdminUser: User = {
      id: `user-admin-pablo-${Date.now()}`, // Or a static ID if preferred
      name: 'Pablo Admin',
      username: 'pablo',
      role: 'admin',
      password: hashedPassword, 
    };

    await usersDb.insert(newAdminUser);
    console.log('[API /admin/reset-database] New admin user "pablo" created with hashed password.');

    return NextResponse.json({ message: "Database reset successfully. All data cleared and 'pablo' admin user created." });
  } catch (error) {
    console.error('[API /admin/reset-database] Error resetting database:', error);
    return NextResponse.json({ message: 'Error resetting database', error: (error as Error).message }, { status: 500 });
  }
}
