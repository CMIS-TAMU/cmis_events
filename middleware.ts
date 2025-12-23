import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Skip middleware for static files and API routes (except protected ones)
  const pathname = request.nextUrl.pathname;
  if (pathname.startsWith('/api/') && !pathname.startsWith('/api/trpc')) {
    return response;
  }

  let user = null;
  let supabase: ReturnType<typeof createServerClient> | null = null;
  
  try {
    supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value));
            response = NextResponse.next({
              request,
            });
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    // Get user from session - use getUser() which works in Edge Runtime with @supabase/ssr
    // The Supabase SSR client supports getUser() in middleware, TypeScript types just need help
    const authResponse = await (supabase.auth as any).getUser();
    
    if (authResponse?.error || !authResponse?.data?.user) {
      // If there's an error getting user, continue without user
      user = null;
    } else {
      user = authResponse.data.user;
    }
  } catch (error) {
    // If session retrieval fails completely, continue without user (unauthenticated)
    // Don't log in production to avoid noise
    if (process.env.NODE_ENV === 'development') {
      console.error('Middleware: Failed to get session:', error);
    }
    user = null;
  }

  // Protected routes - redirect to login if not authenticated
  const protectedPaths = ['/dashboard', '/admin', '/profile'];
  const isProtectedPath = protectedPaths.some((path) => request.nextUrl.pathname.startsWith(path));

  if (isProtectedPath && !user) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/login';
    redirectUrl.searchParams.set('redirect', request.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Admin routes - redirect if not admin
  const adminPaths = ['/admin'];
  const isAdminPath = adminPaths.some((path) => request.nextUrl.pathname.startsWith(path));

  if (isAdminPath && user && supabase) {
    try {
      const { data: profile } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profile?.role !== 'admin') {
        const redirectUrl = request.nextUrl.clone();
        redirectUrl.pathname = '/dashboard';
        return NextResponse.redirect(redirectUrl);
      }
    } catch (error) {
      // If we can't check admin status, redirect to dashboard for safety
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = '/dashboard';
      return NextResponse.redirect(redirectUrl);
    }
  }

  // Auth routes - redirect to dashboard if already logged in
  const authPaths = ['/login', '/signup'];
  const isAuthPath = authPaths.some((path) => request.nextUrl.pathname.startsWith(path));

  if (isAuthPath && user) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/dashboard';
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

