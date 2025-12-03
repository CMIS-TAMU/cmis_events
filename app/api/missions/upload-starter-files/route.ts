import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase, createAdminSupabase } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabase();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' },
        { status: 401 }
      );
    }

    // Check if user is sponsor
    const supabaseAdmin = createAdminSupabase();
    const { data: profile } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'sponsor' && profile?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Access denied. Sponsor role required.' },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const missionId = formData.get('missionId') as string | null;

    console.log('[Starter File Upload] Form data received:', {
      hasFile: !!file,
      fileName: file?.name,
      fileSize: file?.size,
      fileType: file?.type,
      missionId,
    });

    if (!file) {
      console.error('[Starter File Upload] No file in form data');
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!missionId || missionId === 'undefined' || missionId === 'null') {
      console.error('[Starter File Upload] Invalid mission ID:', missionId);
      return NextResponse.json(
        { error: 'Mission ID is required' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = [
      'application/zip',
      'application/x-zip-compressed',
      'application/pdf',
      'text/plain',
      'text/markdown',
    ];

    const isValidType = allowedTypes.includes(file.type) || 
      file.name.match(/\.(zip|pdf|txt|md)$/i);

    if (!isValidType) {
      return NextResponse.json(
        { error: 'Only ZIP, PDF, TXT, and MD files are allowed' },
        { status: 400 }
      );
    }

    // Validate file size (50 MB max)
    const maxSize = 50 * 1024 * 1024; // 50 MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size must be less than 50 MB' },
        { status: 400 }
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filename = `missions/${missionId}/starter-files/${timestamp}-${sanitizedFilename}`;

    // Upload file to Supabase Storage using admin client to bypass RLS
    console.log('[Starter File Upload] Attempting upload:', {
      filename,
      fileSize: file.size,
      fileType: file.type,
      missionId,
    });

    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('mission-starter-files')
      .upload(filename, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error('[Starter File Upload] Upload error details:', {
        error: uploadError,
        message: uploadError.message,
        errorCode: (uploadError as any).statusCode || (uploadError as any).error,
      });
      return NextResponse.json(
        { 
          error: `Failed to upload file: ${uploadError.message}`,
          details: (uploadError as any).error || (uploadError as any).statusCode,
        },
        { status: 400 }
      );
    }

    console.log('[Starter File Upload] Upload successful:', uploadData.path);

    // Get public URL
    const { data: urlData } = supabaseAdmin.storage
      .from('mission-starter-files')
      .getPublicUrl(uploadData.path);

    console.log('[Starter File Upload] Public URL generated:', urlData.publicUrl);

    return NextResponse.json({
      success: true,
      url: urlData.publicUrl,
      filename: uploadData.path,
    });
  } catch (error: any) {
    console.error('[Starter File Upload] Unexpected error:', {
      error,
      message: error?.message,
      stack: error?.stack,
      name: error?.name,
    });
    return NextResponse.json(
      { 
        error: error?.message || 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error?.stack : undefined,
      },
      { status: 500 }
    );
  }
}

