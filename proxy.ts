import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function proxy(request: NextRequest) {
  // Wrap everything in try-catch to prevent middleware from crashing
  try {
    // Skip middleware for static files and API routes (except protected ones)
    const pathname = request.nextUrl.pathname;
    if (pathname.startsWith('/api/') && !pathname.startsWith('/api/trpc')) {
      return NextResponse.next();
    }

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

    // Public routes that should always be accessible (no auth required)
    const publicPaths = [
      '/',
      '/events',
      '/competitions', 
      '/leaderboard',
      '/be-a-mentor',
      '/be-a-sponsor',
      '/login',
      '/signup',
      '/reset-password'
    ];
    const isPublicPath = publicPaths.includes(pathname) || 
                         pathname.startsWith('/events/') || 
                         pathname.startsWith('/competitions/') ||
                         pathname.startsWith('/reset-password/');
    
    // Protected routes - redirect to login if not authenticated
    // Only protect these specific paths, allow everything else to be public
    const protectedPaths = ['/dashboard', '/admin', '/profile'];
    const isProtectedPath = !isPublicPath && protectedPaths.some((path) => pathname.startsWith(path));

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

