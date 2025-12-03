import { z } from 'zod';
import { router, publicProcedure, protectedProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';
import { createAdminSupabase } from '@/lib/supabase/server';

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

  // Update student profile (major, skills, research_interests, career_goals, graduation_year)
  updateStudentProfile: protectedProcedure
    .input(
      z.object({
        major: z.string().optional(),
        skills: z.array(z.string()).optional(),
        research_interests: z.array(z.string()).optional(),
        career_goals: z.string().optional(),
        graduation_year: z.number().int().min(2020).max(2030).optional(),
        gpa: z.number().min(0).max(4.0).optional(),
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

      return data;
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

