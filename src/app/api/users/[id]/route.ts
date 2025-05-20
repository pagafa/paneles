
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

    // If username is being changed, check for uniqueness against other users
    if (requestBody.username && requestBody.username !== existingUser.username) {
      const userWithNewUsername = await db.findOne({ username: requestBody.username });
      // If a user is found with the new username, AND that user is NOT the user we are currently editing, then it's a conflict.
      if (userWithNewUsername && userWithNewUsername.id !== userId) {
        return NextResponse.json({ message: `Error updating user: Username "${requestBody.username}" is already taken by another user.` }, { status: 409 });
      }
    }
    
    const updatePayload: Partial<User> = {};
    if (requestBody.name !== undefined) updatePayload.name = requestBody.name;
    if (requestBody.username !== undefined) updatePayload.username = requestBody.username;
    if (requestBody.role !== undefined) updatePayload.role = requestBody.role;
    if (requestBody.password) {
      // Note: In a real app, you'd hash this password before saving.
      // For this demo, we store it as is, but User type doesn't include it.
      (updatePayload as User & {password?: string}).password = requestBody.password;
    }

    if (Object.keys(updatePayload).length === 0) {
        // No actual fields to update were provided besides potentially an empty password
        const { password, ...userWithoutPassword } = existingUser as User & {password?: string};
        return NextResponse.json(userWithoutPassword);
    }

    const numAffected = await db.update({ id: userId }, { $set: updatePayload });

    if (numAffected === 0) {
      // This could happen if the user was deleted between the findOne and update, or if the payload resulted in no change (though our Object.keys check above should prevent this)
      return NextResponse.json({ message: 'User not found or no changes made' }, { status: 404 });
    }

    const updatedUser = await db.findOne({ id: userId });
    if (!updatedUser) {
        // Should not happen if numAffected > 0, but as a safeguard
        return NextResponse.json({ message: 'User updated but failed to retrieve' }, { status: 500 });
    }
    const { password, ...userWithoutPassword } = updatedUser as User & {password?: string};
    return NextResponse.json(userWithoutPassword);

  } catch (error) {
    console.error(`Error updating user ${params.id}:`, error);
    const errorMessage = (error as Error).message;
    // NeDB specific error for unique constraint violation
    if (errorMessage.includes('unique constraint violated for field username')) {
        // This error comes from NeDB if its unique index on 'username' is violated.
        // Our pre-check should ideally catch this, but this handles the DB-level enforcement.
        return NextResponse.json({ message: `Error updating user: Username "${(error as any)?.payloadToUpdate?.username || 'provided'}" already exists (DB constraint).`, error: errorMessage }, { status: 409 });
    }
     if (errorMessage.includes('unique constraint violated')) { // General unique constraint check from NeDB
        return NextResponse.json({ message: 'Error updating user: A unique field (ID or Username) constraint was violated at the database level.', error: errorMessage }, { status: 409 });
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
    // Prevent deletion of a specific user, e.g., a default admin
    const userToDelete = await db.findOne({ id: userId });

    if (userToDelete && userToDelete.username === 'admin_mv') { // Or use a more robust check if needed
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
