
'use server';

import { NextResponse } from 'next/server';
import { getUsersDb } from '@/lib/db';
import type { User } from '@/types';

// GET a single user by ID
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    if (!params.id) {
      return NextResponse.json({ message: 'User ID is required' }, { status: 400 });
    }
    const db = await getUsersDb();
    const user = await db.findOne({ id: params.id });
    
    if (user) {
      return NextResponse.json(user);
    }
    return NextResponse.json({ message: 'User not found' }, { status: 404 });
  } catch (error) {
    console.error(`Error fetching user ${params.id}:`, error);
    return NextResponse.json({ message: 'Error fetching user', error: (error as Error).message }, { status: 500 });
  }
}

// PUT (update) a user
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const userId = params.id;
    if (!userId) {
        return NextResponse.json({ message: 'User ID is required' }, { status: 400 });
    }

    const requestBody: Partial<Omit<User, 'id' | 'username'>> & { password?: string } = await request.json();
    
    const updatePayload: Partial<User> = {};
    if (requestBody.name !== undefined) updatePayload.name = requestBody.name;
    if (requestBody.role !== undefined) updatePayload.role = requestBody.role;
    // Username cannot be changed.
    // Password update would require hashing here if it was stored hashed.

    if (Object.keys(updatePayload).length === 0) {
        const dbCheck = await getUsersDb();
        const existingDoc = await dbCheck.findOne({ id: userId });
        if(existingDoc) return NextResponse.json(existingDoc);
        return NextResponse.json({ message: 'No updatable fields provided or user not found' }, { status: 400 });
    }

    const db = await getUsersDb();
    const numAffected = await db.update({ id: userId }, { $set: updatePayload });

    if (numAffected === 0) {
      return NextResponse.json({ message: 'User not found or no changes made' }, { status: 404 });
    }

    const updatedUser = await db.findOne({ id: userId });
    if (!updatedUser) {
        return NextResponse.json({ message: 'User updated but failed to retrieve' }, { status: 500 });
    }
    return NextResponse.json(updatedUser);

  } catch (error) {
    console.error(`Error updating user ${params.id}:`, error);
    return NextResponse.json({ message: 'Error updating user', error: (error as Error).message }, { status: 500 });
  }
}

// DELETE a user
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const userId = params.id;
    if (!userId) {
        return NextResponse.json({ message: 'User ID is required' }, { status: 400 });
    }

    // Prevent deleting the main admin user (e.g., 'admin_user')
    const db = await getUsersDb();
    const userToDelete = await db.findOne({ id: userId });
    if (userToDelete && userToDelete.username === 'admin_user') {
      return NextResponse.json({ message: 'Cannot delete the default admin user' }, { status: 403 });
    }
    
    const numRemoved = await db.remove({ id: userId }, {});

    if (numRemoved === 0) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'User deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error(`Error deleting user ${params.id}:`, error);
    return NextResponse.json({ message: 'Error deleting user', error: (error as Error).message }, { status: 500 });
  }
}
