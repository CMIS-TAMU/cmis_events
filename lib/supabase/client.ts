'use client';

import { createClient } from '@supabase/supabase-js';

/**
 * Client-side Supabase client for use in React components
 * This client is safe to use in client components
 */
export function createClientSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  });
}

/**
 * Get the current Supabase client instance
 */
export const supabase = createClientSupabase();

