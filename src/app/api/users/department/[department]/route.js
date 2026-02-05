
import { db } from '@/db';
import { users } from '@/db/schema';
import { NextResponse } from 'next/server';
import { like, or } from 'drizzle-orm';

export async function GET(request, { params }) {
    try {
        const { department } = await params;

        // Fetch users who have this department in their departments list
        // Since departments is stored as a text (JSON string or comma-separated), we use like
        // We also include team leads and members
        const departmentUsers = await db.select({
            id: users.id,
            name: users.name,
            email: users.email,
            role: users.role,
        })
            .from(users)
            .where(
                like(users.departments, `%${department}%`) // Using like but ensuring case matches in query or use ilike if postgres
            );

        // Better approach: Since seeding used "Research" (Capitalized) and URL param is "research" (lowercase)
        // We should use ilike for case-insensitive matching
        const usersList = await db.select({
            id: users.id,
            name: users.name,
            email: users.email,
            role: users.role,
        })
            .from(users)
            .where(
                or(
                    like(users.departments, `%${department}%`),
                    like(users.departments, `%${department.charAt(0).toUpperCase() + department.slice(1)}%`)
                )
            );

        return NextResponse.json(usersList);
    } catch (error) {
        console.error('Error fetching department users:', error);
        return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }
}
