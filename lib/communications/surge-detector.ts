import { createAdminSupabase } from '@/lib/supabase/server';
import type { SurgeModeConfig } from '@/lib/types/communications';

// ============================================================================
// SURGE DETECTION
// ============================================================================

export interface SurgeStatus {
  isActive: boolean;
  currentRate: number;
  threshold: number;
  batchQueueSize: number;
  recommendation?: string;
}

/**
 * Detect if we're in a registration surge
 */
export async function detectSurge(): Promise<boolean> {
  const config = await getSurgeModeConfig();
  if (!config || !config.is_active) return false;

  const currentRate = await getCurrentRegistrationRate();
  return currentRate >= config.threshold_registrations_per_hour;
}

/**
 * Get current registration rate (registrations per hour)
 */
async function getCurrentRegistrationRate(): Promise<number> {
  const supabase = createAdminSupabase();
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

  const { count } = await supabase
    .from('event_registrations')
    .select('*', { count: 'exact', head: true })
    .gte('registered_at', oneHourAgo);

  return count || 0;
}

/**
 * Get surge mode configuration
 */
async function getSurgeModeConfig(): Promise<SurgeModeConfig | null> {
  const supabase = createAdminSupabase();

  const { data } = await supabase
    .from('surge_mode_config')
    .select('*')
    .eq('is_active', true)
    .single();

  return data as SurgeModeConfig | null;
}

/**
 * Get current surge status
 */
export async function getSurgeStatus(): Promise<SurgeStatus> {
  const config = await getSurgeModeConfig();
  const currentRate = await getCurrentRegistrationRate();
  const batchQueueSize = await getBatchQueueSize();

  const status: SurgeStatus = {
    isActive: config?.is_active || false,
    currentRate,
    threshold: config?.threshold_registrations_per_hour || 10,
    batchQueueSize,
  };

  // Generate recommendation
  if (!status.isActive && currentRate >= status.threshold * 0.8) {
    status.recommendation = `Registration rate (${currentRate}/hr) is approaching threshold (${status.threshold}/hr). Consider enabling surge mode.`;
  } else if (status.isActive && currentRate < status.threshold * 0.5) {
    status.recommendation = `Registration rate (${currentRate}/hr) has dropped below threshold. Consider disabling surge mode.`;
  }

  return status;
}

/**
 * Get batch queue size
 */
async function getBatchQueueSize(): Promise<number> {
  const supabase = createAdminSupabase();

  const { count } = await supabase
    .from('communication_queue')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending')
    .gt('scheduled_for', new Date().toISOString());

  return count || 0;
}

/**
 * Calculate optimal batch interval
 */
export async function calculateBatchInterval(): Promise<number> {
  const config = await getSurgeModeConfig();
  if (!config) return 60; // Default 1 hour

  const currentRate = await getCurrentRegistrationRate();
  const threshold = config.threshold_registrations_per_hour;

  // If rate is 2x threshold, batch more aggressively
  if (currentRate >= threshold * 2) {
    return config.batch_interval_hours * 60 * 2; // Double the interval
  }

  // If rate is 1.5x threshold, use normal interval
  if (currentRate >= threshold * 1.5) {
    return config.batch_interval_hours * 60;
  }

  // Otherwise, use shorter interval
  return config.batch_interval_hours * 60 * 0.5;
}

/**
 * Decide if email should be batched
 */
export async function shouldBatch(
  emailType: string,
  recipientTier?: 'premium' | 'standard' | 'basic'
): Promise<boolean> {
  const surgeActive = await detectSurge();
  if (!surgeActive) return false;

  // Premium sponsors always get immediate (unless extreme surge)
  if (recipientTier === 'premium') {
    const currentRate = await getCurrentRegistrationRate();
    const config = await getSurgeModeConfig();
    const threshold = config?.threshold_registrations_per_hour || 10;

    // Only batch premium if rate is 3x threshold
    return currentRate >= threshold * 3;
  }

  // Standard and basic get batched during surge
  return true;
}

/**
 * Get max emails per recipient per day
 */
export async function getMaxEmailsPerDay(): Promise<number> {
  const config = await getSurgeModeConfig();
  return config?.max_emails_per_recipient_per_day || 5;
}


