import { z } from 'zod';
import { router, publicProcedure, protectedProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';
import { createAdminSupabase } from '@/lib/supabase/server';
import { randomUUID } from 'crypto';

export const authRouter = router({
  // Get current user
  getCurrentUser: protectedProcedure.query(async ({ ctx }) => {
    // Use context user and supabase client (already authenticated via protectedProcedure)
    const supabase = ctx.supabase;
    
    if (!supabase) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Supabase client not available',
      });
    }

    // Get user profile from database
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', ctx.user.id)
      .single();

    if (profileError) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: `User profile not found: ${profileError.message}`,
      });
    }

    return {
      id: ctx.user.id,
      email: ctx.user.email,
      profile: profile || null,
    };
  }),

  // Update user profile
  updateProfile: protectedProcedure
    .input(
      z.object({
        full_name: z.string().optional(),
        metadata: z.record(z.string(), z.any()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Use context user and supabase client (already authenticated via protectedProcedure)
      const supabase = ctx.supabase;
      
      if (!supabase) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Supabase client not available',
        });
      }

      const { data, error } = await supabase
        .from('users')
        .update({
          full_name: input.full_name,
          metadata: input.metadata,
          // Note: updated_at will be auto-updated by database trigger if column exists
        })
        .eq('id', ctx.user.id)
        .select()
        .single();

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to update profile: ${error.message}`,
        });
      }

      if (!data) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User profile not found',
        });
      }

      return data;
    }),

  // Update student profile (extended with contact details, industry, work experience, education)
  updateStudentProfile: protectedProcedure
    .input(
      z.object({
        // Academic fields
        major: z.string().optional(),
        skills: z.array(z.string()).optional(),
        research_interests: z.array(z.string()).optional(),
        career_goals: z.string().optional(),
        graduation_year: z.number().int().min(2020).max(2030).optional(),
        gpa: z.number().min(0).max(4.0).optional(),
        degree_type: z.enum(['bachelor', 'master', 'phd', 'associate', 'certificate']).optional(),
        
        // Contact details
        phone: z.string().optional(),
        linkedin_url: z.string().url().optional().or(z.literal('')),
        github_url: z.string().url().optional().or(z.literal('')),
        website_url: z.string().url().optional().or(z.literal('')),
        address: z.string().optional(),
        
        // Professional
        preferred_industry: z.string().optional(),
        
        // Work experience and education (handled separately via dedicated mutations)
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Get authenticated user from context (already verified by protectedProcedure)
      const userId = ctx.user.id;
      const supabaseAdmin = createAdminSupabase();

      // Get current user data to merge metadata
      const { data: currentUser, error: fetchError } = await supabaseAdmin
        .from('users')
        .select('metadata, role')
        .eq('id', userId)
        .single();

      if (fetchError || !currentUser) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: `User profile not found: ${fetchError?.message || 'Unknown error'}`,
        });
      }

      if (currentUser.role !== 'student') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only students can update student profile',
        });
      }

      // Build update object
      const updateData: any = {};

      // Academic fields
      if (input.major !== undefined) {
        updateData.major = input.major || null;
      }
      if (input.skills !== undefined) {
        updateData.skills = input.skills || null;
      }
      if (input.graduation_year !== undefined) {
        updateData.graduation_year = input.graduation_year || null;
      }
      if (input.gpa !== undefined) {
        updateData.gpa = input.gpa || null;
      }
      if (input.degree_type !== undefined) {
        updateData.degree_type = input.degree_type || null;
      }

      // Contact details
      if (input.phone !== undefined) {
        updateData.phone = input.phone || null;
      }
      if (input.linkedin_url !== undefined) {
        updateData.linkedin_url = input.linkedin_url || null;
      }
      if (input.github_url !== undefined) {
        updateData.github_url = input.github_url || null;
      }
      if (input.website_url !== undefined) {
        updateData.website_url = input.website_url || null;
      }
      if (input.address !== undefined) {
        updateData.address = input.address || null;
      }

      // Professional
      if (input.preferred_industry !== undefined) {
        updateData.preferred_industry = input.preferred_industry || null;
      }

      // Merge metadata (research_interests and career_goals)
      const currentMetadata = (currentUser.metadata as any) || {};
      const newMetadata = { ...currentMetadata };

      if (input.research_interests !== undefined) {
        newMetadata.research_interests = input.research_interests || [];
      }
      if (input.career_goals !== undefined) {
        newMetadata.career_goals = input.career_goals || null;
      }

      if (Object.keys(newMetadata).length > 0) {
        updateData.metadata = newMetadata;
      }

      // Use admin client to bypass RLS for profile updates
      const { data, error } = await supabaseAdmin
        .from('users')
        .update(updateData)
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to update student profile: ${error.message}`,
        });
      }

      if (!data) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User profile not found after update',
        });
      }

      // Automatically generate mentor recommendations after profile update
      // This runs asynchronously and doesn't block the response
      if (data.role === 'student') {
        // Check if profile data changed significantly (major, skills, research_interests)
        const significantFieldsChanged = 
          input.major !== undefined ||
          input.skills !== undefined ||
          input.research_interests !== undefined ||
          input.career_goals !== undefined ||
          input.preferred_industry !== undefined;

        if (significantFieldsChanged) {
          // Generate recommendations asynchronously (fire and forget)
          // We'll call the database function directly to avoid circular dependencies
          supabaseAdmin
            .rpc('generate_mentor_recommendations', {
              p_student_id: userId,
            })
            .then(({ error: recError }) => {
              if (recError) {
                console.warn('Failed to generate recommendations after profile update:', recError);
                // Don't throw - this is non-critical
              }
            })
            .catch((err) => {
              console.warn('Error generating recommendations:', err);
              // Silent fail - recommendations can be generated manually later
            });
        }
      }

      return data;
    }),

  // Update work experience for student
  updateWorkExperience: protectedProcedure
    .input(
      z.object({
        work_experience: z.array(
          z.object({
            id: z.string().uuid().optional(),
            company: z.string().min(1),
            position: z.string().min(1),
            start_date: z.string(), // ISO date string
            end_date: z.string().nullable().optional(),
            description: z.string().optional(),
            is_current: z.boolean().optional(),
            location: z.string().optional(),
          })
        ),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      const supabaseAdmin = createAdminSupabase();

      // Verify user is a student
      const { data: user } = await supabaseAdmin
        .from('users')
        .select('role')
        .eq('id', userId)
        .single();

      if (!user || user.role !== 'student') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only students can update work experience',
        });
      }

      // Add IDs to entries that don't have them
      const workExperience = input.work_experience.map((entry) => ({
        ...entry,
        id: entry.id || randomUUID(),
      }));

      const { data, error } = await supabaseAdmin
        .from('users')
        .update({ work_experience: workExperience })
        .eq('id', userId)
        .select('work_experience')
        .single();

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to update work experience: ${error.message}`,
        });
      }

      return data?.work_experience || [];
    }),

  // Update education history for student
  updateEducation: protectedProcedure
    .input(
      z.object({
        education: z.array(
          z.object({
            id: z.string().uuid().optional(),
            institution: z.string().min(1),
            degree: z.string().min(1),
            field_of_study: z.string().min(1),
            start_date: z.string(), // ISO date string
            end_date: z.string().nullable().optional(),
            gpa: z.number().min(0).max(4.0).optional(),
            is_current: z.boolean().optional(),
            location: z.string().optional(),
          })
        ),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      const supabaseAdmin = createAdminSupabase();

      // Verify user is a student
      const { data: user } = await supabaseAdmin
        .from('users')
        .select('role')
        .eq('id', userId)
        .single();

      if (!user || user.role !== 'student') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only students can update education history',
        });
      }

      // Add IDs to entries that don't have them
      const education = input.education.map((entry) => ({
        ...entry,
        id: entry.id || randomUUID(),
      }));

      const { data, error } = await supabaseAdmin
        .from('users')
        .update({ education })
        .eq('id', userId)
        .select('education')
        .single();

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to update education: ${error.message}`,
        });
      }

      return data?.education || [];
    }),

  // Search users by email or name (for team formation)
  searchUsers: protectedProcedure
    .input(
      z.object({
        query: z.string().min(1),
        limit: z.number().default(10),
      })
    )
    .query(async ({ ctx, input }) => {
      // Use context supabase client (has cookie handling)
      const supabase = ctx.supabase;
      
      if (!supabase) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Supabase client not available',
        });
      }
      
      // Search by email or full_name
      const { data, error } = await supabase
        .from('users')
        .select('id, email, full_name, role')
        .or(`email.ilike.%${input.query}%,full_name.ilike.%${input.query}%`)
        .limit(input.limit);

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to search users: ${error.message}`,
        });
      }

      return data || [];
    }),
});

