import PusherServer from 'pusher';
import PusherClient from 'pusher-js';

// Server-side Pusher instance
export const pusherServer = new PusherServer({
    appId: process.env.PUSHER_APP_ID,
    key: process.env.PUSHER_KEY,
    secret: process.env.PUSHER_SECRET,
    cluster: process.env.PUSHER_CLUSTER,
    useTLS: true,
});

// Client-side Pusher instance
export const pusherClient = process.env.NEXT_PUBLIC_PUSHER_KEY
    ? new PusherClient(process.env.NEXT_PUBLIC_PUSHER_KEY, {
        cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'ap2',
    })
    : null;
