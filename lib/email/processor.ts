import { createClient } from '@supabase/supabase-js';
import { sendEmail } from './client';
import {
  eventNotificationVariation1,
  eventNotificationVariation2,
  eventNotificationVariation3,
  eventNotificationVariation4,
  eventNotificationVariation5,
} from './templates/event-notification-variations';
import { getRoleSpecificEventNotification } from './templates/role-specific-event-notifications';
import {
  reminderVariation1,
  reminderVariation2,
  reminderVariation3,
  reminderVariation4,
  reminderVariation5,
} from './templates/reminder-variations';
import {
  sponsorDigestVariation1,
  sponsorDigestVariation2,
  sponsorDigestVariation3,
  sponsorDigestVariation4,
  sponsorDigestVariation5,
} from './templates/sponsor-digest-variations';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);
const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

// Template variation functions mapped by template type
const templateVariations: Record<string, Function[]> = {
  event_notification: [
    eventNotificationVariation1,
    eventNotificationVariation2,
    eventNotificationVariation3,
    eventNotificationVariation4,
    eventNotificationVariation5,
  ],
  reminder: [
    reminderVariation1,
    reminderVariation2,
    reminderVariation3,
    reminderVariation4,
    reminderVariation5,
  ],
  sponsor_digest: [
    sponsorDigestVariation1,
    sponsorDigestVariation2,
    sponsorDigestVariation3,
    sponsorDigestVariation4,
    sponsorDigestVariation5,
  ],
};

/**
 * Process pending emails from the queue
 * Processes up to 50 emails at a time
 */
export async function processEmailQueue(batchSize: number = 50): Promise<{
  processed: number;
  sent: number;
  failed: number;
  errors: string[];
}> {
  const now = new Date().toISOString();
  let processed = 0;
  let sent = 0;
  let failed = 0;
  const errors: string[] = [];

  try {
    // Get pending emails scheduled for now or earlier (or within next 10 seconds for immediate sends)
    // This allows emails scheduled slightly in the future to be picked up immediately
    const futureThreshold = new Date(new Date(now).getTime() + 10 * 1000).toISOString(); // 10 seconds from now
    
    const { data: queueItems, error: fetchError } = await supabase
      .from('communication_queue')
      .select('*, communication_templates!inner(type, name, subject, target_audience), users!inner(email, full_name, role)')
      .eq('status', 'pending')
      .lte('scheduled_for', futureThreshold) // Allow emails scheduled up to 10 seconds in future
      .order('priority', { ascending: false })
      .order('scheduled_for', { ascending: true })
      .limit(batchSize);

    if (fetchError) {
      console.error('Error fetching queue items:', fetchError);
      return { processed: 0, sent: 0, failed: 0, errors: [fetchError.message] };
    }

    if (!queueItems || queueItems.length === 0) {
      return { processed: 0, sent: 0, failed: 0, errors: [] };
    }

    // Process each email
    for (const item of queueItems) {
      processed++;

      try {
        // Mark as processing
        await supabase
          .from('communication_queue')
          .update({ status: 'processing' })
          .eq('id', item.id);

        // Get template category from target_audience (not type - type is channel: email/sms/social)
        const templateCategory = item.communication_templates?.target_audience || 'event_notification';
        const templateName = item.communication_templates?.name || '';
        const templateChannel = item.communication_templates?.type || 'email';
        
        console.log(`[processEmailQueue] Processing queue item ${item.id}, template category: ${templateCategory}, template name: ${templateName}, channel: ${templateChannel}`);
        
        if (!templateCategory || !['event_notification', 'reminder', 'sponsor_digest'].includes(templateCategory)) {
          console.error(`[processEmailQueue] ❌ Invalid template category: ${templateCategory}. Expected: event_notification, reminder, or sponsor_digest`);
        }

        // Select random variation based on category
        const variations = templateVariations[templateCategory] || templateVariations['event_notification'];
        const variationIndex = Math.floor(Math.random() * variations.length);
        const renderTemplate = variations[variationIndex];

        // Get recipient info
        const recipientEmail = item.users?.email;
        const recipientName = item.users?.full_name || 'User';
        const recipientRole = item.users?.role || 'user';

        if (!recipientEmail) {
          throw new Error('Recipient email not found');
        }

        // Get event data if needed
        let eventData = null;
        if (item.metadata?.event_id) {
          const { data: event } = await supabase
            .from('events')
            .select('*')
            .eq('id', item.metadata.event_id)
            .single();
          eventData = event;
        }

        // Generate unsubscribe token (simple hash for now)
        const unsubscribeToken = Buffer.from(`${item.recipient_id}-${Date.now()}`).toString('base64');

        // Render email HTML based on template category (target_audience)
        let html = '';
        let subject = item.communication_templates?.subject || 'CMIS Event Notification';

        if (templateCategory === 'event_notification' && eventData) {
          // Use role-specific templates for personalized experience
          html = getRoleSpecificEventNotification({
            userName: recipientName,
            userRole: recipientRole as 'student' | 'sponsor' | 'mentor' | 'admin' | 'user',
            event: eventData,
            appUrl,
            unsubscribeToken,
          });
          
          // Role-specific subject lines
          const roleSubjects = {
            student: `🎓 New Event: ${eventData.title}`,
            sponsor: `💼 Event Opportunity: ${eventData.title}`,
            mentor: `🤝 Mentoring Opportunity: ${eventData.title}`,
          };
          subject = roleSubjects[recipientRole as keyof typeof roleSubjects] || `New Event: ${eventData.title}`;
        } else if (templateCategory === 'reminder' && eventData) {
          html = renderTemplate({
            userName: recipientName,
            event: eventData,
            appUrl,
            unsubscribeToken,
            userRole: recipientRole,
          });
          subject = `Reminder: ${eventData.title} Tomorrow`;
        } else if (templateCategory === 'sponsor_digest') {
          // Get events, new students, top resumes for sponsor digest
          const events = item.metadata?.events || [];
          const newStudents = item.metadata?.new_students || [];
          const topResumes = item.metadata?.top_resumes || [];

          html = renderTemplate({
            sponsorName: recipientName,
            events,
            newStudents,
            topResumes,
            appUrl,
            unsubscribeToken,
          });
          subject = `Weekly Sponsor Digest - ${new Date().toLocaleDateString()}`;
        } else {
          throw new Error(`Unknown template category: ${templateCategory}. Expected: event_notification, reminder, or sponsor_digest`);
        }

        // Get FROM address from Brevo env vars
        const fromAddress = process.env.BREVO_FROM_EMAIL;
        const fromName = process.env.BREVO_FROM_NAME || 'CMIS Events';
        const fromEmail = `${fromName} <${fromAddress}>`;

        // Send email - explicitly set FROM address (templates don't define this)
        const emailResult = await sendEmail({
          from: fromEmail, // Explicitly set FROM address
          to: recipientEmail,
          subject,
          html,
        });

        if (emailResult.success) {
          // Mark as sent
          await supabase
            .from('communication_queue')
            .update({ status: 'sent' })
            .eq('id', item.id);

          // Log success
          await supabase
            .from('communication_logs')
            .insert({
              schedule_id: item.schedule_id || null,
              template_id: item.template_id,
              recipient_id: item.recipient_id,
              channel: 'email',
              status: 'sent',
              metadata: {
                variation_index: variationIndex,
                template_name: templateName,
              },
            });

          sent++;
        } else {
          throw new Error(emailResult.error?.toString() || 'Email send failed');
        }
      } catch (error: any) {
        failed++;
        const errorMessage = error.message || 'Unknown error';
        errors.push(`Queue item ${item.id}: ${errorMessage}`);

        // Mark as failed
        await supabase
          .from('communication_queue')
          .update({
            status: 'failed',
            metadata: {
              ...item.metadata,
              error: errorMessage,
              failed_at: new Date().toISOString(),
            },
          })
          .eq('id', item.id);

        // Log failure
        await supabase
          .from('communication_logs')
          .insert({
            schedule_id: item.schedule_id || null,
            template_id: item.template_id,
            recipient_id: item.recipient_id,
            channel: 'email',
            status: 'failed',
            error_message: errorMessage,
          });
      }
    }

    return { processed, sent, failed, errors };
  } catch (error: any) {
    console.error('Error processing email queue:', error);
    return {
      processed,
      sent,
      failed,
      errors: [...errors, error.message],
    };
  }
}

/**
 * Get email template by name or create default templates
 */
export async function getOrCreateTemplate(
  name: string,
  type: 'event_notification' | 'reminder' | 'sponsor_digest',
  subject?: string
): Promise<string> {
  // Check if template exists
  const { data: existing } = await supabase
    .from('communication_templates')
    .select('id')
    .eq('name', name)
    .eq('type', type)
    .single();

  if (existing) {
    return existing.id;
  }

  // Create default template
  const defaultSubject = subject || {
    event_notification: 'New Event Available',
    reminder: 'Event Reminder',
    sponsor_digest: 'Weekly Sponsor Digest',
  }[type];

  const { data: newTemplate, error } = await supabase
    .from('communication_templates')
    .insert({
      name,
      type: 'email', // Channel type: email, sms, or social (always 'email' for email templates)
      channel: 'email',
      subject: defaultSubject,
      body: '', // Not used, we use React components
      target_audience: type, // Template category: event_notification, reminder, or sponsor_digest
      is_active: true,
    })
    .select('id')
    .single();

  if (error || !newTemplate) {
    throw new Error(`Failed to create template: ${error?.message}`);
  }

  return newTemplate.id;
}

