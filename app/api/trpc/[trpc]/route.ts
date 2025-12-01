import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from '@/server/routers/_app';
import { createClient } from '@supabase/supabase-js';
import { NextRequest } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

async function createContext(req: NextRequest) {
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  
  // Get auth token from request
  const authHeader = req.headers.get('authorization');
  let user = null;

  if (authHeader) {
    const token = authHeader.replace('Bearer ', '');
    const { data: { user: authUser } } = await supabase.auth.getUser(token);
    user = authUser;
  }

  // If no token in header, try to get from cookies
  if (!user) {
    const token = req.cookies.get('sb-access-token')?.value;
    if (token) {
      const { data: { user: authUser } } = await supabase.auth.getUser(token);
      user = authUser;
    }
  }

  return {
    req,
    user: user ? {
      id: user.id,
      email: user.email || '',
      role: user.user_metadata?.role || 'user',
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

