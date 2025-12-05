import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * GET /api/analytics/emails
 * Returns email performance analytics for admin dashboard
 */
export async function GET(request: NextRequest) {
  try {
    // Verify admin (you can add proper auth check here)
    const searchParams = request.nextUrl.searchParams;
    const days = parseInt(searchParams.get('days') || '30');

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get queue statistics
    const { data: queueStats } = await supabase
      .from('communication_queue')
      .select('status')
      .gte('created_at', startDate.toISOString());

    const queueCounts = {
      pending: queueStats?.filter((s) => s.status === 'pending').length || 0,
      processing: queueStats?.filter((s) => s.status === 'processing').length || 0,
      sent: queueStats?.filter((s) => s.status === 'sent').length || 0,
      failed: queueStats?.filter((s) => s.status === 'failed').length || 0,
    };

    // Get log statistics
    const { data: logs } = await supabase
      .from('communication_logs')
      .select('status, channel, sent_at, template_id, communication_templates!inner(type)')
      .gte('sent_at', startDate.toISOString());

    const sentCount = logs?.filter((l) => l.status === 'sent').length || 0;
    const failedCount = logs?.filter((l) => l.status === 'failed').length || 0;
    const deliveryRate = sentCount + failedCount > 0 
      ? (sentCount / (sentCount + failedCount)) * 100 
      : 0;

    // Group by template type
    const byType: Record<string, number> = {};
    logs?.forEach((log: any) => {
      const type = log.communication_templates?.type || 'unknown';
      byType[type] = (byType[type] || 0) + 1;
    });

    // Get recent activity (last 24 hours)
    const last24Hours = new Date();
    last24Hours.setHours(last24Hours.getHours() - 24);

    const { data: recentLogs } = await supabase
      .from('communication_logs')
      .select('status, sent_at')
      .gte('sent_at', last24Hours.toISOString());

    const recentSent = recentLogs?.filter((l) => l.status === 'sent').length || 0;

    // Get unsubscribe statistics
    const { data: unsubscribes } = await supabase
      .from('communication_preferences')
      .select('email_enabled, unsubscribe_categories')
      .eq('email_enabled', false)
      .gte('updated_at', startDate.toISOString());

    return NextResponse.json({
      queue: queueCounts,
      performance: {
        total_sent: sentCount,
        total_failed: failedCount,
        delivery_rate: Math.round(deliveryRate * 100) / 100,
        recent_24h: recentSent,
      },
      by_type: byType,
      unsubscribes: {
        total: unsubscribes?.length || 0,
        in_period: unsubscribes?.length || 0,
      },
      period: {
        days,
        start_date: startDate.toISOString(),
        end_date: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error('Error fetching email analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}

