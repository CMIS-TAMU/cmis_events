import { createAdminSupabase } from '@/lib/supabase/server';
import type { CommunicationTemplate } from '@/lib/types/communications';

/**
 * Trigger communication when event registration occurs
 */
export async function triggerRegistrationEmail(
  userId: string,
  eventId: string,
  registrationId: string
): Promise<void> {
  const supabase = createAdminSupabase();

  // Find welcome/registration confirmation template
  const { data: templates } = await supabase
    .from('communication_templates')
    .select('*')
    .eq('type', 'email')
    .eq('is_active', true)
    .or('target_audience.eq.registration,target_audience.eq.welcome')
    .limit(1);

  if (!templates || templates.length === 0) {
    console.warn('No registration email template found');
    return;
  }

  const template = templates[0] as CommunicationTemplate;

  // Get user and event data for variables
  const { data: user } = await supabase
    .from('users')
    .select('email, full_name')
    .eq('id', userId)
    .single();

  const { data: event } = await supabase
    .from('events')
    .select('title, description, starts_at, ends_at')
    .eq('id', eventId)
    .single();

  if (!user || !event) {
    console.warn('User or event not found for registration email');
    return;
  }

  // Add to queue
  await supabase.from('communication_queue').insert({
    template_id: template.id,
    recipient_id: userId,
    scheduled_for: new Date().toISOString(),
    priority: 5,
    metadata: {
      event_id: eventId,
      registration_id: registrationId,
      event_title: event.title,
      event_date: event.starts_at,
      user_name: user.full_name,
    },
  });
}

/**
 * Trigger reminder emails for upcoming events
 */
export async function triggerEventReminders(): Promise<void> {
  const supabase = createAdminSupabase();

  // Find reminder templates
  const { data: templates } = await supabase
    .from('communication_templates')
    .select('*')
    .eq('type', 'email')
    .eq('is_active', true)
    .or('target_audience.eq.reminder,target_audience.eq.event_reminder')
    .limit(1);

  if (!templates || templates.length === 0) {
    return;
  }

  const template = templates[0] as CommunicationTemplate;

  // Get events starting in 24 hours
  const tomorrow = new Date();
  tomorrow.setHours(tomorrow.getHours() + 24);
  const tomorrowEnd = new Date(tomorrow);
  tomorrowEnd.setHours(tomorrowEnd.getHours() + 1);

  const { data: events } = await supabase
    .from('events')
    .select('id, title, starts_at')
    .gte('starts_at', tomorrow.toISOString())
    .lte('starts_at', tomorrowEnd.toISOString());

  if (!events || events.length === 0) {
    return;
  }

  // Get registrations for these events
  for (const event of events) {
    const { data: registrations } = await supabase
      .from('event_registrations')
      .select('user_id')
      .eq('event_id', event.id)
      .eq('status', 'registered');

    if (!registrations) continue;

    // Queue reminder emails
    const queueItems = registrations.map((reg) => ({
      template_id: template.id,
      recipient_id: reg.user_id,
      scheduled_for: new Date().toISOString(),
      priority: 3,
      metadata: {
        event_id: event.id,
        event_title: event.title,
        event_date: event.starts_at,
      },
    }));

    if (queueItems.length > 0) {
      await supabase.from('communication_queue').insert(queueItems);
    }
  }
}

/**
 * Trigger cancellation email
 */
export async function triggerCancellationEmail(
  userId: string,
  eventId: string
): Promise<void> {
  const supabase = createAdminSupabase();

  const { data: templates } = await supabase
    .from('communication_templates')
    .select('*')
    .eq('type', 'email')
    .eq('is_active', true)
    .or('target_audience.eq.cancellation,target_audience.eq.cancel')
    .limit(1);

  if (!templates || templates.length === 0) {
    return;
  }

  const template = templates[0] as CommunicationTemplate;

  const { data: event } = await supabase
    .from('events')
    .select('title')
    .eq('id', eventId)
    .single();

  await supabase.from('communication_queue').insert({
    template_id: template.id,
    recipient_id: userId,
    scheduled_for: new Date().toISOString(),
    priority: 4,
    metadata: {
      event_id: eventId,
      event_title: event?.title || 'Event',
    },
  });
}

/**
 * Trigger waitlist promotion email
 */
export async function triggerWaitlistPromotion(
  userId: string,
  eventId: string
): Promise<void> {
  const supabase = createAdminSupabase();

  const { data: templates } = await supabase
    .from('communication_templates')
    .select('*')
    .eq('type', 'email')
    .eq('is_active', true)
    .or('target_audience.eq.waitlist,target_audience.eq.promotion')
    .limit(1);

  if (!templates || templates.length === 0) {
    return;
  }

  const template = templates[0] as CommunicationTemplate;

  const { data: event } = await supabase
    .from('events')
    .select('title, starts_at')
    .eq('id', eventId)
    .single();

  await supabase.from('communication_queue').insert({
    template_id: template.id,
    recipient_id: userId,
    scheduled_for: new Date().toISOString(),
    priority: 6, // High priority for promotions
    metadata: {
      event_id: eventId,
      event_title: event?.title || 'Event',
      event_date: event?.starts_at,
    },
  });
}


