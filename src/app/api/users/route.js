import { NextResponse } from 'next/server';
import { db, schema } from '@/db';

export async function GET() {
    try {
        const users = await db.select({
            id: schema.users.id,
            name: schema.users.name,
            email: schema.users.email,
            role: schema.users.role,
            status: schema.users.status,
            departments: schema.users.departments,
        }).from(schema.users);

        return NextResponse.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }
}
