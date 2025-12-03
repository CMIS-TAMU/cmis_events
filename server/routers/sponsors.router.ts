import { z } from 'zod';
import { router, protectedProcedure, adminProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';

// Helper to check if user is sponsor (uses role from context)
function isSponsor(role?: string): boolean {
  return role === 'sponsor' || role === 'admin';
}

export const sponsorsRouter = router({
  // Get sponsor dashboard stats
  getDashboardStats: protectedProcedure.query(async ({ ctx }) => {
    // Use context supabase and user (already authenticated via protectedProcedure)
    const supabase = ctx.supabase;
    
    if (!supabase) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Supabase client not available',
      });
    }

    if (!isSponsor(ctx.user.role)) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Access denied. Sponsor role required.',
      });
    }

    // Get total events
    const { data: events } = await supabase
      .from('events')
      .select('id')
      .gt('starts_at', new Date().toISOString());

    // Get total registrations
    const { data: registrations } = await supabase
      .from('event_registrations')
      .select('id')
      .eq('status', 'registered');

    // Get total resumes
    const { data: resumes } = await supabase
      .from('users')
      .select('id')
      .not('resume_filename', 'is', null);

    // Get event attendance stats
    const { data: attendance } = await supabase
      .from('event_registrations')
      .select('id')
      .eq('status', 'checked_in');

    return {
      upcomingEvents: events?.length || 0,
      totalRegistrations: registrations?.length || 0,
      totalResumes: resumes?.length || 0,
      totalAttendance: attendance?.length || 0,
    };
  }),

  // Get event attendance for sponsor
  getEventAttendance: protectedProcedure
    .input(z.object({ event_id: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
      // Use context supabase and user (already authenticated via protectedProcedure)
      const supabase = ctx.supabase;
      
      if (!supabase) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Supabase client not available',
        });
      }

      if (!isSponsor(ctx.user.role)) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Access denied. Sponsor role required.',
        });
      }

      const { data, error } = await supabase
        .from('event_registrations')
        .select(`
          id,
          status,
          registered_at,
          checked_in_at,
          users (
            id,
            email,
            full_name,
            major,
            gpa,
            graduation_year,
            resume_filename
          )
        `)
        .eq('event_id', input.event_id)
        .order('registered_at', { ascending: false });

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to fetch attendance: ${error.message}`,
        });
      }

      return data || [];
    }),

  // Search resumes (for sponsors)
  searchResumes: protectedProcedure
    .input(
      z.object({
        search: z.string().optional(),
        major: z.string().optional(),
        skills: z.array(z.string()).optional(),
        minGpa: z.number().optional(),
        maxGpa: z.number().optional(),
        graduationYear: z.number().optional(),
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ input, ctx }) => {
      // Use context supabase and user (already authenticated via protectedProcedure)
      const supabase = ctx.supabase;
      
      if (!supabase) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Supabase client not available',
        });
      }

      if (!isSponsor(ctx.user.role)) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Access denied. Sponsor role required.',
        });
      }

      let query = supabase
        .from('users')
        .select('id, email, full_name, major, gpa, skills, graduation_year, resume_uploaded_at, resume_filename')
        .not('resume_filename', 'is', null)
        .order('resume_uploaded_at', { ascending: false });

      if (input.search) {
        query = query.or(`full_name.ilike.%${input.search}%,email.ilike.%${input.search}%,major.ilike.%${input.search}%`);
      }

      if (input.major) {
        query = query.eq('major', input.major);
      }

      if (input.skills && input.skills.length > 0) {
        query = query.contains('skills', input.skills);
      }

      if (input.minGpa !== undefined) {
        query = query.gte('gpa', input.minGpa);
      }

      if (input.maxGpa !== undefined) {
        query = query.lte('gpa', input.maxGpa);
      }

      if (input.graduationYear) {
        query = query.eq('graduation_year', input.graduationYear);
      }

      query = query.range(input.offset, input.offset + input.limit - 1);

      const { data, error } = await query;

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to search resumes: ${error.message}`,
        });
      }

      return data || [];
    }),

  // Track resume view (for analytics)
  trackResumeView: protectedProcedure
    .input(z.object({ userId: z.string().uuid(), eventId: z.string().uuid().optional() }))
    .mutation(async ({ input, ctx }) => {
      // Use context supabase and user (already authenticated via protectedProcedure)
      const supabase = ctx.supabase;
      
      if (!supabase) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Supabase client not available',
        });
      }

      if (!isSponsor(ctx.user.role)) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Access denied. Sponsor role required.',
        });
      }

      const { error } = await supabase.from('resume_views').insert({
        user_id: input.userId,
        viewed_by: ctx.user.id,
        event_id: input.eventId || null,
      });

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to track view: ${error.message}`,
        });
      }

      return { success: true };
    }),

  // Get shortlisted candidates (stored in metadata or separate table)
  getShortlist: protectedProcedure.query(async ({ ctx }) => {
    // Use context supabase and user (already authenticated via protectedProcedure)
    const supabase = ctx.supabase;
    
    if (!supabase) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Supabase client not available',
      });
    }

    if (!isSponsor(ctx.user.role)) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Access denied. Sponsor role required.',
      });
    }

    // Get sponsor's shortlist from metadata
    const { data: sponsorData } = await supabase
      .from('users')
      .select('metadata')
      .eq('id', ctx.user.id)
      .single();

    const shortlistIds = (sponsorData?.metadata as any)?.shortlist || [];

    if (shortlistIds.length === 0) {
      return [];
    }

    const { data, error } = await supabase
      .from('users')
      .select('id, email, full_name, major, gpa, skills, graduation_year, resume_filename, resume_uploaded_at')
      .in('id', shortlistIds)
      .not('resume_filename', 'is', null);

    if (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: `Failed to fetch shortlist: ${error.message}`,
      });
    }

    return data || [];
  }),

  // Add to shortlist
  addToShortlist: protectedProcedure
    .input(z.object({ userId: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      // Use context supabase and user (already authenticated via protectedProcedure)
      const supabase = ctx.supabase;
      
      if (!supabase) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Supabase client not available',
        });
      }

      if (!isSponsor(ctx.user.role)) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Access denied. Sponsor role required.',
        });
      }

      // Get current shortlist
      const { data: sponsorData } = await supabase
        .from('users')
        .select('metadata')
        .eq('id', ctx.user.id)
        .single();

      const currentShortlist = (sponsorData?.metadata as any)?.shortlist || [];
      
      if (currentShortlist.includes(input.userId)) {
        return { success: true, message: 'Already in shortlist' };
      }

      const newShortlist = [...currentShortlist, input.userId];
      const newMetadata = {
        ...(sponsorData?.metadata || {}),
        shortlist: newShortlist,
      };

      const { error } = await supabase
        .from('users')
        .update({ metadata: newMetadata })
        .eq('id', ctx.user.id);

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to add to shortlist: ${error.message}`,
        });
      }

      return { success: true };
    }),

  // Remove from shortlist
  removeFromShortlist: protectedProcedure
    .input(z.object({ userId: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      // Use context supabase and user (already authenticated via protectedProcedure)
      const supabase = ctx.supabase;
      
      if (!supabase) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Supabase client not available',
        });
      }

      if (!isSponsor(ctx.user.role)) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Access denied. Sponsor role required.',
        });
      }

      // Get current shortlist
      const { data: sponsorData } = await supabase
        .from('users')
        .select('metadata')
        .eq('id', ctx.user.id)
        .single();

      const currentShortlist = (sponsorData?.metadata as any)?.shortlist || [];
      const newShortlist = currentShortlist.filter((id: string) => id !== input.userId);
      
      const newMetadata = {
        ...(sponsorData?.metadata || {}),
        shortlist: newShortlist,
      };

      const { error } = await supabase
        .from('users')
        .update({ metadata: newMetadata })
        .eq('id', ctx.user.id);

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to remove from shortlist: ${error.message}`,
        });
      }

      return { success: true };
    }),
});

