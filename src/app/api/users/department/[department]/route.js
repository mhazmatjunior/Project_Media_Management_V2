
import { db } from '@/db';
import { users } from '@/db/schema';
import { NextResponse } from 'next/server';
import { like, or, eq, and, ne } from 'drizzle-orm';

import { cookies } from 'next/headers';

export async function GET(request, { params }) {
    const cookieStore = await cookies();
    const session = cookieStore.get('user_session');

    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { department } = await params;

        const usersList = await db.select({
            id: users.id,
            name: users.name,
            email: users.email,
            role: users.role,
        })
            .from(users)
            .where(
                and(
                    or(
                        like(users.departments, `%${department}%`),
                        like(users.departments, `%${department.charAt(0).toUpperCase() + department.slice(1)}%`)
                    ),
                    or(
                        eq(users.role, 'member'),
                        eq(users.role, 'team_lead')
                    ),
                    ne(users.status, 'offline')
                )
            );

        return NextResponse.json(usersList);
    } catch (error) {
        console.error('Error fetching department users:', error);
        return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }
}
