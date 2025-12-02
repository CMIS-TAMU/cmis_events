import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

/**
 * API route to get signed URL for a resume
 * This is needed because signed URLs must be generated server-side
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabase();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const resumePath = searchParams.get('path');

    if (!resumePath) {
      return NextResponse.json(
        { error: 'Missing resume path parameter' },
        { status: 400 }
      );
    }

    // Get signed URL (expires in 1 hour)
    const { data, error } = await supabase.storage
      .from('resumes')
      .createSignedUrl(resumePath, 3600);

    if (error || !data) {
      console.error('Error creating signed URL:', error);
      return NextResponse.json(
        { error: error?.message || 'Failed to create signed URL' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      signedUrl: data.signedUrl,
    });
  } catch (error: any) {
    console.error('Resume signed URL error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

