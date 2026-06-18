import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { jwtDecode } from "jwt-decode";
import { routing } from './i18n/routing';

const i18nMiddleware = createMiddleware(routing);

// Role types
const roleBasedRoutes = {
  ADMIN: [/^\/dashboard(\/.*)?$/],
  USER: [/^\/user-profile(\/.*)?$/],
};

type Role = keyof typeof roleBasedRoutes;

function addSecurityHeaders(response: NextResponse) {
  if (!response?.headers) return response;
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  return response;
}

// Helper to remove locale from path to check against regex
function getPathWithoutLocale(pathname: string) {
  const match = pathname.match(/^\/(en|bn)(\/.*)?$/);
  // If matched, returns the path part after locale, or "/" if it's just the locale
  if (match) {
    return match[2] || "/";
  }
  return pathname;
}

function getUserFromToken(request: NextRequest) {
  const token = request.cookies.get("accessToken")?.value;
  if (!token) return null;

  try {
    const decoded: any = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    
    if (decoded.exp && decoded.exp < currentTime) {
      return null;
    }
    
    return decoded; // Returns the payload which should contain the role
  } catch (error) {
    console.error("Token decode failed:", error);
    return null;
  }
}

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Force root "/" to redirect to "/bn"
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/bn', request.url));
  }

  // 1. Run i18n middleware first to handle redirects and locale detection
  const response = i18nMiddleware(request);

  // 2. Auth Logic
  
  // Skip auth check for public assets/api if not already handled by matcher
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/api/') ||
    pathname.includes('.')
  ) {
    return response;
  }

  const pathWithoutLocale = getPathWithoutLocale(pathname);

  // Protected routes check
  const isDashboard = pathWithoutLocale.startsWith("/dashboard");
  const isUserProfile = pathWithoutLocale.startsWith("/user-profile");
  
  if (isDashboard || isUserProfile) {
    const user = getUserFromToken(request);
    
    if (!user) {
      // Redirect to login preserving the locale
      const locale = request.cookies.get('NEXT_LOCALE')?.value || 'bn';
      return NextResponse.redirect(
        new URL(`/${locale}/login?redirect=${pathname}`, request.url)
      );
    }

    const userRole = user.role as Role;
    const allowedRoutes = roleBasedRoutes[userRole];

    if (allowedRoutes?.some((routeRegex) => routeRegex.test(pathWithoutLocale))) {
       // Allowed
       return addSecurityHeaders(response);
    }

    // Not allowed, redirect to default
    const locale = request.cookies.get('NEXT_LOCALE')?.value || 'bn';
    const redirectPath = userRole === "ADMIN" ? "/dashboard" : "/user-profile";
    return NextResponse.redirect(new URL(`/${locale}${redirectPath}`, request.url));
  }

  return addSecurityHeaders(response);
}

export const config = {
  // Matcher must match both i18n routes and protected routes
  // Match all request paths except for the ones starting with:
  // - api (API routes)
  // - _next/static (static files)
  // - _next/image (image optimization files)
  // - favicon.ico (favicon file)
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
