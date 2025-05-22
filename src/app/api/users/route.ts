
'use server';

import { NextResponse } from 'next/server';
import { getUsersDb } from '@/lib/db';
import type { User } from '@/types';

// GET all users
export async function GET() {
  try {
    const db = await getUsersDb();
    const usersFromDb = await db.find({}).sort({ name: 1 });
    // Exclude password from the response for security
    const users = usersFromDb.map(user => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });
    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
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
    
    // Check for existing username
    const existingUserByUsername = await db.findOne({ username: newUserData.username });
    if (existingUserByUsername) {
      return NextResponse.json({ message: `Error creating user: Username "${newUserData.username}" is already taken.` }, { status: 409 });
    }
    
    const userId = newUserData.id || `user-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    // Check for existing ID (less likely with generated IDs but good practice)
    const existingUserById = await db.findOne({ id: userId });
    if (existingUserById) {
      return NextResponse.json({ message: `Error creating user: ID "${userId}" already exists. Please try again.` }, { status: 409 });
    }

    const userToAdd: User = {
      id: userId,
      name: newUserData.name,
      username: newUserData.username,
      role: newUserData.role,
      password: newUserData.password, // Ensure password from the form is included
    };


    const savedUserDoc = await db.insert(userToAdd);
    
    if (!savedUserDoc || (Array.isArray(savedUserDoc) && savedUserDoc.length === 0)) {
      console.error('User data was valid, but NeDB insert returned no document or an empty array.');
      return NextResponse.json({ message: 'Failed to save user to database after validation. The database did not return the saved document.' }, { status: 500 });
    }
    
    const userToReturnFromDb = Array.isArray(savedUserDoc) ? savedUserDoc[0] : savedUserDoc;
    // Exclude password from the response for security
    const { password, ...userToReturn } = userToReturnFromDb;
    
    return NextResponse.json(userToReturn, { status: 201 });

  } catch (error) {
    console.error('Error creating user in API:', error);
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

