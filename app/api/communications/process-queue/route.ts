import { NextRequest, NextResponse } from 'next/server';
import { processPendingQueue, processScheduledQueue } from '@/lib/services/queue-processor';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * Process communication queue
 * This endpoint should be called by a cron job every 5 minutes
 */
export async function POST(request: NextRequest) {
  try {
    // Optional: Add authentication/authorization check
    const authHeader = request.headers.get('authorization');
    const expectedToken = process.env.QUEUE_PROCESSOR_TOKEN;

    if (expectedToken && authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Process pending items
    const pendingResult = await processPendingQueue({ batchSize: 50 });

    // Process scheduled items
    const scheduledResult = await processScheduledQueue({ batchSize: 100 });

    return NextResponse.json({
      success: true,
      pending: pendingResult,
      scheduled: scheduledResult,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error processing queue:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint for health check
 */
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'Queue processor endpoint is active',
    timestamp: new Date().toISOString(),
  });
}


