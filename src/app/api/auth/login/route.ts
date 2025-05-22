
'use server';

import { NextResponse } from 'next/server';
import { getUsersDb } from '@/lib/db';
import type { User } from '@/types';
import bcrypt from 'bcrypt';

export async function POST(request: Request) {
  try {
    const { username, password: inputPassword } = await request.json();

    if (!username || !inputPassword) {
      return NextResponse.json({ message: 'Username and password are required' }, { status: 400 });
    }

    const db = await getUsersDb();
    const user = await db.findOne<User>({ username: username });

    if (!user) {
      return NextResponse.json({ message: 'Invalid username or password' }, { status: 401 });
    }

    if (!user.password) {
      console.error(`[API Auth Login] User ${username} found in DB but has no password stored. Login failed.`);
      return NextResponse.json({ message: 'User data configuration error. Please contact support.' }, { status: 500 });
    }

    if (!user.password.startsWith('$2')) { // Basic check for bcrypt hash
      console.error(`[API Auth Login] User ${username} found, but the stored password does not appear to be a valid bcrypt hash.`);
      return NextResponse.json({ message: 'User data configuration error. Please contact support.' }, { status: 500 });
    }

    const passwordMatch = await bcrypt.compare(inputPassword, user.password);

    if (!passwordMatch) {
      return NextResponse.json({ message: 'Invalid username or password' }, { status: 401 });
    }

    const { password: _, ...userWithoutPassword } = user;
    return NextResponse.json(userWithoutPassword, { status: 200 });

  } catch (error) {
    console.error('[API POST /api/auth/login] Error during login:', error);
    return NextResponse.json({ message: 'Error during login', error: (error as Error).message }, { status: 500 });
  }
}
