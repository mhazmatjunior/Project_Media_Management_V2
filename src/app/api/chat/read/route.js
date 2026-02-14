
import { NextResponse } from 'next/server';
import { db, schema } from '@/db';
import { eq, and } from 'drizzle-orm';
import { cookies } from 'next/headers';

export async function POST(request) {
    try {
        const cookieStore = await cookies();
        const sessionCookie = cookieStore.get('user_session');

        if (!sessionCookie) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const session = JSON.parse(sessionCookie.value);
        const currentUserId = session.id;

        const { type, id } = await request.json();

        if (!id) {
            return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
        }

        if (type === 'group') {
            // Update lastReadAt for group
            await db.update(schema.groupMembers)
                .set({ lastReadAt: new Date() })
                .where(and(
                    eq(schema.groupMembers.groupId, id),
                    eq(schema.groupMembers.userId, currentUserId)
                ));
        } else if (type === 'dm') {
            // Update isRead for DM messages from this user
            // We mark all messages FROM 'id' TO 'currentUserId' as read
            await db.update(schema.messages)
                .set({ isRead: true })
                .where(and(
                    eq(schema.messages.senderId, id),
                    eq(schema.messages.receiverId, currentUserId),
                    eq(schema.messages.isRead, false)
                ));
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error marking as read:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
