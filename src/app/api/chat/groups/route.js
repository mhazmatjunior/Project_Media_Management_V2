import { NextResponse } from 'next/server';
import { db, schema } from '@/db';
import { eq } from 'drizzle-orm';
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

        // Fetch groups where the user is a member
        // Join groupMembers with groups table
        const userGroups = await db.select({
            id: schema.groups.id,
            name: schema.groups.name,
            type: schema.groups.type,
            role: schema.groupMembers.role
        })
            .from(schema.groupMembers)
            .innerJoin(schema.groups, eq(schema.groupMembers.groupId, schema.groups.id))
            .where(eq(schema.groupMembers.userId, currentUserId));

        // Format to match expected frontend structure (if needed, but id/name is standard)
        // Frontend expects { id, name } mainly.

        return NextResponse.json(userGroups);
    } catch (error) {
        console.error('Error fetching user groups:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
