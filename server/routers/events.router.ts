import { z } from 'zod';
import { router, publicProcedure, protectedProcedure, adminProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const eventSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  capacity: z.number().int().min(0).default(0),
  image_url: z.string().url().optional(),
  starts_at: z.string().datetime(),
  ends_at: z.string().datetime().optional(),
});

export const eventsRouter = router({
  // Get all events (public)
  getAll: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
        upcoming: z.boolean().optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      const supabase = createClient(supabaseUrl, supabaseAnonKey);
      
      let query = supabase
        .from('events')
        .select('*')
        .order('starts_at', { ascending: true })
        .range(input?.offset || 0, (input?.offset || 0) + (input?.limit || 20) - 1);

      if (input?.upcoming) {
        query = query.gt('starts_at', new Date().toISOString());
      }

      const { data, error } = await query;

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to fetch events: ${error.message}`,
        });
      }

      return data || [];
    }),

  // Get single event by ID (public)
  getById: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ input }) => {
      const supabase = createClient(supabaseUrl, supabaseAnonKey);
      
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', input.id)
        .single();

      if (error) {
        throw new TRPCError({
          code: error.code === 'PGRST116' ? 'NOT_FOUND' : 'INTERNAL_SERVER_ERROR',
          message: `Failed to fetch event: ${error.message}`,
        });
      }

      if (!data) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Event not found',
        });
      }

      return data;
    }),

  // Create event (admin only)
  create: adminProcedure
    .input(eventSchema)
    .mutation(async ({ ctx, input }) => {
      // Use context supabase and user (already authenticated via adminProcedure)
      const supabase = ctx.supabase;
      
      if (!supabase) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Supabase client not available',
        });
      }

      const { data, error } = await supabase
        .from('events')
        .insert({
          ...input,
          created_by: ctx.user.id,
        })
        .select()
        .single();

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to create event: ${error.message}`,
        });
      }

      if (!data) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Event creation succeeded but no data returned',
        });
      }

      return data;
    }),

  // Update event (admin only)
  update: adminProcedure
    .input(
      eventSchema.extend({
        id: z.string().uuid(),
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
      
      const { id, ...updateData } = input;
      
      const { data, error } = await supabase
        .from('events')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to update event: ${error.message}`,
        });
      }

      if (!data) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Event not found',
        });
      }

      return data;
    }),

  // Delete event (admin only - soft delete)
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
      
      // Soft delete by updating deleted_at (if you add this column)
      // Or hard delete if preferred
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', input.id);

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to delete event: ${error.message}`,
        });
      }

      return { success: true };
    }),
});

