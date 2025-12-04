/**
 * Sponsors tRPC Router
 * Handles sponsor tier management and preferences
 */

import { z } from 'zod';
import { router, protectedProcedure, adminProcedure } from '../trpc';
import { createServerSupabase } from '@/lib/supabase/server';
import {
  getSponsorTier,
  updateSponsorTier,
  getSponsorPreferences,
  updateSponsorPreferences,
  getSponsorEngagementStats,
  changeSponsorTier,
  getTierHistory,
  canAccessFeature,
  checkLimit,
  type SponsorTier,
  type NotificationFrequency,
  type EventType,
} from '@/lib/communications/sponsor-tiers';

// ============================================================================
// INPUT SCHEMAS
// ============================================================================

const updateTierSchema = z.object({
  sponsorId: z.string().uuid(),
  tier: z.enum(['basic', 'standard', 'premium']),
  reason: z.string().optional(),
});

const bulkUpdateTiersSchema = z.object({
  sponsorIds: z.array(z.string().uuid()),
  tier: z.enum(['basic', 'standard', 'premium']),
  reason: z.string().optional(),
});

const updatePreferencesSchema = z.object({
  email_frequency: z.enum(['real-time', 'batched', 'daily', 'weekly', 'never']).optional(),
  notification_preferences: z.record(z.string(), z.enum(['real-time', 'batched', 'daily', 'weekly', 'never'])).optional(),
  student_filters: z.object({
    majors: z.array(z.string()).optional(),
    graduation_years: z.array(z.number()).optional(),
    min_gpa: z.number().min(0).max(4).optional(),
    skills: z.array(z.string()).optional(),
    industries: z.array(z.string()).optional(),
  }).optional(),
  unsubscribed_from: z.array(z.string()).optional(),
  contact_preferences: z.object({
    email: z.boolean(),
    phone: z.boolean().optional(),
    sms: z.boolean().optional(),
  }).optional(),
});

const sponsorFilterSchema = z.object({
  tier: z.enum(['basic', 'standard', 'premium', 'all']).optional(),
  search: z.string().optional(),
  limit: z.number().min(1).max(100).optional().default(50),
  offset: z.number().min(0).optional().default(0),
});

// ============================================================================
// ROUTER
// ============================================================================

export const sponsorsRouter = router({
  // ========== SPONSOR-ACCESSIBLE ENDPOINTS ==========

  /**
   * Get current user's sponsor tier and config
   */
  getMyTier: protectedProcedure.query(async ({ ctx }) => {
    const tier = await getSponsorTier(ctx.user.id);
    const config = (await import('@/lib/communications/sponsor-tiers')).getTierConfig(tier);
    return { tier, config };
  }),

  /**
   * Get current user's notification preferences
   */
  getMyPreferences: protectedProcedure.query(async ({ ctx }) => {
    const preferences = await getSponsorPreferences(ctx.user.id);
    return preferences;
  }),

  /**
   * Update current user's notification preferences
   */
  updateMyPreferences: protectedProcedure
    .input(updatePreferencesSchema)
    .mutation(async ({ ctx, input }) => {
      const result = await updateSponsorPreferences(ctx.user.id, input);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to update preferences');
      }

      return result.data;
    }),

  /**
   * Get current user's engagement stats
   */
  getMyEngagementStats: protectedProcedure.query(async ({ ctx }) => {
    const stats = await getSponsorEngagementStats(ctx.user.id);
    return stats;
  }),

  /**
   * Check if current user can access a feature
   */
  canAccessFeature: protectedProcedure
    .input(z.object({ feature: z.string() }))
    .query(async ({ ctx, input }) => {
      const canAccess = await canAccessFeature(ctx.user.id, input.feature as any);
      return { canAccess };
    }),

  /**
   * Check if current user has reached a limit
   */
  checkLimit: protectedProcedure
    .input(z.object({
      limitType: z.enum(['student_filters', 'saved_searches', 'monthly_exports']),
      currentCount: z.number(),
    }))
    .query(async ({ ctx, input }) => {
      const result = await checkLimit(ctx.user.id, input.limitType, input.currentCount);
      return result;
    }),

  // ========== ADMIN-ONLY ENDPOINTS ==========

  /**
   * Get all sponsors with their tiers and stats
   */
  getAllSponsors: adminProcedure
    .input(sponsorFilterSchema)
    .query(async ({ input }) => {
      const supabase = await createServerSupabase();

      let query = supabase
        .from('users')
        .select(`
          id,
          email,
          full_name,
          sponsor_tier,
          created_at,
          metadata
        `)
        .eq('role', 'sponsor')
        .order('created_at', { ascending: false });

      // Apply tier filter
      if (input.tier && input.tier !== 'all') {
        query = query.eq('sponsor_tier', input.tier);
      }

      // Apply search filter
      if (input.search) {
        query = query.or(`email.ilike.%${input.search}%,full_name.ilike.%${input.search}%`);
      }

      // Apply pagination
      query = query.range(input.offset!, input.offset! + input.limit! - 1);

      const { data: sponsors, error } = await query;

      if (error) {
        throw new Error(`Failed to fetch sponsors: ${error.message}`);
      }

      // Get engagement stats for each sponsor
      const sponsorsWithStats = await Promise.all(
        (sponsors || []).map(async (sponsor) => {
          const stats = await getSponsorEngagementStats(sponsor.id);
          return {
            ...sponsor,
            stats,
          };
        })
      );

      // Get total count
      const { count } = await supabase
        .from('users')
        .select('id', { count: 'exact', head: true })
        .eq('role', 'sponsor');

      return {
        sponsors: sponsorsWithStats,
        total: count || 0,
      };
    }),

  /**
   * Get sponsor tier statistics
   */
  getTierStats: adminProcedure.query(async () => {
    const supabase = await createServerSupabase();

    // Get counts by tier
    const { data: tierCounts } = await supabase
      .from('users')
      .select('sponsor_tier')
      .eq('role', 'sponsor');

    const stats = {
      total: tierCounts?.length || 0,
      basic: tierCounts?.filter(s => s.sponsor_tier === 'basic').length || 0,
      standard: tierCounts?.filter(s => s.sponsor_tier === 'standard').length || 0,
      premium: tierCounts?.filter(s => s.sponsor_tier === 'premium').length || 0,
    };

    return stats;
  }),

  /**
   * Get detailed sponsor information
   */
  getSponsorDetails: adminProcedure
    .input(z.object({ sponsorId: z.string().uuid() }))
    .query(async ({ input }) => {
      const supabase = await createServerSupabase();

      const { data: sponsor, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', input.sponsorId)
        .single();

      if (error || !sponsor) {
        throw new Error('Sponsor not found');
      }

      const [tier, preferences, stats, tierHistory] = await Promise.all([
        getSponsorTier(input.sponsorId),
        getSponsorPreferences(input.sponsorId),
        getSponsorEngagementStats(input.sponsorId),
        getTierHistory(input.sponsorId),
      ]);

      return {
        sponsor,
        tier,
        preferences,
        stats,
        tierHistory,
      };
    }),

  /**
   * Update sponsor tier (admin only)
   */
  updateSponsorTier: adminProcedure
    .input(updateTierSchema)
    .mutation(async ({ ctx, input }) => {
      const result = await changeSponsorTier(
        input.sponsorId,
        input.tier,
        input.reason,
        ctx.user.id
      );

      if (!result.success) {
        throw new Error(result.error || 'Failed to update sponsor tier');
      }

      return result.change;
    }),

  /**
   * Bulk update sponsor tiers (admin only)
   */
  bulkUpdateTiers: adminProcedure
    .input(bulkUpdateTiersSchema)
    .mutation(async ({ ctx, input }) => {
      const results = await Promise.all(
        input.sponsorIds.map(async (sponsorId) => {
          const result = await changeSponsorTier(
            sponsorId,
            input.tier,
            input.reason,
            ctx.user.id
          );
          return {
            sponsorId,
            success: result.success,
            error: result.error,
          };
        })
      );

      const successful = results.filter(r => r.success).length;
      const failed = results.filter(r => !r.success).length;

      return {
        total: input.sponsorIds.length,
        successful,
        failed,
        results,
      };
    }),

  /**
   * Get engagement analytics across all sponsors
   */
  getEngagementAnalytics: adminProcedure
    .input(z.object({
      tier: z.enum(['basic', 'standard', 'premium', 'all']).optional().default('all'),
      days: z.number().min(1).max(365).optional().default(30),
    }))
    .query(async ({ input }) => {
      const supabase = await createServerSupabase();

      // Get sponsors filtered by tier
      let query = supabase
        .from('users')
        .select('id, sponsor_tier')
        .eq('role', 'sponsor');

      if (input.tier !== 'all') {
        query = query.eq('sponsor_tier', input.tier);
      }

      const { data: sponsors } = await query;

      if (!sponsors || sponsors.length === 0) {
        return {
          totalSponsors: 0,
          totalNotifications: 0,
          totalOpens: 0,
          totalClicks: 0,
          totalResumesViewed: 0,
          avgEngagementRate: 0,
          byTier: {},
        };
      }

      // Get engagement stats for all sponsors
      const statsPromises = sponsors.map(s => getSponsorEngagementStats(s.id));
      const allStats = await Promise.all(statsPromises);

      const totalNotifications = allStats.reduce((sum, s) => sum + s.notifications_sent, 0);
      const totalOpens = allStats.reduce((sum, s) => sum + s.notifications_opened, 0);
      const totalClicks = allStats.reduce((sum, s) => sum + s.notifications_clicked, 0);
      const totalResumesViewed = allStats.reduce((sum, s) => sum + s.resumes_viewed, 0);

      const avgEngagementRate = totalNotifications > 0
        ? ((totalOpens + totalClicks) / (totalNotifications * 2)) * 100
        : 0;

      // Group by tier
      const byTier: Record<string, any> = {};
      ['basic', 'standard', 'premium'].forEach(tier => {
        const tierStats = allStats.filter(s => s.tier === tier);
        const tierNotifications = tierStats.reduce((sum, s) => sum + s.notifications_sent, 0);
        const tierOpens = tierStats.reduce((sum, s) => sum + s.notifications_opened, 0);
        const tierClicks = tierStats.reduce((sum, s) => sum + s.notifications_clicked, 0);

        byTier[tier] = {
          count: tierStats.length,
          notifications: tierNotifications,
          opens: tierOpens,
          clicks: tierClicks,
          engagementRate: tierNotifications > 0
            ? ((tierOpens + tierClicks) / (tierNotifications * 2)) * 100
            : 0,
        };
      });

      return {
        totalSponsors: sponsors.length,
        totalNotifications,
        totalOpens,
        totalClicks,
        totalResumesViewed,
        avgEngagementRate: Math.round(avgEngagementRate * 100) / 100,
        byTier,
      };
    }),
});
