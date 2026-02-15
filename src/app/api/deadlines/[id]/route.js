import { NextResponse } from 'next/server';
import { db, schema } from '@/db';
import { eq } from 'drizzle-orm';
import { cookies } from 'next/headers';

// PUT /api/deadlines/[id] - Update a deadline
export async function PUT(request, { params }) {
    try {
        const { id } = await params;
        const cookieStore = await cookies();
        const session = cookieStore.get('user_session');

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { title, datetime, audienceType, targetUsers, description, status } = body;

        const updatedData = {};
        if (title !== undefined) updatedData.title = title;
        if (datetime !== undefined) updatedData.datetime = new Date(datetime);
        if (audienceType !== undefined) updatedData.audienceType = audienceType;
        if (targetUsers !== undefined) updatedData.targetUsers = targetUsers ? JSON.stringify(targetUsers) : null;
        if (description !== undefined) updatedData.description = description;
        if (status !== undefined) updatedData.status = status;

        const [updatedDeadline] = await db
            .update(schema.deadlines)
            .set(updatedData)
            .where(eq(schema.deadlines.id, parseInt(id)))
            .returning();

        if (!updatedDeadline) {
            return NextResponse.json({ error: 'Deadline not found' }, { status: 404 });
        }

        return NextResponse.json(updatedDeadline);
    } catch (error) {
        console.error('Error updating deadline:', error);
        return NextResponse.json(
            { error: 'Failed to update deadline' },
            { status: 500 }
        );
    }
}

// DELETE /api/deadlines/[id] - Remove a deadline
export async function DELETE(request, { params }) {
    try {
        const { id } = await params;
        const cookieStore = await cookies();
        const session = cookieStore.get('user_session');

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const [deletedDeadline] = await db
            .delete(schema.deadlines)
            .where(eq(schema.deadlines.id, parseInt(id)))
            .returning();

        if (!deletedDeadline) {
            return NextResponse.json({ error: 'Deadline not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting deadline:', error);
        return NextResponse.json(
            { error: 'Failed to delete deadline' },
            { status: 500 }
        );
    }
}
