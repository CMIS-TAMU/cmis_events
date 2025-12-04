import { z } from 'zod';
import { router, protectedProcedure, adminProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const sessionsRouter = router({
  // Get all sessions for an event
  getByEvent: protectedProcedure
    .input(z.object({ event_id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      // Use context supabase client (already authenticated via protectedProcedure)
      const supabase = ctx.supabase;
      
      if (!supabase) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Supabase client not available',
        });
      }

      const { data, error } = await supabase
        .from('event_sessions')
        .select('*')
        .eq('event_id', input.event_id)
        .order('starts_at', { ascending: true });

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to fetch sessions: ${error.message}`,
        });
      }

      return data || [];
    }),

  // Get session by ID
  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      // Use context supabase client (already authenticated via protectedProcedure)
      const supabase = ctx.supabase;
      
      if (!supabase) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Supabase client not available',
        });
      }

      const { data, error } = await supabase
        .from('event_sessions')
        .select('*')
        .eq('id', input.id)
        .single();

      if (error) {
        throw new TRPCError({
          code: error.code === 'PGRST116' ? 'NOT_FOUND' : 'INTERNAL_SERVER_ERROR',
          message: `Failed to fetch session: ${error.message}`,
        });
      }

      if (!data) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Session not found',
        });
      }

      return data;
    }),

  // Create session (admin only)
  create: adminProcedure
    .input(
      z.object({
        event_id: z.string().uuid(),
        title: z.string().min(1),
        description: z.string().optional(),
        starts_at: z.string().datetime(),
        ends_at: z.string().datetime(),
        capacity: z.number().int().min(0).default(0),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Use context supabase client (already authenticated via adminProcedure)
      const supabase = ctx.supabase;
      
      if (!supabase) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Supabase client not available',
        });
      }

      // Check for time conflicts with other sessions in the same event
      const { data: conflictingSessions } = await supabase
        .from('event_sessions')
        .select('id, title, starts_at, ends_at')
        .eq('event_id', input.event_id)
        .or(`and(starts_at.lt.${input.ends_at},ends_at.gt.${input.starts_at})`);

      if (conflictingSessions && conflictingSessions.length > 0) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: `Time conflict with existing session: ${conflictingSessions[0].title}`,
        });
      }

      const { data, error } = await supabase
        .from('event_sessions')
        .insert({
          event_id: input.event_id,
          title: input.title,
          description: input.description || null,
          starts_at: input.starts_at,
          ends_at: input.ends_at,
          capacity: input.capacity,
        })
        .select()
        .single();

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to create session: ${error.message}`,
        });
      }

      if (!data) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Session creation succeeded but no data returned',
        });
      }

      return data;
    }),

  // Update session (admin only)
  update: adminProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        title: z.string().min(1).optional(),
        description: z.string().optional(),
        starts_at: z.string().datetime().optional(),
        ends_at: z.string().datetime().optional(),
        capacity: z.number().int().min(0).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Use context supabase client (already authenticated via adminProcedure)
      const supabase = ctx.supabase;
      
      if (!supabase) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Supabase client not available',
        });
      }

      // Get current session to check event_id
      const { data: currentSession, error: fetchError } = await supabase
        .from('event_sessions')
        .select('event_id, starts_at, ends_at')
        .eq('id', input.id)
        .single();

      if (fetchError || !currentSession) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: `Session not found: ${fetchError?.message || 'Unknown error'}`,
        });
      }

      // Check for time conflicts if time is being updated
      if (input.starts_at || input.ends_at) {
        const startTime = input.starts_at || currentSession.starts_at;
        const endTime = input.ends_at || currentSession.ends_at;

        const { data: conflictingSessions } = await supabase
          .from('event_sessions')
          .select('id, title, starts_at, ends_at')
          .eq('event_id', currentSession.event_id)
          .neq('id', input.id)
          .or(`and(starts_at.lt.${endTime},ends_at.gt.${startTime})`);

        if (conflictingSessions && conflictingSessions.length > 0) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: `Time conflict with existing session: ${conflictingSessions[0].title}`,
          });
        }
      }

      const { data, error } = await supabase
        .from('event_sessions')
        .update({
          ...(input.title && { title: input.title }),
          ...(input.description !== undefined && { description: input.description }),
          ...(input.starts_at && { starts_at: input.starts_at }),
          ...(input.ends_at && { ends_at: input.ends_at }),
          ...(input.capacity !== undefined && { capacity: input.capacity }),
        })
        .eq('id', input.id)
        .select()
        .single();

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to update session: ${error.message}`,
        });
      }

      if (!data) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Session not found',
        });
      }

      return data;
    }),

  // Delete session (admin only)
  delete: adminProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      // Use context supabase client (already authenticated via adminProcedure)
      const supabase = ctx.supabase;
      
      if (!supabase) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Supabase client not available',
        });
      }

      const { error } = await supabase
        .from('event_sessions')
        .delete()
        .eq('id', input.id);

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to delete session: ${error.message}`,
        });
      }

      return { success: true };
    }),

  // Register for a session
  register: protectedProcedure
    .input(z.object({ session_id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      // Use context supabase and user (already authenticated via protectedProcedure)
      const supabase = ctx.supabase;
      
      if (!supabase) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Supabase client not available',
        });
      }

      // Check if already registered
      const { data: existing } = await supabase
        .from('session_registrations')
        .select('id')
        .eq('session_id', input.session_id)
        .eq('user_id', ctx.user.id)
        .single();

      if (existing) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Already registered for this session',
        });
      }

      // Use database function to register (handles capacity)
      const { data, error } = await supabase.rpc('register_for_session', {
        p_session_id: input.session_id,
        p_user_id: ctx.user.id,
      });

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Registration failed: ${error.message}`,
        });
      }

      if (data && typeof data === 'object' && 'ok' in data && !data.ok) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: data.error || 'Registration failed',
        });
      }

      return data;
    }),

  // Cancel session registration
  cancel: protectedProcedure
    .input(z.object({ session_id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      // Use context supabase and user (already authenticated via protectedProcedure)
      const supabase = ctx.supabase;
      
      if (!supabase) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Supabase client not available',
        });
      }

      const { error } = await supabase
        .from('session_registrations')
        .delete()
        .eq('session_id', input.session_id)
        .eq('user_id', ctx.user.id);

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to cancel registration: ${error.message}`,
        });
      }

      return { success: true };
    }),

  // Get user's session registrations
  getMySessions: protectedProcedure.query(async ({ ctx }) => {
    // Use context supabase and user (already authenticated via protectedProcedure)
    const supabase = ctx.supabase;
    
    if (!supabase) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Supabase client not available',
      });
    }

    const { data, error } = await supabase
      .from('session_registrations')
      .select(`
        *,
        event_sessions (
          *,
          events (
            id,
            title
          )
        )
      `)
      .eq('user_id', ctx.user.id)
      .order('registered_at', { ascending: false });

    if (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: `Failed to fetch sessions: ${error.message}`,
      });
    }

    return data || [];
  }),

  // Get session registration status
  getRegistrationStatus: protectedProcedure
    .input(z.object({ session_id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      // Use context supabase and user (already authenticated via protectedProcedure)
      const supabase = ctx.supabase;
      
      if (!supabase) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Supabase client not available',
        });
      }

      const { data, error } = await supabase
        .from('session_registrations')
        .select('*')
        .eq('session_id', input.session_id)
        .eq('user_id', ctx.user.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = not found
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to check registration: ${error.message}`,
        });
      }

      return data || null;
    }),

  // Get session capacity info
  getCapacity: protectedProcedure
    .input(z.object({ session_id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      // Use context supabase client (already authenticated via protectedProcedure)
      const supabase = ctx.supabase;
      
      if (!supabase) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Supabase client not available',
        });
      }

      const { data, error } = await supabase.rpc('check_session_capacity', {
        p_session_id: input.session_id,
      });

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to check capacity: ${error.message}`,
        });
      }

      return data;
    }),
});

