/**
 * Sponsor Tier System
 * Manages sponsor tiers, notification preferences, and feature access
 */

import { createServerSupabase } from '@/lib/supabase/server';

// ============================================================================
// TYPES & CONSTANTS
// ============================================================================

export type SponsorTier = 'basic' | 'standard' | 'premium';

export type NotificationFrequency = 'real-time' | 'batched' | 'daily' | 'weekly' | 'never';

export type EventType = 
  | 'resume_upload' 
  | 'new_student' 
  | 'profile_update' 
  | 'mission_submission'
  | 'event_registration'
  | 'mentor_request';

export interface TierConfig {
  tier: SponsorTier;
  name: string;
  features: {
    immediateNotifications: boolean;
    customFilters: boolean;
    priorityAccess: boolean;
    detailedAnalytics: boolean;
    bulkExport: boolean;
    apiAccess: boolean;
    dedicatedSupport: boolean;
  };
  notificationRules: {
    defaultFrequency: NotificationFrequency;
    batchDuringSurge: boolean;
    maxNotificationsPerDay: number;
    canCustomizeByEventType: boolean;
  };
  limits: {
    maxStudentFilters: number;
    maxSavedSearches: number;
    monthlyExports: number;
  };
}

export interface SponsorPreferences {
  id: string;
  sponsor_id: string;
  email_frequency: NotificationFrequency;
  notification_preferences: {
    [key in EventType]?: NotificationFrequency;
  };
  student_filters: {
    majors?: string[];
    graduation_years?: number[];
    min_gpa?: number;
    skills?: string[];
    industries?: string[];
  };
  unsubscribed_from?: EventType[];
  contact_preferences: {
    email: boolean;
    phone?: boolean;
    sms?: boolean;
  };
  created_at: string;
  updated_at: string;
}

// ============================================================================
// TIER CONFIGURATIONS
// ============================================================================

export const TIER_CONFIGS: Record<SponsorTier, TierConfig> = {
  basic: {
    tier: 'basic',
    name: 'Basic',
    features: {
      immediateNotifications: false,
      customFilters: false,
      priorityAccess: false,
      detailedAnalytics: false,
      bulkExport: false,
      apiAccess: false,
      dedicatedSupport: false,
    },
    notificationRules: {
      defaultFrequency: 'weekly',
      batchDuringSurge: true,
      maxNotificationsPerDay: 1,
      canCustomizeByEventType: false,
    },
    limits: {
      maxStudentFilters: 3,
      maxSavedSearches: 5,
      monthlyExports: 10,
    },
  },
  standard: {
    tier: 'standard',
    name: 'Standard',
    features: {
      immediateNotifications: false,
      customFilters: true,
      priorityAccess: false,
      detailedAnalytics: true,
      bulkExport: true,
      apiAccess: false,
      dedicatedSupport: false,
    },
    notificationRules: {
      defaultFrequency: 'batched',
      batchDuringSurge: true,
      maxNotificationsPerDay: 5,
      canCustomizeByEventType: true,
    },
    limits: {
      maxStudentFilters: 10,
      maxSavedSearches: 20,
      monthlyExports: 50,
    },
  },
  premium: {
    tier: 'premium',
    name: 'Premium',
    features: {
      immediateNotifications: true,
      customFilters: true,
      priorityAccess: true,
      detailedAnalytics: true,
      bulkExport: true,
      apiAccess: true,
      dedicatedSupport: true,
    },
    notificationRules: {
      defaultFrequency: 'real-time',
      batchDuringSurge: false,
      maxNotificationsPerDay: -1, // unlimited
      canCustomizeByEventType: true,
    },
    limits: {
      maxStudentFilters: -1, // unlimited
      maxSavedSearches: -1, // unlimited
      monthlyExports: -1, // unlimited
    },
  },
};

// ============================================================================
// TIER MANAGEMENT FUNCTIONS
// ============================================================================

/**
 * Get sponsor's current tier level
 */
export async function getSponsorTier(userId: string): Promise<SponsorTier> {
  const supabase = await createServerSupabase();
  
  const { data, error } = await supabase
    .from('users')
    .select('sponsor_tier')
    .eq('id', userId)
    .single();

  if (error || !data) {
    console.error('Error fetching sponsor tier:', error);
    return 'basic'; // Default to basic tier
  }

  return (data.sponsor_tier as SponsorTier) || 'basic';
}

/**
 * Update sponsor's tier level
 */
export async function updateSponsorTier(
  userId: string,
  tier: SponsorTier
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createServerSupabase();

  const { error } = await supabase
    .from('users')
    .update({ 
      sponsor_tier: tier,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId);

  if (error) {
    console.error('Error updating sponsor tier:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Get tier configuration for a specific tier level
 */
export function getTierConfig(tier: SponsorTier): TierConfig {
  return TIER_CONFIGS[tier];
}

/**
 * Get tier configuration for a sponsor by user ID
 */
export async function getSponsorTierConfig(userId: string): Promise<TierConfig> {
  const tier = await getSponsorTier(userId);
  return getTierConfig(tier);
}

// ============================================================================
// NOTIFICATION PREFERENCES
// ============================================================================

/**
 * Get sponsor's notification preferences
 */
export async function getSponsorPreferences(
  sponsorId: string
): Promise<SponsorPreferences | null> {
  const supabase = await createServerSupabase();

  const { data, error } = await supabase
    .from('sponsor_preferences')
    .select('*')
    .eq('sponsor_id', sponsorId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // No preferences found, return null
      return null;
    }
    console.error('Error fetching sponsor preferences:', error);
    return null;
  }

  return data as SponsorPreferences;
}

/**
 * Create or update sponsor preferences
 */
export async function updateSponsorPreferences(
  sponsorId: string,
  preferences: Partial<Omit<SponsorPreferences, 'id' | 'sponsor_id' | 'created_at' | 'updated_at'>>
): Promise<{ success: boolean; error?: string; data?: SponsorPreferences }> {
  const supabase = await createServerSupabase();

  // Check if preferences exist
  const existing = await getSponsorPreferences(sponsorId);

  if (existing) {
    // Update existing preferences
    const { data, error } = await supabase
      .from('sponsor_preferences')
      .update({
        ...preferences,
        updated_at: new Date().toISOString(),
      })
      .eq('sponsor_id', sponsorId)
      .select()
      .single();

    if (error) {
      console.error('Error updating sponsor preferences:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data: data as SponsorPreferences };
  } else {
    // Create new preferences
    const { data, error } = await supabase
      .from('sponsor_preferences')
      .insert({
        sponsor_id: sponsorId,
        ...preferences,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating sponsor preferences:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data: data as SponsorPreferences };
  }
}

/**
 * Determine if a sponsor should receive an immediate notification
 */
export async function shouldNotifyImmediately(
  sponsorId: string,
  eventType: EventType
): Promise<boolean> {
  // Get sponsor tier and preferences
  const [tier, preferences] = await Promise.all([
    getSponsorTier(sponsorId),
    getSponsorPreferences(sponsorId),
  ]);

  const tierConfig = getTierConfig(tier);

  // Check if sponsor has unsubscribed from this event type
  if (preferences?.unsubscribed_from?.includes(eventType)) {
    return false;
  }

  // Check tier-specific notification rules
  if (!tierConfig.features.immediateNotifications) {
    return false;
  }

  // Check event-specific preferences if available
  if (preferences?.notification_preferences?.[eventType]) {
    return preferences.notification_preferences[eventType] === 'real-time';
  }

  // Fall back to tier default
  return tierConfig.notificationRules.defaultFrequency === 'real-time';
}

/**
 * Get notification frequency for a sponsor and event type
 */
export async function getNotificationFrequency(
  sponsorId: string,
  eventType: EventType
): Promise<NotificationFrequency> {
  const [tier, preferences] = await Promise.all([
    getSponsorTier(sponsorId),
    getSponsorPreferences(sponsorId),
  ]);

  const tierConfig = getTierConfig(tier);

  // Check if sponsor has unsubscribed
  if (preferences?.unsubscribed_from?.includes(eventType)) {
    return 'never';
  }

  // Check event-specific preferences
  if (preferences?.notification_preferences?.[eventType]) {
    return preferences.notification_preferences[eventType];
  }

  // Check global email frequency preference
  if (preferences?.email_frequency) {
    return preferences.email_frequency;
  }

  // Fall back to tier default
  return tierConfig.notificationRules.defaultFrequency;
}

/**
 * Check if notifications should be batched during surge periods
 */
export async function shouldBatchDuringSurge(
  sponsorId: string
): Promise<boolean> {
  const tier = await getSponsorTier(sponsorId);
  const tierConfig = getTierConfig(tier);
  return tierConfig.notificationRules.batchDuringSurge;
}

// ============================================================================
// FEATURE ACCESS CONTROL
// ============================================================================

export type SponsorFeature = 
  | 'immediate_notifications'
  | 'custom_filters'
  | 'priority_access'
  | 'detailed_analytics'
  | 'bulk_export'
  | 'api_access'
  | 'dedicated_support';

/**
 * Check if sponsor can access a specific feature
 */
export async function canAccessFeature(
  sponsorId: string,
  feature: SponsorFeature
): Promise<boolean> {
  const tier = await getSponsorTier(sponsorId);
  const tierConfig = getTierConfig(tier);

  const featureMap: Record<SponsorFeature, keyof TierConfig['features']> = {
    immediate_notifications: 'immediateNotifications',
    custom_filters: 'customFilters',
    priority_access: 'priorityAccess',
    detailed_analytics: 'detailedAnalytics',
    bulk_export: 'bulkExport',
    api_access: 'apiAccess',
    dedicated_support: 'dedicatedSupport',
  };

  const configKey = featureMap[feature];
  return tierConfig.features[configKey];
}

/**
 * Check if sponsor has reached a limit
 */
export async function checkLimit(
  sponsorId: string,
  limitType: 'student_filters' | 'saved_searches' | 'monthly_exports',
  currentCount: number
): Promise<{ allowed: boolean; limit: number }> {
  const tier = await getSponsorTier(sponsorId);
  const tierConfig = getTierConfig(tier);

  const limitMap = {
    student_filters: tierConfig.limits.maxStudentFilters,
    saved_searches: tierConfig.limits.maxSavedSearches,
    monthly_exports: tierConfig.limits.monthlyExports,
  };

  const limit = limitMap[limitType];
  
  // -1 means unlimited
  if (limit === -1) {
    return { allowed: true, limit: -1 };
  }

  return { allowed: currentCount < limit, limit };
}

// ============================================================================
// SPONSOR FILTERS
// ============================================================================

/**
 * Check if a student matches sponsor's filter preferences
 */
export async function matchesSponsorFilters(
  sponsorId: string,
  student: {
    major?: string;
    graduation_year?: number;
    gpa?: number;
    skills?: string[];
    preferred_industry?: string;
  }
): Promise<boolean> {
  const preferences = await getSponsorPreferences(sponsorId);
  
  if (!preferences?.student_filters) {
    return true; // No filters, all students match
  }

  const filters = preferences.student_filters;

  // Check major filter
  if (filters.majors && filters.majors.length > 0) {
    if (!student.major || !filters.majors.includes(student.major)) {
      return false;
    }
  }

  // Check graduation year filter
  if (filters.graduation_years && filters.graduation_years.length > 0) {
    if (!student.graduation_year || !filters.graduation_years.includes(student.graduation_year)) {
      return false;
    }
  }

  // Check minimum GPA filter
  if (filters.min_gpa && student.gpa) {
    if (student.gpa < filters.min_gpa) {
      return false;
    }
  }

  // Check skills filter (student must have at least one matching skill)
  if (filters.skills && filters.skills.length > 0) {
    if (!student.skills || student.skills.length === 0) {
      return false;
    }
    const hasMatchingSkill = filters.skills.some(skill =>
      student.skills!.some(s => s.toLowerCase().includes(skill.toLowerCase()))
    );
    if (!hasMatchingSkill) {
      return false;
    }
  }

  // Check industry filter
  if (filters.industries && filters.industries.length > 0) {
    if (!student.preferred_industry || !filters.industries.includes(student.preferred_industry)) {
      return false;
    }
  }

  return true; // All filters passed
}

// ============================================================================
// ANALYTICS & REPORTING
// ============================================================================

/**
 * Get sponsor engagement stats
 */
export async function getSponsorEngagementStats(sponsorId: string): Promise<{
  tier: SponsorTier;
  notifications_sent: number;
  notifications_opened: number;
  notifications_clicked: number;
  resumes_viewed: number;
  students_contacted: number;
  last_login: string | null;
  member_since: string;
}> {
  const supabase = await createServerSupabase();

  // Get sponsor data
  const { data: sponsor } = await supabase
    .from('users')
    .select('sponsor_tier, created_at, metadata')
    .eq('id', sponsorId)
    .single();

  // Get notification stats (would need notification_logs table)
  // For now, returning mock data structure
  return {
    tier: (sponsor?.sponsor_tier as SponsorTier) || 'basic',
    notifications_sent: sponsor?.metadata?.notifications_sent || 0,
    notifications_opened: sponsor?.metadata?.notifications_opened || 0,
    notifications_clicked: sponsor?.metadata?.notifications_clicked || 0,
    resumes_viewed: sponsor?.metadata?.resumes_viewed || 0,
    students_contacted: sponsor?.metadata?.students_contacted || 0,
    last_login: sponsor?.metadata?.last_login || null,
    member_since: sponsor?.created_at || new Date().toISOString(),
  };
}

// ============================================================================
// TIER UPGRADE/DOWNGRADE WORKFLOWS
// ============================================================================

export interface TierChange {
  from: SponsorTier;
  to: SponsorTier;
  isUpgrade: boolean;
  date: string;
  reason?: string;
}

/**
 * Change sponsor tier with validation and logging
 */
export async function changeSponsorTier(
  sponsorId: string,
  newTier: SponsorTier,
  reason?: string,
  adminId?: string
): Promise<{ success: boolean; error?: string; change?: TierChange }> {
  const currentTier = await getSponsorTier(sponsorId);

  if (currentTier === newTier) {
    return { success: false, error: 'New tier is the same as current tier' };
  }

  // Determine if this is an upgrade or downgrade
  const tierOrder: SponsorTier[] = ['basic', 'standard', 'premium'];
  const isUpgrade = tierOrder.indexOf(newTier) > tierOrder.indexOf(currentTier);

  // Update the tier
  const updateResult = await updateSponsorTier(sponsorId, newTier);

  if (!updateResult.success) {
    return updateResult;
  }

  // Log the tier change
  const tierChange: TierChange = {
    from: currentTier,
    to: newTier,
    isUpgrade,
    date: new Date().toISOString(),
    reason,
  };

  // Store tier change in user metadata
  const supabase = await createServerSupabase();
  const { data: user } = await supabase
    .from('users')
    .select('metadata')
    .eq('id', sponsorId)
    .single();

  const tierHistory = user?.metadata?.tier_history || [];
  tierHistory.push(tierChange);

  await supabase
    .from('users')
    .update({
      metadata: {
        ...user?.metadata,
        tier_history: tierHistory,
        tier_changed_by: adminId,
        tier_changed_at: new Date().toISOString(),
      },
    })
    .eq('id', sponsorId);

  return { success: true, change: tierChange };
}

/**
 * Get tier change history for a sponsor
 */
export async function getTierHistory(sponsorId: string): Promise<TierChange[]> {
  const supabase = await createServerSupabase();

  const { data } = await supabase
    .from('users')
    .select('metadata')
    .eq('id', sponsorId)
    .single();

  return data?.metadata?.tier_history || [];
}

