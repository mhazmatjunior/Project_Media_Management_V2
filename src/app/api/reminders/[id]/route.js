import { NextResponse } from 'next/server';
import { db, schema } from '@/db';
import { eq } from 'drizzle-orm';

// DELETE /api/reminders/[id] - Delete a reminder
export async function DELETE(request, { params }) {
    try {
        const { id } = await params;

        await db.delete(schema.reminders)
            .where(eq(schema.reminders.id, parseInt(id)));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting reminder:', error);
        return NextResponse.json(
            { error: 'Failed to delete reminder' },
            { status: 500 }
        );
    }
}

// PUT /api/reminders/[id] - Update a reminder
export async function PUT(request, { params }) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { title, datetime, audienceType, targetUsers } = body;

        const [updatedReminder] = await db
            .update(schema.reminders)
            .set({
                title,
                datetime: new Date(datetime),
                audienceType,
                targetUsers: targetUsers ? JSON.stringify(targetUsers) : null,
            })
            .where(eq(schema.reminders.id, parseInt(id)))
            .returning();

        return NextResponse.json(updatedReminder);
    } catch (error) {
        console.error('Error updating reminder:', error);
        return NextResponse.json(
            { error: 'Failed to update reminder' },
            { status: 500 }
        );
    }
}
