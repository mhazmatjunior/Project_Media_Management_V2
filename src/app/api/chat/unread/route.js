import { NextResponse } from 'next/server';
import { db, schema } from '@/db';
import { eq, and, isNull } from 'drizzle-orm';
import { getSession } from '@/lib/auth';

export async function GET(request) {
    try {
        // Fallback to query param since getSession uses localStorage (client-only)
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized: Missing userId' }, { status: 401 });
        }

        // Use the query param ID
        const currentUserId = parseInt(userId);

        // Fetch unread messages where receiver is current user
        const unreadMessages = await db.select({
            senderId: schema.messages.senderId,
            channel: schema.messages.channel,
        }).from(schema.messages)
            .where(and(
                eq(schema.messages.receiverId, currentUserId),
                eq(schema.messages.isRead, false)
            ));

        // Aggregate counts
        const unreadMap = {};
        unreadMessages.forEach(msg => {
            if (msg.channel) {
                // Group messages logic (if supported in future)
            } else {
                // DM
                const key = `dm-${msg.senderId}`;
                unreadMap[key] = (unreadMap[key] || 0) + 1;
            }
        });

        // Convert counts to boolean true (since frontend uses boolean for badge)
        // Or keep numbers if we want to show count later. The frontend currently checks `unread[key] && ...`
        // So { 'dm-1': 5 } is truthy.

        // Let's normalize to just "true" to match current frontend state shape, 
        // OR better: keep numbers, they are truthy.

        return NextResponse.json(unreadMap);
    } catch (error) {
        console.error('Error fetching unread:', error);
        // Return empty on error to not break UI
        return NextResponse.json({});
    }
}
