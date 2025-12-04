/**
 * Sponsor Tier System
 * Handles tier-based access control and notification preferences
 */

import { createServerSupabase } from '@/lib/supabase/server';

// ============================================================================
// TYPES
// ============================================================================

export type SponsorTier = 'basic' | 'standard' | 'premium';

export type NotificationFrequency = 'real-time' | 'batched' | 'daily' | 'weekly' | 'never';

export type EventType = 
  | 'resume_upload'
  | 'new_student'
  | 'profile_update'
  | 'mission_submission'
  | 'event_registration'
  | 'mentor_request'
  | 'new_event';  // Added for event creation notifications

export interface TierConfig {
  name: string;
  defaultFrequency: NotificationFrequency;
  maxFilters: number;
  maxSavedSearches: number;
  maxMonthlyExports: number;
  features: string[];
  batchDuringSurge: boolean;
}

// ============================================================================
// TIER CONFIGURATIONS
// ============================================================================

export const TIER_CONFIGS: Record<SponsorTier, TierConfig> = {
  basic: {
    name: 'Basic',
    defaultFrequency: 'weekly',
    maxFilters: 3,
    maxSavedSearches: 5,
    maxMonthlyExports: 10,
    features: ['view_students', 'basic_filters'],
    batchDuringSurge: true,
  },
  standard: {
    name: 'Standard',
    defaultFrequency: 'batched',
    maxFilters: 10,
    maxSavedSearches: 20,
    maxMonthlyExports: 50,
    features: ['view_students', 'basic_filters', 'advanced_filters', 'analytics'],
    batchDuringSurge: true,
  },
  premium: {
    name: 'Premium',
    defaultFrequency: 'real-time',
    maxFilters: -1, // Unlimited
    maxSavedSearches: -1,
    maxMonthlyExports: -1,
    features: ['view_students', 'basic_filters', 'advanced_filters', 'analytics', 'api_access', 'priority_support'],
    batchDuringSurge: false,
  },
};

// ============================================================================
// CORE FUNCTIONS
// ============================================================================

/**
 * Get a sponsor's current tier
 */
export async function getSponsorTier(sponsorId: string): Promise<SponsorTier> {
  const supabase = await createServerSupabase();
  
  const { data } = await supabase
    .from('users')
    .select('sponsor_tier')
    .eq('id', sponsorId)
    .single();

  return (data?.sponsor_tier as SponsorTier) || 'basic';
}

/**
 * Get tier configuration
 */
export function getTierConfig(tier: SponsorTier): TierConfig {
  return TIER_CONFIGS[tier] || TIER_CONFIGS.basic;
}

/**
 * Update a sponsor's tier
 */
export async function updateSponsorTier(
  sponsorId: string,
  tier: SponsorTier,
  reason?: string
): Promise<boolean> {
  const supabase = await createServerSupabase();

  const { error } = await supabase
    .from('users')
    .update({ sponsor_tier: tier })
    .eq('id', sponsorId);

  if (error) {
    console.error('Error updating sponsor tier:', error);
    return false;
  }

  // Log tier change
  await supabase.from('notification_logs').insert({
    sponsor_id: sponsorId,
    notification_type: 'tier_change',
    event_type: 'profile_update',
    metadata: { new_tier: tier, reason },
  });

  return true;
}

/**
 * Get sponsor preferences
 */
export async function getSponsorPreferences(sponsorId: string): Promise<any> {
  const supabase = await createServerSupabase();

  const { data } = await supabase
    .from('sponsor_preferences')
    .select('*')
    .eq('sponsor_id', sponsorId)
    .single();

  // Return defaults if no preferences exist
  if (!data) {
    const tier = await getSponsorTier(sponsorId);
    const config = getTierConfig(tier);
    return {
      email_frequency: config.defaultFrequency,
      notification_preferences: {},
      student_filters: {},
      unsubscribed_from: [],
      contact_preferences: { email: true },
    };
  }

  return data;
}

/**
 * Update sponsor preferences
 */
export async function updateSponsorPreferences(
  sponsorId: string,
  preferences: Partial<any>
): Promise<boolean> {
  const supabase = await createServerSupabase();

  // Check if preferences exist
  const { data: existing } = await supabase
    .from('sponsor_preferences')
    .select('id')
    .eq('sponsor_id', sponsorId)
    .single();

  if (existing) {
    const { error } = await supabase
      .from('sponsor_preferences')
      .update({ ...preferences, updated_at: new Date().toISOString() })
      .eq('sponsor_id', sponsorId);
    return !error;
  } else {
    const { error } = await supabase
      .from('sponsor_preferences')
      .insert({ sponsor_id: sponsorId, ...preferences });
    return !error;
  }
}

/**
 * Get notification frequency for a specific event type
 */
export async function getNotificationFrequency(
  sponsorId: string,
  eventType: EventType
): Promise<NotificationFrequency> {
  const prefs = await getSponsorPreferences(sponsorId);
  
  // Check if sponsor has unsubscribed from this event type
  if (prefs.unsubscribed_from?.includes(eventType)) {
    return 'never';
  }

  // Check for event-specific preference
  if (prefs.notification_preferences?.[eventType]) {
    return prefs.notification_preferences[eventType];
  }

  // Fall back to global frequency preference
  if (prefs.email_frequency) {
    return prefs.email_frequency;
  }

  // Fall back to tier default
  const tier = await getSponsorTier(sponsorId);
  return getTierConfig(tier).defaultFrequency;
}

/**
 * Check if sponsor should receive immediate notifications
 */
export async function shouldNotifyImmediately(
  sponsorId: string,
  eventType: EventType
): Promise<boolean> {
  const frequency = await getNotificationFrequency(sponsorId, eventType);
  return frequency === 'real-time';
}

/**
 * Check if notifications should be batched during surge
 */
export async function shouldBatchDuringSurge(sponsorId: string): Promise<boolean> {
  const tier = await getSponsorTier(sponsorId);
  return getTierConfig(tier).batchDuringSurge;
}

/**
 * Check if student matches sponsor's filters
 */
export async function matchesSponsorFilters(
  sponsorId: string,
  studentData: {
    major?: string;
    graduation_year?: number;
    gpa?: number;
    skills?: string[];
    preferred_industry?: string;
  }
): Promise<boolean> {
  const prefs = await getSponsorPreferences(sponsorId);
  const filters = prefs.student_filters || {};

  // If no filters set, match all
  if (Object.keys(filters).length === 0) {
    return true;
  }

  // Check major filter
  if (filters.majors?.length > 0 && studentData.major) {
    if (!filters.majors.includes(studentData.major)) {
      return false;
    }
  }

  // Check graduation year filter
  if (filters.graduation_years?.length > 0 && studentData.graduation_year) {
    if (!filters.graduation_years.includes(studentData.graduation_year)) {
      return false;
    }
  }

  // Check GPA filter
  if (filters.min_gpa && studentData.gpa) {
    if (studentData.gpa < filters.min_gpa) {
      return false;
    }
  }

  // Check skills filter (any match)
  if (filters.skills?.length > 0 && studentData.skills?.length) {
    const hasMatchingSkill = studentData.skills.some((skill: string) => 
      filters.skills.includes(skill)
    );
    if (!hasMatchingSkill) {
      return false;
    }
  }

  // Check industry filter
  if (filters.industries?.length > 0 && studentData.preferred_industry) {
    if (!filters.industries.includes(studentData.preferred_industry)) {
      return false;
    }
  }

  return true;
}

/**
 * Get sponsor engagement stats
 */
export async function getSponsorEngagementStats(sponsorId: string): Promise<any> {
  const supabase = await createServerSupabase();

  const { data } = await supabase
    .from('sponsor_engagement_stats')
    .select('*')
    .eq('sponsor_id', sponsorId)
    .single();

  return data || {
    notifications_sent: 0,
    notifications_opened: 0,
    resumes_viewed: 0,
    resumes_downloaded: 0,
    students_contacted: 0,
    last_login: null,
  };
}

/**
 * Check if sponsor can access a specific feature
 */
export async function canAccessFeature(
  sponsorId: string,
  feature: string
): Promise<boolean> {
  const tier = await getSponsorTier(sponsorId);
  const config = getTierConfig(tier);
  return config.features.includes(feature);
}

/**
 * Check tier limits
 */
export async function checkLimit(
  sponsorId: string,
  limitType: 'student_filters' | 'saved_searches' | 'monthly_exports',
  currentCount: number
): Promise<{ allowed: boolean; limit: number; remaining: number }> {
  const tier = await getSponsorTier(sponsorId);
  const config = getTierConfig(tier);

  let limit: number;
  switch (limitType) {
    case 'student_filters':
      limit = config.maxFilters;
      break;
    case 'saved_searches':
      limit = config.maxSavedSearches;
      break;
    case 'monthly_exports':
      limit = config.maxMonthlyExports;
      break;
    default:
      limit = 0;
  }

  // -1 means unlimited
  if (limit === -1) {
    return { allowed: true, limit: -1, remaining: -1 };
  }

  return {
    allowed: currentCount < limit,
    limit,
    remaining: Math.max(0, limit - currentCount),
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
): Promise<boolean> {
  const currentTier = await getSponsorTier(sponsorId);
  
  if (currentTier === newTier) {
    return true; // No change needed
  }

  const success = await updateSponsorTier(sponsorId, newTier, reason);
  
  if (success) {
    // Log the tier change for history
    const supabase = await createServerSupabase();
    await supabase.from('notification_logs').insert({
      sponsor_id: sponsorId,
      notification_type: 'tier_change',
      event_type: 'profile_update',
      metadata: {
        previous_tier: currentTier,
        new_tier: newTier,
        reason,
        changed_by: changedBy,
      },
    });
  }

  return success;
}

/**
 * Get tier change history
 */
export async function getTierHistory(sponsorId: string): Promise<any[]> {
  const supabase = await createServerSupabase();

  const { data } = await supabase
    .from('notification_logs')
    .select('*')
    .eq('sponsor_id', sponsorId)
    .eq('notification_type', 'tier_change')
    .order('sent_at', { ascending: false })
    .limit(10);

  return data || [];
}
