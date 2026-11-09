import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifySessionToken, ADMIN_COOKIE_NAME } from '@/lib/session';

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // صفحة تسجيل الدخول
    if (request.nextUrl.pathname === '/admin/login') {
      const adminSession = request.cookies.get(ADMIN_COOKIE_NAME);
      if (adminSession?.value) {
        const isValid = await verifySessionToken(adminSession.value);
        if (isValid) {
          return NextResponse.redirect(new URL('/admin', request.url));
        }
      }
      return NextResponse.next();
    }

    // بقية صفحات لوحة التحكم
    const adminSession = request.cookies.get(ADMIN_COOKIE_NAME);
    if (!adminSession?.value) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    const isValid = await verifySessionToken(adminSession.value);
    if (!isValid) {
      const response = NextResponse.redirect(new URL('/admin/login', request.url));
      response.cookies.delete(ADMIN_COOKIE_NAME);
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
