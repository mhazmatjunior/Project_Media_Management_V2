import { NextResponse } from 'next/server';
import { db, schema } from '@/db';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

export async function POST(request) {
    try {
        // Check if admin already exists
        const existingAdmin = await db
            .select()
            .from(schema.users)
            .where(eq(schema.users.email, 'admin@example.com'))
            .limit(1);

        if (existingAdmin.length > 0) {
            return NextResponse.json({
                message: 'Admin user already exists',
                email: 'admin@example.com'
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash('password123', 10);

        // Insert admin user
        await db.insert(schema.users).values({
            email: 'admin@example.com',
            password: hashedPassword,
            name: 'Admin',
        });

        return NextResponse.json({
            success: true,
            message: 'Admin user created successfully',
            email: 'admin@example.com',
            password: 'password123'
        });

    } catch (error) {
        console.error('Error seeding admin:', error);
        return NextResponse.json(
            { error: 'Failed to seed admin user' },
            { status: 500 }
        );
    }
}
