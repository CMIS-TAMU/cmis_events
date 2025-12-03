/**
 * Mentor Matching Engine
 * 
 * This module contains the core matching algorithm that pairs mentors with students
 * based on skills, goals, interests, and activity scores.
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Use service role key for matching engine (bypasses RLS)
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export interface MatchScore {
  studentId: string;
  score: number;
  reasons: {
    skillOverlap: number;
    goalAlignment: number;
    graduationYear: number;
    activityScore: number;
  };
  details: {
    matchingSkills: string[];
    matchingGoals: string[];
    graduationYear: number | null;
    activityScore: number;
  };
}

export interface StudentProfile {
  userId: string;
  skills: string[];
  interests: string[];
  careerGoals: string[];
  graduationYear: number | null;
  activityScore: number;
  major: string | null;
}

export interface MentorProfile {
  userId: string;
  skills: string[];
  areasOfExpertise: string[];
  industries: string[];
  preferredHelpTypes: string[];
}

/**
 * Calculate match score between a mentor and student
 */
export function calculateMatchScore(
  mentor: MentorProfile,
  student: StudentProfile
): MatchScore {
  // 1. Skill Overlap (40% weight)
  const skillOverlap = calculateSkillOverlap(
    mentor.skills,
    mentor.areasOfExpertise,
    student.skills,
    student.interests
  );

  // 2. Career Goals Alignment (25% weight)
  const goalAlignment = calculateGoalAlignment(
    mentor.industries,
    mentor.preferredHelpTypes,
    student.careerGoals,
    student.interests
  );

  // 3. Graduation Year Relevance (15% weight)
  const graduationWeight = calculateGraduationWeight(student.graduationYear);

  // 4. Growth Activity Score (20% weight)
  const activityWeight = normalizeActivityScore(student.activityScore);

  // Calculate final score
  const totalScore =
    skillOverlap * 0.4 +
    goalAlignment * 0.25 +
    graduationWeight * 0.15 +
    activityWeight * 0.2;

  // Find matching skills
  const matchingSkills = findMatchingItems(
    [...mentor.skills, ...mentor.areasOfExpertise],
    [...student.skills, ...student.interests]
  );

  // Find matching goals
  const matchingGoals = findMatchingItems(
    [...mentor.industries, ...mentor.preferredHelpTypes],
    [...student.careerGoals, ...student.interests]
  );

  return {
    studentId: student.userId,
    score: Math.round(totalScore * 100) / 100, // Round to 2 decimal places
    reasons: {
      skillOverlap: Math.round(skillOverlap * 100) / 100,
      goalAlignment: Math.round(goalAlignment * 100) / 100,
      graduationYear: Math.round(graduationWeight * 100) / 100,
      activityScore: Math.round(activityWeight * 100) / 100,
    },
    details: {
      matchingSkills,
      matchingGoals,
      graduationYear: student.graduationYear,
      activityScore: student.activityScore,
    },
  };
}

/**
 * Calculate skill overlap score (0-100)
 */
function calculateSkillOverlap(
  mentorSkills: string[],
  mentorExpertise: string[],
  studentSkills: string[],
  studentInterests: string[]
): number {
  const mentorItems = [
    ...mentorSkills.map((s) => s.toLowerCase()),
    ...mentorExpertise.map((e) => e.toLowerCase()),
  ];
  const studentItems = [
    ...studentSkills.map((s) => s.toLowerCase()),
    ...studentInterests.map((i) => i.toLowerCase()),
  ];

  if (mentorItems.length === 0 || studentItems.length === 0) {
    return 0;
  }

  const matching = findMatchingItems(mentorItems, studentItems);
  const totalUnique = new Set([...mentorItems, ...studentItems]).size;

  if (totalUnique === 0) return 0;

  return (matching.length / totalUnique) * 100;
}

/**
 * Calculate goal alignment score (0-100)
 */
function calculateGoalAlignment(
  mentorIndustries: string[],
  mentorHelpTypes: string[],
  studentGoals: string[],
  studentInterests: string[]
): number {
  const mentorItems = [
    ...mentorIndustries.map((i) => i.toLowerCase()),
    ...mentorHelpTypes.map((h) => h.toLowerCase()),
  ];
  const studentItems = [
    ...studentGoals.map((g) => g.toLowerCase()),
    ...studentInterests.map((i) => i.toLowerCase()),
  ];

  if (mentorItems.length === 0 || studentItems.length === 0) {
    return 0;
  }

  const matching = findMatchingItems(mentorItems, studentItems);
  const totalUnique = new Set([...mentorItems, ...studentItems]).size;

  if (totalUnique === 0) return 0;

  return (matching.length / totalUnique) * 100;
}

/**
 * Calculate graduation year weight (0-100)
 * Prioritizes students closer to graduation
 */
function calculateGraduationWeight(graduationYear: number | null): number {
  if (!graduationYear) return 50; // Default score if unknown

  const currentYear = new Date().getFullYear();
  const yearsUntilGraduation = graduationYear - currentYear;

  // Higher score for students graduating soon (0-2 years)
  if (yearsUntilGraduation <= 0) return 100; // Already graduated or graduating this year
  if (yearsUntilGraduation === 1) return 90;
  if (yearsUntilGraduation === 2) return 75;
  if (yearsUntilGraduation === 3) return 60;
  if (yearsUntilGraduation === 4) return 50;

  return 40; // 5+ years away
}

/**
 * Normalize activity score to 0-100 range
 */
function normalizeActivityScore(activityScore: number): number {
  // Activity score is already 0-100, but we can adjust the scale
  // Higher activity = better match
  return Math.min(activityScore, 100);
}

/**
 * Find matching items between two arrays (case-insensitive, partial matches)
 */
function findMatchingItems(arr1: string[], arr2: string[]): string[] {
  const matches: string[] = [];
  const arr2Lower = arr2.map((item) => item.toLowerCase());

  for (const item1 of arr1) {
    const item1Lower = item1.toLowerCase();
    
    // Exact match
    if (arr2Lower.includes(item1Lower)) {
      matches.push(item1);
      continue;
    }

    // Partial match (one contains the other)
    for (const item2 of arr2) {
      const item2Lower = item2.toLowerCase();
      if (
        item1Lower.includes(item2Lower) ||
        item2Lower.includes(item1Lower)
      ) {
        if (!matches.includes(item1)) {
          matches.push(item1);
        }
      }
    }
  }

  return matches;
}

/**
 * Find best matching students for a mentor
 */
export async function findBestMatches(
  mentorId: string,
  limit: number = 4
): Promise<MatchScore[]> {
  try {
    // Get mentor profile
    const { data: mentorProfile, error: mentorError } = await supabase
      .from('mentor_profiles')
      .select('*')
      .eq('user_id', mentorId)
      .eq('is_active', true)
      .single();

    if (mentorError || !mentorProfile) {
      console.error('Mentor profile not found:', mentorError);
      return [];
    }

    // Get all students seeking mentorship
    const { data: studentProfiles, error: studentsError } = await supabase
      .from('student_profiles')
      .select(`
        *,
        users!inner (
          id,
          skills,
          graduation_year,
          major
        )
      `)
      .eq('seeking_mentorship', true);

    if (studentsError || !studentProfiles) {
      console.error('Error fetching students:', studentsError);
      return [];
    }

    // Get user skills from users table
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, skills, graduation_year, major')
      .in(
        'id',
        studentProfiles.map((sp) => sp.user_id)
      );

    if (usersError) {
      console.error('Error fetching user data:', usersError);
    }

    // Create user skills map
    const userSkillsMap = new Map(
      (users || []).map((u) => [u.id, u.skills || []])
    );

    // Calculate match scores
    const matches: MatchScore[] = [];

    for (const studentProfile of studentProfiles) {
      const userSkills = userSkillsMap.get(studentProfile.user_id) || [];
      const user = users?.find((u) => u.id === studentProfile.user_id);

      const student: StudentProfile = {
        userId: studentProfile.user_id,
        skills: userSkills,
        interests: studentProfile.interests || [],
        careerGoals: studentProfile.career_goals || [],
        graduationYear: user?.graduation_year || null,
        activityScore: studentProfile.growth_activity_score || 0,
        major: user?.major || null,
      };

      const mentor: MentorProfile = {
        userId: mentorProfile.user_id,
        skills: mentorProfile.skills || [],
        areasOfExpertise: mentorProfile.areas_of_expertise || [],
        industries: mentorProfile.industries || [],
        preferredHelpTypes: mentorProfile.preferred_help_types || [],
      };

      const matchScore = calculateMatchScore(mentor, student);
      matches.push(matchScore);
    }

    // Sort by score (descending) and return top N
    matches.sort((a, b) => b.score - a.score);
    return matches.slice(0, limit);
  } catch (error) {
    console.error('Error in findBestMatches:', error);
    return [];
  }
}

/**
 * Create a match batch for a mentor
 */
export async function createMatchBatch(mentorId: string): Promise<string | null> {
  try {
    // Find best matches
    const matches = await findBestMatches(mentorId, 4);

    if (matches.length === 0) {
      console.log('No matches found for mentor:', mentorId);
      return null;
    }

    // Create match batch
    const { data: batch, error: batchError } = await supabase
      .from('mentor_match_batches')
      .insert({
        mentor_id: mentorId,
        status: 'pending',
        expires_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days
      })
      .select()
      .single();

    if (batchError || !batch) {
      console.error('Error creating match batch:', batchError);
      return null;
    }

    // Create match candidates
    const candidates = matches.map((match) => ({
      batch_id: batch.id,
      student_id: match.studentId,
      match_score: match.score,
      match_reasons: match.reasons,
      mentor_response: 'pending' as const,
    }));

    const { error: candidatesError } = await supabase
      .from('mentor_match_candidates')
      .insert(candidates);

    if (candidatesError) {
      console.error('Error creating match candidates:', candidatesError);
      // Delete batch if candidates failed
      await supabase.from('mentor_match_batches').delete().eq('id', batch.id);
      return null;
    }

    return batch.id;
  } catch (error) {
    console.error('Error in createMatchBatch:', error);
    return null;
  }
}

