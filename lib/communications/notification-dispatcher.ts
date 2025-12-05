/**
 * Notification Dispatcher
 * Handles tier-based notification routing and batching
 */

import { createServerSupabase } from '@/lib/supabase/server';
import {
  getSponsorTier,
  getNotificationFrequency,
  shouldNotifyImmediately,
  shouldBatchDuringSurge,
  matchesSponsorFilters,
  type EventType,
  type NotificationFrequency,
} from './sponsor-tiers';

// ============================================================================
// TYPES
// ============================================================================

export interface NotificationPayload {
  eventType: EventType;
  eventData: Record<string, any>;
  studentData?: {
    major?: string;
    graduation_year?: number;
    gpa?: number;
    skills?: string[];
    preferred_industry?: string;
  };
}

export interface NotificationResult {
  sent: number;
  queued: number;
  filtered: number;
  errors: number;
}

// ============================================================================
// SURGE DETECTION
// ============================================================================

/**
 * Detect if we're currently in a surge period
 * (high volume of notifications being sent)
 */
async function isSurgePeriod(): Promise<boolean> {
  const supabase = await createServerSupabase();
  
  // Check notifications sent in last hour
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  
  const { count } = await supabase
    .from('notification_logs')
    .select('id', { count: 'exact', head: true })
    .gte('sent_at', oneHourAgo.toISOString());

  // Consider it a surge if more than 100 notifications in last hour
  return (count || 0) > 100;
}

// ============================================================================
// NOTIFICATION SCHEDULING
// ============================================================================

/**
 * Calculate when to send a notification based on frequency
 */
function calculateScheduledTime(frequency: NotificationFrequency): Date {
  const now = new Date();
  
  switch (frequency) {
    case 'real-time':
      return now; // Send immediately
      
    case 'batched':
      // Send at next 4-hour interval (00:00, 04:00, 08:00, 12:00, 16:00, 20:00)
      const hours = now.getHours();
      const nextBatch = Math.ceil(hours / 4) * 4;
      const scheduled = new Date(now);
      scheduled.setHours(nextBatch, 0, 0, 0);
      return scheduled;
      
    case 'daily':
      // Send at 9 AM next day (or today if before 9 AM)
      const daily = new Date(now);
      daily.setHours(9, 0, 0, 0);
      if (daily <= now) {
        daily.setDate(daily.getDate() + 1);
      }
      return daily;
      
    case 'weekly':
      // Send on Monday at 9 AM
      const weekly = new Date(now);
      weekly.setHours(9, 0, 0, 0);
      const daysUntilMonday = (8 - weekly.getDay()) % 7 || 7;
      weekly.setDate(weekly.getDate() + daysUntilMonday);
      return weekly;
      
    case 'never':
    default:
      // Schedule far in the future (will be cancelled)
      const never = new Date(now);
      never.setFullYear(never.getFullYear() + 10);
      return never;
  }
}

/**
 * Queue a notification for later delivery
 */
async function queueNotification(
  sponsorId: string,
  payload: NotificationPayload,
  frequency: NotificationFrequency
): Promise<void> {
  const supabase = await createServerSupabase();
  
  const scheduledFor = calculateScheduledTime(frequency);
  
  await supabase
    .from('notification_queue')
    .insert({
      sponsor_id: sponsorId,
      event_type: payload.eventType,
      event_data: payload.eventData,
      notification_frequency: frequency,
      scheduled_for: scheduledFor.toISOString(),
      status: 'pending',
    });
}

/**
 * Send notification immediately
 */
async function sendNotificationNow(
  sponsorId: string,
  sponsorEmail: string,
  payload: NotificationPayload
): Promise<boolean> {
  try {
    // Get user details including role
    const supabase = await createServerSupabase();
    const { data: user } = await supabase
      .from('users')
      .select('full_name, email, role')
      .eq('id', sponsorId)
      .single();

    if (!user) {
      console.error(`User not found: ${sponsorId}`);
      return false;
    }

    // Build email based on event type and user role
    const emailData = buildEmailData(user, payload);
    
    // Send email via API route
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const response = await fetch(`${appUrl}/api/email/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(emailData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Email API returned error: ${response.status} - ${errorText}`);
      return false;
    }

    const result = await response.json();
    
    // Log the notification (only for sponsors)
    if (user.role === 'sponsor') {
      await supabase
        .from('notification_logs')
        .insert({
          sponsor_id: sponsorId,
          notification_type: 'email',
          event_type: payload.eventType,
          email_subject: emailData.subject,
          email_to: sponsorEmail,
          delivery_status: result.success ? 'sent' : 'failed',
          metadata: {
            event_data: payload.eventData,
          },
        });
    }

    // Update engagement stats (only for sponsors)
    if (user.role === 'sponsor') {
      await supabase.rpc('increment_sponsor_stat', {
        p_sponsor_id: sponsorId,
        p_stat_name: 'notifications_sent',
      });
    }

    return result.success;
  } catch (error) {
    console.error('Error sending notification:', error);
    return false;
  }
}

/**
 * Build email data based on event type and user role
 */
function buildEmailData(user: any, payload: NotificationPayload): any {
  const { eventType, eventData, studentData } = payload;
  const userRole = user.role || 'user';
  const userName = user.full_name || 'User';
  
  switch (eventType) {
    case 'resume_upload':
      return {
        type: 'sponsor_notification',
        to: user.email,
        subject: 'New Resume Available',
        sponsorName: userName,
        eventType: 'resume_upload',
        studentName: eventData.student_name,
        studentEmail: eventData.student_email,
        studentMajor: studentData?.major,
        studentSkills: studentData?.skills,
        resumeUrl: eventData.resume_url,
      };
      
    case 'new_student':
      return {
        type: 'sponsor_notification',
        to: user.email,
        subject: 'New Student Registered',
        sponsorName: userName,
        eventType: 'new_student',
        studentName: eventData.student_name,
        studentEmail: eventData.student_email,
        studentMajor: studentData?.major,
        studentSkills: studentData?.skills,
      };
      
    case 'mission_submission':
      return {
        type: 'submission_received',
        sponsorName: userName,
        sponsorEmail: user.email,
        mission: {
          id: eventData.mission_id,
          title: eventData.mission_title,
        },
        student: {
          name: eventData.student_name,
          email: eventData.student_email,
        },
        submissionId: eventData.submission_id,
      };

    case 'new_event':
      // Use role-specific email type
      if (userRole === 'sponsor') {
        return {
          type: 'sponsor_new_event',
          to: user.email,
          subject: `🎉 New Event: ${eventData.title}`,
          sponsorName: userName,
          event: {
            title: eventData.title,
            description: eventData.description,
            starts_at: eventData.starts_at,
            ends_at: eventData.ends_at,
            capacity: eventData.capacity,
          },
          eventId: eventData.id,
        };
      } else if (userRole === 'student') {
        return {
          type: 'student_new_event',
          to: user.email,
          subject: `🎉 New Event: ${eventData.title}`,
          studentName: userName,
          event: {
            title: eventData.title,
            description: eventData.description,
            starts_at: eventData.starts_at,
            ends_at: eventData.ends_at,
            capacity: eventData.capacity,
          },
          eventId: eventData.id,
        };
      } else if (userRole === 'mentor') {
        return {
          type: 'mentor_new_event',
          to: user.email,
          subject: `🎉 New Event: ${eventData.title}`,
          mentorName: userName,
          event: {
            title: eventData.title,
            description: eventData.description,
            starts_at: eventData.starts_at,
            ends_at: eventData.ends_at,
            capacity: eventData.capacity,
          },
          eventId: eventData.id,
        };
      } else {
        // Fallback for other roles (admin, etc.) - use sponsor template
        return {
          type: 'sponsor_new_event',
          to: user.email,
          subject: `🎉 New Event: ${eventData.title}`,
          sponsorName: userName,
          event: {
            title: eventData.title,
            description: eventData.description,
            starts_at: eventData.starts_at,
            ends_at: eventData.ends_at,
            capacity: eventData.capacity,
          },
          eventId: eventData.id,
        };
      }
      
    default:
      return {
        type: 'sponsor_notification',
        to: user.email,
        subject: `New ${eventType} Notification`,
        sponsorName: userName,
        eventType,
        ...eventData,
      };
  }
}

// ============================================================================
// MAIN DISPATCHER
// ============================================================================

/**
 * Dispatch notification to all users (sponsors, students, mentors) about new events
 * Handles role-specific email templates
 */
export async function dispatchToAllUsers(
  payload: NotificationPayload
): Promise<NotificationResult> {
  const supabase = await createServerSupabase();
  
  // Get all users (sponsors, students, mentors) - exclude admins
  const { data: users, error } = await supabase
    .from('users')
    .select('id, email, role, full_name')
    .in('role', ['sponsor', 'student', 'mentor']);

  if (error) {
    console.error('Error fetching users:', error);
    return { sent: 0, queued: 0, filtered: 0, errors: 0 };
  }

  if (!users || users.length === 0) {
    console.warn('No users found in database. No notifications will be sent.');
    return { sent: 0, queued: 0, filtered: 0, errors: 0 };
  }

  const roleCounts = users.reduce((acc, user) => {
    acc[user.role] = (acc[user.role] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  console.log(`Found ${users.length} user(s) to notify about ${payload.eventType}:`, roleCounts);

  const result: NotificationResult = {
    sent: 0,
    queued: 0,
    filtered: 0,
    errors: 0,
  };

  // Process each user
  await Promise.all(
    users.map(async (user) => {
      try {
        // For new_event, always send immediately regardless of preferences
        console.log(`Sending immediate notification to ${user.role} ${user.id} (${user.email})`);
        const success = await sendNotificationNow(user.id, user.email, payload);
        if (success) {
          result.sent++;
          console.log(`✓ Notification sent to ${user.email} (${user.role})`);
        } else {
          result.errors++;
          console.error(`✗ Failed to send notification to ${user.email} (${user.role})`);
        }
      } catch (error) {
        console.error(`Error processing ${user.role} ${user.id}:`, error);
        result.errors++;
      }
    })
  );

  return result;
}

/**
 * Dispatch notification to all relevant sponsors
 * Handles tier-based routing, filtering, and batching
 */
export async function dispatchToSponsors(
  payload: NotificationPayload
): Promise<NotificationResult> {
  const supabase = await createServerSupabase();
  
  // Get all sponsors
  const { data: sponsors, error } = await supabase
    .from('users')
    .select('id, email, sponsor_tier')
    .eq('role', 'sponsor');

  if (error) {
    console.error('Error fetching sponsors:', error);
    return { sent: 0, queued: 0, filtered: 0, errors: 0 };
  }

  if (!sponsors || sponsors.length === 0) {
    console.warn('No sponsors found in database. No notifications will be sent.');
    return { sent: 0, queued: 0, filtered: 0, errors: 0 };
  }

  console.log(`Found ${sponsors.length} sponsor(s) to notify about ${payload.eventType}`);

  const result: NotificationResult = {
    sent: 0,
    queued: 0,
    filtered: 0,
    errors: 0,
  };

  const inSurge = await isSurgePeriod();

  // Process each sponsor
  await Promise.all(
    sponsors.map(async (sponsor) => {
      try {
        // Check if sponsor's filters match the student
        if (payload.studentData) {
          const matches = await matchesSponsorFilters(sponsor.id, payload.studentData);
          if (!matches) {
            result.filtered++;
            return;
          }
        }

        // Get notification frequency for this sponsor and event type
        const frequency = await getNotificationFrequency(sponsor.id, payload.eventType);
        
        if (frequency === 'never') {
          result.filtered++;
          return;
        }

        // Determine if we should send immediately
        const shouldSendNow = await shouldNotifyImmediately(sponsor.id, payload.eventType);
        
        // Check if we should batch during surge
        const shouldBatch = inSurge && await shouldBatchDuringSurge(sponsor.id);

        if (shouldSendNow && !shouldBatch) {
          // Send immediately
          console.log(`Sending immediate notification to sponsor ${sponsor.id} (${sponsor.email})`);
          const success = await sendNotificationNow(sponsor.id, sponsor.email, payload);
          if (success) {
            result.sent++;
            console.log(`✓ Notification sent to ${sponsor.email}`);
          } else {
            result.errors++;
            console.error(`✗ Failed to send notification to ${sponsor.email}`);
          }
        } else {
          // Queue for later
          console.log(`Queuing notification for sponsor ${sponsor.id} (frequency: ${frequency})`);
          await queueNotification(sponsor.id, payload, frequency);
          result.queued++;
        }
      } catch (error) {
        console.error(`Error processing sponsor ${sponsor.id}:`, error);
        result.errors++;
      }
    })
  );

  return result;
}

/**
 * Dispatch to a specific sponsor
 */
export async function dispatchToSponsor(
  sponsorId: string,
  payload: NotificationPayload
): Promise<boolean> {
  const supabase = await createServerSupabase();

  // Get sponsor details
  const { data: sponsor, error } = await supabase
    .from('users')
    .select('email, sponsor_tier')
    .eq('id', sponsorId)
    .eq('role', 'sponsor')
    .single();

  if (error || !sponsor) {
    console.error('Sponsor not found:', error);
    return false;
  }

  // Check filters
  if (payload.studentData) {
    const matches = await matchesSponsorFilters(sponsorId, payload.studentData);
    if (!matches) {
      return false; // Filtered out
    }
  }

  // Get notification frequency
  const frequency = await getNotificationFrequency(sponsorId, payload.eventType);
  
  if (frequency === 'never') {
    return false; // Unsubscribed
  }

  // Check if should send immediately
  const shouldSendNow = await shouldNotifyImmediately(sponsorId, payload.eventType);
  const inSurge = await isSurgePeriod();
  const shouldBatch = inSurge && await shouldBatchDuringSurge(sponsorId);

  if (shouldSendNow && !shouldBatch) {
    return await sendNotificationNow(sponsorId, sponsor.email, payload);
  } else {
    await queueNotification(sponsorId, payload, frequency);
    return true; // Queued successfully
  }
}

// ============================================================================
// BATCH PROCESSOR (Call this from a cron job)
// ============================================================================

/**
 * Process pending notifications in the queue
 * Should be called periodically (e.g., every hour)
 */
export async function processBatchedNotifications(): Promise<{
  processed: number;
  sent: number;
  failed: number;
}> {
  const supabase = await createServerSupabase();
  
  // Get all pending notifications that are due
  const now = new Date();
  const { data: pendingNotifications } = await supabase
    .from('notification_queue')
    .select(`
      id,
      sponsor_id,
      event_type,
      event_data,
      notification_frequency
    `)
    .eq('status', 'pending')
    .lte('scheduled_for', now.toISOString())
    .limit(1000); // Process in batches of 1000

  if (!pendingNotifications || pendingNotifications.length === 0) {
    return { processed: 0, sent: 0, failed: 0 };
  }

  // Group by sponsor and frequency
  const grouped = new Map<string, any[]>();
  
  pendingNotifications.forEach(notification => {
    const key = `${notification.sponsor_id}-${notification.notification_frequency}`;
    if (!grouped.has(key)) {
      grouped.set(key, []);
    }
    grouped.get(key)!.push(notification);
  });

  let sent = 0;
  let failed = 0;

  // Send grouped notifications
  for (const [key, notifications] of grouped.entries()) {
    const [sponsorId] = key.split('-');
    
    try {
      // Get sponsor email
      const { data: sponsor } = await supabase
        .from('users')
        .select('email, full_name')
        .eq('id', sponsorId)
        .single();

      if (!sponsor) {
        failed += notifications.length;
        continue;
      }

      // Create digest email
      const digestPayload: NotificationPayload = {
        eventType: 'new_student', // Generic type for digest
        eventData: {
          notifications: notifications.map(n => ({
            event_type: n.event_type,
            ...n.event_data,
          })),
          count: notifications.length,
        },
      };

      const success = await sendNotificationNow(sponsorId, sponsor.email, digestPayload);
      
      if (success) {
        sent++;
        
        // Mark notifications as sent
        await supabase
          .from('notification_queue')
          .update({ 
            status: 'sent',
            sent_at: new Date().toISOString(),
          })
          .in('id', notifications.map(n => n.id));
      } else {
        failed++;
        
        // Mark as failed
        await supabase
          .from('notification_queue')
          .update({ status: 'failed' })
          .in('id', notifications.map(n => n.id));
      }
    } catch (error) {
      console.error(`Error processing batch for sponsor ${sponsorId}:`, error);
      failed++;
    }
  }

  return {
    processed: pendingNotifications.length,
    sent,
    failed,
  };
}

// ============================================================================
// HELPER: Increment sponsor stats (SQL function)
// ============================================================================

/**
 * SQL function to create (run in Supabase SQL Editor):
 * 
 * CREATE OR REPLACE FUNCTION increment_sponsor_stat(
 *   p_sponsor_id uuid,
 *   p_stat_name text
 * ) RETURNS void AS $$
 * BEGIN
 *   IF p_stat_name = 'notifications_sent' THEN
 *     UPDATE sponsor_engagement_stats
 *     SET notifications_sent = notifications_sent + 1,
 *         last_notification_sent = now()
 *     WHERE sponsor_id = p_sponsor_id;
 *   ELSIF p_stat_name = 'resumes_viewed' THEN
 *     UPDATE sponsor_engagement_stats
 *     SET resumes_viewed = resumes_viewed + 1,
 *         last_resume_viewed = now()
 *     WHERE sponsor_id = p_sponsor_id;
 *   END IF;
 * END;
 * $$ LANGUAGE plpgsql;
 */

