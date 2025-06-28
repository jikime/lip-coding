import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 인증이 필요한 페이지 경로들
const authRequiredPaths = [
  '/profile',
  '/mentors',
  '/requests',
];

// 인증된 사용자가 접근했을 때 리다이렉트할 페이지들 (로그인 페이지, 회원가입 페이지 등)
const authRedirectPaths = [
  '/login',
  '/signup',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // API 경로는 처리하지 않음
  if (pathname.startsWith('/api/')) {
    return NextResponse.next();
  }
  
  // 토큰 확인
  const token = request.cookies.get('token')?.value;
  
  // 인증이 필요한 페이지에 접근했는데 토큰이 없는 경우
  if (authRequiredPaths.some(path => pathname.startsWith(path)) && !token) {
    const url = new URL('/login', request.url);
    url.searchParams.set('from', pathname);
    return NextResponse.redirect(url);
  }
  
  // 인증된 사용자가 로그인/회원가입 페이지에 접근한 경우
  if (authRedirectPaths.some(path => pathname === path) && token) {
    return NextResponse.redirect(new URL('/profile', request.url));
  }
  
  // 루트 경로('/')에 접근한 경우
  if (pathname === '/') {
    // 로그인한 사용자는 프로필 페이지로, 비로그인 사용자는 로그인 페이지로
    const redirectUrl = token ? '/profile' : '/login';
    return NextResponse.redirect(new URL(redirectUrl, request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};