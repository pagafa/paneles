
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
      // Exclude password from the response for security
      const { password, ...userWithoutPassword } = user as User & {password?:string};
      return NextResponse.json(userWithoutPassword);
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

    const requestBody: Partial<Omit<User, 'id'>> & { password?: string } = await request.json();
    const db = await getUsersDb();

    const existingUser = await db.findOne({ id: userId });
    if (!existingUser) {
        return NextResponse.json({ message: 'User not found for update' }, { status: 404 });
    }

    // If username is being changed, check for uniqueness
    if (requestBody.username && requestBody.username !== existingUser.username) {
      const userWithNewUsername = await db.findOne({ username: requestBody.username });
      if (userWithNewUsername) { // No need to check userWithNewUsername.id !== userId because ensureIndex covers new users
        return NextResponse.json({ message: 'Username already taken by another user' }, { status: 409 });
      }
    }
    
    const updatePayload: Partial<User> = {};
    if (requestBody.name !== undefined) updatePayload.name = requestBody.name;
    if (requestBody.username !== undefined) updatePayload.username = requestBody.username;
    if (requestBody.role !== undefined) updatePayload.role = requestBody.role;
    // Password update would require hashing here if it was stored hashed.
    // For this demo, if password is in requestBody, it means user wants to change it.
    // If password field is not sent in payload (or is empty), it's not updated.
    if (requestBody.password) {
      // In a real app, hash requestBody.password here before setting it in updatePayload
      (updatePayload as User & {password?: string}).password = requestBody.password;
    }


    if (Object.keys(updatePayload).length === 0) {
        // No actual fields to update, return existing user data (without password)
        const { password, ...userWithoutPassword } = existingUser as User & {password?: string};
        return NextResponse.json(userWithoutPassword);
    }

    const numAffected = await db.update({ id: userId }, { $set: updatePayload });

    if (numAffected === 0) {
      // This case should ideally be caught by the "No actual fields to update" check
      // or if the user wasn't found (which is checked earlier).
      return NextResponse.json({ message: 'User not found or no changes made' }, { status: 404 });
    }

    const updatedUser = await db.findOne({ id: userId });
    if (!updatedUser) {
        return NextResponse.json({ message: 'User updated but failed to retrieve' }, { status: 500 });
    }
    // Exclude password from the response for security
    const { password, ...userWithoutPassword } = updatedUser as User & {password?: string};
    return NextResponse.json(userWithoutPassword);

  } catch (error) {
    console.error(`Error updating user ${params.id}:`, error);
    if ((error as Error).message.includes('unique constraint violated for field username')) {
        return NextResponse.json({ message: 'Error updating user: Username already exists.', error: (error as Error).message }, { status: 409 });
    }
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
