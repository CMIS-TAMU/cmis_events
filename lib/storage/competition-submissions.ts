import { createClientSupabase } from '@/lib/supabase/client';

/**
 * Upload competition submission file to Supabase Storage
 */
export async function uploadCompetitionSubmission(
  file: File,
  competitionId: string,
  teamId: string
): Promise<{ url: string; filename: string }> {
  const supabase = createClientSupabase();

  // Validate file type (allow PDF, DOCX, PPT)
  const allowedTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
    'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx
    'application/msword', // .doc
    'application/vnd.ms-powerpoint', // .ppt
  ];

  if (!allowedTypes.includes(file.type)) {
    throw new Error('Invalid file type. Please upload a PDF, DOC, DOCX, PPT, or PPTX file.');
  }

  // Validate file size (max 10MB)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    throw new Error('File size exceeds 10MB limit.');
  }

  // Create file path: competitions/{competition_id}/{team_id}/{filename}
  const fileExt = file.name.split('.').pop();
  const timestamp = Date.now();
  const fileName = `${timestamp}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
  const filePath = `competitions/${competitionId}/${teamId}/${fileName}`;

  // Upload file
  const { data, error } = await supabase.storage
    .from('competition-submissions')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    throw new Error(`Failed to upload file: ${error.message}`);
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('competition-submissions')
    .getPublicUrl(filePath);

  return {
    url: publicUrl,
    filename: file.name,
  };
}

/**
 * Get signed URL for downloading a submission (if private bucket)
 */
export async function getSubmissionDownloadUrl(filePath: string): Promise<string> {
  const supabase = createClientSupabase();

  const { data, error } = await supabase.storage
    .from('competition-submissions')
    .createSignedUrl(filePath, 3600); // 1 hour expiry

  if (error) {
    throw new Error(`Failed to generate download URL: ${error.message}`);
  }

  return data.signedUrl;
}

/**
 * Delete submission file
 */
export async function deleteSubmission(filePath: string): Promise<void> {
  const supabase = createClientSupabase();

  const { error } = await supabase.storage
    .from('competition-submissions')
    .remove([filePath]);

  if (error) {
    throw new Error(`Failed to delete file: ${error.message}`);
  }
}

