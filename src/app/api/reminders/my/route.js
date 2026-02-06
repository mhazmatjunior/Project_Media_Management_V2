
import { db } from '@/db';
import { reminders, users } from '@/db/schema';
import { desc, asc, eq, or, and, like } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { getSession } from "@/lib/auth";
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

        // Fetch reminders based on audience type
        // 1. All users
        // 2. Leads only (if user is team_lead or main_team)
        // 3. Members only (if user is member)
        // 4. Specific targeting (if userId is in targetUsers)

        const allReminders = await db.select().from(reminders).orderBy(asc(reminders.datetime));

        const myReminders = allReminders.filter(reminder => {
            // Include 'all' audience
            if (reminder.audienceType === 'all') return true;

            // Include 'leads' if user is a lead or main team
            if (reminder.audienceType === 'leads' && (userRole === 'team_lead' || userRole === 'main_team')) return true;

            // Include 'members' if user is a member
            if (reminder.audienceType === 'members' && userRole === 'member') return true;

            // Include 'specific' if user ID is in targetUsers list
            if (reminder.audienceType === 'specific') {
                try {
                    const targets = reminder.targetUsers ? JSON.parse(reminder.targetUsers) : [];
                    // Ensure targets are comparing numbers or strings consistently
                    return targets.map(String).includes(String(userId));
                } catch (e) {
                    return false;
                }
            }

            return false;
        });

        // Filter for future reminders or recent ones (optional, for now returning all relevant)
        // Let's filter to show only future reminders + reminders from the last 24 hours
        // const now = new Date();
        // const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

        // const filtered = myReminders.filter(r => new Date(r.datetime) > yesterday);

        return NextResponse.json(myReminders);

    } catch (error) {
        console.error('Error fetching user reminders:', error);
        return NextResponse.json({ error: 'Failed to fetch reminders' }, { status: 500 });
    }
}
