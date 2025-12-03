import { createServerSupabase, createAdminSupabase } from '@/lib/supabase/server';

export interface MissionFileUploadResult {
  success: boolean;
  url?: string;
  filename?: string;
  error?: string;
}

/**
 * Upload starter files for a mission
 * Should be called from server context (API route)
 */
export async function uploadMissionStarterFiles(
  file: File,
  missionId: string
): Promise<MissionFileUploadResult> {
  try {
    // Validate file type (allow ZIP, PDF, TXT, MD)
    const allowedTypes = [
      'application/zip',
      'application/x-zip-compressed',
      'application/pdf',
      'text/plain',
      'text/markdown',
    ];
    
    if (!allowedTypes.includes(file.type) && !file.name.match(/\.(zip|pdf|txt|md)$/i)) {
      return {
        success: false,
        error: 'Only ZIP, PDF, TXT, and MD files are allowed',
      };
    }

    // Validate file size (50 MB max)
    const maxSize = 50 * 1024 * 1024; // 50 MB
    if (file.size > maxSize) {
      return {
        success: false,
        error: 'File size must be less than 50 MB',
      };
    }

    const supabase = await createServerSupabase();

    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return {
        success: false,
        error: 'Unauthorized - Authentication required',
      };
    }

    // Generate unique filename
    const timestamp = Date.now();
    const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filename = `missions/${missionId}/starter-files/${timestamp}-${sanitizedFilename}`;

    // Upload file to Supabase Storage
    const { data, error } = await supabase.storage
      .from('mission-starter-files')
      .upload(filename, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error('Mission file upload error:', error);
      return {
        success: false,
        error: error.message || 'Failed to upload file',
      };
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('mission-starter-files')
      .getPublicUrl(data.path);

    return {
      success: true,
      url: urlData.publicUrl,
      filename: data.path,
    };
  } catch (error: any) {
    console.error('Mission file upload error:', error);
    return {
      success: false,
      error: error.message || 'An error occurred while uploading file',
    };
  }
}

/**
 * Upload submission files for a mission
 * Should be called from server context (API route)
 */
export async function uploadMissionSubmissionFiles(
  files: File[],
  missionId: string,
  studentId: string
): Promise<{ success: boolean; files?: Array<{ url: string; filename: string }>; error?: string }> {
  try {
    const supabase = await createServerSupabase();

    // Verify user is authenticated and matches studentId
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user || user.id !== studentId) {
      return {
        success: false,
        error: 'Unauthorized - Authentication required',
      };
    }

    const uploadedFiles: Array<{ url: string; filename: string }> = [];

    for (const file of files) {
      // Validate file size (100 MB max per file)
      const maxSize = 100 * 1024 * 1024; // 100 MB
      if (file.size > maxSize) {
        return {
          success: false,
          error: `File ${file.name} exceeds 100 MB limit`,
        };
      }

      // Generate unique filename
      const timestamp = Date.now();
      const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const filename = `missions/${missionId}/submissions/${studentId}/${timestamp}-${sanitizedFilename}`;

      // Upload file to Supabase Storage (private bucket)
      const { data, error } = await supabase.storage
        .from('mission-submissions')
        .upload(filename, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) {
        console.error('Submission file upload error:', error);
        return {
          success: false,
          error: `Failed to upload ${file.name}: ${error.message}`,
        };
      }

      // Get signed URL (private bucket requires signed URLs)
      const { data: signedUrlData, error: urlError } = await supabase.storage
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

    return {
      success: true,
      files: uploadedFiles,
    };
  } catch (error: any) {
    console.error('Submission file upload error:', error);
    return {
      success: false,
      error: error.message || 'An error occurred while uploading files',
    };
  }
}

/**
 * Get signed URL for submission file (for viewing/downloading)
 */
export async function getSubmissionFileSignedUrl(
  filePath: string,
  expiresIn: number = 3600
): Promise<string | null> {
  try {
    const supabase = await createServerSupabase();

    const { data, error } = await supabase.storage
      .from('mission-submissions')
      .createSignedUrl(filePath, expiresIn);

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
 * Delete submission files
 */
export async function deleteSubmissionFiles(
  filePaths: string[]
): Promise<boolean> {
  try {
    const supabase = await createServerSupabase();

    const { error } = await supabase.storage
      .from('mission-submissions')
      .remove(filePaths);

    if (error) {
      console.error('Error deleting files:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error deleting files:', error);
    return false;
  }
}

