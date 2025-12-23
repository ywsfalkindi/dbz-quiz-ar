import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // هل يحاول المستخدم الدخول لصفحة الأدمن؟
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // نتحقق من وجود "الكوكي" السري
    const adminSession = request.cookies.get('admin_session');

    // إذا لم يكن موجوداً، اطرده لصفحة الدخول
    if (!adminSession) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

// نحدد المسارات التي ينطبق عليها هذا الحارس
export const config = {
  matcher: '/admin/:path*',
};