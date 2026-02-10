import { NextResponse } from 'next/server';

export function middleware(request) {
    // Check for session cookie directly from request
    const session = request.cookies.get('user_session')?.value;

    // Define public paths that don't require authentication
    const publicPaths = ['/', '/api/login', '/favicon.ico'];
    const path = request.nextUrl.pathname;
    const isPublicPath = publicPaths.some(p => path === p);

    // Specifically ensure /content or similar subpaths are protected
    // (though the logic below handles it, being explicit for the user's request)
    if (path.startsWith('/content') && !session) {
        return NextResponse.redirect(new URL('/', request.url));
    }

    // If there is no session and the user is trying to access a protected route
    if (!session && !isPublicPath) {
        // Redirect to login page
        return NextResponse.redirect(new URL('/', request.url));
    }

    // If there is a session and the user is on the login page
    if (session && request.nextUrl.pathname === '/') {
        // Redirect to dashboard
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api/login (login route)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder content (if any, though usually served statically)
         */
        '/((?!api/login|_next/static|_next/image|favicon.ico).*)',
    ],
};
