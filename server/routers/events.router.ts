import { z } from 'zod';
import { router, publicProcedure, protectedProcedure, adminProcedure } from '../trpc';
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
        throw new Error(`Failed to fetch events: ${error.message}`);
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
        throw new Error(`Failed to fetch event: ${error.message}`);
      }

      return data;
    }),

  // Create event (admin only)
  create: adminProcedure
    .input(eventSchema)
    .mutation(async ({ ctx, input }) => {
      const supabase = createClient(supabaseUrl, supabaseAnonKey);
      const { data: { user } } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from('events')
        .insert({
          ...input,
          created_by: user?.id || null,
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create event: ${error.message}`);
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
    .mutation(async ({ input }) => {
      const supabase = createClient(supabaseUrl, supabaseAnonKey);
      
      const { id, ...updateData } = input;
      
      const { data, error } = await supabase
        .from('events')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update event: ${error.message}`);
      }

      return data;
    }),

  // Delete event (admin only - soft delete)
  delete: adminProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input }) => {
      const supabase = createClient(supabaseUrl, supabaseAnonKey);
      
      // Soft delete by updating deleted_at (if you add this column)
      // Or hard delete if preferred
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', input.id);

      if (error) {
        throw new Error(`Failed to delete event: ${error.message}`);
      }

      return { success: true };
    }),
});

