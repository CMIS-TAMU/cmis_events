import { createAdminSupabase } from '@/lib/supabase/server';
import type { CommunicationQueue, CommunicationTemplate } from '@/lib/types/communications';

// ============================================================================
// TYPES
// ============================================================================

export interface QueueItem {
  template_id: string;
  recipient_id: string;
  scheduled_for: string;
  priority: number;
  metadata?: Record<string, unknown>;
}

export interface QueueStatus {
  pending: number;
  processing: number;
  sent: number;
  failed: number;
  total: number;
}

// ============================================================================
// QUEUE MANAGER
// ============================================================================

export class QueueManager {
  /**
   * Add item to queue
   */
  async addToQueue(
    template: CommunicationTemplate | string,
    recipientId: string,
    scheduledFor: Date | string,
    priority: number = 0,
    metadata?: Record<string, unknown>
  ): Promise<CommunicationQueue> {
    const supabase = createAdminSupabase();

    const templateId = typeof template === 'string' ? template : template.id;

    const { data, error } = await supabase
      .from('communication_queue')
      .insert({
        template_id: templateId,
        recipient_id: recipientId,
        scheduled_for:
          typeof scheduledFor === 'string'
            ? scheduledFor
            : scheduledFor.toISOString(),
        priority,
        status: 'pending',
        metadata: metadata || {},
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to add to queue: ${error.message}`);
    }

    return data as CommunicationQueue;
  }

  /**
   * Batch add multiple items to queue
   */
  async batchAddToQueue(
    items: Array<{
      template: CommunicationTemplate | string;
      recipient_id: string;
      scheduled_for: Date | string;
      priority?: number;
      metadata?: Record<string, unknown>;
    }>
  ): Promise<CommunicationQueue[]> {
    const supabase = createAdminSupabase();

    const queueItems = items.map((item) => ({
      template_id:
        typeof item.template === 'string' ? item.template : item.template.id,
      recipient_id: item.recipient_id,
      scheduled_for:
        typeof item.scheduled_for === 'string'
          ? item.scheduled_for
          : item.scheduled_for.toISOString(),
      priority: item.priority || 0,
      status: 'pending' as const,
      metadata: item.metadata || {},
    }));

    const { data, error } = await supabase
      .from('communication_queue')
      .insert(queueItems)
      .select();

    if (error) {
      throw new Error(`Failed to batch add to queue: ${error.message}`);
    }

    return (data || []) as CommunicationQueue[];
  }

  /**
   * Intelligently batch emails during surge periods
   */
  async batchEmails(
    recipients: string[],
    template: CommunicationTemplate | string,
    options: {
      batchSize?: number;
      staggerMinutes?: number;
      startTime?: Date;
    } = {}
  ): Promise<CommunicationQueue[]> {
    const batchSize = options.batchSize || 50;
    const staggerMinutes = options.staggerMinutes || 5;
    const startTime = options.startTime || new Date();

    const items: Array<{
      template: CommunicationTemplate | string;
      recipient_id: string;
      scheduled_for: Date;
      priority: number;
    }> = [];

    // Distribute recipients across batches
    for (let i = 0; i < recipients.length; i++) {
      const batchNumber = Math.floor(i / batchSize);
      const scheduledTime = new Date(
        startTime.getTime() + batchNumber * staggerMinutes * 60 * 1000
      );

      items.push({
        template,
        recipient_id: recipients[i]!,
        scheduled_for: scheduledTime,
        priority: 3, // Medium priority for batched emails
      });
    }

    return this.batchAddToQueue(items);
  }

  /**
   * Prioritize queue - sort by priority and scheduled time
   */
  async prioritizeQueue(): Promise<CommunicationQueue[]> {
    const supabase = createAdminSupabase();

    const { data, error } = await supabase
      .from('communication_queue')
      .select('*')
      .eq('status', 'pending')
      .order('priority', { ascending: false })
      .order('scheduled_for', { ascending: true });

    if (error) {
      throw new Error(`Failed to prioritize queue: ${error.message}`);
    }

    return (data || []) as CommunicationQueue[];
  }

  /**
   * Get queue status statistics
   */
  async getQueueStatus(): Promise<QueueStatus> {
    const supabase = createAdminSupabase();

    const { data, error } = await supabase
      .from('communication_queue')
      .select('status');

    if (error) {
      throw new Error(`Failed to get queue status: ${error.message}`);
    }

    const status: QueueStatus = {
      pending: 0,
      processing: 0,
      sent: 0,
      failed: 0,
      total: data?.length || 0,
    };

    data?.forEach((item) => {
      const itemStatus = item.status as keyof QueueStatus;
      if (itemStatus in status) {
        status[itemStatus]++;
      }
    });

    return status;
  }

  /**
   * Get pending items ready to send
   */
  async getPendingItems(limit: number = 100): Promise<CommunicationQueue[]> {
    const supabase = createAdminSupabase();
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from('communication_queue')
      .select('*')
      .eq('status', 'pending')
      .lte('scheduled_for', now)
      .order('priority', { ascending: false })
      .order('scheduled_for', { ascending: true })
      .limit(limit);

    if (error) {
      throw new Error(`Failed to get pending items: ${error.message}`);
    }

    return (data || []) as CommunicationQueue[];
  }

  /**
   * Mark item as processing
   */
  async markProcessing(queueId: string): Promise<void> {
    const supabase = createAdminSupabase();

    await supabase
      .from('communication_queue')
      .update({ status: 'processing' })
      .eq('id', queueId);
  }

  /**
   * Mark item as sent
   */
  async markSent(queueId: string): Promise<void> {
    const supabase = createAdminSupabase();

    await supabase
      .from('communication_queue')
      .update({ status: 'sent' })
      .eq('id', queueId);
  }

  /**
   * Mark item as failed
   */
  async markFailed(
    queueId: string,
    errorMessage?: string
  ): Promise<void> {
    const supabase = createAdminSupabase();

    const updateData: any = { status: 'failed' };
    if (errorMessage) {
      const { data: existing } = await supabase
        .from('communication_queue')
        .select('metadata')
        .eq('id', queueId)
        .single();

      updateData.metadata = {
        ...(existing?.metadata as Record<string, unknown>),
        error: errorMessage,
      };
    }

    await supabase.from('communication_queue').update(updateData).eq('id', queueId);
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

export const queueManager = new QueueManager();


