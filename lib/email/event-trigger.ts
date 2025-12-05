import { createClient } from '@supabase/supabase-js';
import { queueEmail, getEligibleRecipients, getUsersByRole } from './queue';
import { getOrCreateTemplate, processEmailQueue } from './processor';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Triggered when an admin creates a new event
 * Automatically queues notification emails for all eligible recipients
 */
export async function onEventCreated(eventId: string): Promise<{
  success: boolean;
  notificationsQueued: number;
  notificationsSent?: number;
  notificationsFailed?: number;
  error?: string;
}> {
  console.log('🚀 onEventCreated called with eventId:', eventId);
  try {
    // Get event details
    console.log('📋 Fetching event details...');
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single();

    if (eventError || !event) {
      console.error('❌ Event not found:', eventError?.message);
      return {
        success: false,
        notificationsQueued: 0,
        error: `Event not found: ${eventError?.message}`,
      };
    }

    console.log('✅ Event found:', event.title);

    // Get or create event notification template
    console.log('📧 Getting/creating email template...');
    const templateId = await getOrCreateTemplate(
      'event_notification_new',
      'event_notification',
      `New Event: ${event.title}`
    );
    console.log('✅ Template ID:', templateId);

    // Get eligible recipients - specifically sponsors and mentors
    // This ensures sponsors and mentors are notified when events are created
    console.log('Finding sponsors and mentors...');
    const sponsorsAndMentors = await getUsersByRole(['sponsor', 'mentor']);
    console.log('Found sponsors/mentors:', sponsorsAndMentors.length, sponsorsAndMentors.map(u => ({ email: u.email, role: u.role })));
    
    const eligibleRecipients = sponsorsAndMentors.map((u) => u.id);

    if (eligibleRecipients.length === 0) {
      console.warn('No eligible recipients found. Make sure users exist with roles "sponsor" or "mentor" and have email_enabled = true');
      return {
        success: true,
        notificationsQueued: 0,
        error: 'No eligible recipients found. Ensure users exist with roles "sponsor" or "mentor" and have email preferences enabled.',
      };
    }

    // Queue emails immediately (scheduled for now, not future)
    const now = new Date();
    let queued = 0;
    const errors: string[] = [];

    // Queue each email with immediate send time (scheduled for now, not future)
    console.log(`📬 Queueing ${eligibleRecipients.length} emails...`);
    for (let i = 0; i < eligibleRecipients.length; i++) {
      const recipientId = eligibleRecipients[i];
      
      // Schedule for now (or 1 second ago to ensure it's immediately available)
      // Small stagger (0-5 seconds) to avoid spam filters but still send immediately
      const randomDelay = Math.floor(Math.random() * 5 * 1000); // 0-5 seconds in milliseconds
      const scheduledTime = new Date(now.getTime() - 1000 + randomDelay); // 1 second ago + random 0-5 sec

      console.log(`  Queueing email ${i + 1}/${eligibleRecipients.length} for recipient: ${recipientId}, scheduled: ${scheduledTime.toISOString()}`);
      
      const queueResult = await queueEmail({
        templateId,
        recipientId,
        scheduledFor: scheduledTime,
        priority: 1, // Higher priority for immediate notifications
        metadata: {
          event_id: eventId,
          event_title: event.title,
          notification_type: 'event_created',
          created_at: new Date().toISOString(),
        },
      });

      if (queueResult.success) {
        console.log(`  ✅ Email ${i + 1} queued successfully (queueId: ${queueResult.queueId})`);
        queued++;
      } else {
        console.error(`  ❌ Email ${i + 1} failed to queue: ${queueResult.error}`);
        errors.push(`${recipientId}: ${queueResult.error}`);
      }
    }

    // Process queue immediately to send emails right away
    console.log(`Queued ${queued} emails, processing immediately...`);
    let sent = 0;
    let failed = 0;
    
    try {
      // Wait a moment for queue items to be committed to database
      await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second wait
      
      console.log('Processing email queue...');
      const processResult = await processEmailQueue(50); // Process up to 50 emails
      sent = processResult.sent;
      failed = processResult.failed;
      console.log(`✅ Queue processed: ${sent} sent, ${failed} failed, ${processResult.processed} processed`);
      
      if (processResult.errors.length > 0) {
        console.error('Queue processing errors:', processResult.errors);
        errors.push(...processResult.errors);
      }
      
      // If no emails were sent, try one more time after a brief delay
      if (sent === 0 && queued > 0) {
        console.log('No emails sent on first attempt, retrying...');
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 more seconds
        const retryResult = await processEmailQueue(50);
        sent = retryResult.sent;
        failed = retryResult.failed;
        console.log(`✅ Retry result: ${sent} sent, ${failed} failed`);
      }
    } catch (processError: any) {
      console.error('❌ Error processing queue immediately:', processError);
      errors.push(`Queue processing error: ${processError.message}`);
      // Don't fail the whole operation - emails are still queued and will be sent by cron job
    }

    return {
      success: errors.length === 0 && failed === 0,
      notificationsQueued: queued,
      notificationsSent: sent,
      notificationsFailed: failed,
      error: errors.length > 0 ? errors.join('; ') : undefined,
    };
  } catch (error: any) {
    console.error('Error in onEventCreated:', error);
    return {
      success: false,
      notificationsQueued: 0,
      error: error.message,
    };
  }
}

