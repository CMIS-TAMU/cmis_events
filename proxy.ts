import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // CRITICAL: Check homepage and public routes FIRST - before ANY other processing
  // This must be the absolute first check to ensure homepage is never blocked
  if (pathname === '/' || 
      pathname === '/events' ||
      pathname === '/competitions' ||
      pathname === '/leaderboard' ||
      pathname === '/be-a-mentor' ||
      pathname === '/be-a-sponsor' ||
      pathname === '/login' ||
      pathname === '/signup' ||
      pathname === '/reset-password' ||
      pathname.startsWith('/events/') ||
      pathname.startsWith('/competitions/') ||
      pathname.startsWith('/reset-password/')) {
    // Immediate return - no processing, no checks, just allow through
    return NextResponse.next();
  }
  
  // Skip proxy for static files, API routes, and Next.js internals
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.match(/\.(ico|png|jpg|jpeg|gif|svg|webp|woff|woff2|ttf|eot)$/)
  ) {
    return NextResponse.next();
  }

  // Wrap rest in try-catch to prevent middleware from crashing
  try {

    let response = NextResponse.next({
      request: {
        headers: request.headers,
      },
    });

    let user = null;
    let supabase: ReturnType<typeof createServerClient> | null = null;
    
    try {
      // Validate environment variables before creating client
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseAnonKey) {
        // Missing env vars - skip auth checks but continue
        return response;
      }

      supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
        cookies: {
          getAll() {
            try {
              return request.cookies.getAll();
            } catch {
              return [];
            }
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) => {
                try {
                  request.cookies.set(name, value);
                } catch {
                  // Ignore request cookie setting errors
                }
                try {
                  response.cookies.set(name, value, options || {});
                } catch {
                  // Ignore response cookie setting errors
                }
              });
            } catch {
              // Ignore cookie setting errors
            }
          },
        },
      });

      // Get user from session - use getUser() which works in Edge Runtime with @supabase/ssr
      try {
        const authResponse = await (supabase.auth as any).getUser();
        
        if (authResponse && !authResponse.error && authResponse.data?.user) {
          user = authResponse.data.user;
        }
      } catch (authError) {
        // Auth error - continue without user
        user = null;
      }
    } catch (error) {
      // If anything fails, continue without user (unauthenticated)
      user = null;
    }

    // Protected routes - redirect to login if not authenticated
    // Only protect these specific paths, allow everything else to be public
    const protectedPaths = ['/dashboard', '/admin', '/profile'];
    const isProtectedPath = protectedPaths.some((path) => pathname.startsWith(path));

    if (isProtectedPath && !user) {
      try {
        const redirectUrl = request.nextUrl.clone();
        redirectUrl.pathname = '/login';
        redirectUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(redirectUrl);
      } catch {
        // If redirect fails, just continue
        return response;
      }
    }

    // Admin routes - redirect if not admin
    const adminPaths = ['/admin'];
    const isAdminPath = adminPaths.some((path) => pathname.startsWith(path));

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
        try {
          const redirectUrl = request.nextUrl.clone();
          redirectUrl.pathname = '/dashboard';
          return NextResponse.redirect(redirectUrl);
        } catch {
          // If redirect fails, just continue
          return response;
        }
      }
    }

    // Auth routes - redirect to dashboard if already logged in
    const authPaths = ['/login', '/signup'];
    const isAuthPath = authPaths.some((path) => pathname.startsWith(path));

    if (isAuthPath && user) {
      try {
        const redirectUrl = request.nextUrl.clone();
        redirectUrl.pathname = '/dashboard';
        return NextResponse.redirect(redirectUrl);
      } catch {
        // If redirect fails, just continue
        return response;
      }
    }

    return response;
  } catch (error) {
    // If middleware completely fails, return a basic response to prevent crash
    return NextResponse.next();
  }
}

// Matcher configuration for proxy
// Match all request paths except for static files
// IMPORTANT: The root path "/" MUST be included to allow homepage access
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * Note: This pattern INCLUDES the root path "/"
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

