import { createClient } from '@supabase/supabase-js';

export function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase environment variables are not set');
  }

  return createClient(supabaseUrl, supabaseKey);
}

export async function testConnection() {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.from('users').select('count');
    console.log('Database connection:', error ? 'FAILED' : 'SUCCESS');
    if (error) {
      console.error('Error details:', error);
    }
    return { data, error };
  } catch (error) {
    console.error('Connection error:', error);
    return { 
      data: null, 
      error: error instanceof Error ? error : new Error('Unknown error') 
    };
  }
}

