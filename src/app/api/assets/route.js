import { NextResponse } from 'next/server';
import { db, schema } from '@/db';
import { videoAssets } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { S3Client, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

import { R2, R2_BUCKET_NAME } from '@/lib/r2';

import { cookies } from 'next/headers';

// GET /api/assets?videoId=123 - List assets for a video
export async function GET(request) {
    const cookieStore = await cookies();
    const session = cookieStore.get('user_session');

    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const videoId = searchParams.get('videoId');

    if (!videoId) {
        return NextResponse.json({ error: 'Video ID required' }, { status: 400 });
    }

    try {
        const assets = await db.select().from(videoAssets).where(eq(videoAssets.videoId, parseInt(videoId)));

        // Generate Presigned "Download" URLs for each asset
        const assetsWithUrls = await Promise.all(assets.map(async (asset) => {
            const command = new GetObjectCommand({
                Bucket: process.env.R2_BUCKET_NAME,
                Key: asset.fileName, // We stored the key in fileName
            });
            const url = await getSignedUrl(R2, command, { expiresIn: 3600 }); // 1 hour link
            return { ...asset, downloadUrl: url };
        }));

        return NextResponse.json(assetsWithUrls);
    } catch (error) {
        console.error('Error fetching assets:', error);
        return NextResponse.json({ error: 'Failed to fetch assets' }, { status: 500 });
    }
}

// POST /api/assets - Save metadata after upload
export async function POST(request) {
    const cookieStore = await cookies();
    const session = cookieStore.get('user_session');

    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { videoId, department, fileName, fileUrl, fileType, size } = body;

        const [newAsset] = await db.insert(videoAssets).values({
            videoId: parseInt(videoId),
            department,
            fileName: fileName, // This is the R2 Key
            fileUrl: fileUrl,   // This is the Public URL (or just a placeholder if using presigned)
            fileType,
            size
        }).returning();

        return NextResponse.json(newAsset);
    } catch (error) {
        console.error('Error saving asset metadata:', error);
        return NextResponse.json({ error: 'Failed to save asset' }, { status: 500 });
    }
}

// DELETE /api/assets?id=123 - Delete specific asset
export async function DELETE(request) {
    const cookieStore = await cookies();
    const session = cookieStore.get('user_session');

    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    try {
        // 1. Get asset to find fileName
        const [asset] = await db.select().from(videoAssets).where(eq(videoAssets.id, parseInt(id)));

        if (!asset) return NextResponse.json({ error: 'Asset not found' }, { status: 404 });

        // 2. Delete from R2
        try {
            const command = new DeleteObjectCommand({
                Bucket: process.env.R2_BUCKET_NAME,
                Key: asset.fileName,
            });
            await R2.send(command);
        } catch (r2Error) {
            console.error('R2 Delete Error (ignoring):', r2Error);
        }

        // 3. Delete from DB
        await db.delete(videoAssets).where(eq(videoAssets.id, parseInt(id)));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting asset:', error);
        return NextResponse.json({ error: 'Failed to delete asset' }, { status: 500 });
    }
}
