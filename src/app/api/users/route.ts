
'use server';

import { NextResponse } from 'next/server';
import { getUsersDb } from '@/lib/db';
import type { User } from '@/types';
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

// GET all users
export async function GET() {
  try {
    const db = await getUsersDb();
    const usersFromDb = await db.find({}).sort({ name: 1 });
    const users = usersFromDb.map(user => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });
    return NextResponse.json(users);
  } catch (error) {
    console.error('[API GET /api/users] Error:', error);
    return NextResponse.json({ message: 'Error fetching users', error: (error as Error).message }, { status: 500 });
  }
}

// POST a new user
export async function POST(request: Request) {
  try {
    const newUserData: Omit<User, 'id'> & { id?: string, password?: string } = await request.json();
    
    if (!newUserData.name || !newUserData.username || !newUserData.role || !newUserData.password) {
      return NextResponse.json({ message: 'Missing required fields (name, username, role, password)' }, { status: 400 });
    }

    const db = await getUsersDb();
    
    const existingUserByUsername = await db.findOne({ username: newUserData.username });
    if (existingUserByUsername) {
      return NextResponse.json({ message: `Error creating user: Username "${newUserData.username}" is already taken.` }, { status: 409 });
    }
    
    const userId = newUserData.id || `user-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const existingUserById = await db.findOne({ id: userId });
    if (existingUserById) {
      return NextResponse.json({ message: `Error creating user: ID "${userId}" already exists. Please try again. (This should be rare)` }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(newUserData.password, SALT_ROUNDS);

    const userToAdd: User = {
      id: userId,
      name: newUserData.name,
      username: newUserData.username,
      role: newUserData.role,
      password: hashedPassword,
    };

    const savedUserDoc = await db.insert(userToAdd);
    
    if (!savedUserDoc || (Array.isArray(savedUserDoc) && savedUserDoc.length === 0)) {
      console.error('[API POST /api/users] User data was valid, but NeDB insert returned no document or an empty array.');
      return NextResponse.json({ message: 'Failed to save user to database after validation. The database did not return the saved document.' }, { status: 500 });
    }
    
    const userToReturnFromDb = Array.isArray(savedUserDoc) ? savedUserDoc[0] : savedUserDoc;
    const { password, ...userToReturn } = userToReturnFromDb;
    
    return NextResponse.json(userToReturn, { status: 201 });

  } catch (error) {
    console.error('[API POST /api/users] Error creating user:', error);
    const errorMessage = (error as Error).message;

    if (errorMessage.includes('unique constraint violated for field username')) {
        return NextResponse.json({ message: `Error creating user: Username already exists. Detail: ${errorMessage}`, error: errorMessage }, { status: 409 });
    }
    if (errorMessage.includes('unique constraint violated for field id')) {
        return NextResponse.json({ message: `Error creating user: User ID already exists. Detail: ${errorMessage}`, error: errorMessage }, { status: 409 });
    }
    if (errorMessage.includes('unique constraint violated')) { 
        return NextResponse.json({ message: `Error creating user: A unique field (ID or Username) already exists. Detail: ${errorMessage}`, error: errorMessage }, { status: 409 });
    }
    return NextResponse.json({ message: `Error creating user: ${errorMessage}`, error: errorMessage }, { status: 500 });
  }
}
