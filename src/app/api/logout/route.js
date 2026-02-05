import { NextResponse } from 'next/server';

export async function POST(request) {
    const response = NextResponse.json({ success: true, message: 'Logged out successfully' });

    // Clear the session cookie
    response.cookies.delete('user_session');

    return response;
}
