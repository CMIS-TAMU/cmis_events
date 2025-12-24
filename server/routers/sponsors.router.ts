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
  getTierConfig,
  type SponsorTier,
  type NotificationFrequency,
  type EventType,
} from '@/lib/communications/sponsor-tiers';
import { matchResumesToJob, indexJobDescription } from '@/lib/services/resume-matching';

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
    const config = getTierConfig(tier);
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
      
      if (!result) {
        throw new Error('Failed to update preferences');
      }

      // Return updated preferences
      const preferences = await getSponsorPreferences(ctx.user.id);
      return preferences;
    }),

  /**
   * Get current user's engagement stats
   */
  getMyEngagementStats: protectedProcedure.query(async ({ ctx }) => {
    const stats = await getSponsorEngagementStats(ctx.user.id);
    return stats;
  }),

  /**
   * Get comprehensive dashboard stats for the current sponsor
   */
  getDashboardStats: protectedProcedure.query(async ({ ctx }) => {
    const supabase = await createServerSupabase();
    
    // Verify user is a sponsor
    const { data: userProfile } = await supabase
      .from('users')
      .select('role')
      .eq('id', ctx.user.id)
      .single();

    if (userProfile?.role !== 'sponsor' && userProfile?.role !== 'admin') {
      throw new Error('Access denied. Sponsor role required.');
    }

    // Get sponsor engagement stats
    const engagementStats = await getSponsorEngagementStats(ctx.user.id);
    
    // Get sponsor tier and config
    const tier = await getSponsorTier(ctx.user.id);
    const tierConfig = getTierConfig(tier);

    // Get upcoming events (next 7 days)
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
    
    const { data: upcomingEvents, error: eventsError } = await supabase
      .from('events')
      .select('id, title, starts_at, capacity, image_url')
      .gt('starts_at', new Date().toISOString())
      .lte('starts_at', sevenDaysFromNow.toISOString())
      .order('starts_at', { ascending: true })
      .limit(5);

    if (eventsError) {
      console.error('Error fetching upcoming events:', eventsError);
    }

    // Get total event registrations
    const { count: totalRegistrations } = await supabase
      .from('event_registrations')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'registered');

    // Get total resumes available
    const { count: totalResumes } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .not('resume_url', 'is', null)
      .eq('role', 'student');

    // Get total attendance (checked in)
    const { count: totalAttendance } = await supabase
      .from('event_registrations')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'checked_in');

    // Get shortlisted students count
    const { count: shortlistedCount } = await supabase
      .from('sponsor_shortlist')
      .select('*', { count: 'exact', head: true })
      .eq('sponsor_id', ctx.user.id);

    return {
      // Engagement stats
      engagement: engagementStats,
      
      // Tier information
      tier,
      tierConfig,
      
      // Event stats
      upcomingEvents: upcomingEvents || [],
      totalRegistrations: totalRegistrations || 0,
      totalAttendance: totalAttendance || 0,
      
      // Resume stats
      totalResumes: totalResumes || 0,
      
      // Shortlist stats
      shortlistedCount: shortlistedCount || 0,
    };
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

  /**
   * Get current sponsor's shortlist
   * Returns list of shortlisted candidates for the current sponsor
   */
  getShortlist: protectedProcedure.query(async ({ ctx }) => {
    const supabase = await createServerSupabase();
    
    // Verify user is a sponsor
    const { data: userProfile } = await supabase
      .from('users')
      .select('role')
      .eq('id', ctx.user.id)
      .single();

    if (userProfile?.role !== 'sponsor' && userProfile?.role !== 'admin') {
      throw new Error('Access denied. Sponsor role required.');
    }

    const { data: shortlist, error } = await supabase
      .from('sponsor_shortlist')
      .select(`
        id,
        user_id,
        created_at,
        users:user_id (
          id,
          email,
          full_name,
          major,
          gpa,
          skills,
          graduation_year,
          resume_filename
        )
      `)
      .eq('sponsor_id', ctx.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch shortlist: ${error.message}`);
    }

    // Transform to match what the page expects
    return (shortlist || []).map((item: any) => ({
      id: item.users?.id || item.user_id, // Use user id as the id for the page
      user_id: item.user_id,
      created_at: item.created_at,
      ...item.users,
    }));
  }),

  /**
   * Search resumes (for sponsors)
   */
  searchResumes: protectedProcedure
    .input(
      z.object({
        search: z.string().optional(),
        major: z.string().optional(),
        skills: z.array(z.string()).optional(),
        minGpa: z.number().optional(),
        maxGpa: z.number().optional(),
        graduationYear: z.number().optional(),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      const supabase = await createServerSupabase();
      
      // Verify user is a sponsor
      const { data: userProfile } = await supabase
        .from('users')
        .select('role')
        .eq('id', ctx.user.id)
        .single();

      if (userProfile?.role !== 'sponsor' && userProfile?.role !== 'admin') {
        throw new Error('Access denied. Sponsor role required.');
      }

      let query = supabase
        .from('users')
        .select('id, email, full_name, major, gpa, skills, graduation_year, resume_filename, resume_uploaded_at')
        .eq('role', 'student')
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
        throw new Error(`Failed to search resumes: ${error.message}`);
      }

      return data || [];
    }),

  /**
   * Semantic search for resumes using AI (job description matching)
   */
  searchResumesSemantic: protectedProcedure
    .input(
      z.object({
        jobDescription: z.string().min(1, 'Job description is required'),
        threshold: z.number().min(0).max(1).optional().default(0.6),
        limit: z.number().min(1).max(50).optional().default(20),
        skills: z.array(z.string()).optional(),
        major: z.string().optional(),
        minGpa: z.number().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const supabase = await createServerSupabase();
      
      // Verify user is a sponsor
      const { data: userProfile } = await supabase
        .from('users')
        .select('role')
        .eq('id', ctx.user.id)
        .single();

      if (userProfile?.role !== 'sponsor' && userProfile?.role !== 'admin') {
        throw new Error('Access denied. Sponsor role required.');
      }

      // Use semantic search to match resumes
      const matches = await matchResumesToJob(input.jobDescription, {
        threshold: input.threshold,
        limit: input.limit,
        skills: input.skills,
        major: input.major,
        minGPA: input.minGpa,
      });

      // Fetch full user data for matched resumes
      const userIds = matches.map(m => m.userId).filter(Boolean);
      if (userIds.length === 0) {
        return [];
      }

      const { data: users, error } = await supabase
        .from('users')
        .select('id, email, full_name, major, gpa, skills, graduation_year, resume_filename, resume_uploaded_at')
        .in('id', userIds);

      if (error) {
        throw new Error(`Failed to fetch matched users: ${error.message}`);
      }

      // Combine match data with user data
      const results = matches.map(match => {
        const user = users?.find(u => u.id === match.userId);
        return {
          ...user,
          similarity: match.similarity,
          matchScore: Math.round(match.similarity * 100),
        };
      }).filter(r => r.id); // Only include results with user data

      // Sort by similarity (highest first)
      return results.sort((a, b) => (b.similarity || 0) - (a.similarity || 0));
    }),

  /**
   * Add candidate to shortlist
   */
  addToShortlist: protectedProcedure
    .input(z.object({ userId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const supabase = await createServerSupabase();
      
      // Verify user is a sponsor
      const { data: userProfile } = await supabase
        .from('users')
        .select('role')
        .eq('id', ctx.user.id)
        .single();

      if (userProfile?.role !== 'sponsor' && userProfile?.role !== 'admin') {
        throw new Error('Access denied. Sponsor role required.');
      }

      // Check if already in shortlist
      const { data: existing } = await supabase
        .from('sponsor_shortlist')
        .select('id')
        .eq('sponsor_id', ctx.user.id)
        .eq('user_id', input.userId)
        .single();

      if (existing) {
        return { success: true, message: 'Already in shortlist' };
      }

      const { data, error } = await supabase
        .from('sponsor_shortlist')
        .insert({
          sponsor_id: ctx.user.id,
          user_id: input.userId,
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to add to shortlist: ${error.message}`);
      }

      return { success: true, data };
    }),

  /**
   * Remove candidate from shortlist
   */
  removeFromShortlist: protectedProcedure
    .input(z.object({ userId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const supabase = await createServerSupabase();
      
      // Verify user is a sponsor
      const { data: userProfile } = await supabase
        .from('users')
        .select('role')
        .eq('id', ctx.user.id)
        .single();

      if (userProfile?.role !== 'sponsor' && userProfile?.role !== 'admin') {
        throw new Error('Access denied. Sponsor role required.');
      }

      const { error } = await supabase
        .from('sponsor_shortlist')
        .delete()
        .eq('sponsor_id', ctx.user.id)
        .eq('user_id', input.userId);

      if (error) {
        throw new Error(`Failed to remove from shortlist: ${error.message}`);
      }

      return { success: true };
    }),

  /**
   * Track resume view
   */
  trackResumeView: protectedProcedure
    .input(z.object({ userId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const supabase = await createServerSupabase();
      
      // Verify user is a sponsor
      const { data: userProfile } = await supabase
        .from('users')
        .select('role')
        .eq('id', ctx.user.id)
        .single();

      if (userProfile?.role !== 'sponsor' && userProfile?.role !== 'admin') {
        throw new Error('Access denied. Sponsor role required.');
      }

      const { error } = await supabase.from('resume_views').insert({
        user_id: input.userId,
        viewed_by: ctx.user.id,
        event_id: null,
      });

      if (error) {
        // Don't throw error for tracking - just log it
        console.error('Failed to track resume view:', error);
        return { success: false };
      }

      return { success: true };
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

      if (!result) {
        throw new Error('Failed to update sponsor tier');
      }

      // Return the updated tier information
      const tier = await getSponsorTier(input.sponsorId);
      const tierConfig = getTierConfig(tier);
      return { tier, config: tierConfig };
    }),

  /**
   * Bulk update sponsor tiers (admin only)
   */
  bulkUpdateTiers: adminProcedure
    .input(bulkUpdateTiersSchema)
    .mutation(async ({ ctx, input }) => {
      const results = await Promise.all(
        input.sponsorIds.map(async (sponsorId) => {
          try {
            const result = await changeSponsorTier(
              sponsorId,
              input.tier,
              input.reason,
              ctx.user.id
            );
            return {
              sponsorId,
              success: result,
              error: result ? undefined : 'Failed to update tier',
            };
          } catch (error: any) {
            return {
              sponsorId,
              success: false,
              error: error.message || 'Failed to update tier',
            };
          }
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
