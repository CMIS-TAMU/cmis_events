import { z } from 'zod';
import { router, adminProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';

export const analyticsRouter = router({
  // Get dashboard overview stats
  getOverview: adminProcedure
    .input(
      z.object({
        days: z.number().min(1).max(365).default(30),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      // Use context supabase client (already authenticated via adminProcedure)
      const supabase = ctx.supabase;
      
      if (!supabase) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Supabase client not available',
        });
      }

      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.getDate() - (input?.days || 30));
      const startDate = daysAgo.toISOString();

      // Get total users
      const { count: totalUsers } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });

      // Get new users in period
      const { count: newUsers } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startDate);

      // Get total events
      const { count: totalEvents } = await supabase
        .from('events')
        .select('*', { count: 'exact', head: true });

      // Get events in period
      const { count: eventsInPeriod } = await supabase
        .from('events')
        .select('*', { count: 'exact', head: true })
        .gte('starts_at', startDate);

      // Get total registrations
      const { count: totalRegistrations } = await supabase
        .from('event_registrations')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'registered');

      // Get registrations in period
      const { count: registrationsInPeriod } = await supabase
        .from('event_registrations')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'registered')
        .gte('registered_at', startDate);

      // Get average feedback rating
      const { data: feedbackData } = await supabase
        .from('feedback')
        .select('rating')
        .gte('created_at', startDate);

      const avgRating = feedbackData && feedbackData.length > 0
        ? Math.round((feedbackData.reduce((sum, f) => sum + f.rating, 0) / feedbackData.length) * 100) / 100
        : 0;

      // Get check-in count
      const { count: checkedIn } = await supabase
        .from('event_registrations')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'checked_in')
        .gte('registered_at', startDate);

      return {
        total_users: totalUsers || 0,
        new_users: newUsers || 0,
        total_events: totalEvents || 0,
        events_in_period: eventsInPeriod || 0,
        total_registrations: totalRegistrations || 0,
        registrations_in_period: registrationsInPeriod || 0,
        avg_rating: avgRating,
        checked_in: checkedIn || 0,
        feedback_count: feedbackData?.length || 0,
      };
    }),

  // Get registration trends over time
  getRegistrationTrends: adminProcedure
    .input(
      z.object({
        days: z.number().min(7).max(365).default(30),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      // Use context supabase client (already authenticated via adminProcedure)
      const supabase = ctx.supabase;
      
      if (!supabase) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Supabase client not available',
        });
      }

      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.getDate() - (input?.days || 30));

      const { data: registrations, error } = await supabase
        .from('event_registrations')
        .select('registered_at, status')
        .gte('registered_at', daysAgo.toISOString())
        .order('registered_at', { ascending: true });

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to fetch registration trends: ${error.message}`,
        });
      }

      // Group by date
      const groupedData = new Map<string, { registrations: number; cancellations: number }>();

      (registrations || []).forEach((r) => {
        const date = new Date(r.registered_at).toISOString().split('T')[0];

        if (!groupedData.has(date)) {
          groupedData.set(date, { registrations: 0, cancellations: 0 });
        }

        const entry = groupedData.get(date)!;
        if (r.status === 'cancelled') {
          entry.cancellations++;
        } else {
          entry.registrations++;
        }
      });

      return Array.from(groupedData.entries()).map(([date, data]) => ({
        date,
        ...data,
      }));
    }),

  // Get event performance metrics
  getEventPerformance: adminProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).default(10),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      // Use context supabase client (already authenticated via adminProcedure)
      const supabase = ctx.supabase;
      
      if (!supabase) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Supabase client not available',
        });
      }

      const { data: events, error } = await supabase
        .from('events')
        .select(`
          id,
          title,
          capacity,
          starts_at,
          event_registrations (id, status),
          feedback (rating)
        `)
        .order('starts_at', { ascending: false })
        .limit(input?.limit || 10);

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to fetch event performance: ${error.message}`,
        });
      }

      return (events || []).map((event: any) => {
        const registrations = event.event_registrations || [];
        const registered = registrations.filter((r: any) => r.status === 'registered').length;
        const checkedIn = registrations.filter((r: any) => r.status === 'checked_in').length;
        const cancelled = registrations.filter((r: any) => r.status === 'cancelled').length;

        const feedback = event.feedback || [];
        const avgRating = feedback.length > 0
          ? Math.round((feedback.reduce((sum: number, f: any) => sum + f.rating, 0) / feedback.length) * 100) / 100
          : null;

        const fillRate = event.capacity > 0
          ? Math.round((registered / event.capacity) * 100)
          : null;

        return {
          id: event.id,
          title: event.title,
          date: event.starts_at,
          capacity: event.capacity,
          registered,
          checked_in: checkedIn,
          cancelled,
          fill_rate: fillRate,
          avg_rating: avgRating,
          feedback_count: feedback.length,
        };
      });
    }),

  // Get user role distribution
  getUserDistribution: adminProcedure.query(async ({ ctx }) => {
    // Use context supabase client (already authenticated via adminProcedure)
    const supabase = ctx.supabase;
    
    if (!supabase) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Supabase client not available',
      });
    }

    const { data: users } = await supabase
      .from('users')
      .select('role');

    const roleDistribution: Record<string, number> = {};
    (users || []).forEach((u: any) => {
      const role = u.role || 'user';
      roleDistribution[role] = (roleDistribution[role] || 0) + 1;
    });

    return roleDistribution;
  }),

  // Get popular upcoming events
  getPopularEvents: adminProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(20).default(5),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      // Use context supabase client (already authenticated via adminProcedure)
      const supabase = ctx.supabase;
      
      if (!supabase) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Supabase client not available',
        });
      }

      const { data: events, error } = await supabase
        .from('events')
        .select(`
          id,
          title,
          starts_at,
          capacity,
          event_registrations (id, status)
        `)
        .gt('starts_at', new Date().toISOString())
        .order('starts_at', { ascending: true });

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to fetch popular events: ${error.message}`,
        });
      }

      const eventsWithCounts = (events || []).map((event: any) => {
        const registrations = event.event_registrations || [];
        const registered = registrations.filter((r: any) => r.status === 'registered').length;

        return {
          id: event.id,
          title: event.title,
          date: event.starts_at,
          capacity: event.capacity,
          registered,
          fill_rate: event.capacity > 0 ? Math.round((registered / event.capacity) * 100) : null,
        };
      });

      // Sort by registration count
      eventsWithCounts.sort((a, b) => b.registered - a.registered);

      return eventsWithCounts.slice(0, input?.limit || 5);
    }),

  // Export data as JSON (can be converted to CSV on frontend)
  exportData: adminProcedure
    .input(
      z.object({
        type: z.enum(['events', 'registrations', 'users', 'feedback']),
        days: z.number().min(1).max(365).default(365),
      })
    )
    .query(async ({ ctx, input }) => {
      // Use context supabase client (already authenticated via adminProcedure)
      const supabase = ctx.supabase;
      
      if (!supabase) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Supabase client not available',
        });
      }

      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.getDate() - input.days);
      const startDate = daysAgo.toISOString();

      switch (input.type) {
        case 'events': {
          const { data, error } = await supabase
            .from('events')
            .select('*')
            .gte('created_at', startDate)
            .order('created_at', { ascending: false });

          if (error) {
            throw new TRPCError({
              code: 'INTERNAL_SERVER_ERROR',
              message: error.message,
            });
          }
          return data || [];
        }

        case 'registrations': {
          const { data, error } = await supabase
            .from('event_registrations')
            .select(`
              *,
              events (title),
              users (full_name, email)
            `)
            .gte('registered_at', startDate)
            .order('registered_at', { ascending: false });

          if (error) {
            throw new TRPCError({
              code: 'INTERNAL_SERVER_ERROR',
              message: error.message,
            });
          }
          return (data || []).map((r: any) => ({
            ...r,
            event_title: r.events?.title,
            user_name: r.users?.full_name,
            user_email: r.users?.email,
          }));
        }

        case 'users': {
          const { data, error } = await supabase
            .from('users')
            .select('id, email, full_name, role, created_at')
            .gte('created_at', startDate)
            .order('created_at', { ascending: false });

          if (error) {
            throw new TRPCError({
              code: 'INTERNAL_SERVER_ERROR',
              message: error.message,
            });
          }
          return data || [];
        }

        case 'feedback': {
          const { data, error } = await supabase
            .from('feedback')
            .select(`
              *,
              events (title),
              users (full_name, email)
            `)
            .gte('created_at', startDate)
            .order('created_at', { ascending: false });

          if (error) {
            throw new TRPCError({
              code: 'INTERNAL_SERVER_ERROR',
              message: error.message,
            });
          }
          return (data || []).map((f: any) => ({
            ...f,
            event_title: f.events?.title,
            user_name: f.users?.full_name,
            user_email: f.users?.email,
          }));
        }

        default:
          return [];
      }
    }),
});

