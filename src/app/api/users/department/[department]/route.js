
import { db } from '@/db';
import { users } from '@/db/schema';
import { NextResponse } from 'next/server';
import { like, or, eq, and } from 'drizzle-orm';

export async function GET(request, { params }) {
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
                    eq(users.role, 'member')
                )
            );

        return NextResponse.json(usersList);
    } catch (error) {
        console.error('Error fetching department users:', error);
        return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }
}
