/**
 * Mentor Matching Service
 * 
 * Provides utilities for matching students with mentors using vector embeddings
 */

import {
  generateAndStoreEmbedding,
  searchSimilarContent,
  updateEmbedding,
  deleteEmbedding,
} from '@/lib/ai/embeddings';
import { createAdminSupabase } from '@/lib/supabase/server';

export interface MentorMatch {
  mentorId: string;
  userId: string;
  similarity: number;
  textContent: string;
  metadata: Record<string, unknown>;
}

/**
 * Index a student profile for mentor matching
 */
export async function indexStudentProfile(
  studentId: string,
  profileData: {
    goals?: string;
    interests?: string;
    careerPath?: string;
    skills?: string[];
    major?: string;
    graduationYear?: number;
    preferredMentorTraits?: string[];
    areasOfFocus?: string[];
  }
): Promise<{ id: string }> {
  // Combine profile fields into searchable text
  const textParts = [
    profileData.goals,
    profileData.interests,
    profileData.careerPath,
    profileData.major,
    profileData.preferredMentorTraits?.join(', '),
    profileData.areasOfFocus?.join(', '),
    profileData.skills?.join(', '),
  ].filter(Boolean);

  const textContent = textParts.join('\n\n').trim();

  return generateAndStoreEmbedding(
    'student_profile',
    studentId,
    textContent,
    studentId, // User ID
    {
      major: profileData.major,
      graduationYear: profileData.graduationYear,
      skills: profileData.skills || [],
      goals: profileData.goals,
      interests: profileData.interests,
      careerPath: profileData.careerPath,
      preferredMentorTraits: profileData.preferredMentorTraits || [],
      areasOfFocus: profileData.areasOfFocus || [],
      indexedAt: new Date().toISOString(),
    }
  );
}

/**
 * Index a mentor profile for matching
 */
export async function indexMentorProfile(
  mentorId: string,
  profileData: {
    expertise?: string;
    experience?: string;
    specialization?: string;
    industry?: string;
    skills?: string[];
    background?: string;
    mentoringStyle?: string;
    availability?: string;
  }
): Promise<{ id: string }> {
  // Combine mentor profile fields into searchable text
  const textParts = [
    profileData.expertise,
    profileData.experience,
    profileData.specialization,
    profileData.industry,
    profileData.background,
    profileData.mentoringStyle,
    profileData.skills?.join(', '),
  ].filter(Boolean);

  const textContent = textParts.join('\n\n').trim();

  return generateAndStoreEmbedding(
    'mentor_profile',
    mentorId,
    textContent,
    mentorId, // User ID
    {
      industry: profileData.industry,
      skills: profileData.skills || [],
      expertise: profileData.expertise,
      experience: profileData.experience,
      specialization: profileData.specialization,
      background: profileData.background,
      mentoringStyle: profileData.mentoringStyle,
      availability: profileData.availability,
      indexedAt: new Date().toISOString(),
    }
  );
}

/**
 * Update student profile embedding
 */
export async function updateStudentProfileIndex(
  studentId: string,
  profileData: Record<string, unknown>
): Promise<{ id: string }> {
  const textParts = [
    profileData.goals,
    profileData.interests,
    profileData.careerPath,
    profileData.major,
    Array.isArray(profileData.preferredMentorTraits)
      ? profileData.preferredMentorTraits.join(', ')
      : '',
    Array.isArray(profileData.areasOfFocus)
      ? profileData.areasOfFocus.join(', ')
      : '',
    Array.isArray(profileData.skills) ? profileData.skills.join(', ') : '',
  ].filter(Boolean);

  const textContent = textParts.join('\n\n').trim();
  return updateEmbedding('student_profile', studentId, textContent, studentId, profileData);
}

/**
 * Update mentor profile embedding
 */
export async function updateMentorProfileIndex(
  mentorId: string,
  profileData: Record<string, unknown>
): Promise<{ id: string }> {
  const textParts = [
    profileData.expertise,
    profileData.experience,
    profileData.specialization,
    profileData.industry,
    profileData.background,
    profileData.mentoringStyle,
    Array.isArray(profileData.skills) ? profileData.skills.join(', ') : '',
  ].filter(Boolean);

  const textContent = textParts.join('\n\n').trim();
  return updateEmbedding('mentor_profile', mentorId, textContent, mentorId, profileData);
}

/**
 * Delete student profile embedding
 */
export async function deleteStudentProfileIndex(studentId: string): Promise<void> {
  return deleteEmbedding('student_profile', studentId);
}

/**
 * Delete mentor profile embedding
 */
export async function deleteMentorProfileIndex(mentorId: string): Promise<void> {
  return deleteEmbedding('mentor_profile', mentorId);
}

/**
 * Find matching mentors for a student using semantic search
 */
export async function findMatchingMentors(
  studentId: string,
  options?: {
    threshold?: number;
    limit?: number;
    industry?: string;
    specialization?: string;
  }
): Promise<MentorMatch[]> {
  const supabase = createAdminSupabase();

  // Get student profile embedding
  const { data: studentProfile, error } = await supabase
    .from('embeddings')
    .select('text_content')
    .eq('content_type', 'student_profile')
    .eq('content_id', studentId)
    .single();

  if (error || !studentProfile) {
    throw new Error('Student profile not found or not indexed');
  }

  // Search for similar mentor profiles
  const results = await searchSimilarContent(studentProfile.text_content, {
    contentType: 'mentor_profile',
    threshold: options?.threshold ?? 0.6,
    limit: options?.limit ?? 10,
  });

  // Apply filters if specified
  let filtered = results;

  if (options?.industry) {
    filtered = filtered.filter(
      (result) =>
        (result.metadata.industry as string)?.toLowerCase() ===
        options.industry!.toLowerCase()
    );
  }

  if (options?.specialization) {
    filtered = filtered.filter(
      (result) =>
        (result.metadata.specialization as string)?.toLowerCase() ===
        options.specialization!.toLowerCase()
    );
  }

  return filtered.map((result) => ({
    mentorId: result.contentId,
    userId: result.userId || '',
    similarity: result.similarity,
    textContent: result.textContent,
    metadata: result.metadata,
  }));
}

/**
 * Find matching students for a mentor using semantic search
 */
export async function findMatchingStudents(
  mentorId: string,
  options?: {
    threshold?: number;
    limit?: number;
    major?: string;
    careerPath?: string;
  }
): Promise<MentorMatch[]> {
  const supabase = createAdminSupabase();

  // Get mentor profile embedding
  const { data: mentorProfile, error } = await supabase
    .from('embeddings')
    .select('text_content')
    .eq('content_type', 'mentor_profile')
    .eq('content_id', mentorId)
    .single();

  if (error || !mentorProfile) {
    throw new Error('Mentor profile not found or not indexed');
  }

  // Search for similar student profiles
  const results = await searchSimilarContent(mentorProfile.text_content, {
    contentType: 'student_profile',
    threshold: options?.threshold ?? 0.6,
    limit: options?.limit ?? 10,
  });

  // Apply filters if specified
  let filtered = results;

  if (options?.major) {
    filtered = filtered.filter(
      (result) =>
        (result.metadata.major as string)?.toLowerCase() ===
        options.major!.toLowerCase()
    );
  }

  if (options?.careerPath) {
    filtered = filtered.filter(
      (result) =>
        (result.metadata.careerPath as string)?.toLowerCase().includes(
          options.careerPath!.toLowerCase()
        )
    );
  }

  return filtered.map((result) => ({
    mentorId: result.contentId, // Actually studentId in this context
    userId: result.userId || '',
    similarity: result.similarity,
    textContent: result.textContent,
    metadata: result.metadata,
  }));
}

/**
 * Match using natural language query (e.g., "looking for a mentor in data science")
 */
export async function searchMentorsByQuery(
  query: string,
  options?: {
    threshold?: number;
    limit?: number;
    industry?: string;
  }
): Promise<MentorMatch[]> {
  const results = await searchSimilarContent(query, {
    contentType: 'mentor_profile',
    threshold: options?.threshold ?? 0.6,
    limit: options?.limit ?? 10,
  });

  let filtered = results;

  if (options?.industry) {
    filtered = filtered.filter(
      (result) =>
        (result.metadata.industry as string)?.toLowerCase() ===
        options.industry!.toLowerCase()
    );
  }

  return filtered.map((result) => ({
    mentorId: result.contentId,
    userId: result.userId || '',
    similarity: result.similarity,
    textContent: result.textContent,
    metadata: result.metadata,
  }));
}

