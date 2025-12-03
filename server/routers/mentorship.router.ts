import { z } from 'zod';
import { router, protectedProcedure, adminProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';
import { createClient } from '@supabase/supabase-js';
import { createAdminSupabase } from '@/lib/supabase/server';
import { sendEmail } from '@/lib/email/client';
import { mentorNotificationEmail } from '@/lib/email/templates';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const mentorshipRouter = router({
  // ========================================================================
  // PROFILE MANAGEMENT
  // ========================================================================

  // Create mentorship profile (student or mentor)
  createProfile: protectedProcedure
    .input(
      z.object({
        profile_type: z.enum(['student', 'mentor']),
        // Student fields
        major: z.string().optional(),
        graduation_year: z.number().int().min(2020).max(2030).optional(),
        research_interests: z.array(z.string()).optional(),
        career_goals: z.string().optional(),
        technical_skills: z.array(z.string()).optional(),
        gpa: z.number().min(0).max(4.0).optional(),
        // Mentor fields
        industry: z.string().optional(),
        organization: z.string().optional(),
        job_designation: z.string().optional(),
        tamu_graduation_year: z.number().int().min(1900).max(2030).optional(),
        location: z.string().optional(),
        areas_of_expertise: z.array(z.string()).optional(),
        max_mentees: z.number().int().min(1).max(10).optional(),
        // Mentor contact fields
        preferred_name: z.string().optional(),
        phone_number: z.string().optional(),
        linkedin_url: z.string().optional(),
        website_url: z.string().optional(),
        contact_email: z.string().email().optional(),
        // Common fields
        communication_preferences: z.array(z.string()).optional(),
        meeting_frequency: z.enum(['weekly', 'biweekly', 'monthly', 'as-needed']).optional(),
        mentorship_type: z.enum(['career', 'research', 'project', 'general']).optional(),
        bio: z.string().optional(),
        in_matching_pool: z.boolean().default(true),
        availability_status: z.enum(['active', 'on-break', 'unavailable']).default('active'),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // User is already authenticated via protectedProcedure
      if (!ctx.user) {
        throw new Error('User not authenticated');
      }
      
      // Use Supabase client from context if available, otherwise create one with service role for DB ops
      // Note: For database queries, we can use anon key client as RLS will handle permissions
      const supabase = ctx.supabase || createClient(supabaseUrl, supabaseAnonKey);
      
      const { profile_type, ...profileData } = input;

      // Validate required fields based on profile type
      if (profile_type === 'student' && !input.major) {
        throw new Error('Major is required for student profiles');
      }
      if (profile_type === 'mentor' && !input.industry) {
        throw new Error('Industry is required for mentor profiles');
      }

      // Check if profile already exists
      const { data: existing } = await supabase
        .from('mentorship_profiles')
        .select('id')
        .eq('user_id', ctx.user.id)
        .eq('profile_type', profile_type)
        .single();

      if (existing) {
        throw new Error('Profile already exists. Use updateProfile instead.');
      }

      const { data, error } = await supabase
        .from('mentorship_profiles')
        .insert({
          user_id: ctx.user.id,
          profile_type,
          ...profileData,
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create profile: ${error.message}`);
      }

      return data;
    }),

  // Update mentorship profile
  updateProfile: protectedProcedure
    .input(
      z.object({
        profile_type: z.enum(['student', 'mentor']).optional(),
        major: z.string().optional(),
        graduation_year: z.number().int().min(2020).max(2030).optional(),
        research_interests: z.array(z.string()).optional(),
        career_goals: z.string().optional(),
        technical_skills: z.array(z.string()).optional(),
        gpa: z.number().min(0).max(4.0).optional(),
        industry: z.string().optional(),
        organization: z.string().optional(),
        job_designation: z.string().optional(),
        tamu_graduation_year: z.number().int().min(1900).max(2030).optional(),
        location: z.string().optional(),
        areas_of_expertise: z.array(z.string()).optional(),
        max_mentees: z.number().int().min(1).max(10).optional(),
        // Mentor contact fields
        preferred_name: z.string().optional(),
        phone_number: z.string().optional(),
        linkedin_url: z.string().optional(),
        website_url: z.string().optional(),
        contact_email: z.string().email().optional(),
        communication_preferences: z.array(z.string()).optional(),
        meeting_frequency: z.enum(['weekly', 'biweekly', 'monthly', 'as-needed']).optional(),
        mentorship_type: z.enum(['career', 'research', 'project', 'general']).optional(),
        bio: z.string().optional(),
        in_matching_pool: z.boolean().optional(),
        availability_status: z.enum(['active', 'on-break', 'unavailable']).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Use Supabase client from context (has cookie handling) or create one
      const supabase = ctx.supabase || createClient(supabaseUrl, supabaseAnonKey);
      
      // User is already authenticated via protectedProcedure
      if (!ctx.user) {
        throw new Error('User not authenticated');
      }
      const user = ctx.user;

      const { data: existing } = await supabase
        .from('mentorship_profiles')
        .select('id, profile_type')
        .eq('user_id', user.id)
        .single();

      if (!existing) {
        throw new Error('Profile not found. Create a profile first.');
      }

      const { data, error } = await supabase
        .from('mentorship_profiles')
        .update(input)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update profile: ${error.message}`);
      }

      return data;
    }),

  // Get user's mentorship profile
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    // Use Supabase client from context (has cookie handling) or create one
    const supabase = ctx.supabase || createClient(supabaseUrl, supabaseAnonKey);
    
    // User is already authenticated via protectedProcedure
    if (!ctx.user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('mentorship_profiles')
      .select('*')
      .eq('user_id', ctx.user.id)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to fetch profile: ${error.message}`);
    }

    return data;
  }),

  // Get profile by ID (for admins or matched pairs)
  getProfileById: protectedProcedure
    .input(z.object({ user_id: z.string().uuid() }))
    .query(async ({ input }) => {
      const supabase = createClient(supabaseUrl, supabaseAnonKey);
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('User not authenticated');
      }

      // Check if user has permission (admin or matched)
      const { data: userProfile } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();

      const isAdmin = userProfile?.role === 'admin';

      // Check if they have an active match
      const { data: hasMatch } = await supabase
        .from('matches')
        .select('id')
        .eq('status', 'active')
        .or(`student_id.eq.${user.id},mentor_id.eq.${user.id}`)
        .or(`student_id.eq.${input.user_id},mentor_id.eq.${input.user_id}`)
        .limit(1)
        .maybeSingle();

      if (!isAdmin && !hasMatch) {
        throw new Error('Access denied');
      }

      const { data, error } = await supabase
        .from('mentorship_profiles')
        .select('*')
        .eq('user_id', input.user_id)
        .maybeSingle();

      if (error) {
        throw new Error(`Failed to fetch profile: ${error.message}`);
      }

      return data;
    }),

  // ========================================================================
  // MATCHING
  // ========================================================================

  // Student requests a mentor (creates match batch)
  requestMentor: protectedProcedure
    .input(
      z.object({
        request_id: z.string().uuid().optional(),
        preferred_mentorship_type: z.enum(['career', 'research', 'project', 'general']).optional(),
        preferred_industry: z.array(z.string()).optional(),
        preferred_communication_method: z.array(z.string()).optional(),
        student_notes: z.string().optional(),
      }).optional()
    )
    .mutation(async ({ ctx, input }) => {
      // Get authenticated user from context (already verified by protectedProcedure)
      if (!ctx.user) {
        throw new Error('User not authenticated');
      }

      const userId = ctx.user.id;
      const supabase = createAdminSupabase(); // Use service role to bypass RLS

      // Verify user is a student (no profile required)
      const { data: userProfile } = await supabase
        .from('users')
        .select('role, major, skills, resume_url')
        .eq('id', userId)
        .single();

      if (!userProfile || userProfile.role !== 'student') {
        throw new Error('You must be a student to request a mentor.');
      }

      // Optional: Check if user has some data for matching (major, skills, or resume)
      if (!userProfile.major && (!userProfile.skills || userProfile.skills.length === 0) && !userProfile.resume_url) {
        throw new Error('Please add your major, skills, or upload a resume to help us match you with the right mentor.');
      }

      // DEFENSIVE FIX: Clear ALL pending batches for this student before creating new one
      // This ensures no blocking batches exist when user wants to request a new mentor
      try {
        // Clear ALL pending batches for this student (user wants a fresh request)
        const { error: clearAllError } = await supabase
          .from('match_batches')
          .delete()
          .eq('student_id', userId)
          .eq('status', 'pending');
        
        if (clearAllError) {
          console.warn('Failed to clear pending batches:', clearAllError);
          // Log but continue - database function will handle the check
        } else {
          console.log(`Attempted to clear all pending match batches for student ${userId}`);
        }
      } catch (err) {
        console.warn('Error clearing pending batches (non-critical):', err);
        // Continue anyway - database function will handle the check
      }

      // Create mentorship request (optional tracking)
      let requestId = input?.request_id || null;
      if (!requestId) {
        const { data: request, error: requestError } = await supabase
          .from('mentorship_requests')
          .insert({
            student_id: userId,
            preferred_mentorship_type: input?.preferred_mentorship_type,
            preferred_industry: input?.preferred_industry,
            preferred_communication_method: input?.preferred_communication_method,
            student_notes: input?.student_notes,
            status: 'processing',
          })
          .select('id')
          .single();

        if (requestError) {
          console.error('Failed to create request:', requestError);
          // Continue anyway - request tracking is optional
        } else {
          requestId = request.id;
        }
      }

      // Create match batch using database function
      const { data: batchResult, error: batchError } = await supabase.rpc('create_match_batch', {
        p_student_id: userId,
        p_request_id: requestId,
      });

      if (batchError) {
        throw new Error(`Failed to create match batch: ${batchError.message}`);
      }

      if (!batchResult?.ok) {
        // Provide a more helpful error message for pending batch errors
        if (batchResult?.error?.includes('pending match batch')) {
          throw new Error(
            batchResult.error + 
            ' Please wait a moment and try again, or contact support if this persists.'
          );
        }
        throw new Error(batchResult?.error || 'Failed to create match batch');
      }

      // Update request status if it exists
      if (requestId) {
        await supabase
          .from('mentorship_requests')
          .update({ status: 'matched', match_batch_id: batchResult.batch_id })
          .eq('id', requestId);
      }

      // Send email notifications to mentors (async, don't block response)
      // Send emails asynchronously - don't wait for completion
      if (batchResult?.ok && batchResult.batch_id) {
        // Get student data
        const { data: student } = await supabase
          .from('users')
          .select('full_name, email, major, skills, metadata')
          .eq('id', userId)
          .single();

        // Get student notes from request if available
        let studentNotes = input?.student_notes || null;
        if (!studentNotes && requestId) {
          const { data: request } = await supabase
            .from('mentorship_requests')
            .select('student_notes')
            .eq('id', requestId)
            .single();
          studentNotes = request?.student_notes || null;
        }

        // Get match batch details with mentor info
        const { data: matchBatch } = await supabase
          .from('match_batches')
          .select(`
            mentor_1_id,
            mentor_1_score,
            mentor_2_id,
            mentor_2_score,
            mentor_3_id,
            mentor_3_score,
            mentor_1:mentor_1_id(id, email, full_name),
            mentor_2:mentor_2_id(id, email, full_name),
            mentor_3:mentor_3_id(id, email, full_name)
          `)
          .eq('id', batchResult.batch_id)
          .single();

        if (student && matchBatch) {
          const studentSkills = (student.skills || []) as string[];
          const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

          // Helper function to send email (fire and forget)
          const sendMentorEmail = async (
            mentorEmail: string,
            mentorName: string,
            matchScore: number,
            position: number
          ) => {
            try {
              const html = mentorNotificationEmail({
                mentorName,
                studentName: student.full_name || student.email || 'Student',
                studentEmail: student.email,
                studentMajor: student.major || null,
                studentSkills: studentSkills,
                matchScore,
                batchId: batchResult.batch_id,
                mentorPosition: position,
                studentNotes: studentNotes || undefined,
                appUrl,
              });

              const result = await sendEmail({
                to: mentorEmail,
                subject: `New Mentorship Request - Match Score: ${matchScore}/100`,
                html,
              });

              if (!result.success) {
                console.error(`Failed to send email to mentor ${position}:`, result.error);
              }
            } catch (err) {
              console.error(`Failed to send email to mentor ${position}:`, err);
            }
          };

          // Send emails to all mentors (async, fire and forget - don't block response)
          const mentor1 = matchBatch.mentor_1 as any;
          if (matchBatch.mentor_1_id && mentor1?.email) {
            sendMentorEmail(
              mentor1.email,
              mentor1.full_name || 'Mentor',
              matchBatch.mentor_1_score || 0,
              1
            ).catch(() => {}); // Silently fail - don't block response
          }

          const mentor2 = matchBatch.mentor_2 as any;
          if (matchBatch.mentor_2_id && mentor2?.email) {
            sendMentorEmail(
              mentor2.email,
              mentor2.full_name || 'Mentor',
              matchBatch.mentor_2_score || 0,
              2
            ).catch(() => {}); // Silently fail - don't block response
          }

          const mentor3 = matchBatch.mentor_3 as any;
          if (matchBatch.mentor_3_id && mentor3?.email) {
            sendMentorEmail(
              mentor3.email,
              mentor3.full_name || 'Mentor',
              matchBatch.mentor_3_score || 0,
              3
            ).catch(() => {}); // Silently fail - don't block response
          }
        }
      }

      return batchResult;
    }),

  // Mentor selects a student from match batch
  selectStudent: protectedProcedure
    .input(
      z.object({
        batch_id: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Get authenticated user from context
      if (!ctx.user) {
        throw new Error('User not authenticated');
      }

      const mentorId = ctx.user.id;
      const supabase = createAdminSupabase(); // Use service role to bypass RLS

      // Call database function to process selection
      const { data: result, error } = await supabase.rpc('mentor_select_student', {
        p_mentor_id: mentorId,
        p_batch_id: input.batch_id,
      });

      if (error) {
        throw new Error(`Failed to select student: ${error.message}`);
      }

      if (!result?.ok) {
        throw new Error(result?.error || 'Failed to select student');
      }

      return result;
    }),

  // Get match batch for student
  getMatchBatch: protectedProcedure.query(async ({ ctx }) => {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('match_batches')
      .select(`
        *,
        mentor_1:mentor_1_id(id, email, full_name),
        mentor_2:mentor_2_id(id, email, full_name),
        mentor_3:mentor_3_id(id, email, full_name)
      `)
      .eq('student_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to fetch match batch: ${error.message}`);
    }

    return data;
  }),

  // Get match batch for mentor (where they are recommended)
  getMentorMatchBatch: protectedProcedure.query(async ({ ctx }) => {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('match_batches')
      .select(`
        *,
        student:student_id(id, email, full_name)
      `)
      .or(`mentor_1_id.eq.${user.id},mentor_2_id.eq.${user.id},mentor_3_id.eq.${user.id}`)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch match batches: ${error.message}`);
    }

    return data || [];
  }),

  // Get all matches for current user
  getMatches: protectedProcedure.query(async ({ ctx }) => {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('matches')
      .select(`
        *,
        student:student_id(id, email, full_name),
        mentor:mentor_id(id, email, full_name)
      `)
      .or(`student_id.eq.${user.id},mentor_id.eq.${user.id}`)
      .order('matched_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch matches: ${error.message}`);
    }

    return data || [];
  }),

  // Get active match for current user
  getActiveMatch: protectedProcedure.query(async ({ ctx }) => {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('matches')
      .select(`
        *,
        student:student_id(id, email, full_name),
        mentor:mentor_id(id, email, full_name)
      `)
      .or(`student_id.eq.${user.id},mentor_id.eq.${user.id}`)
      .eq('status', 'active')
      .order('matched_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to fetch active match: ${error.message}`);
    }

    return data;
  }),

  // Get match by ID (for match details page)
  getMatchById: protectedProcedure
    .input(z.object({ match_id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      if (!ctx.user) {
        throw new Error('User not authenticated');
      }

      const supabase = ctx.supabase;

      // Get match with student and mentor info
      const { data: match, error } = await supabase
        .from('matches')
        .select(`
          *,
          student:student_id(id, email, full_name, major, skills),
          mentor:mentor_id(id, email, full_name)
        `)
        .eq('id', input.match_id)
        .single();

      if (error) {
        throw new Error(`Failed to fetch match: ${error.message}`);
      }

      if (!match) {
        throw new Error('Match not found');
      }

      // Verify user has access to this match
      if (match.student_id !== ctx.user.id && match.mentor_id !== ctx.user.id) {
        throw new Error('Access denied');
      }

      return match;
    }),

  // ========================================================================
  // FEEDBACK
  // ========================================================================

  // Submit feedback for a match
  submitFeedback: protectedProcedure
    .input(
      z.object({
        match_id: z.string().uuid(),
        rating: z.number().int().min(1).max(5),
        comment: z.string().optional(),
        feedback_type: z.enum(['general', 'match-quality', 'session', 'final']).default('general'),
      })
    )
    .mutation(async ({ input }) => {
      const supabase = createClient(supabaseUrl, supabaseAnonKey);
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('User not authenticated');
      }

      // Verify user is part of this match
      const { data: match } = await supabase
        .from('matches')
        .select('student_id, mentor_id')
        .eq('id', input.match_id)
        .single();

      if (!match) {
        throw new Error('Match not found');
      }

      const feedbackAboutId = match.student_id === user.id ? match.mentor_id : match.student_id;

      const { data, error } = await supabase
        .from('mentorship_feedback')
        .insert({
          match_id: input.match_id,
          feedback_from_id: user.id,
          feedback_about_id: feedbackAboutId,
          rating: input.rating,
          comment: input.comment,
          feedback_type: input.feedback_type,
        })
        .select()
        .single();

      if (error) {
        // Check if it's a unique constraint violation (already submitted)
        if (error.code === '23505') {
          throw new Error('Feedback already submitted for this match');
        }
        throw new Error(`Failed to submit feedback: ${error.message}`);
      }

      // Update match health score if rating is low
      if (input.rating < 3) {
        await supabase
          .from('matches')
          .update({
            is_at_risk: true,
            at_risk_reason: `Low feedback rating: ${input.rating}/5`,
            health_score: input.rating,
          })
          .eq('id', input.match_id);
      }

      return data;
    }),

  // Get feedback for a match
  getFeedback: protectedProcedure
    .input(z.object({ match_id: z.string().uuid() }))
    .query(async ({ input }) => {
      const supabase = createClient(supabaseUrl, supabaseAnonKey);
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('mentorship_feedback')
        .select('*')
        .eq('match_id', input.match_id)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch feedback: ${error.message}`);
      }

      return data || [];
    }),

  // ========================================================================
  // QUICK QUESTIONS (Micro-Mentoring Marketplace)
  // ========================================================================

  // Post a quick question
  postQuestion: protectedProcedure
    .input(
      z.object({
        title: z.string().min(5).max(200),
        description: z.string().min(10).max(2000),
        tags: z.array(z.string()).default([]),
        preferred_response_time: z.enum(['24-hours', '48-hours', '1-week']).default('48-hours'),
      })
    )
    .mutation(async ({ input }) => {
      const supabase = createClient(supabaseUrl, supabaseAnonKey);
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('User not authenticated');
      }

      // Calculate expiration based on preferred response time
      const expiresAt = new Date();
      if (input.preferred_response_time === '24-hours') {
        expiresAt.setHours(expiresAt.getHours() + 24);
      } else if (input.preferred_response_time === '48-hours') {
        expiresAt.setHours(expiresAt.getHours() + 48);
      } else {
        expiresAt.setDate(expiresAt.getDate() + 7);
      }

      const { data, error } = await supabase
        .from('quick_questions')
        .insert({
          student_id: user.id,
          title: input.title,
          description: input.description,
          tags: input.tags,
          preferred_response_time: input.preferred_response_time,
          expires_at: expiresAt.toISOString(),
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to post question: ${error.message}`);
      }

      return data;
    }),

  // Get open questions (for mentors)
  getOpenQuestions: protectedProcedure
    .input(
      z.object({
        tags: z.array(z.string()).optional(),
        limit: z.number().default(20),
      }).optional()
    )
    .query(async ({ input }) => {
      const supabase = createClient(supabaseUrl, supabaseAnonKey);
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('User not authenticated');
      }

      let query = supabase
        .from('quick_questions')
        .select(`
          *,
          student:student_id(id, email, full_name)
        `)
        .eq('status', 'open')
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(input?.limit || 20);

      if (input?.tags && input.tags.length > 0) {
        query = query.contains('tags', input.tags);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Failed to fetch questions: ${error.message}`);
      }

      return data || [];
    }),

  // Get student's questions
  getMyQuestions: protectedProcedure.query(async ({ ctx }) => {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('quick_questions')
      .select('*')
      .eq('student_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch questions: ${error.message}`);
    }

    return data || [];
  }),

  // Mentor claims a question
  claimQuestion: protectedProcedure
    .input(z.object({ question_id: z.string().uuid() }))
    .mutation(async ({ input }) => {
      const supabase = createClient(supabaseUrl, supabaseAnonKey);
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('User not authenticated');
      }

      // Verify user is a mentor
      const { data: profile } = await supabase
        .from('mentorship_profiles')
        .select('profile_type, availability_status')
        .eq('user_id', user.id)
        .eq('profile_type', 'mentor')
        .single();

      if (!profile) {
        throw new Error('Mentor profile not found');
      }

      if (profile.availability_status !== 'active') {
        throw new Error('You are not currently available');
      }

      // Claim the question
      const { data, error } = await supabase
        .from('quick_questions')
        .update({
          status: 'claimed',
          claimed_by_mentor_id: user.id,
          claimed_at: new Date().toISOString(),
        })
        .eq('id', input.question_id)
        .eq('status', 'open')
        .select()
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          throw new Error('Question not found or already claimed');
        }
        throw new Error(`Failed to claim question: ${error.message}`);
      }

      return data;
    }),

  // Complete a question (student or mentor)
  completeQuestion: protectedProcedure
    .input(
      z.object({
        question_id: z.string().uuid(),
        session_duration_minutes: z.number().optional(),
        student_rating: z.number().int().min(1).max(5).optional(),
        mentor_rating: z.number().int().min(1).max(5).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const supabase = createClient(supabaseUrl, supabaseAnonKey);
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('User not authenticated');
      }

      // Get question to verify access
      const { data: question } = await supabase
        .from('quick_questions')
        .select('student_id, claimed_by_mentor_id, status')
        .eq('id', input.question_id)
        .single();

      if (!question) {
        throw new Error('Question not found');
      }

      const isStudent = question.student_id === user.id;
      const isMentor = question.claimed_by_mentor_id === user.id;

      if (!isStudent && !isMentor) {
        throw new Error('Access denied');
      }

      const updateData: any = {
        status: 'completed',
        completed_at: new Date().toISOString(),
      };

      if (input.session_duration_minutes) {
        updateData.session_duration_minutes = input.session_duration_minutes;
      }

      if (isStudent && input.student_rating) {
        updateData.student_rating = input.student_rating;
      }

      if (isMentor && input.mentor_rating) {
        updateData.mentor_rating = input.mentor_rating;
      }

      const { data, error } = await supabase
        .from('quick_questions')
        .update(updateData)
        .eq('id', input.question_id)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to complete question: ${error.message}`);
      }

      return data;
    }),

  // ========================================================================
  // MEETING LOGS
  // ========================================================================

  // Create meeting log
  logMeeting: protectedProcedure
    .input(
      z.object({
        match_id: z.string().uuid(),
        meeting_date: z.string(), // ISO date string
        duration_minutes: z.number().optional(),
        meeting_type: z.enum(['virtual', 'in-person', 'phone', 'email']).default('virtual'),
        agenda: z.string().optional(),
        discussion_points: z.array(z.string()).optional(),
        action_items: z.array(z.string()).optional(),
        student_notes: z.string().optional(),
        mentor_notes: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const supabase = createClient(supabaseUrl, supabaseAnonKey);
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('User not authenticated');
      }

      // Verify user is part of this match
      const { data: match } = await supabase
        .from('matches')
        .select('student_id, mentor_id')
        .eq('id', input.match_id)
        .single();

      if (!match) {
        throw new Error('Match not found');
      }

      if (match.student_id !== user.id && match.mentor_id !== user.id) {
        throw new Error('Access denied');
      }

      const { data, error } = await supabase
        .from('meeting_logs')
        .insert({
          match_id: input.match_id,
          meeting_date: input.meeting_date,
          duration_minutes: input.duration_minutes,
          meeting_type: input.meeting_type,
          agenda: input.agenda,
          discussion_points: input.discussion_points,
          action_items: input.action_items,
          student_notes: input.student_notes,
          mentor_notes: input.mentor_notes,
          logged_by_id: user.id,
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to log meeting: ${error.message}`);
      }

      // Update match's last_meeting_at and clear at-risk status if meeting is recent
      await supabase
        .from('matches')
        .update({
          last_meeting_at: input.meeting_date,
          is_at_risk: false,
          at_risk_reason: null,
          health_score: 5, // Reset to good
        })
        .eq('id', input.match_id);

      return data;
    }),

  // Get meeting logs for a match
  getMeetingLogs: protectedProcedure
    .input(z.object({ match_id: z.string().uuid() }))
    .query(async ({ input }) => {
      const supabase = createClient(supabaseUrl, supabaseAnonKey);
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('User not authenticated');
      }

      // Verify user is part of this match
      const { data: match } = await supabase
        .from('matches')
        .select('student_id, mentor_id')
        .eq('id', input.match_id)
        .single();

      if (!match) {
        throw new Error('Match not found');
      }

      if (match.student_id !== user.id && match.mentor_id !== user.id) {
        throw new Error('Access denied');
      }

      const { data, error } = await supabase
        .from('meeting_logs')
        .select('*')
        .eq('match_id', input.match_id)
        .order('meeting_date', { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch meeting logs: ${error.message}`);
      }

      return data || [];
    }),

  // ========================================================================
  // ADMIN ENDPOINTS
  // ========================================================================

  // Get all matches (admin only)
  getAllMatches: adminProcedure
    .input(
      z.object({
        status: z.enum(['pending', 'active', 'completed', 'failed', 'dissolved']).optional(),
        limit: z.number().default(50),
        offset: z.number().default(0),
      }).optional()
    )
    .query(async ({ input }) => {
      const supabase = getAdminSupabase();

      let query = supabase
        .from('matches')
        .select(`
          *,
          student:student_id(id, email, full_name),
          mentor:mentor_id(id, email, full_name)
        `)
        .order('matched_at', { ascending: false })
        .range(input?.offset || 0, (input?.offset || 0) + (input?.limit || 50) - 1);

      if (input?.status) {
        query = query.eq('status', input.status);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Failed to fetch matches: ${error.message}`);
      }

      return data || [];
    }),

  // Get dashboard statistics (admin)
  getDashboardStats: adminProcedure
    .input(
      z.object({
        days: z.number().default(30),
      }).optional()
    )
    .query(async ({ input }) => {
      const supabase = getAdminSupabase();
      const days = input?.days || 30;
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      // Total matches
      const { count: totalMatches } = await supabase
        .from('matches')
        .select('*', { count: 'exact', head: true });

      // Active matches
      const { count: activeMatches } = await supabase
        .from('matches')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      // Pending match batches
      const { count: pendingBatches } = await supabase
        .from('match_batches')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      // Unmatched students (in matching pool but no active match)
      const { data: unmatchedStudents } = await supabase
        .from('mentorship_profiles')
        .select('user_id', { count: 'exact', head: true })
        .eq('profile_type', 'student')
        .eq('in_matching_pool', true)
        .not('user_id', 'in', `
          SELECT student_id FROM matches WHERE status = 'active'
        `);

      // Average match score
      const { data: avgScoreData } = await supabase
        .from('matches')
        .select('match_score')
        .not('match_score', 'is', null);

      const avgScore = avgScoreData && avgScoreData.length > 0
        ? avgScoreData.reduce((sum, m) => sum + (m.match_score || 0), 0) / avgScoreData.length
        : 0;

      // At-risk matches
      const { count: atRiskMatches } = await supabase
        .from('matches')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active')
        .eq('is_at_risk', true);

      // Recent matches
      const { count: recentMatches } = await supabase
        .from('matches')
        .select('*', { count: 'exact', head: true })
        .gte('matched_at', cutoffDate.toISOString());

      return {
        total_matches: totalMatches || 0,
        active_matches: activeMatches || 0,
        pending_batches: pendingBatches || 0,
        unmatched_students: unmatchedStudents?.length || 0,
        average_match_score: Math.round(avgScore * 100) / 100,
        at_risk_matches: atRiskMatches || 0,
        recent_matches: recentMatches || 0,
      };
    }),

  // Get at-risk matches (admin)
  getAtRiskMatches: adminProcedure.query(async ({ ctx }) => {
    const supabase = getAdminSupabase();

    const { data, error } = await supabase.rpc('get_at_risk_matches');

    if (error) {
      throw new Error(`Failed to fetch at-risk matches: ${error.message}`);
    }

    return data || [];
  }),

  // Create manual match (admin)
  createManualMatch: adminProcedure
    .input(
      z.object({
        student_id: z.string().uuid(),
        mentor_id: z.string().uuid(),
        match_score: z.number().optional(),
        admin_notes: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const supabase = getAdminSupabase();

      // Verify both profiles exist
      const { data: studentProfile } = await supabase
        .from('mentorship_profiles')
        .select('profile_type')
        .eq('user_id', input.student_id)
        .eq('profile_type', 'student')
        .single();

      const { data: mentorProfile } = await supabase
        .from('mentorship_profiles')
        .select('profile_type, current_mentees, max_mentees')
        .eq('user_id', input.mentor_id)
        .eq('profile_type', 'mentor')
        .single();

      if (!studentProfile || !mentorProfile) {
        throw new Error('Student or mentor profile not found');
      }

      if (mentorProfile.current_mentees >= mentorProfile.max_mentees) {
        throw new Error('Mentor is at capacity');
      }

      const { data, error } = await supabase
        .from('matches')
        .insert({
          student_id: input.student_id,
          mentor_id: input.mentor_id,
          match_score: input.match_score || 100, // Admin override gets perfect score
          status: 'active',
          matched_at: new Date().toISOString(),
          activated_at: new Date().toISOString(),
          created_by_admin: true,
          admin_notes: input.admin_notes,
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create match: ${error.message}`);
      }

      return data;
    }),

  // Dissolve a match (admin)
  dissolveMatch: adminProcedure
    .input(
      z.object({
        match_id: z.string().uuid(),
        reason: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const supabase = getAdminSupabase();

      const { data, error } = await supabase
        .from('matches')
        .update({
          status: 'dissolved',
          completed_at: new Date().toISOString(),
          admin_notes: input.reason,
        })
        .eq('id', input.match_id)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to dissolve match: ${error.message}`);
      }

      return data;
    }),
});

