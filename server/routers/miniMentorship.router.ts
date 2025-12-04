import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';
import { createAdminSupabase } from '@/lib/supabase/server';
import { sendEmail } from '@/lib/email/client';
import { miniMentorshipRequestNotificationEmail } from '@/lib/email/templates';

export const miniMentorshipRouter = router({
  // ========================================================================
  // STUDENT PROCEDURES
  // ========================================================================

  // Create a mini session request
  createRequest: protectedProcedure
    .input(
      z.object({
        title: z.string().min(5, 'Title must be at least 5 characters').max(200),
        description: z.string().min(10, 'Description must be at least 10 characters').max(2000),
        session_type: z.enum([
          'interview_prep',
          'skill_learning',
          'career_advice',
          'resume_review',
          'project_guidance',
          'technical_help',
          'portfolio_review',
          'networking_advice',
          'other',
        ]),
        preferred_duration_minutes: z.number().refine((val) => [30, 45, 60].includes(val), {
          message: 'Duration must be 30, 45, or 60 minutes',
        }).default(60),
        urgency: z.enum(['low', 'normal', 'high', 'urgent']).default('normal'),
        preferred_date_start: z.date().optional(),
        preferred_date_end: z.date().optional(),
        tags: z.array(z.string()).optional(),
        specific_questions: z.string().max(500).optional(),
        resume_url: z.string().url().optional(),
        portfolio_url: z.string().url().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'User not authenticated',
        });
      }

      const supabase = ctx.supabase;
      
      if (!supabase) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Supabase client not available',
        });
      }

      // Set expiry date (7 days from now)
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      const { data, error } = await supabase
        .from('mini_mentorship_requests')
        .insert({
          student_id: ctx.user.id,
          title: input.title,
          description: input.description,
          session_type: input.session_type,
          preferred_duration_minutes: input.preferred_duration_minutes,
          urgency: input.urgency,
          preferred_date_start: input.preferred_date_start?.toISOString().split('T')[0] || null,
          preferred_date_end: input.preferred_date_end?.toISOString().split('T')[0] || null,
          tags: input.tags || [],
          specific_questions: input.specific_questions || null,
          resume_url: input.resume_url || null,
          portfolio_url: input.portfolio_url || null,
          expires_at: expiresAt.toISOString(),
          status: 'open',
        })
        .select()
        .single();

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to create request: ${error.message}`,
        });
      }

      // Send email notifications to all active mentors (async, don't block response)
      if (data) {
        console.log('[Mini Mentorship] Request created, preparing to send notifications...');
        
        // Get student info for email
        const { data: student } = await supabase
          .from('users')
          .select('full_name, email')
          .eq('id', ctx.user.id)
          .single();

        if (!student) {
          console.warn('[Mini Mentorship] Student info not found, skipping email notifications');
        }

        // Get all active mentors (in matching pool)
        // Use admin client to bypass RLS when querying mentors
        const adminSupabase = createAdminSupabase();
        const { data: activeMentors, error: mentorsError } = await adminSupabase
          .from('mentorship_profiles')
          .select(`
            user_id,
            users:user_id(id, email, full_name)
          `)
          .eq('profile_type', 'mentor')
          .eq('in_matching_pool', true);

        if (mentorsError) {
          console.error('[Mini Mentorship] Failed to fetch active mentors for notification:', mentorsError);
          // Don't throw error - notification failure shouldn't break request creation
        } else {
          console.log(`[Mini Mentorship] Found ${activeMentors?.length || 0} active mentors`);
        }

        // Send emails to all mentors asynchronously (fire and forget)
        if (activeMentors && activeMentors.length > 0 && student) {
          const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
          console.log(`[Mini Mentorship] Preparing to send notifications to ${activeMentors.length} mentors`);
          
          // Helper function to send email directly (more reliable than fetch)
          const sendMentorNotification = async (mentor: any) => {
            try {
              const mentorUser = mentor.users;
              if (!mentorUser || !mentorUser.email) {
                console.warn(`[Mini Mentorship] Mentor ${mentor.user_id} has no email, skipping`);
                return;
              }

              console.log(`[Mini Mentorship] Sending notification email to ${mentorUser.email}`);

              // Generate email HTML
              const html = miniMentorshipRequestNotificationEmail({
                mentorName: mentorUser.full_name || 'Mentor',
                requestTitle: input.title,
                requestDescription: input.description,
                sessionType: input.session_type,
                duration: input.preferred_duration_minutes,
                urgency: input.urgency,
                studentName: student.full_name || undefined,
                preferredDates: input.preferred_date_start || input.preferred_date_end ? {
                  start: input.preferred_date_start?.toISOString().split('T')[0],
                  end: input.preferred_date_end?.toISOString().split('T')[0],
                } : undefined,
                tags: input.tags || [],
                appUrl,
              });

              // Generate subject line
              const subject = input.urgency === 'urgent' 
                ? `🚨 URGENT: New Mini Session Request - ${input.title}`
                : input.urgency === 'high'
                  ? `⚠️ High Priority: New Mini Session Request - ${input.title}`
                  : `New Mini Session Request - ${input.title}`;

              // Send email directly using sendEmail function (more reliable)
              const result = await sendEmail({
                to: mentorUser.email,
                subject,
                html,
              });

              if (!result.success) {
                console.error(`[Mini Mentorship] ❌ Failed to send email to ${mentorUser.email}:`, result.error);
              } else {
                console.log(`[Mini Mentorship] ✅ Email sent successfully to ${mentorUser.email}`);
              }
            } catch (err: any) {
              console.error(`[Mini Mentorship] ❌ Error sending email to ${mentor?.users?.email || 'unknown'}:`, err.message);
            }
          };

          // Send emails to all mentors (async, fire and forget - don't block response)
          activeMentors.forEach((mentor) => {
            sendMentorNotification(mentor).catch((err) => {
              console.error(`[Mini Mentorship] Unhandled error sending notification:`, err);
            });
          });
        } else {
          if (!activeMentors || activeMentors.length === 0) {
            console.warn('[Mini Mentorship] ⚠️ No active mentors found in matching pool');
          }
          if (!student) {
            console.warn('[Mini Mentorship] ⚠️ Student info missing, cannot send notifications');
          }
        }
      }

      return data;
    }),

  // Get student's own mini session requests
  getMyRequests: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'User not authenticated',
      });
    }

    const supabase = ctx.supabase;
    
    if (!supabase) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Supabase client not available',
      });
    }

    const { data, error } = await supabase
      .from('mini_mentorship_requests')
      .select(`
        *,
        claimed_mentor:claimed_by_mentor_id(id, email, full_name)
      `)
      .eq('student_id', ctx.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: `Failed to fetch requests: ${error.message}`,
      });
    }

    return data || [];
  }),

  // Get a specific request by ID (for viewing details)
  getRequestById: protectedProcedure
    .input(z.object({ request_id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      if (!ctx.user) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'User not authenticated',
        });
      }

      const supabase = ctx.supabase;
      
      if (!supabase) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Supabase client not available',
        });
      }

      const { data, error } = await supabase
        .from('mini_mentorship_requests')
        .select(`
          *,
          student:student_id(id, email, full_name),
          claimed_mentor:claimed_by_mentor_id(id, email, full_name),
          scheduled_session:mini_mentorship_sessions(*)
        `)
        .eq('id', input.request_id)
        .single();

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to fetch request: ${error.message}`,
        });
      }

      // Check if user is authorized to view this request
      // Students can view their own requests, mentors can view if they claimed it
      if (data.student_id !== ctx.user.id && data.claimed_by_mentor_id !== ctx.user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to view this request',
        });
      }

      return data;
    }),

  // Cancel a request (only if still open or claimed, not scheduled)
  cancelRequest: protectedProcedure
    .input(z.object({ request_id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'User not authenticated',
        });
      }

      const supabase = ctx.supabase;
      
      if (!supabase) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Supabase client not available',
        });
      }

      // First, check if request exists and belongs to user
      const { data: existing, error: fetchError } = await supabase
        .from('mini_mentorship_requests')
        .select('status, student_id')
        .eq('id', input.request_id)
        .single();

      if (fetchError || !existing) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Request not found',
        });
      }

      if (existing.student_id !== ctx.user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You can only cancel your own requests',
        });
      }

      // Cannot cancel if already scheduled or completed
      if (existing.status === 'scheduled' || existing.status === 'completed') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Cannot cancel a scheduled or completed request',
        });
      }

      const { data, error } = await supabase
        .from('mini_mentorship_requests')
        .update({
          status: 'cancelled',
          updated_at: new Date().toISOString(),
        })
        .eq('id', input.request_id)
        .select()
        .single();

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to cancel request: ${error.message}`,
        });
      }

      return data;
    }),

  // ========================================================================
  // MENTOR PROCEDURES
  // ========================================================================

  // Get all open requests (for mentors to browse)
  getOpenRequests: protectedProcedure
    .input(
      z.object({
        session_type: z.enum([
          'interview_prep',
          'skill_learning',
          'career_advice',
          'resume_review',
          'project_guidance',
          'technical_help',
          'portfolio_review',
          'networking_advice',
          'other',
        ]).optional(),
        tags: z.array(z.string()).optional(),
        limit: z.number().min(1).max(50).default(20),
        offset: z.number().min(0).default(0),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      if (!ctx.user) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'User not authenticated',
        });
      }

      const supabase = ctx.supabase;
      
      if (!supabase) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Supabase client not available',
        });
      }

      // Verify user is a mentor
      const { data: profile } = await supabase
        .from('mentorship_profiles')
        .select('profile_type, in_matching_pool')
        .eq('user_id', ctx.user.id)
        .eq('profile_type', 'mentor')
        .single();

      if (!profile || !profile.in_matching_pool) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You must be a mentor in the matching pool to view requests',
        });
      }

      let query = supabase
        .from('mini_mentorship_requests')
        .select(`
          *,
          student:student_id(id, email, full_name)
        `)
        .eq('status', 'open')
        .order('created_at', { ascending: false })
        .range(input?.offset || 0, (input?.offset || 0) + (input?.limit || 20) - 1);

      // Filter by session type if provided
      if (input?.session_type) {
        query = query.eq('session_type', input.session_type);
      }

      // Filter by tags if provided (using overlap operator)
      if (input?.tags && input.tags.length > 0) {
        query = query.overlaps('tags', input.tags);
      }

      const { data, error } = await query;

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to fetch open requests: ${error.message}`,
        });
      }

      return data || [];
    }),

  // Claim a request (mentor claims a student's request)
  claimRequest: protectedProcedure
    .input(z.object({ request_id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'User not authenticated',
        });
      }

      const supabase = ctx.supabase;
      
      if (!supabase) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Supabase client not available',
        });
      }

      // Verify user is a mentor
      const { data: profile } = await supabase
        .from('mentorship_profiles')
        .select('profile_type, in_matching_pool')
        .eq('user_id', ctx.user.id)
        .eq('profile_type', 'mentor')
        .single();

      if (!profile || !profile.in_matching_pool) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You must be a mentor in the matching pool to claim requests',
        });
      }

      // Check if request exists and is open
      const { data: existing, error: fetchError } = await supabase
        .from('mini_mentorship_requests')
        .select('status, student_id')
        .eq('id', input.request_id)
        .single();

      if (fetchError || !existing) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Request not found',
        });
      }

      if (existing.status !== 'open') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `Request is not open (current status: ${existing.status})`,
        });
      }

      // Claim the request
      const { data, error } = await supabase
        .from('mini_mentorship_requests')
        .update({
          status: 'claimed',
          claimed_by_mentor_id: ctx.user.id,
          claimed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', input.request_id)
        .select(`
          *,
          student:student_id(id, email, full_name)
        `)
        .single();

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to claim request: ${error.message}`,
        });
      }

      return data;
    }),

  // Get mentor's claimed requests
  getClaimedRequests: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'User not authenticated',
      });
    }

    const supabase = ctx.supabase;
    
    if (!supabase) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Supabase client not available',
      });
    }

    const { data, error } = await supabase
      .from('mini_mentorship_requests')
      .select(`
        *,
        student:student_id(id, email, full_name),
        scheduled_session:mini_mentorship_sessions(*)
      `)
      .eq('claimed_by_mentor_id', ctx.user.id)
      .in('status', ['claimed', 'scheduled'])
      .order('created_at', { ascending: false });

    if (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: `Failed to fetch claimed requests: ${error.message}`,
      });
    }

    return data || [];
  }),

  // ========================================================================
  // SESSION PROCEDURES (for both students and mentors)
  // ========================================================================

  // Get sessions for current user (student or mentor)
  getMySessions: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'User not authenticated',
      });
    }

    const supabase = ctx.supabase;
    
    if (!supabase) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Supabase client not available',
      });
    }

    const { data, error } = await supabase
      .from('mini_mentorship_sessions')
      .select(`
        *,
        student:student_id(id, email, full_name),
        mentor:mentor_id(id, email, full_name),
        request:request_id(*)
      `)
      .or(`student_id.eq.${ctx.user.id},mentor_id.eq.${ctx.user.id}`)
      .order('scheduled_at', { ascending: false });

    if (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: `Failed to fetch sessions: ${error.message}`,
      });
    }

    return data || [];
  }),
});

