
'use server';

import { NextResponse } from 'next/server';
import { getUsersDb } from '@/lib/db';
import type { User } from '@/types';

export async function POST(request: Request) {
  try {
    const { username, password: inputPassword } = await request.json();

    console.log(`[API Auth Login] Attempting login for username: ${username}`);
    // Non rexistres inputPassword no servidor por seguridade en produción, pero útil para depuración local temporal.
    // console.log(`[API Auth Login] Password received from form: ${inputPassword}`);


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

    // Rexistra o contrasinal almacenado para depuración. NUNCA fagas isto en produción.
    console.log(`[API Auth Login] User found in DB. Stored password for ${username}: '${user.password}'`);
    console.log(`[API Auth Login] Comparing stored password ('${user.password}') with input password ('${inputPassword}')`);

    if (user.password !== inputPassword) {
      console.log(`[API Auth Login] Password mismatch for user: ${username}. Login failed.`);
      return NextResponse.json({ message: 'Invalid username or password' }, { status: 401 });
    }

    // Non devolver o contrasinal na resposta
    const { password: _, ...userWithoutPassword } = user;

    console.log(`[API Auth Login] User authenticated successfully: ${username}`);
    return NextResponse.json(userWithoutPassword, { status: 200 });

  } catch (error) {
    console.error('[API Auth Login] Error during login:', error);
    return NextResponse.json({ message: 'Error during login', error: (error as Error).message }, { status: 500 });
  }
}
