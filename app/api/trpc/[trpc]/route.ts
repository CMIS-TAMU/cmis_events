import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from '@/server/routers/_app';
import { createServerClient } from '@supabase/ssr';
import { NextRequest } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

async function createContext(req: NextRequest) {
  // Create Supabase client with SSR cookie handling (same as middleware)
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return req.cookies.getAll();
      },
      setAll(cookiesToSet) {
        // In API routes, we can't set cookies in context creation
        // Cookies will be handled by middleware
        cookiesToSet.forEach(({ name, value }) => {
          req.cookies.set(name, value);
        });
      },
    },
  });

  // Get user from session (reads from cookies automatically)
  const { data: { user } } = await supabase.auth.getUser();

  // Get user role from database if user exists
  let role = 'user';
  if (user) {
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();
    
    role = profile?.role || user.user_metadata?.role || 'user';
  }

  return {
    req,
    supabase, // Pass the Supabase client with cookie handling
    user: user ? {
      id: user.id,
      email: user.email || '',
      role,
    } : undefined,
  };
}

const handler = (req: NextRequest) =>
  fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: () => createContext(req),
    onError:
      process.env.NODE_ENV === 'development'
        ? ({ path, error }) => {
            console.error(`❌ tRPC failed on ${path ?? '<no-path>'}: ${error.message}`);
          }
        : undefined,
  });

export { handler as GET, handler as POST };

