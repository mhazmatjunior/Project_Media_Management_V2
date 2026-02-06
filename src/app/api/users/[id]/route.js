
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function PUT(request, { params }) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { status, departments } = body;

        const updateData = {};
        if (status) updateData.status = status;
        if (departments) updateData.departments = JSON.stringify(departments);

        if (Object.keys(updateData).length === 0) {
            return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
        }

        const updatedUser = await db.update(users)
            .set(updateData)
            .where(eq(users.id, parseInt(id)))
            .returning();

        return NextResponse.json(updatedUser[0]);

    } catch (error) {
        console.error('Error updating user:', error);
        return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
    }
}
