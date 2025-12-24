/**
 * Resume Matching Service
 * 
 * Provides utilities for matching resumes to job descriptions using vector embeddings
 */

import {
  generateAndStoreEmbedding,
  searchSimilarContent,
  updateEmbedding,
  deleteEmbedding,
} from '@/lib/ai/embeddings';
import { createAdminSupabase } from '@/lib/supabase/server';

export interface ResumeMatch {
  resumeId: string;
  userId: string;
  similarity: number;
  textContent: string;
  metadata: Record<string, unknown>;
}

/**
 * Extract text from PDF resume
 */
export async function extractResumeText(
  pdfBuffer: Buffer
): Promise<string> {
  try {
    // pdf-parse v2.4.5 changed API: PDFParse is now a class that must be instantiated
    // We need to create an instance and call getText() method
    let PDFParseClass: any;
    
    try {
      // Try ES6 import first
      const pdfParseModule = await import('pdf-parse');
      PDFParseClass = (pdfParseModule as any).PDFParse;
    } catch (importError) {
      // Fallback to require for Node.js (works better with CommonJS)
      const pdfModule = require('pdf-parse');
      PDFParseClass = pdfModule.PDFParse;
    }
    
    if (!PDFParseClass || typeof PDFParseClass !== 'function') {
      throw new Error('PDFParse class not found in pdf-parse module');
    }
    
    // Create instance with the buffer
    const parser = new PDFParseClass({ data: pdfBuffer });
    
    // Extract text using getText() method
    const result = await parser.getText();
    
    // Clean up
    await parser.destroy();
    
    // result.text contains the full text, result.pages contains per-page text
    return result.text || '';
  } catch (error) {
    console.error('[Resume Matching] PDF parse error:', error);
    throw new Error(`Failed to extract text from PDF resume: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Generate and store embedding for a resume
 */
export async function indexResume(
  resumeId: string,
  resumeText: string,
  userId: string,
  metadata?: {
    fileName?: string;
    uploadedAt?: string;
    skills?: string[];
    major?: string;
    gpa?: number;
  }
): Promise<{ id: string }> {
  return generateAndStoreEmbedding(
    'resume',
    resumeId,
    resumeText,
    userId,
    {
      fileName: metadata?.fileName,
      uploadedAt: metadata?.uploadedAt || new Date().toISOString(),
      skills: metadata?.skills || [],
      major: metadata?.major,
      gpa: metadata?.gpa,
    }
  );
}

/**
 * Update resume embedding when resume is updated
 */
export async function updateResumeIndex(
  resumeId: string,
  resumeText: string,
  userId: string,
  metadata?: Record<string, unknown>
): Promise<{ id: string }> {
  return updateEmbedding('resume', resumeId, resumeText, userId, metadata);
}

/**
 * Delete resume embedding when resume is deleted
 */
export async function deleteResumeIndex(resumeId: string): Promise<void> {
  return deleteEmbedding('resume', resumeId);
}

/**
 * Match resumes to a job description
 */
export async function matchResumesToJob(
  jobDescription: string,
  options?: {
    threshold?: number;
    limit?: number;
    skills?: string[];
    major?: string;
    minGPA?: number;
  }
): Promise<ResumeMatch[]> {
  const results = await searchSimilarContent(jobDescription, {
    contentType: 'resume',
    threshold: options?.threshold ?? 0.6,
    limit: options?.limit ?? 20,
  });

  // Apply additional filters if specified
  let filtered = results;

  if (options?.skills && options.skills.length > 0) {
    filtered = filtered.filter((result) => {
      const resumeSkills = (result.metadata.skills as string[]) || [];
      return options.skills!.some((skill) =>
        resumeSkills.some(
          (rs) => rs.toLowerCase().includes(skill.toLowerCase())
        )
      );
    });
  }

  if (options?.major) {
    filtered = filtered.filter(
      (result) =>
        (result.metadata.major as string)?.toLowerCase() ===
        options.major!.toLowerCase()
    );
  }

  if (options?.minGPA !== undefined) {
    filtered = filtered.filter((result) => {
      const gpa = result.metadata.gpa as number;
      return gpa !== undefined && gpa >= options.minGPA!;
    });
  }

  return filtered.map((result) => ({
    resumeId: result.contentId,
    userId: result.userId || '',
    similarity: result.similarity,
    textContent: result.textContent,
    metadata: result.metadata,
  }));
}

/**
 * Generate and store embedding for a job description
 * This allows matching resumes to stored job descriptions
 */
export async function indexJobDescription(
  jobId: string,
  jobDescription: string,
  metadata?: {
    title?: string;
    company?: string;
    location?: string;
    skills?: string[];
    experienceLevel?: string;
  }
): Promise<{ id: string }> {
  return generateAndStoreEmbedding(
    'job_description',
    jobId,
    jobDescription,
    undefined, // Job descriptions aren't owned by users
    {
      title: metadata?.title,
      company: metadata?.company,
      location: metadata?.location,
      skills: metadata?.skills || [],
      experienceLevel: metadata?.experienceLevel,
      createdAt: new Date().toISOString(),
    }
  );
}

/**
 * Find resumes that match a stored job description
 */
export async function findMatchingResumesForJob(
  jobId: string
): Promise<ResumeMatch[]> {
  const supabase = createAdminSupabase();

  // Get the job description embedding
  const { data: jobEmbedding, error } = await supabase
    .from('embeddings')
    .select('text_content, embedding')
    .eq('content_type', 'job_description')
    .eq('content_id', jobId)
    .single();

  if (error || !jobEmbedding) {
    throw new Error('Job description not found');
  }

  // Parse the embedding vector
  // Note: Supabase returns embeddings as strings like "[1,2,3,...]"
  const embeddingString = jobEmbedding.embedding as string;
  const embedding = JSON.parse(embeddingString);

  // Search for similar resumes
  const { searchSimilarContent } = await import('@/lib/ai/embeddings');
  const results = await searchSimilarContent(jobEmbedding.text_content, {
    contentType: 'resume',
    threshold: 0.6,
    limit: 20,
  });

  return results.map((result) => ({
    resumeId: result.contentId,
    userId: result.userId || '',
    similarity: result.similarity,
    textContent: result.textContent,
    metadata: result.metadata,
  }));
}

