// Example: How to use the database in your API routes or components

import { db, schema } from '@/db';
import { eq, desc } from 'drizzle-orm';

// ============================================
// EXAMPLE 1: Fetch all videos
// ============================================
export async function getAllVideos() {
    const videos = await db.select().from(schema.videos);
    return videos;
}

// ============================================
// EXAMPLE 2: Fetch videos by status
// ============================================
export async function getVideosByStatus(status) {
    const videos = await db
        .select()
        .from(schema.videos)
        .where(eq(schema.videos.status, status))
        .orderBy(desc(schema.videos.createdAt));

    return videos;
}

// ============================================
// EXAMPLE 3: Create a new video
// ============================================
export async function createVideo(videoData) {
    const [newVideo] = await db
        .insert(schema.videos)
        .values({
            title: videoData.title,
            description: videoData.description,
            status: videoData.status || 'pending',
            category: videoData.category || 'general',
            userId: videoData.userId,
        })
        .returning();

    return newVideo;
}

//============================================
// EXAMPLE 4: Update video status
// ============================================
export async function updateVideoStatus(videoId, newStatus) {
    const [updatedVideo] = await db
        .update(schema.videos)
        .set({
            status: newStatus,
            updatedAt: new Date(),
        })
        .where(eq(schema.videos.id, videoId))
        .returning();

    return updatedVideo;
}

// ============================================
// EXAMPLE 5: Delete a video
// ============================================
export async function deleteVideo(videoId) {
    await db
        .delete(schema.videos)
        .where(eq(schema.videos.id, videoId));

    return { success: true };
}

// ============================================
// EXAMPLE 6: Get video statistics
// ============================================
export async function getVideoStats() {
    const allVideos = await db.select().from(schema.videos);

    return {
        total: allVideos.length,
        pending: allVideos.filter(v => v.status === 'pending').length,
        inProgress: allVideos.filter(v => v.status === 'in_progress').length,
        completed: allVideos.filter(v => v.status === 'completed').length,
        totalViews: allVideos.reduce((sum, v) => sum + (v.views || 0), 0),
        totalLikes: allVideos.reduce((sum, v) => sum + (v.likes || 0), 0),
    };
}

// ============================================
// USAGE IN API ROUTE: /api/videos/route.js
// ============================================
/*
import { getAllVideos, createVideo } from '@/lib/db-queries';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const videos = await getAllVideos();
    return NextResponse.json(videos);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const newVideo = await createVideo(body);
    return NextResponse.json(newVideo);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
*/
