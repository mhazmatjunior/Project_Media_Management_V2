import { NextResponse } from 'next/server';
import { db, schema } from '@/db';
import { contentTopics } from '@/db/schema';
import { cookies } from 'next/headers';

export async function GET() {
    try {
        const cookieStore = await cookies();
        const session = cookieStore.get('user_session');

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const topics = await db.select().from(contentTopics);
        return NextResponse.json(topics);
    } catch (error) {
        console.error('Error fetching content topics:', error);
        return NextResponse.json({ error: 'Failed to fetch topics' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const cookieStore = await cookies();
        const sessionCookie = cookieStore.get('user_session');

        if (!sessionCookie) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const session = JSON.parse(sessionCookie.value);
        if (session.role !== 'main_team') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { department, category, topic } = await request.json();

        if (!department || !category || !topic) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const [newTopic] = await db.insert(contentTopics).values({
            department,
            category,
            topic
        }).returning();

        return NextResponse.json(newTopic);
    } catch (error) {
        console.error('Error saving content topic:', error);
        return NextResponse.json({ error: 'Failed to save topic' }, { status: 500 });
    }
}
