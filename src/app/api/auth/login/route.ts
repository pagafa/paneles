
'use server';

import { NextResponse } from 'next/server';
import { getUsersDb } from '@/lib/db';
import type { User } from '@/types';

export async function POST(request: Request) {
  try {
    const { username, password: inputPassword } = await request.json();

    if (!username || !inputPassword) {
      return NextResponse.json({ message: 'Username and password are required' }, { status: 400 });
    }

    const db = await getUsersDb();
    const user = await db.findOne<User>({ username: username });

    if (!user) {
      console.log(`[API Auth Login] User not found: ${username}`);
      return NextResponse.json({ message: 'Invalid username or password' }, { status: 401 });
    }

    // Comparar o contrasinal proporcionado co contrasinal almacenado na base de datos
    // Neste prototipo, os contrasinais gárdanse en texto plano.
    // Nunha aplicación real, aquí compararías un hash do inputPassword co hash almacenado.
    if (user.password !== inputPassword) {
      console.log(`[API Auth Login] Password mismatch for user: ${username}. Expected: '${user.password}', Got: '${inputPassword}'`);
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
