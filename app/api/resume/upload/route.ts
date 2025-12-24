import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase, createAdminSupabase } from '@/lib/supabase/server';
import { indexResume, extractResumeText } from '@/lib/services/resume-matching';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // Use server-side Supabase client that handles cookies/auth
    const supabase = await createServerSupabase();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error('Auth error:', authError);
      return NextResponse.json(
        { error: 'Unauthorized - Please log in to upload a resume' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const major = formData.get('major') as string | null;
    const gpa = formData.get('gpa') ? parseFloat(formData.get('gpa') as string) : null;
    const skills = formData.get('skills') ? JSON.parse(formData.get('skills') as string) : null;
    const graduationYear = formData.get('graduationYear') ? parseInt(formData.get('graduationYear') as string) : null;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Create admin client first (needed for both storage and database operations)
    let supabaseAdmin;
    try {
      supabaseAdmin = createAdminSupabase();
      console.log('[Resume Upload] Admin client created successfully');
    } catch (adminError: any) {
      console.error('[Resume Upload] Failed to create admin client:', adminError);
      return NextResponse.json(
        { error: `Server configuration error: ${adminError.message}. Please ensure SUPABASE_SERVICE_ROLE_KEY is set in .env.local` },
        { status: 500 }
      );
    }

    // Validate file type
    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { error: 'Only PDF files are allowed' },
        { status: 400 }
      );
    }

    // Validate file size (10 MB max)
    const maxSize = 10 * 1024 * 1024; // 10 MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size must be less than 10 MB' },
        { status: 400 }
      );
    }

    // Upload file to Supabase Storage using admin client (bypasses RLS)
    console.log('[Resume Upload] Uploading file to storage...');
    const timestamp = Date.now();
    const filename = `${user.id}/${timestamp}-${file.name}`;
    
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('resumes')
      .upload(filename, file, {
        cacheControl: '3600',
        upsert: false, // Don't overwrite existing files
      });

    if (uploadError) {
      console.error('[Resume Upload] Storage upload error:', uploadError);
      return NextResponse.json(
        { error: `Failed to upload file: ${uploadError.message}` },
        { status: 400 }
      );
    }

    console.log('[Resume Upload] File uploaded successfully:', uploadData.path);

    // Get public URL (for private buckets, we'll use signed URLs)
    const { data: urlData } = supabaseAdmin.storage
      .from('resumes')
      .getPublicUrl(uploadData.path);

    const uploadResult = {
      success: true,
      url: urlData.publicUrl,
      filename: uploadData.path,
    };

    // Check if user exists first
    console.log('[Resume Upload] Checking if user exists:', user.id);
    const { data: existingUser, error: checkError } = await supabaseAdmin
      .from('users')
      .select('id, resume_filename, resume_version')
      .eq('id', user.id)
      .maybeSingle();

    if (checkError) {
      console.error('[Resume Upload] Error checking user existence:', checkError);
      return NextResponse.json(
        { error: `Failed to check user: ${checkError.message}` },
        { status: 500 }
      );
    }

    if (!existingUser) {
      console.error('[Resume Upload] User does not exist in users table:', user.id);
      return NextResponse.json(
        { error: 'User profile not found. Please contact support.' },
        { status: 404 }
      );
    }

    console.log('[Resume Upload] User found, current version:', existingUser.resume_version);
    const newVersion = (existingUser.resume_version || 0) + 1;

    // Update user record using admin client (bypasses RLS)
    console.log('[Resume Upload] Updating user record with admin client...');
    const updateData = {
      resume_url: uploadResult.url || null,
      resume_filename: uploadResult.filename || null,
      resume_uploaded_at: new Date().toISOString(),
      resume_version: newVersion,
      major: major || null,
      gpa: gpa || null,
      skills: skills || null,
      graduation_year: graduationYear || null,
    };
    console.log('[Resume Upload] Update data:', JSON.stringify(updateData, null, 2));

    const { data, error } = await supabaseAdmin
      .from('users')
      .update(updateData)
      .eq('id', user.id)
      .select()
      .single();

    if (error) {
      console.error('[Resume Upload] Database update error:', error);
      console.error('[Resume Upload] Error code:', error.code);
      console.error('[Resume Upload] Error message:', error.message);
      console.error('[Resume Upload] Error details:', error.details);
      console.error('[Resume Upload] Error hint:', error.hint);
      return NextResponse.json(
        { error: `Failed to update resume: ${error.message}. Error code: ${error.code || 'unknown'}. Details: ${error.details || 'none'}` },
        { status: 500 }
      );
    }

    console.log('[Resume Upload] Update successful!');

    // Index resume for semantic search (async, don't block response)
    try {
      console.log('[Resume Upload] Starting resume indexing...');
      const fileBuffer = Buffer.from(await file.arrayBuffer());
      const resumeText = await extractResumeText(fileBuffer);
      
      await indexResume(user.id, resumeText, user.id, {
        fileName: file.name,
        uploadedAt: new Date().toISOString(),
        skills: skills || [],
        major: major || undefined,
        gpa: gpa || undefined,
      });
      
      console.log('[Resume Upload] Resume indexed successfully');
    } catch (indexError: any) {
      // Log error but don't fail the upload
      console.error('[Resume Upload] Failed to index resume (non-critical):', indexError);
    }

    return NextResponse.json({
      success: true,
      data: {
        ...data,
        signedUrl: uploadResult.url,
      },
    });
  } catch (error: any) {
    console.error('Resume upload error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

