import { NextResponse } from 'next/server';
import { db, schema } from '@/db';
import { asc } from 'drizzle-orm';

// GET /api/reminders - Fetch all reminders (for dashboard)
export async function GET() {
    try {
        const reminders = await db
            .select()
            .from(schema.reminders)
            .orderBy(asc(schema.reminders.datetime));

        return NextResponse.json(reminders);
    } catch (error) {
        console.error('Error fetching reminders:', error);
        return NextResponse.json(
            { error: 'Failed to fetch reminders' },
            { status: 500 }
        );
    }
}

// POST /api/reminders - Create new reminder
export async function POST(request) {
    try {
        const body = await request.json();
        const { title, datetime, audienceType, targetUsers, createdBy } = body;

        if (!title || !datetime) {
            return NextResponse.json(
                { error: 'Title and date/time are required' },
                { status: 400 }
            );
        }

        const [newReminder] = await db
            .insert(schema.reminders)
            .values({
                title,
                datetime: new Date(datetime),
                audienceType: audienceType || 'all',
                targetUsers: targetUsers ? JSON.stringify(targetUsers) : null,
                createdBy: createdBy, // Should be passed from frontend
            })
            .returning();

        return NextResponse.json(newReminder, { status: 201 });
    } catch (error) {
        console.error('Error creating reminder:', error);
        return NextResponse.json(
            { error: 'Failed to create reminder' },
            { status: 500 }
        );
    }
}
