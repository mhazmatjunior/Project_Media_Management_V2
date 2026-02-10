import { NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { db, schema } from '@/db';
import { videoAssets } from '@/db/schema';

import { R2, R2_BUCKET_NAME } from '@/lib/r2';

import { cookies } from 'next/headers';

export async function POST(request) {
    const cookieStore = await cookies();
    const session = cookieStore.get('user_session');

    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { fileName, fileType, videoId, department } = body;

        // generated unique filename
        const uniqueFileName = `${videoId}-${department}-${Date.now()}-${fileName.replace(/\s+/g, '-')}`;

        // Create the command
        const command = new PutObjectCommand({
            Bucket: R2_BUCKET_NAME,
            Key: uniqueFileName,
            ContentType: fileType,
        });

        // Generate Presigned URL (valid for 5 minutes)
        const signedUrl = await getSignedUrl(R2, command, { expiresIn: 300 });

        // Calculate public URL (for downloading later)
        // If R2.dev is enabled, use that. Otherwise, we might need to presign downloads too.
        // For now, let's assume we'll use presigned GET urls for downloads to keep it private.
        const fileKey = uniqueFileName;

        return NextResponse.json({
            uploadUrl: signedUrl,
            fileKey: fileKey,
        });
    } catch (error) {
        console.error('Error generating upload URL:', error);
        return NextResponse.json(
            { error: 'Failed to generate upload URL' },
            { status: 500 }
        );
    }
}
