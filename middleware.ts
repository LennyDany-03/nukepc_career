import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // TEMPORARILY DISABLED: Auth protection disabled for demo/development
  // Check if user has tokens in cookies
  // const token = request.cookies.get('access_token')?.value;
  // const refreshToken = request.cookies.get('refresh_token')?.value;

  // const isAuthenticated = !!token || !!refreshToken;

  // // Define protected routes
  // const isProtectedRoute = pathname.startsWith('/dashboard');

  // // Define auth routes (login/register)
  // const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/register');

  // if (isProtectedRoute && !isAuthenticated) {
  //   // Redirect to login if trying to access dashboard while unauthenticated
  //   return NextResponse.redirect(new URL('/login', request.url));
  // }

  // if (isAuthRoute && isAuthenticated) {
  //   // Redirect to dashboard if trying to access login/register while authenticated
  //   return NextResponse.redirect(new URL('/dashboard', request.url));
  // }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/register'],
};
