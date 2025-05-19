
'use server';

import { NextResponse } from 'next/server';
import { getUsersDb } from '@/lib/db';
import type { User } from '@/types';

// GET all users
export async function GET() {
  try {
    const db = await getUsersDb();
    const users = await db.find({}).sort({ name: 1 });
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
    // In a real app, hash the password before saving. For this demo, we'll store it as is (not recommended for production).
    // if (!newUserData.password) {
    //   return NextResponse.json({ message: 'Password is required for new users' }, { status: 400 });
    // }


    const db = await getUsersDb();
    
    const userToAdd: User = {
      id: newUserData.id || `user-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: newUserData.name,
      username: newUserData.username,
      role: newUserData.role,
      // password: hashedPassword, // Store hashed password
    };

    // Check for existing username
    const existingUser = await db.findOne({ username: userToAdd.username });
    if (existingUser) {
      return NextResponse.json({ message: 'Username already exists' }, { status: 409 });
    }

    const savedUser = await db.insert(userToAdd);
    return NextResponse.json(savedUser, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    if ((error as Error).message.includes('unique constraint violated for field username')) { // More specific error for NeDB
        return NextResponse.json({ message: 'Error creating user: Username already exists.', error: (error as Error).message }, { status: 409 });
    }
    if ((error as Error).message.includes('unique constraint violated')) { // General unique constraint
        return NextResponse.json({ message: 'Error creating user: ID or Username already exists.', error: (error as Error).message }, { status: 409 });
    }
    return NextResponse.json({ message: 'Error creating user', error: (error as Error).message }, { status: 500 });
  }
}
