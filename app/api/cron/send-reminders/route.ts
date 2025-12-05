import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { queueEmail } from '@/lib/email/queue';
import { getOrCreateTemplate } from '@/lib/email/processor';

export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Cron job to send 24-hour reminders
 * Runs every hour
 * Finds events starting in 24 hours and sends reminders to registered users
 */
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
      return NextResponse.json(
        { error: 'CRON_SECRET not configured' },
        { status: 500 }
      );
    }

    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Calculate 24 hours from now
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const tomorrowStart = new Date(tomorrow);
    tomorrowStart.setHours(0, 0, 0, 0);
    const tomorrowEnd = new Date(tomorrow);
    tomorrowEnd.setHours(23, 59, 59, 999);

    // Find events starting tomorrow
    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select('*')
      .gte('starts_at', tomorrowStart.toISOString())
      .lte('starts_at', tomorrowEnd.toISOString());

    if (eventsError) {
      throw new Error(`Failed to fetch events: ${eventsError.message}`);
    }

    if (!events || events.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No events starting in 24 hours',
        remindersQueued: 0,
        timestamp: new Date().toISOString(),
      });
    }

    // Get reminder template
    const reminderTemplateId = await getOrCreateTemplate('event_reminder_24h', 'reminder', 'Event Reminder');

    let remindersQueued = 0;
    const errors: string[] = [];

    // For each event, get registered users and queue reminders
    for (const event of events) {
      // Get registered users (not cancelled, not checked in)
      const { data: registrations, error: regError } = await supabase
        .from('event_registrations')
        .select('user_id, users!inner(email, full_name, role)')
        .eq('event_id', event.id)
        .eq('status', 'registered');

      if (regError) {
        errors.push(`Event ${event.id}: ${regError.message}`);
        continue;
      }

      if (!registrations || registrations.length === 0) {
        continue;
      }

      // Check if reminder already sent (prevent duplicates)
      const { data: existingReminders } = await supabase
        .from('communication_logs')
        .select('recipient_id')
        .eq('template_id', reminderTemplateId)
        .eq('status', 'sent')
        .in('recipient_id', registrations.map((r: any) => r.user_id))
        .gte('sent_at', new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString()); // Last 2 hours

      const alreadySent = new Set(existingReminders?.map((r: any) => r.recipient_id) || []);

      // Queue reminders for users who haven't received one
      for (const registration of registrations) {
        const userId = registration.user_id;
        
        if (alreadySent.has(userId)) {
          continue; // Skip if already sent
        }

        // Queue reminder email
        const result = await queueEmail({
          templateId: reminderTemplateId,
          recipientId: userId,
          priority: 1, // Higher priority for reminders
          metadata: {
            event_id: event.id,
            event_title: event.title,
            reminder_type: '24h',
          },
        });

        if (result.success) {
          remindersQueued++;
        } else {
          errors.push(`User ${userId}: ${result.error}`);
        }
      }
    }

    return NextResponse.json({
      success: true,
      eventsFound: events.length,
      remindersQueued,
      errors: errors.length > 0 ? errors : undefined,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error sending reminders:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

