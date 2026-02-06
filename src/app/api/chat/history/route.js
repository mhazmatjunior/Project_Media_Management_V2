import { NextResponse } from 'next/server';
import { db } from '@/db';
import { messages, users } from '@/db/schema';
import { eq, or, and, asc } from 'drizzle-orm';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const channel = searchParams.get('channel');
        const userId1 = searchParams.get('userId1'); // Current User
        const userId2 = searchParams.get('userId2'); // Other User (for DM)

        let result;

        if (channel) {
            // Fetch group messages
            result = await db.select({
                id: messages.id,
                content: messages.content,
                senderId: messages.senderId,
                createdAt: messages.createdAt,
                senderName: users.name,
            })
                .from(messages)
                .leftJoin(users, eq(messages.senderId, users.id))
                .where(eq(messages.channel, channel))
                .orderBy(asc(messages.createdAt));

        } else if (userId1 && userId2) {
            // Fetch DM messages
            result = await db.select({
                id: messages.id,
                content: messages.content,
                senderId: messages.senderId,
                receiverId: messages.receiverId,
                createdAt: messages.createdAt,
                senderName: users.name,
            })
                .from(messages)
                .leftJoin(users, eq(messages.senderId, users.id))
                .where(
                    or(
                        and(eq(messages.senderId, userId1), eq(messages.receiverId, userId2)),
                        and(eq(messages.senderId, userId2), eq(messages.receiverId, userId1))
                    )
                )
                .orderBy(asc(messages.createdAt));

            // Mark received messages as read
            // userId1 is the requester (Current User)
            // So we mark messages where receiverId = userId1 and senderId = userId2
            await db.update(messages)
                .set({ isRead: true })
                .where(
                    and(
                        eq(messages.receiverId, userId1),
                        eq(messages.senderId, userId2),
                        eq(messages.isRead, false)
                    )
                );
        } else {
            return NextResponse.json([]);
        }

        return NextResponse.json(result);
    } catch (error) {
        console.error('Error fetching messages:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
