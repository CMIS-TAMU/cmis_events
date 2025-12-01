import { testConnection } from '@/lib/test-db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Check if environment variables are set
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return NextResponse.json({
        success: false,
        message: 'Supabase environment variables not configured',
        error: 'Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY',
      }, { status: 500 });
    }

    const result = await testConnection();
    
    return NextResponse.json({
      success: !result.error,
      message: result.error ? 'Database connection failed' : 'Database connection successful',
      error: result.error?.message || null,
      details: result.error && 'code' in result.error ? {
        code: result.error.code,
        hint: result.error.hint,
      } : null,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: 'Error testing database',
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

