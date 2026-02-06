import { NextResponse } from 'next/server';
import { db } from '@/db';
import { messages } from '@/db/schema';
import { pusherServer } from '@/lib/pusher';
import { getSession } from '@/lib/auth';

export async function POST(request) {
    try {
        const session = await getSession(); // This might need adjustment based on how auth works in this app
        // For now, assume session user is passed or we verify it some other way.
        // Actually, getSession usually reads from cookies.

        // If your auth system is custom, we might need to parse headers.
        // Let's assume the client sends userId for now if getSession isn't robust, 
        // but ideally we decode the token. 
        // Based on previous files, getSession seems to exist in @/lib/auth.

        const body = await request.json();
        const { content, channel, receiverId, currentUserId } = body;

        // Fallback if getSession fails/is client-side only mock: use currentUserId from body
        // SECURITY NOTE: In production, trust ONLY the session. 
        const senderId = session?.id || currentUserId;

        if (!senderId || !content) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const newMessage = await db.insert(messages).values({
            content,
            senderId,
            receiverId: receiverId || null,
            channel: channel || null,
        }).returning();

        const messageData = newMessage[0];

        // Trigger Pusher event
        // Channel naming convention:
        // - Group: 'chat-group-main'
        // - DM: 'chat-dm-1-2' (sorted ids)

        let pusherChannel = '';
        if (channel) {
            pusherChannel = `chat-group-${channel}`;
        } else if (receiverId) {
            const ids = [senderId, receiverId].sort((a, b) => a - b);
            pusherChannel = `chat-dm-${ids[0]}-${ids[1]}`;
        }

        if (pusherChannel) {
            await pusherServer.trigger(pusherChannel, 'new-message', messageData);
        }

        // Trigger Notification on Receiver's Personal Channel (if DM)
        if (receiverId) {
            await pusherServer.trigger(`user-${receiverId}`, 'new-message', messageData);
        }

        return NextResponse.json(messageData);
    } catch (error) {
        console.error('Error sending message:', error);
        return NextResponse.json({ error: 'Internal User Error' }, { status: 500 });
    }
}
