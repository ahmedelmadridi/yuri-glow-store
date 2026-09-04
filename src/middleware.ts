import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Check if we are trying to access the admin area
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Exclude the login page itself from the check
    if (request.nextUrl.pathname === '/admin/login') {
      return NextResponse.next();
    }

    // Check for the admin session cookie
    const adminSession = request.cookies.get('admin_session');

    if (!adminSession || adminSession.value !== 'authenticated') {
      // Redirect to login if not authenticated
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
