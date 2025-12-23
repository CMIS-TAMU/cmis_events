/**
 * Example Usage of Vector Embeddings
 * 
 * This file demonstrates how to use the embeddings service.
 * You can copy these examples into your own code.
 */

import {
  generateEmbedding,
  generateAndStoreEmbedding,
  searchSimilarContent,
  findSimilarEmbeddings,
} from './embeddings';
import {
  indexResume,
  matchResumesToJob,
  extractResumeText,
} from '../services/resume-matching';
import {
  indexEvent,
  searchEvents,
} from '../services/content-search';

// ============================================
// Example 1: Basic Embedding Generation
// ============================================
export async function exampleGenerateEmbedding() {
  const text = "Looking for a software engineer with React and TypeScript experience";
  
  const result = await generateEmbedding(text);
  
  console.log('Embedding dimensions:', result.dimensions); // 1536
  console.log('Model used:', result.model);
  console.log('Embedding vector (first 10):', result.embedding.slice(0, 10));
}

// ============================================
// Example 2: Store Embedding
// ============================================
export async function exampleStoreEmbedding(resumeId: string, resumeText: string, userId: string) {
  const result = await generateAndStoreEmbedding(
    'resume',              // Content type
    resumeId,              // Content ID
    resumeText,            // Text to embed
    userId,                // User ID (optional)
    {                      // Metadata (optional)
      fileName: 'resume.pdf',
      skills: ['React', 'TypeScript'],
      uploadedAt: new Date().toISOString(),
    }
  );
  
  console.log('Embedding stored with ID:', result.id);
}

// ============================================
// Example 3: Semantic Search
// ============================================
export async function exampleSemanticSearch(query: string) {
  const results = await searchSimilarContent(query, {
    contentType: 'resume',
    threshold: 0.7,  // Minimum 70% similarity
    limit: 10,
  });
  
  results.forEach((result, index) => {
    console.log(`Result ${index + 1}:`);
    console.log(`  Similarity: ${(result.similarity * 100).toFixed(1)}%`);
    console.log(`  Content ID: ${result.contentId}`);
    console.log(`  Preview: ${result.textContent.substring(0, 100)}...`);
  });
}

// ============================================
// Example 4: Resume Matching
// ============================================
export async function exampleResumeMatching(jobDescription: string) {
  // Match resumes to a job description
  const matches = await matchResumesToJob(jobDescription, {
    threshold: 0.7,
    limit: 10,
    skills: ['React', 'TypeScript'],  // Optional: filter by skills
    minGPA: 3.5,                      // Optional: filter by GPA
  });
  
  matches.forEach((match, index) => {
    console.log(`Match ${index + 1}:`);
    console.log(`  Resume ID: ${match.resumeId}`);
    console.log(`  Similarity: ${(match.similarity * 100).toFixed(1)}%`);
    console.log(`  User ID: ${match.userId}`);
    
    // Access metadata
    const skills = match.metadata.skills as string[];
    const gpa = match.metadata.gpa as number;
    console.log(`  Skills: ${skills?.join(', ')}`);
    console.log(`  GPA: ${gpa}`);
  });
  
  return matches;
}

// ============================================
// Example 5: Index a Resume
// ============================================
export async function exampleIndexResume(
  resumeId: string,
  pdfBuffer: Buffer,
  userId: string
) {
  // Extract text from PDF
  const resumeText = await extractResumeText(pdfBuffer);
  
  // Index the resume
  await indexResume(resumeId, resumeText, userId, {
    fileName: 'resume.pdf',
    skills: ['React', 'TypeScript', 'Node.js'],
    major: 'Computer Science',
    gpa: 3.8,
  });
  
  console.log('Resume indexed successfully');
}

// ============================================
// Example 6: Event Search
// ============================================
export async function exampleEventSearch(query: string) {
  // Search for events using natural language
  const events = await searchEvents(query, {
    threshold: 0.6,
    limit: 5,
    type: 'workshop',  // Optional: filter by event type
  });
  
  events.forEach((event, index) => {
    console.log(`Event ${index + 1}:`);
    console.log(`  Event ID: ${event.eventId}`);
    console.log(`  Similarity: ${(event.similarity * 100).toFixed(1)}%`);
    console.log(`  Title: ${event.metadata.title}`);
    console.log(`  Location: ${event.metadata.location}`);
  });
  
  return events;
}

// ============================================
// Example 7: Index an Event
// ============================================
export async function exampleIndexEvent(
  eventId: string,
  title: string,
  description: string
) {
  await indexEvent(eventId, title, description, {
    startsAt: new Date().toISOString(),
    location: 'Wehner 301',
    type: 'workshop',
    capacity: 50,
  });
  
  console.log('Event indexed successfully');
}

// ============================================
// Example 8: Batch Indexing
// ============================================
export async function exampleBatchIndexResumes(
  resumes: Array<{ id: string; text: string; userId: string }>
) {
  const batchSize = 10;
  const results = [];
  
  for (let i = 0; i < resumes.length; i += batchSize) {
    const batch = resumes.slice(i, i + batchSize);
    
    // Process batch in parallel
    const batchResults = await Promise.all(
      batch.map((resume) =>
        indexResume(resume.id, resume.text, resume.userId).catch((error) => {
          console.error(`Failed to index resume ${resume.id}:`, error);
          return null;
        })
      )
    );
    
    results.push(...batchResults.filter((r) => r !== null));
    
    // Optional: Add delay between batches to avoid rate limiting
    if (i + batchSize < resumes.length) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
  
  console.log(`Indexed ${results.length} resumes`);
  return results;
}

// ============================================
// Example 9: Using Pre-computed Embeddings
// ============================================
export async function exampleFindSimilarWithEmbedding(embeddingVector: number[]) {
  // If you already have an embedding vector, use findSimilarEmbeddings
  const results = await findSimilarEmbeddings(embeddingVector, {
    contentType: 'resume',
    threshold: 0.7,
    limit: 10,
  });
  
  return results;
}

// ============================================
// Example 10: Complete Resume Upload Flow
// ============================================
export async function exampleCompleteResumeUploadFlow(
  resumeId: string,
  pdfBuffer: Buffer,
  userId: string
) {
  try {
    // 1. Extract text from PDF
    const resumeText = await extractResumeText(pdfBuffer);
    
    // 2. Index the resume (generates embedding and stores it)
    await indexResume(resumeId, resumeText, userId, {
      fileName: 'resume.pdf',
      uploadedAt: new Date().toISOString(),
    });
    
    console.log('Resume uploaded and indexed successfully');
    
    // 3. Optionally, find similar resumes
    const similar = await searchSimilarContent(resumeText, {
      contentType: 'resume',
      threshold: 0.8,
      limit: 5,
    });
    
    console.log(`Found ${similar.length} similar resumes`);
    
    return { success: true, similarResumes: similar };
  } catch (error) {
    console.error('Error in resume upload flow:', error);
    throw error;
  }
}

