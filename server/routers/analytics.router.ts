import { z } from 'zod';
import { router, adminProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';
import { createAdminSupabase } from '@/lib/supabase/server';
import type { DashboardData, Alert, AlertType, AlertSeverity } from '@/types/dashboard';

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
        ? Math.round((feedbackData.reduce((sum: number, f: { rating: number }) => sum + f.rating, 0) / feedbackData.length) * 100) / 100
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

      (registrations || []).forEach((r: { registered_at: string; status: string }) => {
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
      eventsWithCounts.sort((a: { registered: number }, b: { registered: number }) => b.registered - a.registered);

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

  // Get comprehensive dashboard data for admin (all critical metrics in one call)
  // OPTIMIZED: All queries run in parallel for maximum performance
  getDashboard: adminProcedure.query(async ({ ctx }): Promise<DashboardData> => {
    const adminSupabase = createAdminSupabase();
    
    if (!adminSupabase) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Supabase client not available',
      });
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const weekFromNow = new Date(today);
    weekFromNow.setDate(weekFromNow.getDate() + 7);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // ⚡ PARALLELIZE ALL QUERIES - Runs simultaneously instead of sequentially
    const [
      totalUsersResult,
      newUsersResult,
      allEventsResult,
      totalRegistrationsResult,
      matchBatchesResult,
      activeCompetitionsResult,
      competitionsResult,
      miniRequestsResult,
      // Sponsor queries
      sponsorsResult,
      sponsorEngagementResult,
      notificationLogsResult,
    ] = await Promise.all([
      // Get total users
      adminSupabase
        .from('users')
        .select('*', { count: 'exact', head: true }),
      
      // Get new users in last 7 days
      adminSupabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', sevenDaysAgo.toISOString()),
      
      // Get all events with registrations
      adminSupabase
        .from('events')
        .select('id, title, starts_at, capacity, event_registrations(id, status)')
        .order('starts_at', { ascending: true }),
      
      // Get total registrations
      adminSupabase
        .from('event_registrations')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'registered'),
      
      // Get pending mentorship requests
      adminSupabase
        .from('match_batches')
        .select('id')
        .eq('status', 'pending'),
      
      // Get active competitions
      adminSupabase
        .from('case_competitions')
        .select('id, title, status')
        .eq('status', 'open'),
      
      // Get competitions needing rubrics
      adminSupabase
        .from('case_competitions')
        .select(`
          id,
          title,
          competition_rubrics(id)
        `)
        .eq('status', 'open'),
      
      // Get open mini mentorship requests
      adminSupabase
        .from('mini_mentorship_requests')
        .select('id')
        .eq('status', 'open'),
      
      // Get all sponsors
      adminSupabase
        .from('users')
        .select('id, sponsor_tier, last_sign_in_at, created_at')
        .eq('role', 'sponsor'),
      
      // Get sponsor engagement stats
      adminSupabase
        .from('sponsor_engagement_stats')
        .select('sponsor_id, resumes_viewed, notifications_sent, last_login'),
      
      // Get notification logs (last 30 days)
      adminSupabase
        .from('notification_logs')
        .select('sponsor_id, sent_at, opened_at, clicked_at')
        .gte('sent_at', sevenDaysAgo.toISOString()),
    ]);

    // Extract results
    const totalUsers = totalUsersResult.count || 0;
    const newUsers = newUsersResult.count || 0;
    const allEvents = allEventsResult.data || [];
    const totalRegistrations = totalRegistrationsResult.count || 0;
    const matchBatches = matchBatchesResult.data || [];
    const activeCompetitions = activeCompetitionsResult.data || [];
    const competitions = competitionsResult.data || [];
    const miniRequests = miniRequestsResult.data || [];
    
    // Extract sponsor results
    const sponsors = sponsorsResult.data || [];
    const sponsorEngagement = sponsorEngagementResult.data || [];
    const notificationLogs = notificationLogsResult.data || [];
    
    // Calculate sponsor metrics
    const totalSponsors = sponsors.length;
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    // Active sponsors (logged in last 30 days)
    const activeSponsors30d = sponsors.filter((s: any) => {
      if (!s.last_sign_in_at) return false;
      return new Date(s.last_sign_in_at) >= thirtyDaysAgo;
    }).length;
    
    // Low engagement sponsors (no login in last 60 days)
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
    const lowEngagementSponsors = sponsors.filter((s: any) => {
      if (!s.last_sign_in_at) return true; // Never logged in
      return new Date(s.last_sign_in_at) < sixtyDaysAgo;
    }).length;
    
    // Total resume views
    const totalResumeViews = sponsorEngagement.reduce((sum: number, stat: any) => {
      return sum + (stat.resumes_viewed || 0);
    }, 0);
    
    // Notification engagement rate
    const totalNotificationsSent = notificationLogs.length;
    const totalOpened = notificationLogs.filter((log: any) => log.opened_at).length;
    const notificationRate = totalNotificationsSent > 0 
      ? Math.round((totalOpened / totalNotificationsSent) * 100)
      : 0;
    
    // Create sponsor engagement map for alerts
    const sponsorEngagementMap = new Map();
    sponsorEngagement.forEach((stat: any) => {
      sponsorEngagementMap.set(stat.sponsor_id, stat);
    });

    // Calculate event metrics
    const upcomingEvents = allEvents.filter((e: any) => new Date(e.starts_at) > now);
    const eventsToday = upcomingEvents.filter((e: any) => {
      const eventDate = new Date(e.starts_at);
      return eventDate >= today && eventDate < tomorrow;
    });
    const eventsThisWeek = upcomingEvents.filter((e: any) => {
      const eventDate = new Date(e.starts_at);
      return eventDate >= today && eventDate < weekFromNow;
    });

    const competitionsNeedingRubrics = competitions.filter((comp: any) => 
      !comp.competition_rubrics || comp.competition_rubrics.length === 0
    );

    // Get events needing attention (low registration < 20% capacity)
    const eventsNeedingAttention = upcomingEvents.filter((event: any) => {
      if (!event.capacity || event.capacity === 0) return false;
      const registrations = event.event_registrations || [];
      const registeredCount = registrations.filter((r: any) => r.status === 'registered').length;
      const fillRate = (registeredCount / event.capacity) * 100;
      return fillRate < 20 && new Date(event.starts_at) <= weekFromNow;
    }).slice(0, 5);

    // Get upcoming events for this week
    const upcomingEventsThisWeek = upcomingEvents
      .filter((e: any) => {
        const eventDate = new Date(e.starts_at);
        return eventDate >= today && eventDate < weekFromNow;
      })
      .slice(0, 5)
      .map((event: any) => {
        const registrations = event.event_registrations || [];
        const registeredCount = registrations.filter((r: any) => r.status === 'registered').length;
        const checkedInCount = registrations.filter((r: any) => r.status === 'checked_in').length;
        const fillRate = event.capacity > 0 ? Math.round((registeredCount / event.capacity) * 100) : null;
        
        return {
          id: event.id,
          title: event.title,
          starts_at: event.starts_at,
          capacity: event.capacity,
          registered: registeredCount,
          checked_in: checkedInCount,
          fill_rate: fillRate,
        };
      });

    // Generate alerts
    const alerts: Alert[] = [];

    // Low registration alerts
    eventsNeedingAttention.forEach((event: any) => {
      alerts.push({
        type: 'low_registration',
        severity: 'high',
        title: `Low Registration: ${event.title}`,
        description: `Only ${event.event_registrations?.filter((r: any) => r.status === 'registered').length || 0} registered of ${event.capacity} capacity`,
        action_url: `/admin/events/${event.id}/edit`,
      } as Alert);
    });

    // Competitions needing rubrics
    competitionsNeedingRubrics.forEach((comp: any) => {
      alerts.push({
        type: 'missing_rubric',
        severity: 'medium',
        title: `Competition Needs Rubrics: ${comp.title}`,
        description: 'This competition has no judging rubrics defined yet',
        action_url: `/admin/competitions/${comp.id}`,
      } as Alert);
    });

    // Events happening today
    eventsToday.forEach((event: any) => {
      alerts.push({
        type: 'upcoming_checkin',
        severity: 'medium',
        title: `Check-in Today: ${event.title}`,
        description: `Event starts ${new Date(event.starts_at).toLocaleTimeString()}`,
        action_url: `/admin/checkin?event=${event.id}`,
      } as Alert);
    });
    
    // Sponsor engagement alerts
    if (lowEngagementSponsors > 0) {
      alerts.push({
        type: 'low_sponsor_engagement',
        severity: 'medium',
        title: `${lowEngagementSponsors} Sponsors with Low Engagement`,
        description: `${lowEngagementSponsors} sponsor(s) haven't logged in for 60+ days. Consider reaching out.`,
        action_url: '/admin/sponsors?filter=low_engagement',
      } as Alert);
    }
    
    // Check for upcoming events not notified to sponsors
    const eventsNotNotified = upcomingEventsThisWeek.filter((event: any) => {
      // Check if any notifications were sent for this event
      const eventNotifications = notificationLogs.filter((log: any) => {
        return log.event_data?.event_id === event.id;
      });
      return eventNotifications.length === 0;
    });
    
    eventsNotNotified.slice(0, 3).forEach((event: any) => {
      alerts.push({
        type: 'event_not_notified_sponsors',
        severity: 'low',
        title: `Event Not Notified: ${event.title}`,
        description: 'No sponsor notifications sent for this upcoming event',
        action_url: `/admin/events/${event.id}/notify-sponsors`,
      } as Alert);
    });
    
    // Premium sponsors with low engagement
    const premiumLowEngagement = sponsors.filter((s: any) => {
      if (s.sponsor_tier !== 'premium') return false;
      if (!s.last_sign_in_at) return true;
      return new Date(s.last_sign_in_at) < sixtyDaysAgo;
    }).length;
    
    if (premiumLowEngagement > 0) {
      alerts.push({
        type: 'low_sponsor_engagement',
        severity: 'high',
        title: `${premiumLowEngagement} Premium Sponsors Need Attention`,
        description: `${premiumLowEngagement} premium sponsor(s) have low engagement. High priority.`,
        action_url: '/admin/sponsors?filter=tier:premium&sort=engagement',
      } as Alert);
    }

    return {
      metrics: {
        total_users: totalUsers || 0,
        new_users_7d: newUsers || 0,
        total_events: allEvents?.length || 0,
        upcoming_events: upcomingEvents.length,
        events_today: eventsToday.length,
        events_this_week: eventsThisWeek.length,
        total_registrations: totalRegistrations || 0,
        pending_mentorship_requests: matchBatches?.length || 0,
        active_competitions: activeCompetitions?.length || 0,
        open_mini_sessions: miniRequests?.length || 0,
        // Sponsor engagement metrics
        total_sponsors: totalSponsors,
        active_sponsors_30d: activeSponsors30d,
        low_engagement_sponsors: lowEngagementSponsors,
        total_resume_views: totalResumeViews,
        sponsor_notification_rate: notificationRate,
      },
      alerts,
      upcoming_events: upcomingEventsThisWeek,
      events_needing_attention: eventsNeedingAttention.map((e: any) => ({
        id: e.id,
        title: e.title,
        starts_at: e.starts_at,
        registered: e.event_registrations?.filter((r: any) => r.status === 'registered').length || 0,
        capacity: e.capacity,
      })),
    };
  }),
});

