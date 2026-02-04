import { NextResponse } from 'next/server';
import { db, schema } from '@/db';
import { eq } from 'drizzle-orm';

// GET /api/stats - Fetch aggregated statistics
export async function GET() {
    try {
        const videos = await db.select().from(schema.videos);

        const stats = {
            total: videos.length,
            pending: videos.filter(v => v.status === 'pending').length,
            running: videos.filter(v => v.status === 'in_progress').length,
            ended: videos.filter(v => v.status === 'completed').length,
            totalViews: videos.reduce((sum, v) => sum + (v.views || 0), 0),
            totalLikes: videos.reduce((sum, v) => sum + (v.likes || 0), 0),
        };

        return NextResponse.json(stats);
    } catch (error) {
        console.error('Error fetching stats:', error);
        return NextResponse.json(
            { error: 'Failed to fetch statistics' },
            { status: 500 }
        );
    }
}
