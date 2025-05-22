
'use server';

import { NextResponse } from 'next/server';
import { getUsersDb } from '@/lib/db';
import type { User } from '@/types';
import bcrypt from 'bcrypt';

export async function POST(request: Request) {
  try {
    const { username, password: inputPassword } = await request.json();

    console.log(`[API Auth Login] Attempting login for username: ${username}`);

    if (!username || !inputPassword) {
      console.log('[API Auth Login] Username or password not provided in request.');
      return NextResponse.json({ message: 'Username and password are required' }, { status: 400 });
    }

    const db = await getUsersDb();
    const user = await db.findOne<User>({ username: username });

    if (!user) {
      console.log(`[API Auth Login] User not found in DB for username: ${username}`);
      return NextResponse.json({ message: 'Invalid username or password' }, { status: 401 });
    }

    // User found, now compare the hashed password
    if (!user.password) {
      console.log(`[API Auth Login] User ${username} found in DB but has no password stored. Login failed.`);
      return NextResponse.json({ message: 'Invalid username or password' }, { status: 401 });
    }

    console.log(`[API Auth Login] User ${username} found. Comparing input password with stored hash.`);
    const passwordMatch = await bcrypt.compare(inputPassword, user.password);

    if (!passwordMatch) {
      console.log(`[API Auth Login] Password mismatch for user: ${username}. Login failed.`);
      return NextResponse.json({ message: 'Invalid username or password' }, { status: 401 });
    }

    // Password matches
    // Do not return the password (even the hash) in the response
    const { password: _, ...userWithoutPassword } = user;

    console.log(`[API Auth Login] User authenticated successfully: ${username}`);
    return NextResponse.json(userWithoutPassword, { status: 200 });

  } catch (error) {
    console.error('[API Auth Login] Error during login:', error);
    return NextResponse.json({ message: 'Error during login', error: (error as Error).message }, { status: 500 });
  }
}
