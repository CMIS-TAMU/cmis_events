/**
 * Sponsor Tier Management Functions
 * Handles sponsor tier operations, preferences, and engagement stats
 */

import { createAdminSupabase } from '@/lib/supabase/server';

export type SponsorTier = 'basic' | 'standard' | 'premium';
export type NotificationFrequency = 'real-time' | 'batched' | 'daily' | 'weekly' | 'never';
export type EventType = string;

interface SponsorEngagementStats {
  tier: SponsorTier;
  notifications_sent: number;
  notifications_opened: number;
  notifications_clicked: number;
  resumes_viewed: number;
  resumes_downloaded: number;
  students_contacted: number;
  students_shortlisted: number;
  last_login: string | null;
}

/**
 * Get sponsor tier for a user
 */
export async function getSponsorTier(userId: string): Promise<SponsorTier> {
  const supabase = createAdminSupabase();
  
  const { data, error } = await supabase
    .from('users')
    .select('sponsor_tier')
    .eq('id', userId)
    .single();

  if (error || !data) {
    return 'basic'; // Default tier
  }

  return (data.sponsor_tier as SponsorTier) || 'basic';
}

/**
 * Update sponsor tier (deprecated - use changeSponsorTier instead)
 */
export async function updateSponsorTier(
  userId: string,
  tier: SponsorTier
): Promise<{ success: boolean; error?: string }> {
  return changeSponsorTier(userId, tier, 'Updated via updateSponsorTier', 'system');
}

/**
 * Get sponsor preferences
 */
export async function getSponsorPreferences(userId: string) {
  const supabase = createAdminSupabase();
  
  const { data, error } = await supabase
    .from('sponsor_preferences')
    .select('*')
    .eq('sponsor_id', userId)
    .single();

  if (error || !data) {
    // Return default preferences
    return {
      email_frequency: 'weekly' as NotificationFrequency,
      notification_preferences: {},
      student_filters: {},
      unsubscribed_from: [],
      contact_preferences: { email: true },
    };
  }

  return {
    email_frequency: data.email_frequency || 'weekly',
    notification_preferences: data.notification_preferences || {},
    student_filters: data.student_filters || {},
    unsubscribed_from: data.unsubscribed_from || [],
    contact_preferences: data.contact_preferences || { email: true },
  };
}

/**
 * Update sponsor preferences
 */
export async function updateSponsorPreferences(
  userId: string,
  preferences: any
): Promise<{ success: boolean; data?: any; error?: string }> {
  const supabase = createAdminSupabase();
  
  const { data, error } = await supabase
    .from('sponsor_preferences')
    .upsert({
      sponsor_id: userId,
      ...preferences,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data };
}

/**
 * Get sponsor engagement statistics
 */
export async function getSponsorEngagementStats(userId: string): Promise<SponsorEngagementStats> {
  const supabase = createAdminSupabase();
  
  // Get sponsor tier
  const tier = await getSponsorTier(userId);
  
  // Get engagement stats
  const { data: stats, error } = await supabase
    .from('sponsor_engagement_stats')
    .select('*')
    .eq('sponsor_id', userId)
    .single();

  if (error || !stats) {
    // Return default stats if not found
    return {
      tier,
      notifications_sent: 0,
      notifications_opened: 0,
      notifications_clicked: 0,
      resumes_viewed: 0,
      resumes_downloaded: 0,
      students_contacted: 0,
      students_shortlisted: 0,
      last_login: null,
    };
  }

  return {
    tier,
    notifications_sent: stats.notifications_sent || 0,
    notifications_opened: stats.notifications_opened || 0,
    notifications_clicked: stats.notifications_clicked || 0,
    resumes_viewed: stats.resumes_viewed || 0,
    resumes_downloaded: stats.resumes_downloaded || 0,
    students_contacted: stats.students_contacted || 0,
    students_shortlisted: stats.students_shortlisted || 0,
    last_login: stats.last_login || null,
  };
}

/**
 * Change sponsor tier with history tracking
 */
export async function changeSponsorTier(
  sponsorId: string,
  newTier: SponsorTier,
  reason?: string,
  changedBy?: string
): Promise<{ success: boolean; change?: any; error?: string }> {
  const supabase = createAdminSupabase();
  
  // Get current tier
  const currentTier = await getSponsorTier(sponsorId);
  
  // Update tier
  const { error: updateError } = await supabase
    .from('users')
    .update({ sponsor_tier: newTier })
    .eq('id', sponsorId);

  if (updateError) {
    return { success: false, error: updateError.message };
  }

  // Record tier change history (if table exists)
  try {
    const { data: changeRecord } = await supabase
      .from('sponsor_tier_history')
      .insert({
        sponsor_id: sponsorId,
        old_tier: currentTier,
        new_tier: newTier,
        reason: reason || 'Tier updated',
        changed_by: changedBy || 'system',
      })
      .select()
      .single();

    return { success: true, change: changeRecord };
  } catch (err) {
    // Tier history table might not exist - that's okay
    return { success: true };
  }
}

/**
 * Get tier change history
 */
export async function getTierHistory(sponsorId: string) {
  const supabase = createAdminSupabase();
  
  const { data, error } = await supabase
    .from('sponsor_tier_history')
    .select('*')
    .eq('sponsor_id', sponsorId)
    .order('changed_at', { ascending: false });

  if (error) {
    return [];
  }

  return data || [];
}

/**
 * Check if sponsor can access a feature
 */
export async function canAccessFeature(
  userId: string,
  feature: string
): Promise<boolean> {
  const tier = await getSponsorTier(userId);
  
  // Feature access based on tier
  const featureAccess: Record<SponsorTier, string[]> = {
    premium: ['resume_search', 'advanced_filters', 'csv_export', 'priority_support', 'unlimited_searches'],
    standard: ['resume_search', 'basic_filters', 'csv_export'],
    basic: ['resume_search'],
  };

  return featureAccess[tier]?.includes(feature) || false;
}

/**
 * Check if sponsor has reached a limit
 */
export async function checkLimit(
  userId: string,
  limitType: 'student_filters' | 'saved_searches' | 'monthly_exports',
  currentCount: number
): Promise<{ withinLimit: boolean; limit: number; remaining: number }> {
  const tier = await getSponsorTier(userId);
  
  const limits: Record<SponsorTier, Record<string, number>> = {
    premium: {
      student_filters: 10,
      saved_searches: 20,
      monthly_exports: 100,
    },
    standard: {
      student_filters: 5,
      saved_searches: 10,
      monthly_exports: 50,
    },
    basic: {
      student_filters: 3,
      saved_searches: 5,
      monthly_exports: 10,
    },
  };

  const limit = limits[tier]?.[limitType] || 0;
  const remaining = Math.max(0, limit - currentCount);

  return {
    withinLimit: currentCount < limit,
    limit,
    remaining,
  };
}

/**
 * Get tier configuration
 */
export function getTierConfig(tier: SponsorTier) {
  const configs = {
    premium: {
      name: 'Premium',
      features: [
        'Unlimited resume searches',
        'Advanced filtering options',
        'Priority support',
        'Unlimited CSV exports',
        '20 saved searches',
      ],
      limits: {
        student_filters: 10,
        saved_searches: 20,
        monthly_exports: 100,
      },
    },
    standard: {
      name: 'Standard',
      features: [
        'Resume searches',
        'Basic filtering',
        'Standard support',
        '50 CSV exports/month',
        '10 saved searches',
      ],
      limits: {
        student_filters: 5,
        saved_searches: 10,
        monthly_exports: 50,
      },
    },
    basic: {
      name: 'Basic',
      features: [
        'Resume searches',
        'Basic filtering',
        'Community support',
        '10 CSV exports/month',
        '5 saved searches',
      ],
      limits: {
        student_filters: 3,
        saved_searches: 5,
        monthly_exports: 10,
      },
    },
  };

  return configs[tier] || configs.basic;
}
