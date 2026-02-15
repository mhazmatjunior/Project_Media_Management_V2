import { NextResponse } from 'next/server';
import { db, schema } from '@/db';
import { asc } from 'drizzle-orm';
import { cookies } from 'next/headers';

// GET /api/deadlines - Fetch all deadlines
export async function GET() {
    try {
        const cookieStore = await cookies();
        const session = cookieStore.get('user_session');

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const deadlines = await db
            .select()
            .from(schema.deadlines)
            .orderBy(asc(schema.deadlines.datetime));

        return NextResponse.json(deadlines);
    } catch (error) {
        console.error('Error fetching deadlines:', error);
        return NextResponse.json(
            { error: 'Failed to fetch deadlines' },
            { status: 500 }
        );
    }
}

// POST /api/deadlines - Create new deadline
export async function POST(request) {
    try {
        const cookieStore = await cookies();
        const session = cookieStore.get('user_session');

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { title, datetime, audienceType, targetUsers, description, createdBy } = body;

        if (!title || !datetime) {
            return NextResponse.json(
                { error: 'Title and date/time are required' },
                { status: 400 }
            );
        }

        const [newDeadline] = await db
            .insert(schema.deadlines)
            .values({
                title,
                datetime: new Date(datetime),
                audienceType: audienceType || 'all',
                targetUsers: targetUsers ? JSON.stringify(targetUsers) : null,
                description,
                status: 'active',
                createdBy: createdBy,
            })
            .returning();

        return NextResponse.json(newDeadline, { status: 201 });
    } catch (error) {
        console.error('Error creating deadline:', error);
        return NextResponse.json(
            { error: 'Failed to create deadline' },
            { status: 500 }
        );
    }
}
