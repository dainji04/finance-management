import { NextResponse } from 'next/server';
import { AUTH_COOKIE_NAME } from './app/lib/authConstants';

const PUBLIC_PAGES = ['/login', '/register'];

export function middleware(request) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const isAuthApi = pathname.startsWith('/api/auth');
  const isApi = pathname.startsWith('/api');
  const isPublicPage = PUBLIC_PAGES.includes(pathname);

  if (isAuthApi) {
    return NextResponse.next();
  }

  if (!token) {
    if (isApi) {
      return NextResponse.json({ message: 'Chưa đăng nhập' }, { status: 401 });
    }
    if (!isPublicPage) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    return NextResponse.next();
  }

  if (isPublicPage) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest|icon.svg|sw.js).*)']
};
