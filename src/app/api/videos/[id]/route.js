import { NextResponse } from 'next/server';
import { db, schema } from '@/db';
import { eq } from 'drizzle-orm';

// PUT /api/videos/[id] - Update video
export async function PUT(request, { params }) {
    try {
        const { id } = await params;
        const body = await request.json();

        // Map app status to DB status if provided
        const updateData = {};

        if (body.name) updateData.title = body.name;
        if (body.description) updateData.description = body.description;
        if (body.status) {
            updateData.status = mapAppStatusToDb(body.status);
        }
        if (body.currentDepartment !== undefined) {
            updateData.currentDepartment = body.currentDepartment;
        }
        if (body.assignedTo !== undefined) {
            // Handle "0", "", or valid number string to integer or null
            if (body.assignedTo === "" || body.assignedTo === null || body.assignedTo === "null") {
                updateData.assignedTo = null;
            } else {
                const parsedId = parseInt(body.assignedTo);
                updateData.assignedTo = isNaN(parsedId) ? null : parsedId;
            }
        }

        updateData.updatedAt = new Date();

        const [updatedVideo] = await db
            .update(schema.videos)
            .set(updateData)
            .where(eq(schema.videos.id, parseInt(id)))
            .returning();

        if (!updatedVideo) {
            return NextResponse.json(
                { error: 'Video not found' },
                { status: 404 }
            );
        }

        // Map back to app format
        const mappedVideo = {
            id: updatedVideo.id,
            name: updatedVideo.title,
            description: updatedVideo.description,
            status: mapDbStatusToApp(updatedVideo.status),
            date: formatDate(updatedVideo.createdAt),
        };

        return NextResponse.json(mappedVideo);
    } catch (error) {
        console.error('Error updating video:', error);
        return NextResponse.json(
            { error: 'Failed to update video' },
            { status: 500 }
        );
    }
}

// DELETE /api/videos/[id] - Delete video
export async function DELETE(request, { params }) {
    try {
        const { id } = await params;

        await db
            .delete(schema.videos)
            .where(eq(schema.videos.id, parseInt(id)));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting video:', error);
        return NextResponse.json(
            { error: 'Failed to delete video' },
            { status: 500 }
        );
    }
}

// Helper functions
function mapAppStatusToDb(appStatus) {
    const statusMap = {
        'pending': 'pending',
        'running': 'in_progress',
        'ended': 'completed',
    };
    return statusMap[appStatus] || 'pending';
}

function mapDbStatusToApp(dbStatus) {
    const statusMap = {
        'pending': 'pending',
        'in_progress': 'running',
        'completed': 'ended',
    };
    return statusMap[dbStatus] || 'pending';
}

function formatDate(date) {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
