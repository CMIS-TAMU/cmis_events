import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Use service role key for server-side operations
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export interface QueueEmailParams {
  templateId: string;
  recipientId: string;
  scheduledFor?: Date;
  priority?: number;
  metadata?: Record<string, any>;
}

/**
 * Queue an email for sending
 * If scheduledFor is not provided, assigns a random time within the next hour
 */
export async function queueEmail({
  templateId,
  recipientId,
  scheduledFor,
  priority = 0,
  metadata = {},
}: QueueEmailParams): Promise<{ success: boolean; queueId?: string; error?: string }> {
  try {
    console.log(`[queueEmail] Queueing email for recipient: ${recipientId}, template: ${templateId}`);
    
    // Check user preferences
    const { data: preferences, error: prefError } = await supabase
      .from('communication_preferences')
      .select('email_enabled, unsubscribe_categories')
      .eq('user_id', recipientId)
      .single();
    
    if (prefError && prefError.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error(`[queueEmail] Error checking preferences:`, prefError);
    }

    // If user has disabled emails, don't queue
    if (preferences && preferences.email_enabled === false) {
      console.log(`[queueEmail] User ${recipientId} has disabled emails`);
      return { success: false, error: 'User has disabled email notifications' };
    }

    // Calculate scheduled time
    let scheduledTime: Date;
    if (scheduledFor) {
      scheduledTime = scheduledFor;
    } else {
      // Randomize send time within next hour (to avoid spam filters)
      const now = new Date();
      const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
      const randomMinutes = Math.floor(Math.random() * 60);
      scheduledTime = new Date(now.getTime() + randomMinutes * 60 * 1000);
    }

    console.log(`[queueEmail] Inserting into queue: scheduled_for=${scheduledTime.toISOString()}, priority=${priority}`);

    // Insert into queue
    const { data, error } = await supabase
      .from('communication_queue')
      .insert({
        template_id: templateId,
        recipient_id: recipientId,
        scheduled_for: scheduledTime.toISOString(),
        status: 'pending',
        priority,
        metadata,
      })
      .select('id')
      .single();

    if (error) {
      console.error('[queueEmail] ❌ Error inserting into queue:', error);
      console.error('[queueEmail] Error details:', JSON.stringify(error, null, 2));
      return { success: false, error: error.message };
    }

    console.log(`[queueEmail] ✅ Successfully queued email with queueId: ${data.id}`);
    return { success: true, queueId: data.id };
  } catch (error: any) {
    console.error('Error in queueEmail:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Queue multiple emails with randomized send times
 * Spreads emails over a time window (default: 8-11 AM)
 */
export async function queueBulkEmails(
  templateId: string,
  recipientIds: string[],
  options: {
    sendWindowStart?: number; // Hour of day (0-23)
    sendWindowEnd?: number;
    spreadMinutes?: number; // How many minutes to spread sends over
    priority?: number;
    metadata?: Record<string, any>;
  } = {}
): Promise<{ success: number; failed: number; errors: string[] }> {
  const {
    sendWindowStart = 8,
    sendWindowEnd = 11,
    spreadMinutes = 180, // 3 hours
    priority = 0,
    metadata = {},
  } = options;

  let success = 0;
  let failed = 0;
  const errors: string[] = [];

  // Filter out users who have disabled emails
  const { data: preferences } = await supabase
    .from('communication_preferences')
    .select('user_id')
    .in('user_id', recipientIds)
    .eq('email_enabled', true);

  const enabledUserIds = preferences?.map((p) => p.user_id) || [];
  const filteredRecipients = recipientIds.filter((id) => enabledUserIds.includes(id));

  // Calculate base time (next occurrence of send window)
  const now = new Date();
  let baseTime = new Date(now);
  baseTime.setHours(sendWindowStart, 0, 0, 0);

  // If we've passed the send window today, use tomorrow
  if (now.getHours() >= sendWindowEnd) {
    baseTime.setDate(baseTime.getDate() + 1);
  }

  // Queue each email with randomized time
  for (let i = 0; i < filteredRecipients.length; i++) {
    const recipientId = filteredRecipients[i];
    
    // Randomize time within window
    const randomMinutes = Math.floor(Math.random() * spreadMinutes);
    const scheduledTime = new Date(baseTime.getTime() + randomMinutes * 60 * 1000);

    const result = await queueEmail({
      templateId,
      recipientId,
      scheduledFor: scheduledTime,
      priority,
      metadata: {
        ...metadata,
        bulkIndex: i,
        totalRecipients: filteredRecipients.length,
      },
    });

    if (result.success) {
      success++;
    } else {
      failed++;
      errors.push(`${recipientId}: ${result.error}`);
    }
  }

  return { success, failed, errors };
}

/**
 * Get eligible recipients for an event notification
 * Returns users with email enabled who match the event criteria
 */
export async function getEligibleRecipients(
  eventId: string,
  roles?: string[]
): Promise<string[]> {
  try {
    // Get event details (optional, for future filtering)
    const { data: event } = await supabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single();

    if (!event) {
      return [];
    }

    // Get users with email enabled
    const { data: preferences } = await supabase
      .from('communication_preferences')
      .select('user_id')
      .eq('email_enabled', true);

    const enabledUserIds = preferences?.map((p) => p.user_id) || [];

    if (enabledUserIds.length === 0) {
      return [];
    }

    // Build query for eligible users
    let query = supabase
      .from('users')
      .select('id')
      .in('id', enabledUserIds);

    // Filter by roles if provided
    if (roles && roles.length > 0) {
      query = query.in('role', roles);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error getting eligible recipients:', error);
      return [];
    }

    return data?.map((u) => u.id) || [];
  } catch (error: any) {
    console.error('Error in getEligibleRecipients:', error);
    return [];
  }
}

/**
 * Get users by role with email enabled
 * If users don't have preferences, creates them with email_enabled = true
 */
export async function getUsersByRole(
  roles: string[]
): Promise<Array<{ id: string; email: string; full_name: string; role: string }>> {
  try {
    // First, get all users with the specified roles
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email, full_name, role')
      .in('role', roles);

    if (usersError) {
      console.error('Error getting users by role:', usersError);
      return [];
    }

    if (!users || users.length === 0) {
      console.log('No users found with roles:', roles);
      return [];
    }

    // Ensure all users have email preferences enabled
    for (const user of users) {
      // Check if preference exists
      const { data: existingPref } = await supabase
        .from('communication_preferences')
        .select('email_enabled')
        .eq('user_id', user.id)
        .single();

      if (!existingPref) {
        // Create preference with email enabled by default
        await supabase
          .from('communication_preferences')
          .insert({
            user_id: user.id,
            email_enabled: true,
            sms_enabled: false,
            unsubscribe_categories: [],
          });
        console.log(`Created email preferences for user: ${user.email}`);
      } else if (existingPref.email_enabled === false) {
        // Update to enable if disabled
        await supabase
          .from('communication_preferences')
          .update({ email_enabled: true })
          .eq('user_id', user.id);
        console.log(`Enabled email preferences for user: ${user.email}`);
      }
    }

    // Return all users (now guaranteed to have email enabled)
    return users;
  } catch (error: any) {
    console.error('Error in getUsersByRole:', error);
    return [];
  }
}

