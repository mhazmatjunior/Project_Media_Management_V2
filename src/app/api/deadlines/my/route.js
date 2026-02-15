import { db } from '@/db';
import { deadlines } from '@/db/schema';
import { asc } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request) {
    try {
        const cookieStore = await cookies();
        const sessionCookie = cookieStore.get('user_session');

        if (!sessionCookie) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const session = JSON.parse(sessionCookie.value);
        const userId = session.id;
        const userRole = session.role;

        const allDeadlines = await db.select().from(deadlines).orderBy(asc(deadlines.datetime));

        const myDeadlines = allDeadlines.filter(deadline => {
            // Include 'all' audience
            if (deadline.audienceType === 'all') return true;

            // Include 'leads' if user is a lead or main team
            if (deadline.audienceType === 'leads' && (userRole === 'team_lead' || userRole === 'main_team')) return true;

            // Include 'members' if user is a member
            if (deadline.audienceType === 'members' && userRole === 'member') return true;

            // Include 'specific' if user ID is in targetUsers list
            if (deadline.audienceType === 'specific') {
                try {
                    const targets = deadline.targetUsers ? JSON.parse(deadline.targetUsers) : [];
                    return targets.map(String).includes(String(userId));
                } catch (e) {
                    return false;
                }
            }

            return false;
        });

        return NextResponse.json(myDeadlines);

    } catch (error) {
        console.error('Error fetching user deadlines:', error);
        return NextResponse.json({ error: 'Failed to fetch deadlines' }, { status: 500 });
    }
}
