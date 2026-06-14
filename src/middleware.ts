import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

const PUBLIC_PATHS = ['/', '/splash', '/onboarding', '/login', '/admin-login'];
const ADMIN_PATHS = ['/admin'];
const CLIENT_PATHS = ['/home', '/barber', '/booking', '/chat', '/profile'];

export default function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Strip locale prefix for path matching
  const pathnameWithoutLocale = pathname.replace(/^\/[a-z]{2}(-[A-Z]{2})?/, '') || '/';

  return intlMiddleware(request);
}

export const config = {
  matcher: [
    '/((?!api|_next|_vercel|.*\\..*).*)',
  ],
};
