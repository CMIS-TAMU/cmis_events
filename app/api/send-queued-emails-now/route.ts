import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { processEmailQueue } from '@/lib/email/processor';

export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Send queued emails immediately
 * Updates scheduled_for to now and processes the queue
 * GET /api/send-queued-emails-now
 */
export async function GET(request: NextRequest) {
  try {
    // Update all pending emails to be sent now
    const { data: updated, error: updateError } = await supabase
      .from('communication_queue')
      .update({ scheduled_for: new Date().toISOString() })
      .eq('status', 'pending')
      .select();

    if (updateError) {
      return NextResponse.json(
        {
          success: false,
          error: `Failed to update schedule: ${updateError.message}`,
        },
        { status: 500 }
      );
    }

    const updatedCount = updated?.length || 0;

    if (updatedCount === 0) {
      return NextResponse.json({
        success: true,
        message: 'No pending emails to send',
        updated: 0,
        processed: 0,
      });
    }

    // Process the queue
    const result = await processEmailQueue(50);

    return NextResponse.json({
      success: true,
      message: `Updated ${updatedCount} emails and processed queue`,
      updated: updatedCount,
      processed: result.processed,
      sent: result.sent,
      failed: result.failed,
      errors: result.errors.length > 0 ? result.errors : undefined,
    });
  } catch (error: any) {
    console.error('Error sending queued emails:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}


