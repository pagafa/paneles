
'use server';

import { NextResponse } from 'next/server';
import { getUsersDb } from '@/lib/db';
import type { User } from '@/types';

// GET all users
export async function GET() {
  try {
    const db = await getUsersDb();
    const users = await db.find({}).sort({ name: 1 });
    // Exclude password if it were part of the User type and stored in DB
    // For this app, User type does not have password, so no need to exclude here.
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
    
    if (!newUserData.name || !newUserData.username || !newUserData.role) {
      return NextResponse.json({ message: 'Missing required fields (name, username, role)' }, { status: 400 });
    }
    // Password is handled by the form for new users, but not stored in User model in DB

    const db = await getUsersDb();
    
    const userToAdd: User = {
      id: newUserData.id || `user-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: newUserData.name,
      username: newUserData.username,
      role: newUserData.role,
      // Password is not part of the User type stored in the database
    };

    // Check for existing username
    const existingUserByUsername = await db.findOne({ username: userToAdd.username });
    if (existingUserByUsername) {
      return NextResponse.json({ message: `Error creating user: Username "${userToAdd.username}" is already taken.` }, { status: 409 });
    }

    // Check for existing ID (less likely with generated IDs but good practice)
    const existingUserById = await db.findOne({ id: userToAdd.id });
    if (existingUserById) {
      return NextResponse.json({ message: `Error creating user: ID "${userToAdd.id}" already exists. Please try again.` }, { status: 409 });
    }

    const savedUser = await db.insert(userToAdd);

    if (!savedUser || (Array.isArray(savedUser) && savedUser.length === 0)) {
      console.error('User data was valid, but NeDB insert returned no document or an empty array.');
      return NextResponse.json({ message: 'Failed to save user to database after validation. The database did not return the saved document.' }, { status: 500 });
    }
    
    const userToReturn = Array.isArray(savedUser) ? savedUser[0] : savedUser;
    
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
