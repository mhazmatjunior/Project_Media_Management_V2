import { NextResponse } from 'next/server';
import { db, schema } from '@/db';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

export async function POST(request) {
    try {
        console.log('🔄 Updating admin user password...');

        // Hash password with bcrypt
        const hashedPassword = await bcrypt.hash('password123', 10);

        console.log('✅ Password hashed with bcrypt');

        // Check if admin exists
        const existing = await db
            .select()
            .from(schema.users)
            .where(eq(schema.users.email, 'admin@example.com'))
            .limit(1);

        if (existing.length > 0) {
            // Update existing admin user with hashed password
            await db
                .update(schema.users)
                .set({ password: hashedPassword })
                .where(eq(schema.users.email, 'admin@example.com'));

            console.log('✅ Admin password updated to hashed version');

            return NextResponse.json({
                success: true,
                message: 'Admin password updated successfully with bcrypt hash',
                email: 'admin@example.com',
                note: 'Password: password123 (now properly hashed)'
            });
        } else {
            // Insert new admin user
            await db.insert(schema.users).values({
                email: 'admin@example.com',
                password: hashedPassword,
                name: 'Admin',
            });

            console.log('✅ New admin user created with hashed password');

            return NextResponse.json({
                success: true,
                message: 'Admin user created successfully with hashed password',
                email: 'admin@example.com',
                note: 'Password: password123'
            });
        }

    } catch (error) {
        console.error('❌ Error updating admin user:', error);
        return NextResponse.json(
            { error: 'Failed to update admin user', details: error.message },
            { status: 500 }
        );
    }
}
