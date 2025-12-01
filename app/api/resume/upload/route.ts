import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { uploadResume } from '@/lib/storage/resume';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
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

    // Upload resume
    const uploadResult = await uploadResume(file, user.id);

    if (!uploadResult.success) {
      return NextResponse.json(
        { error: uploadResult.error },
        { status: 400 }
      );
    }

    // Get current resume info to delete old one
    const { data: currentUser } = await supabase
      .from('users')
      .select('resume_filename, resume_version')
      .eq('id', user.id)
      .single();

    const newVersion = (currentUser?.resume_version || 0) + 1;

    // Update user record
    const { data, error } = await supabase
      .from('users')
      .update({
        resume_url: uploadResult.url || null,
        resume_filename: uploadResult.filename || null,
        resume_uploaded_at: new Date().toISOString(),
        resume_version: newVersion,
        major: major || null,
        gpa: gpa || null,
        skills: skills || null,
        graduation_year: graduationYear || null,
      })
      .eq('id', user.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: `Failed to update resume: ${error.message}` },
        { status: 500 }
      );
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

