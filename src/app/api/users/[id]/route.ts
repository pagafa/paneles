
'use server';

import { NextResponse } from 'next/server';
import { getUsersDb } from '@/lib/db';
import type { User } from '@/types';
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

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
      const { password, ...userWithoutPassword } = user;
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

    const requestBody: Partial<Omit<User, 'id' | 'password'>> & { password?: string } = await request.json();
    const db = await getUsersDb();

    const existingUser = await db.findOne({ id: userId });
    if (!existingUser) {
        return NextResponse.json({ message: 'User not found for update' }, { status: 404 });
    }

    // If username is being changed, check for uniqueness against other users
    if (requestBody.username && requestBody.username !== existingUser.username) {
      const userWithNewUsername = await db.findOne({ username: requestBody.username });
      if (userWithNewUsername && userWithNewUsername.id !== userId) {
        return NextResponse.json({ message: `Error updating user: Username "${requestBody.username}" is already taken by another user. Please choose a different username.` }, { status: 409 });
      }
    }
    
    const updatePayload: Partial<User> = {};
    if (requestBody.name !== undefined) updatePayload.name = requestBody.name;
    if (requestBody.username !== undefined) updatePayload.username = requestBody.username;
    if (requestBody.role !== undefined) updatePayload.role = requestBody.role;
    
    // Hash and update password only if a new one is provided and it's not empty
    if (requestBody.password && requestBody.password.trim() !== "") {
      updatePayload.password = await bcrypt.hash(requestBody.password.trim(), SALT_ROUNDS);
    }

    if (Object.keys(updatePayload).length === 0) {
        const { password, ...userWithoutPassword } = existingUser; 
        return NextResponse.json(userWithoutPassword);
    }

    const numAffected = await db.update({ id: userId }, { $set: updatePayload });

    if (numAffected === 0) {
      // This might happen if the payload is identical to existing data,
      // but we should still return the user data.
      const currentData = await db.findOne({ id: userId });
      if(currentData) {
        const { password, ...userWithoutPassword } = currentData;
        return NextResponse.json(userWithoutPassword);
      }
      return NextResponse.json({ message: 'User not found or no changes made' }, { status: 404 });
    }

    const updatedUserFromDb = await db.findOne({ id: userId });
    if (!updatedUserFromDb) {
        return NextResponse.json({ message: 'User updated but failed to retrieve' }, { status: 500 });
    }
    const { password, ...userWithoutPassword } = updatedUserFromDb; 
    return NextResponse.json(userWithoutPassword);

  } catch (error) {
    console.error(`Error updating user ${params.id}:`, error);
    const errorMessage = (error as Error).message;
    const requestBodyUsername = (await request.clone().json().catch(() => ({}))).username;
    
    if (errorMessage.includes('unique constraint violated for field username')) {
        const attemptedUsername = requestBodyUsername || 'provided';
        return NextResponse.json({ message: `Error updating user: Username "${attemptedUsername}" already exists. Please choose a different username. (DB constraint: ${errorMessage})` }, { status: 409 });
    }
     if (errorMessage.includes('unique constraint violated for field id')) { 
        return NextResponse.json({ message: `Error updating user: User ID constraint violated. (DB constraint: ${errorMessage})` }, { status: 409 });
    }
    return NextResponse.json({ message: `Error updating user: ${errorMessage}`, error: errorMessage }, { status: 500 });
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

    if (userToDelete && userToDelete.username === 'admin_mv') { 
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
    
