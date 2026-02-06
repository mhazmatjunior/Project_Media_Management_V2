import { NextResponse } from 'next/server';
import { db, schema } from '@/db';
import { eq, desc } from 'drizzle-orm';

// GET /api/videos - Fetch all videos
export async function GET() {
    try {
        const videos = await db
            .select({
                ...schema.videos,
                assigneeName: schema.users.name,
            })
            .from(schema.videos)
            .leftJoin(schema.users, eq(schema.videos.assignedTo, schema.users.id))
            .orderBy(desc(schema.videos.createdAt));

        // Map database statuses to app terminology
        const mappedVideos = videos.map(video => ({
            id: video.id,
            name: video.title,
            description: video.description,
            status: mapDbStatusToApp(video.status),
            currentDepartment: video.currentDepartment,
            date: formatDate(video.createdAt),
            color: getColorForStatus(video.status),
            value: calculateProgress(video.status),
            views: video.views,
            likes: video.likes,
            duration: video.duration,
            assignedTo: video.assignedTo,
            assigneeName: video.assigneeName,
            departmentEnteredAt: video.departmentEnteredAt,
            departmentTimestamp: video.createdAt, // Fallback
        }));

        return NextResponse.json(mappedVideos);
    } catch (error) {
        console.error('Error fetching videos:', error);
        return NextResponse.json(
            { error: 'Failed to fetch videos' },
            { status: 500 }
        );
    }
}

// POST /api/videos - Create new video
export async function POST(request) {
    try {
        const body = await request.json();
        const { name, description } = body;

        if (!name) {
            return NextResponse.json(
                { error: 'Video name is required' },
                { status: 400 }
            );
        }

        const [newVideo] = await db
            .insert(schema.videos)
            .values({
                title: name,
                description: description || '',
                status: 'pending', // DB status
                category: 'general',
                views: 0,
                likes: 0,
                isPublished: false,
            })
            .returning();

        // Map to app format
        const mappedVideo = {
            id: newVideo.id,
            name: newVideo.title,
            description: newVideo.description,
            status: 'pending', // App status
            date: formatDate(newVideo.createdAt),
            color: getColorForStatus('pending'),
            value: 0,
        };

        return NextResponse.json(mappedVideo, { status: 201 });
    } catch (error) {
        console.error('Error creating video:', error);
        return NextResponse.json(
            { error: 'Failed to create video' },
            { status: 500 }
        );
    }
}

// Helper functions
function mapDbStatusToApp(dbStatus) {
    const statusMap = {
        'pending': 'pending',
        'in_progress': 'running',
        'completed': 'ended',
        'archived': 'archived',
    };
    return statusMap[dbStatus] || 'pending';
}

function formatDate(date) {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function getColorForStatus(status) {
    const colors = {
        'pending': '#6366F1',
        'in_progress': '#EF4444',
        'completed': '#10B981',
    };
    return colors[status] || '#6366F1';
}

function calculateProgress(status) {
    const progressMap = {
        'pending': 0,
        'in_progress': 50,
        'completed': 100,
    };
    return progressMap[status] || 0;
}
