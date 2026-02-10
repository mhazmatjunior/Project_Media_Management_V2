import { NextResponse } from 'next/server';
import { db, schema } from '@/db';
import { eq } from 'drizzle-orm';
import { cookies } from 'next/headers';
import { R2, R2_BUCKET_NAME } from '@/lib/r2';
import { DeleteObjectsCommand } from '@aws-sdk/client-s3';

// Helper to delete assets for a video
async function deleteVideoAssets(videoId) {
    try {
        // 1. Get all assets
        const assets = await db.select().from(schema.videoAssets).where(eq(schema.videoAssets.videoId, videoId));

        if (assets.length > 0) {
            // 2. Delete from R2
            const deleteParams = {
                Bucket: R2_BUCKET_NAME,
                Delete: {
                    Objects: assets.map(a => ({ Key: a.fileName })),
                    Quiet: true,
                },
            };
            await R2.send(new DeleteObjectsCommand(deleteParams));

            // 3. Delete from DB
            await db.delete(schema.videoAssets).where(eq(schema.videoAssets.videoId, videoId));
            console.log(`Deleted ${assets.length} assets for video ${videoId}`);
        }
    } catch (error) {
        console.error('Error cleaning up assets:', error);
        // We don't block the video update/delete if cleanup fails, but we verify it.
    }
}

// PUT /api/videos/[id] - Update video
export async function PUT(request, { params }) {
    try {
        const { id } = await params;
        const body = await request.json();

        // Get user from session for history tracking
        const cookieStore = await cookies();
        const session = cookieStore.get('user_session');
        let currentUserId = null;
        if (session) {
            try {
                const user = JSON.parse(session.value);
                currentUserId = user.id;
            } catch (e) {
                console.error('Error parsing session:', e);
            }
        }

        // Map app status to DB status if provided
        const updateData = {};
        const isCompletingDepartment = body.status === 'department_completed';
        const isFinishingProject = body.status === 'ended';

        if (body.name) updateData.title = body.name;
        if (body.description) updateData.description = body.description;
        if (body.status) {
            updateData.status = mapAppStatusToDb(body.status);
        }
        if (body.currentDepartment !== undefined) {
            updateData.currentDepartment = body.currentDepartment;
            updateData.departmentEnteredAt = new Date();
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

        // CLEANUP LOGIC: If video is marked as finished (ended/completed)
        if (isFinishingProject) {
            await deleteVideoAssets(parseInt(id));
        }

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

        // Log history if completing department
        const historyUserId = currentUserId || updatedVideo.assignedTo;
        if (isCompletingDepartment && historyUserId) {
            await db.insert(schema.videoHistory).values({
                videoId: updatedVideo.id,
                userId: historyUserId,
                department: updatedVideo.currentDepartment || body.currentDepartment || "unknown",
                action: 'completed',
                timestamp: new Date(),
            });
        }

        // Map back to app format
        const mappedVideo = {
            id: updatedVideo.id,
            name: updatedVideo.title,
            description: updatedVideo.description,
            status: mapDbStatusToApp(updatedVideo.status),
            date: formatDate(updatedVideo.createdAt),
            departmentEnteredAt: updatedVideo.departmentEnteredAt,
            currentDepartment: updatedVideo.currentDepartment,
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
        const videoId = parseInt(id);

        // CLEANUP LOGIC: Delete assets before deleting video
        await deleteVideoAssets(videoId);

        // Delete history first (foreign key constraint)
        await db.delete(schema.videoHistory).where(eq(schema.videoHistory.videoId, videoId));

        await db
            .delete(schema.videos)
            .where(eq(schema.videos.id, videoId));

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
        'department_completed': 'department_completed',
        'ended': 'completed',
    };
    return statusMap[appStatus] || 'pending';
}

function mapDbStatusToApp(dbStatus) {
    const statusMap = {
        'pending': 'pending',
        'in_progress': 'running',
        'department_completed': 'department_completed',
        'completed': 'ended',
    };
    return statusMap[dbStatus] || 'pending';
}

function formatDate(date) {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
