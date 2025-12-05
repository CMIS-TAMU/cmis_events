import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Debug endpoint to check email queue status
 * GET /api/debug/email-queue
 */
export async function GET(request: NextRequest) {
  try {
    // Get recent queue items
    const { data: queueItems, error: queueError } = await supabase
      .from('communication_queue')
      .select(`
        *,
        communication_templates:template_id (name, type),
        users:recipient_id (email, full_name, role)
      `)
      .order('created_at', { ascending: false })
      .limit(20);

    // Get recent logs
    const { data: logs, error: logsError } = await supabase
      .from('communication_logs')
      .select(`
        *,
        communication_templates:template_id (name, type),
        users:recipient_id (email, full_name)
      `)
      .order('sent_at', { ascending: false })
      .limit(20);

    // Get users with roles
    const { data: sponsors, error: sponsorsError } = await supabase
      .from('users')
      .select('id, email, full_name, role')
      .in('role', ['sponsor', 'mentor']);

    // Get email preferences
    const { data: preferences, error: prefsError } = await supabase
      .from('communication_preferences')
      .select('*, users:user_id (email, role)')
      .in('user_id', sponsors?.map(s => s.id) || []);

    return NextResponse.json({
      success: true,
      queue: {
        items: queueItems || [],
        error: queueError?.message,
        count: queueItems?.length || 0,
      },
      logs: {
        items: logs || [],
        error: logsError?.message,
        count: logs?.length || 0,
      },
      sponsors_mentors: {
        users: sponsors || [],
        error: sponsorsError?.message,
        count: sponsors?.length || 0,
      },
      preferences: {
        items: preferences || [],
        error: prefsError?.message,
        count: preferences?.length || 0,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}


