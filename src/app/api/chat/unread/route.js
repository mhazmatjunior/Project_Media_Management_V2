import { NextResponse } from 'next/server';
import { db, schema } from '@/db';
import { eq, and, isNull, sql } from 'drizzle-orm';
import { getSession } from '@/lib/auth';

import { cookies } from 'next/headers';

export async function GET(request) {
    try {
        const cookieStore = await cookies();
        const sessionCookie = cookieStore.get('user_session');

        if (!sessionCookie) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const session = JSON.parse(sessionCookie.value);
        const currentUserId = session.id;


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
            const key = `dm-${msg.senderId}`;
            unreadMap[key] = (unreadMap[key] || 0) + 1;
        });

        // Fetch Group Unread Counts
        // 1. Get user's groups and their lastReadAt
        const userGroups = await db.select({
            id: schema.groups.id,
            lastReadAt: schema.groupMembers.lastReadAt
        })
            .from(schema.groupMembers)
            .innerJoin(schema.groups, eq(schema.groupMembers.groupId, schema.groups.id))
            .where(eq(schema.groupMembers.userId, currentUserId));

        // 2. For each group, count messages newer than lastReadAt
        // This could be optimized into a single complex query, but loop is reliable for now
        for (const group of userGroups) {
            const lastRead = group.lastReadAt || new Date(0); // Default to epoch if null

            // Count messages in this group created after lastRead
            // Using a raw count or select count
            const result = await db.execute(sql`
                SELECT COUNT(*) as count 
                FROM ${schema.messages} 
                WHERE ${schema.messages.groupId} = ${group.id} 
                AND ${schema.messages.createdAt} > ${lastRead}
                AND ${schema.messages.senderId} != ${currentUserId}
            `);

            // Drizzle execute returns rows in result usually, check driver
            // neon-http driver returns rows array directly or result object?
            // checking previous logs... it seems to be an array of rows or result.rows.
            // Safe bet: result[0].count or result.rows[0].count

            const count = parseInt(result[0]?.count || result.rows?.[0]?.count || 0);

            console.log(`[Unread API] Group ${group.id}: LastRead=${lastRead}, Count=${count}, RawRes:`, result);

            if (count > 0) {
                unreadMap[`group-${group.id}`] = count;
            }
        }

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
