import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendEmail } from '@/lib/email/client';
import { eventNotificationVariation1 } from '@/lib/email/templates/event-notification-variations';

export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);
const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

/**
 * Test endpoint to send emails directly to specific addresses
 * GET /api/test-email-notification?email=test@example.com&type=event|reminder|digest
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const email = searchParams.get('email');
    const type = searchParams.get('type') || 'event';

    if (!email) {
      return NextResponse.json(
        { error: 'Email parameter is required' },
        { status: 400 }
      );
    }

    // Create a test event for the email
    const testEvent = {
      id: 'test-event-id',
      title: 'Test Email Notification Event',
      description: 'This is a test email to verify the email notification system is working correctly.',
      starts_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
      ends_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(), // +2 hours
      capacity: 50,
    };

    let html = '';
    let subject = '';

    if (type === 'event') {
      html = eventNotificationVariation1({
        userName: email.split('@')[0].replace(/\./g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        event: testEvent,
        appUrl,
        unsubscribeToken: Buffer.from(`test-${Date.now()}`).toString('base64'),
      });
      subject = `Test: New Event - ${testEvent.title}`;
    } else if (type === 'reminder') {
      const { reminderVariation1 } = await import('@/lib/email/templates/reminder-variations');
      html = reminderVariation1({
        userName: email.split('@')[0].replace(/\./g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        event: testEvent,
        appUrl,
        unsubscribeToken: Buffer.from(`test-${Date.now()}`).toString('base64'),
        userRole: 'student',
      });
      subject = `Test: Reminder - ${testEvent.title} Tomorrow`;
    } else if (type === 'digest') {
      const { sponsorDigestVariation1 } = await import('@/lib/email/templates/sponsor-digest-variations');
      html = sponsorDigestVariation1({
        sponsorName: email.split('@')[0].replace(/\./g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        events: [testEvent],
        newStudents: [],
        topResumes: [],
        appUrl,
        unsubscribeToken: Buffer.from(`test-${Date.now()}`).toString('base64'),
      });
      subject = `Test: Weekly Sponsor Digest - ${new Date().toLocaleDateString()}`;
    } else {
      return NextResponse.json(
        { error: 'Invalid type. Use: event, reminder, or digest' },
        { status: 400 }
      );
    }

    // Send email
    const result = await sendEmail({
      to: email,
      subject,
      html,
    });

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `Test email sent successfully to ${email}`,
        type,
        emailId: result.data?.id,
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
          message: `Failed to send email to ${email}`,
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Error sending test email:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * POST endpoint to send to multiple emails at once
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { emails, type = 'event' } = body;

    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return NextResponse.json(
        { error: 'emails array is required' },
        { status: 400 }
      );
    }

    const results = [];

    for (const email of emails) {
      try {
        const url = new URL('/api/test-email-notification', request.url);
        url.searchParams.set('email', email);
        url.searchParams.set('type', type);

        const response = await fetch(url.toString());
        const data = await response.json();

        results.push({
          email,
          success: data.success,
          error: data.error,
        });
      } catch (error: any) {
        results.push({
          email,
          success: false,
          error: error.message,
        });
      }
    }

    const successCount = results.filter((r) => r.success).length;
    const failedCount = results.filter((r) => !r.success).length;

    return NextResponse.json({
      success: true,
      total: emails.length,
      sent: successCount,
      failed: failedCount,
      results,
    });
  } catch (error: any) {
    console.error('Error sending bulk test emails:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}


