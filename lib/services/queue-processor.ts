import { createAdminSupabase } from '@/lib/supabase/server';
import { sendTemplateEmail } from './email-service';
import type { CommunicationQueue, CommunicationTemplate, SurgeModeConfig } from '@/lib/types/communications';

// ============================================================================
// QUEUE PROCESSING
// ============================================================================

export interface ProcessQueueOptions {
  batchSize?: number;
  respectSurgeMode?: boolean;
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
 * Check if we're in a registration surge
 */
async function isInSurge(): Promise<boolean> {
  const config = await getSurgeModeConfig();
  if (!config || !config.is_active) return false;

  const supabase = createAdminSupabase();
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

  // Count registrations in the last hour
  const { count } = await supabase
    .from('event_registrations')
    .select('*', { count: 'exact', head: true })
    .gte('registered_at', oneHourAgo);

  return (count || 0) >= config.threshold_registrations_per_hour;
}

/**
 * Check if recipient has exceeded daily email limit
 */
async function hasExceededDailyLimit(
  recipientId: string,
  maxPerDay: number
): Promise<boolean> {
  const supabase = createAdminSupabase();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { count } = await supabase
    .from('communication_logs')
    .select('*', { count: 'exact', head: true })
    .eq('recipient_id', recipientId)
    .eq('status', 'sent')
    .gte('sent_at', today.toISOString());

  return (count || 0) >= maxPerDay;
}

/**
 * Process pending queue items
 */
export async function processPendingQueue(
  options: ProcessQueueOptions = {}
): Promise<{
  processed: number;
  succeeded: number;
  failed: number;
  skipped: number;
}> {
  const supabase = createAdminSupabase();
  const batchSize = options.batchSize || 50;
  const respectSurgeMode = options.respectSurgeMode !== false;

  const results = {
    processed: 0,
    succeeded: 0,
    failed: 0,
    skipped: 0,
  };

  // Get surge mode config
  const surgeConfig = respectSurgeMode ? await getSurgeModeConfig() : null;
  const inSurge = respectSurgeMode && surgeConfig?.is_active
    ? await isInSurge()
    : false;

  // Get pending items
  const { data: queueItems } = await supabase
    .from('communication_queue')
    .select('*, communication_templates(*), users(id, email)')
    .eq('status', 'pending')
    .lte('scheduled_for', new Date().toISOString())
    .order('priority', { ascending: false })
    .order('scheduled_for', { ascending: true })
    .limit(batchSize);

  if (!queueItems || queueItems.length === 0) {
    return results;
  }

  // Process items
  for (const item of queueItems) {
    try {
      // Mark as processing
      await supabase
        .from('communication_queue')
        .update({ status: 'processing' })
        .eq('id', item.id);

      results.processed++;

      // Check daily limit if in surge mode
      if (inSurge && surgeConfig) {
        const exceeded = await hasExceededDailyLimit(
          item.recipient_id,
          surgeConfig.max_emails_per_recipient_per_day
        );

        if (exceeded) {
          // Reschedule for next day
          const nextDay = new Date();
          nextDay.setDate(nextDay.getDate() + 1);
          nextDay.setHours(9, 0, 0, 0); // 9 AM next day

          await supabase
            .from('communication_queue')
            .update({
              status: 'pending',
              scheduled_for: nextDay.toISOString(),
            })
            .eq('id', item.id);

          results.skipped++;
          continue;
        }
      }

      // Get template
      const template = item.communication_templates as CommunicationTemplate;
      if (!template) {
        throw new Error('Template not found');
      }

      // Get recipient email
      const user = item.users as { id: string; email: string } | null;
      if (!user || !user.email) {
        throw new Error('Recipient email not found');
      }

      // Send email
      const result = await sendTemplateEmail({
        template,
        recipientId: item.recipient_id,
        recipientEmail: user.email,
        variables: (item.metadata as Record<string, unknown>) || {},
        scheduleId: undefined, // Could be added to queue items
        metadata: {
          queue_id: item.id,
          ...(item.metadata as Record<string, unknown>),
        },
      });

      if (result.success) {
        // Mark as sent
        await supabase
          .from('communication_queue')
          .update({ status: 'sent' })
          .eq('id', item.id);

        results.succeeded++;
      } else {
        // Mark as failed
        await supabase
          .from('communication_queue')
          .update({
            status: 'failed',
            metadata: {
              ...(item.metadata as Record<string, unknown>),
              error: result.error,
            },
          })
          .eq('id', item.id);

        results.failed++;
      }
    } catch (error: any) {
      console.error(`Error processing queue item ${item.id}:`, error);

      // Mark as failed
      await supabase
        .from('communication_queue')
        .update({
          status: 'failed',
          metadata: {
            ...(item.metadata as Record<string, unknown>),
            error: error.message,
          },
        })
        .eq('id', item.id);

      results.failed++;
    }

    // If in surge mode, add delay between emails
    if (inSurge && surgeConfig) {
      const delayMs = (surgeConfig.batch_interval_hours * 60 * 60 * 1000) / batchSize;
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  return results;
}

/**
 * Process scheduled queue items (for future sends)
 */
export async function processScheduledQueue(
  options: ProcessQueueOptions = {}
): Promise<{
  processed: number;
  scheduled: number;
}> {
  const supabase = createAdminSupabase();
  const batchSize = options.batchSize || 100;

  const results = {
    processed: 0,
    scheduled: 0,
  };

  // Get items scheduled for the near future (next 5 minutes)
  const now = new Date();
  const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);

  const { data: queueItems } = await supabase
    .from('communication_queue')
    .select('*')
    .eq('status', 'pending')
    .gte('scheduled_for', now.toISOString())
    .lte('scheduled_for', fiveMinutesFromNow.toISOString())
    .order('scheduled_for', { ascending: true })
    .limit(batchSize);

  if (!queueItems || queueItems.length === 0) {
    return results;
  }

  // Process items that are ready
  for (const item of queueItems) {
    const scheduledTime = new Date(item.scheduled_for);
    if (scheduledTime <= now) {
      // Process immediately
      const processResult = await processPendingQueue({ batchSize: 1 });
      results.processed += processResult.processed;
    } else {
      results.scheduled++;
    }
  }

  return results;
}

/**
 * Retry failed items
 */
export async function retryFailedItems(
  itemIds?: string[]
): Promise<{ retried: number; succeeded: number; failed: number }> {
  const supabase = createAdminSupabase();

  const results = {
    retried: 0,
    succeeded: 0,
    failed: 0,
  };

  let query = supabase
    .from('communication_queue')
    .select('*')
    .eq('status', 'failed')
    .limit(50);

  if (itemIds && itemIds.length > 0) {
    query = query.in('id', itemIds);
  }

  const { data: failedItems } = await query;

  if (!failedItems || failedItems.length === 0) {
    return results;
  }

  // Reset status to pending
  const ids = failedItems.map((item) => item.id);
  await supabase
    .from('communication_queue')
    .update({ status: 'pending' })
    .in('id', ids);

  results.retried = failedItems.length;

  // Process them
  const processResult = await processPendingQueue({ batchSize: failedItems.length });
  results.succeeded = processResult.succeeded;
  results.failed = processResult.failed;

  return results;
}

/**
 * Clean up old queue items
 */
export async function cleanupQueue(daysOld: number = 30): Promise<{ deleted: number }> {
  const supabase = createAdminSupabase();
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);

  // Delete old sent/failed items
  const { data, error } = await supabase
    .from('communication_queue')
    .delete()
    .in('status', ['sent', 'failed', 'cancelled'])
    .lt('created_at', cutoffDate.toISOString())
    .select();
  
  const count = data?.length || 0;

  return { deleted: count || 0 };
}

