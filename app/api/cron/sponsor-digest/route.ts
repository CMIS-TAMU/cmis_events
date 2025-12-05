import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { queueBulkEmails, getUsersByRole } from '@/lib/email/queue';
import { getOrCreateTemplate } from '@/lib/email/processor';

export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Cron job to send weekly sponsor digest
 * Runs every Monday at 8 AM
 * Sends digest of upcoming events and new students to all sponsors
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

    // Get sponsor digest template
    const digestTemplateId = await getOrCreateTemplate(
      'sponsor_weekly_digest',
      'sponsor_digest',
      'Weekly Sponsor Digest'
    );

    // Get all sponsors
    const sponsors = await getUsersByRole(['sponsor', 'admin']);

    if (sponsors.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No sponsors found',
        digestsQueued: 0,
        timestamp: new Date().toISOString(),
      });
    }

    // Get events in next 30 days
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select('*, event_registrations(count)')
      .gte('starts_at', new Date().toISOString())
      .lte('starts_at', thirtyDaysFromNow.toISOString())
      .order('starts_at', { ascending: true });

    if (eventsError) {
      throw new Error(`Failed to fetch events: ${eventsError.message}`);
    }

    // Get new students (joined in last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data: newStudents, error: studentsError } = await supabase
      .from('users')
      .select('id, email, full_name, major, graduation_year, resume_url, created_at')
      .in('role', ['student', 'user'])
      .gte('created_at', sevenDaysAgo.toISOString())
      .order('created_at', { ascending: false })
      .limit(10);

    if (studentsError) {
      console.error('Error fetching new students:', studentsError);
    }

    // Get top resumes (users with resumes, ordered by resume views or upload date)
    const { data: topResumes, error: resumesError } = await supabase
      .from('users')
      .select('id, email, full_name, major, graduation_year, resume_url, resume_uploaded_at')
      .in('role', ['student', 'user'])
      .not('resume_url', 'is', null)
      .order('resume_uploaded_at', { ascending: false })
      .limit(5);

    if (resumesError) {
      console.error('Error fetching top resumes:', resumesError);
    }

    // Prepare event data with registration counts
    const eventsWithCounts = (events || []).map((event: any) => ({
      id: event.id,
      title: event.title,
      description: event.description,
      starts_at: event.starts_at,
      capacity: event.capacity,
      registered_count: event.event_registrations?.[0]?.count || 0,
    }));

    // Queue emails for all sponsors
    const sponsorIds = sponsors.map((s) => s.id);
    const result = await queueBulkEmails(digestTemplateId, sponsorIds, {
      sendWindowStart: 8,
      sendWindowEnd: 11,
      spreadMinutes: 180, // 3 hours
      priority: 0,
      metadata: {
        events: eventsWithCounts,
        new_students: newStudents || [],
        top_resumes: topResumes || [],
        digest_date: new Date().toISOString(),
      },
    });

    return NextResponse.json({
      success: true,
      sponsorsFound: sponsors.length,
      eventsFound: eventsWithCounts.length,
      newStudentsFound: newStudents?.length || 0,
      topResumesFound: topResumes?.length || 0,
      digestsQueued: result.success,
      failed: result.failed,
      errors: result.errors.length > 0 ? result.errors : undefined,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error sending sponsor digest:', error);
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

