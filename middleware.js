import { NextResponse } from 'next/server';

export function middleware(request) {
    const { pathname } = request.nextUrl;
    
    // Public routes that don't need authentication
    const publicPaths = ['/', '/api/login', '/api/seed'];
    
    // Check if this is a public path
    const isPublicPath = publicPaths.some(path => pathname.startsWith(path));
    
    if (isPublicPath) {
        return NextResponse.next();
    }
    
    // Check for session in cookies
    const session = request.cookies.get('user_session');
    
    // If no session, redirect to login
    if (!session) {
        return NextResponse.redirect(new URL('/', request.url));
    }
    
    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image files)
         * - favicon.ico, icon.svg
         * - images (.png, .jpg, .webp)
         */
        '/((?!_next/static|_next/image|favicon.ico|icon.svg|.*\\.png$|.*\\.jpg$|.*\\.webp$).*)',
    ],
};
