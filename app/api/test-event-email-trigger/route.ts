import { NextRequest, NextResponse } from 'next/server';
import { onEventCreated } from '@/lib/email/event-trigger';

export const dynamic = 'force-dynamic';

/**
 * Test endpoint to manually trigger email notifications for an event
 * Usage: POST /api/test-event-email-trigger?eventId=<event-id>
 */
export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId');

    if (!eventId) {
      return NextResponse.json(
        { error: 'Missing eventId query parameter' },
        { status: 400 }
      );
    }

    console.log('🧪 Test endpoint: Triggering email notifications for event:', eventId);
    const result = await onEventCreated(eventId);

    return NextResponse.json({
      success: result.success,
      message: result.success 
        ? `Successfully queued ${result.notificationsQueued} emails, sent ${result.notificationsSent || 0}`
        : `Failed: ${result.error}`,
      details: {
        notificationsQueued: result.notificationsQueued,
        notificationsSent: result.notificationsSent || 0,
        notificationsFailed: result.notificationsFailed || 0,
        error: result.error,
      },
    });
  } catch (error: any) {
    console.error('❌ Test endpoint error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to trigger email notifications',
        message: error.message,
        stack: error.stack,
      },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint to check if trigger function exists
 */
export async function GET() {
  return NextResponse.json({
    message: 'Event email trigger test endpoint',
    usage: 'POST /api/test-event-email-trigger?eventId=<event-id>',
    example: 'POST /api/test-event-email-trigger?eventId=123e4567-e89b-12d3-a456-426614174000',
  });
}


