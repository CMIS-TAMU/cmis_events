'use client';

import { createBrowserClient } from '@supabase/ssr';

/**
 * Client-side Supabase client for use in React components
 * Uses @supabase/ssr for proper cookie handling
 */
export function createClientSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}

/**
 * Get the current Supabase client instance
 */
export const supabase = createClientSupabase();

