/**
 * Re-Engagement Campaign Cron Job
 * 
 * This endpoint should be called daily (via Vercel Cron or external service)
 * to send re-engagement emails to users who haven't registered for events in 30+ days
 * 
 * Protection: Use CRON_SECRET environment variable
 */

import { NextRequest, NextResponse } from 'next/server';
import { processReEngagementCampaign } from '@/lib/services/re-engagement.service';

export const runtime = 'nodejs';
export const maxDuration = 60; // Allow up to 60 seconds for processing

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret for security
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET || 'your-secret-key-change-in-production';
    
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('[Re-Engagement Cron] Starting re-engagement campaign...');
    
    const result = await processReEngagementCampaign();
    
    console.log('[Re-Engagement Cron] Campaign completed:', result);
    
    return NextResponse.json({
      success: true,
      message: 'Re-engagement campaign processed',
      ...result,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[Re-Engagement Cron] Error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to process re-engagement campaign',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

// Also support POST for external cron services
export async function POST(request: NextRequest) {
  return GET(request);
}


