
import { db } from '@/db';
import { users, videos, videoHistory, messages, reminders } from '@/db/schema';
import { eq, or } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function PUT(request, { params }) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { status, departments } = body;

        const updateData = {};
        if (status) updateData.status = status;
        if (departments) updateData.departments = JSON.stringify(departments);

        if (Object.keys(updateData).length === 0) {
            return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
        }

        const updatedUser = await db.update(users)
            .set(updateData)
            .where(eq(users.id, parseInt(id)))
            .returning();

        return NextResponse.json(updatedUser[0]);

    } catch (error) {
        console.error('Error updating user:', error);
        return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
    }
}

export async function DELETE(request, { params }) {
    try {
        const { id } = await params;
        const userId = parseInt(id);

        // 1. Unassign videos and remove ownership
        await db.update(videos)
            .set({ assignedTo: null })
            .where(eq(videos.assignedTo, userId));

        await db.update(videos)
            .set({ userId: null })
            .where(eq(videos.userId, userId));

        // 2. Delete history
        await db.delete(videoHistory)
            .where(eq(videoHistory.userId, userId));

        // 3. Delete messages
        await db.delete(messages)
            .where(or(
                eq(messages.senderId, userId),
                eq(messages.receiverId, userId)
            ));

        // 4. Remove from reminders
        await db.update(reminders)
            .set({ createdBy: null })
            .where(eq(reminders.createdBy, userId));

        // 5. Delete user
        await db.delete(users).where(eq(users.id, userId));

        return NextResponse.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        return NextResponse.json({ error: 'Failed to delete user: ' + error.message }, { status: 500 });
    }
}
