import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export interface ResumeUploadResult {
  success: boolean;
  url?: string;
  filename?: string;
  error?: string;
}

/**
 * Upload resume to Supabase Storage
 */
export async function uploadResume(
  file: File,
  userId: string
): Promise<ResumeUploadResult> {
  try {
    // Validate file type
    if (file.type !== 'application/pdf') {
      return {
        success: false,
        error: 'Only PDF files are allowed',
      };
    }

    // Validate file size (10 MB max)
    const maxSize = 10 * 1024 * 1024; // 10 MB
    if (file.size > maxSize) {
      return {
        success: false,
        error: 'File size must be less than 10 MB',
      };
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.id !== userId) {
      return {
        success: false,
        error: 'Unauthorized',
      };
    }

    // Generate unique filename
    const timestamp = Date.now();
    const filename = `${userId}/${timestamp}-${file.name}`;

    // Upload file to Supabase Storage
    const { data, error } = await supabase.storage
      .from('resumes')
      .upload(filename, file, {
        cacheControl: '3600',
        upsert: false, // Don't overwrite existing files
      });

    if (error) {
      console.error('Resume upload error:', error);
      return {
        success: false,
        error: error.message || 'Failed to upload resume',
      };
    }

    // Get public URL (for private buckets, we'll use signed URLs)
    const { data: urlData } = supabase.storage
      .from('resumes')
      .getPublicUrl(data.path);

    return {
      success: true,
      url: urlData.publicUrl,
      filename: data.path,
    };
  } catch (error: any) {
    console.error('Resume upload error:', error);
    return {
      success: false,
      error: error.message || 'An error occurred while uploading resume',
    };
  }
}

/**
 * Get signed URL for resume (for private bucket access)
 */
export async function getResumeSignedUrl(
  resumePath: string,
  expiresIn: number = 3600
): Promise<string | null> {
  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const { data, error } = await supabase.storage
      .from('resumes')
      .createSignedUrl(resumePath, expiresIn);

    if (error || !data) {
      console.error('Error creating signed URL:', error);
      return null;
    }

    return data.signedUrl;
  } catch (error) {
    console.error('Error getting signed URL:', error);
    return null;
  }
}

/**
 * Delete resume from Supabase Storage
 */
export async function deleteResume(resumePath: string): Promise<boolean> {
  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const { error } = await supabase.storage
      .from('resumes')
      .remove([resumePath]);

    if (error) {
      console.error('Error deleting resume:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error deleting resume:', error);
    return false;
  }
}

