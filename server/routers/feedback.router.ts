import { z } from 'zod';
import { router, publicProcedure, protectedProcedure, adminProcedure } from '../trpc';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const feedbackRouter = router({
  // Submit feedback for an event
  submit: protectedProcedure
    .input(
      z.object({
        event_id: z.string().uuid(),
        rating: z.number().int().min(1).max(5),
        comment: z.string().optional(),
        anonymous: z.boolean().default(false),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const supabase = createClient(supabaseUrl, supabaseAnonKey);

      // Check if user was registered for this event
      const { data: registration } = await supabase
        .from('event_registrations')
        .select('id')
        .eq('event_id', input.event_id)
        .eq('user_id', ctx.user.id)
        .single();

      if (!registration) {
        throw new Error('You must be registered for this event to submit feedback');
      }

      // Check if user already submitted feedback
      const { data: existingFeedback } = await supabase
        .from('feedback')
        .select('id')
        .eq('event_id', input.event_id)
        .eq('user_id', ctx.user.id)
        .single();

      if (existingFeedback) {
        throw new Error('You have already submitted feedback for this event');
      }

      // Submit feedback
      const { data, error } = await supabase
        .from('feedback')
        .insert({
          event_id: input.event_id,
          user_id: input.anonymous ? null : ctx.user.id,
          rating: input.rating,
          comment: input.comment,
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to submit feedback: ${error.message}`);
      }

      return data;
    }),

  // Check if user has submitted feedback for an event
  hasSubmitted: protectedProcedure
    .input(z.object({ event_id: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
      const supabase = createClient(supabaseUrl, supabaseAnonKey);

      const { data } = await supabase
        .from('feedback')
        .select('id')
        .eq('event_id', input.event_id)
        .eq('user_id', ctx.user.id)
        .single();

      return { submitted: !!data };
    }),

  // Get feedback for an event (admin only)
  getByEvent: adminProcedure
    .input(z.object({ event_id: z.string().uuid() }))
    .query(async ({ input }) => {
      const supabase = createClient(supabaseUrl, supabaseAnonKey);

      const { data, error } = await supabase
        .from('feedback')
        .select(`
          *,
          users (id, full_name, email)
        `)
        .eq('event_id', input.event_id)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch feedback: ${error.message}`);
      }

      return data || [];
    }),

  // Get feedback summary for an event (public - for event details)
  getSummary: publicProcedure
    .input(z.object({ event_id: z.string().uuid() }))
    .query(async ({ input }) => {
      const supabase = createClient(supabaseUrl, supabaseAnonKey);

      const { data: feedback, error } = await supabase
        .from('feedback')
        .select('rating')
        .eq('event_id', input.event_id);

      if (error) {
        throw new Error(`Failed to fetch feedback: ${error.message}`);
      }

      if (!feedback || feedback.length === 0) {
        return {
          total_responses: 0,
          avg_rating: 0,
          rating_distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        };
      }

      const ratingDist: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      let totalRating = 0;

      feedback.forEach((f) => {
        if (f.rating >= 1 && f.rating <= 5) {
          ratingDist[f.rating]++;
          totalRating += f.rating;
        }
      });

      return {
        total_responses: feedback.length,
        avg_rating: Math.round((totalRating / feedback.length) * 100) / 100,
        rating_distribution: ratingDist,
      };
    }),

  // Get all feedback (admin only) with pagination
  getAll: adminProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      }).optional()
    )
    .query(async ({ input }) => {
      const supabase = createClient(supabaseUrl, supabaseAnonKey);

      const { data, error } = await supabase
        .from('feedback')
        .select(`
          *,
          events (id, title, starts_at),
          users (id, full_name, email)
        `)
        .order('created_at', { ascending: false })
        .range(input?.offset || 0, (input?.offset || 0) + (input?.limit || 50) - 1);

      if (error) {
        throw new Error(`Failed to fetch feedback: ${error.message}`);
      }

      return data || [];
    }),

  // Get feedback trends (admin only)
  getTrends: adminProcedure
    .input(
      z.object({
        days: z.number().min(7).max(365).default(30),
      }).optional()
    )
    .query(async ({ input }) => {
      const supabase = createClient(supabaseUrl, supabaseAnonKey);
      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.getDate() - (input?.days || 30));

      const { data: feedback, error } = await supabase
        .from('feedback')
        .select(`
          rating,
          created_at,
          events (id, title, starts_at)
        `)
        .gte('created_at', daysAgo.toISOString())
        .order('created_at', { ascending: true });

      if (error) {
        throw new Error(`Failed to fetch feedback trends: ${error.message}`);
      }

      // Group by event
      const eventMap = new Map<string, { title: string; ratings: number[]; date: string }>();

      (feedback || []).forEach((f: any) => {
        if (f.events) {
          const eventId = f.events.id;
          if (!eventMap.has(eventId)) {
            eventMap.set(eventId, {
              title: f.events.title,
              ratings: [],
              date: f.events.starts_at,
            });
          }
          eventMap.get(eventId)!.ratings.push(f.rating);
        }
      });

      const trends = Array.from(eventMap.entries()).map(([id, data]) => ({
        event_id: id,
        event_title: data.title,
        event_date: data.date,
        total_responses: data.ratings.length,
        avg_rating: Math.round((data.ratings.reduce((a, b) => a + b, 0) / data.ratings.length) * 100) / 100,
      }));

      trends.sort((a, b) => new Date(b.event_date).getTime() - new Date(a.event_date).getTime());

      return trends;
    }),

  // Delete feedback (admin only)
  delete: adminProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input }) => {
      const supabase = createClient(supabaseUrl, supabaseAnonKey);

      const { error } = await supabase
        .from('feedback')
        .delete()
        .eq('id', input.id);

      if (error) {
        throw new Error(`Failed to delete feedback: ${error.message}`);
      }

      return { success: true };
    }),
});

