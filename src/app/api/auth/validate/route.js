import { NextResponse } from 'next/server';
import { db, schema } from '@/db';
import { eq } from 'drizzle-orm';

export async function POST(request) {
    try {
        const { userId, tokenVersion } = await request.json();

        if (!userId || tokenVersion === undefined) {
            return NextResponse.json({ valid: false }, { status: 400 });
        }

        const users = await db
            .select({ tokenVersion: schema.users.tokenVersion })
            .from(schema.users)
            .where(eq(schema.users.id, userId))
            .limit(1);

        const user = users[0];

        if (!user) {
            return NextResponse.json({ valid: false });
        }

        // Check if version matches
        if (user.tokenVersion !== tokenVersion) {
            return NextResponse.json({ valid: false });
        }

        return NextResponse.json({ valid: true });

    } catch (error) {
        console.error('Validation error:', error);
        return NextResponse.json({ valid: false }, { status: 500 });
    }
}
