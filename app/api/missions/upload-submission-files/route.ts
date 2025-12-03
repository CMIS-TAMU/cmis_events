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

    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    const missionId = formData.get('missionId') as string;
    const studentId = formData.get('studentId') as string;

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      );
    }

    if (!missionId || !studentId) {
      return NextResponse.json(
        { error: 'Mission ID and Student ID are required' },
        { status: 400 }
      );
    }

    // Verify student ID matches authenticated user
    if (studentId !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Use admin client for storage upload
    const supabaseAdmin = createAdminSupabase();

    const uploadedFiles: Array<{ url: string; filename: string }> = [];

    for (const file of files) {
      // Validate file size (100 MB max per file)
      const maxSize = 100 * 1024 * 1024; // 100 MB
      if (file.size > maxSize) {
        return NextResponse.json(
          { error: `File ${file.name} exceeds 100 MB limit` },
          { status: 400 }
        );
      }

      // Generate unique filename
      const timestamp = Date.now();
      const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const filename = `missions/${missionId}/submissions/${studentId}/${timestamp}-${sanitizedFilename}`;

      // Upload file to Supabase Storage (private bucket)
      const { data, error } = await supabaseAdmin.storage
        .from('mission-submissions')
        .upload(filename, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) {
        console.error('Submission file upload error:', error);
        return NextResponse.json(
          { error: `Failed to upload ${file.name}: ${error.message}` },
          { status: 400 }
        );
      }

      // Get signed URL (private bucket requires signed URLs)
      const { data: signedUrlData, error: urlError } = await supabaseAdmin.storage
        .from('mission-submissions')
        .createSignedUrl(data.path, 3600 * 24 * 365); // 1 year expiry

      if (urlError || !signedUrlData) {
        console.error('Error creating signed URL:', urlError);
        // Continue anyway - we have the path
      }

      uploadedFiles.push({
        url: signedUrlData?.signedUrl || data.path,
        filename: data.path,
      });
    }

    return NextResponse.json({
      success: true,
      files: uploadedFiles,
    });
  } catch (error: any) {
    console.error('Submission file upload error:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred while uploading files' },
      { status: 500 }
    );
  }
}

