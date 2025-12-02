import { NextRequest, NextResponse } from 'next/server';
import { createAdminSupabase } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

/**
 * Test endpoint to verify admin client is working
 * This helps debug RLS issues
 */
export async function GET(request: NextRequest) {
  try {
    // Check if service role key is available
    const hasServiceKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!hasServiceKey) {
      return NextResponse.json({
        success: false,
        error: 'SUPABASE_SERVICE_ROLE_KEY is not set in environment variables',
        hasServiceKey: false,
      }, { status: 500 });
    }

    // Try to create admin client
    let supabaseAdmin;
    try {
      supabaseAdmin = createAdminSupabase();
    } catch (error: any) {
      return NextResponse.json({
        success: false,
        error: `Failed to create admin client: ${error.message}`,
        hasServiceKey: true,
      }, { status: 500 });
    }

    // Try a simple query to verify it works
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('id, email')
      .limit(1);

    if (error) {
      return NextResponse.json({
        success: false,
        error: `Admin client query failed: ${error.message}`,
        errorCode: error.code,
        errorDetails: error.details,
        hasServiceKey: true,
        adminClientCreated: true,
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Admin client is working correctly',
      hasServiceKey: true,
      adminClientCreated: true,
      querySuccessful: true,
      sampleData: data,
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || 'Unknown error',
    }, { status: 500 });
  }
}

