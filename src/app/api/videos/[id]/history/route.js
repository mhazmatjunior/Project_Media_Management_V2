import { NextResponse } from 'next/server';
import { db, schema } from '@/db';
import { eq, desc, and } from 'drizzle-orm';

// GET /api/videos/[id]/history - Get video history
export async function GET(request, { params }) {
    try {
        const { id } = await params;
        const videoId = parseInt(id);

        if (isNaN(videoId)) {
            return NextResponse.json({ error: 'Invalid video ID' }, { status: 400 });
        }

        const history = await db
            .select({
                id: schema.videoHistory.id,
                department: schema.videoHistory.department,
                action: schema.videoHistory.action,
                timestamp: schema.videoHistory.timestamp,
                user: {
                    name: schema.users.name,
                    role: schema.users.role,
                    // If no avatar, we'll generate one in frontend or use placeholder
                }
            })
            .from(schema.videoHistory)
            .leftJoin(schema.users, eq(schema.videoHistory.userId, schema.users.id))
            .where(eq(schema.videoHistory.videoId, videoId))
            .orderBy(desc(schema.videoHistory.timestamp));

        // Format for frontend
        const formattedHistory = history.map(item => ({
            name: item.user?.name || 'Unknown',
            role: `Completed ${item.department} task`,
            status: 'Completed',
            department: item.department,
            date: item.timestamp,
            // Generate deterministic avatar based on name length/char
            img: `https://i.pravatar.cc/150?u=${item.user?.name || 'user'}`
        }));

        return NextResponse.json(formattedHistory);
    } catch (error) {
        console.error('Error fetching video history:', error);
        return NextResponse.json(
            { error: 'Failed to fetch history' },
            { status: 500 }
        );
    }
}
