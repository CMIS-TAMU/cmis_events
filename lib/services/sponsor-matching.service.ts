/**
 * Sponsor Matching Service
 * Handles finding matching students for sponsors and sending notifications
 */

import { createAdminSupabase } from '@/lib/supabase/server';
import { matchesSponsorFilters } from '@/lib/communications/sponsor-tiers';

interface MatchingStudent {
  student_id: string;
  student_name: string;
  student_email: string;
  match_score: number;
  match_reasons: string[];
  major: string | null;
  skills: string[] | null;
  preferred_industry: string | null;
  resume_url: string | null;
}

interface SponsorInfo {
  id: string;
  email: string;
  full_name: string;
}

/**
 * Find students matching a sponsor's criteria
 */
export async function findMatchingStudents(
  sponsorId: string,
  limit: number = 10,
  minScore: number = 50
): Promise<MatchingStudent[]> {
  const supabase = createAdminSupabase();
  
  const { data, error } = await supabase.rpc('get_matching_students_for_sponsor', {
    p_sponsor_id: sponsorId,
    p_limit: limit,
    p_min_score: minScore,
  });

  if (error) {
    console.error('Error finding matching students:', error);
    return [];
  }

  return (data || []).map((student: any) => ({
    student_id: student.student_id,
    student_name: student.student_name,
    student_email: student.student_email,
    match_score: parseFloat(student.match_score || 0),
    match_reasons: Array.isArray(student.match_reasons) 
      ? student.match_reasons 
      : (student.match_reasons ? JSON.parse(JSON.stringify(student.match_reasons)) : []),
    major: student.major,
    skills: student.skills || [],
    preferred_industry: student.preferred_industry,
    resume_url: student.resume_url,
  }));
}

/**
 * Send real-time notification when new student matches sponsor
 */
export async function sendRealTimeMatchNotification(
  sponsorId: string,
  student: MatchingStudent
): Promise<boolean> {
  try {
    const supabase = createAdminSupabase();
    
    // Get sponsor info
    const { data: sponsor } = await supabase
      .from('users')
      .select('email, full_name')
      .eq('id', sponsorId)
      .single();

    if (!sponsor) {
      return false;
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    
    const response = await fetch(`${appUrl}/api/email/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'sponsor_student_match',
        sponsorName: sponsor.full_name || sponsor.email.split('@')[0],
        sponsorEmail: sponsor.email,
        studentName: student.student_name,
        studentEmail: student.student_email,
        matchScore: Math.round(student.match_score),
        matchCriteria: student.match_reasons,
        studentMajor: student.major,
        studentSkills: student.skills || [],
        studentResumeUrl: student.resume_url,
      }),
    });

    const result = await response.json();

    if (result.success) {
      // Record the match and notification
      await supabase
        .from('sponsor_student_matches')
        .upsert({
          sponsor_id: sponsorId,
          student_id: student.student_id,
          match_score: student.match_score,
          match_criteria: { reasons: student.match_reasons },
          notified_at: new Date().toISOString(),
          notification_type: 'realtime',
        }, {
          onConflict: 'sponsor_id,student_id',
        });

      // Log notification
      await supabase
        .from('notification_logs')
        .insert({
          sponsor_id: sponsorId,
          notification_type: 'email',
          event_type: 'new_student_match',
          email_subject: `New Student Match: ${student.student_name}`,
          email_to: sponsor.email,
          delivery_status: 'sent',
          metadata: {
            student_id: student.student_id,
            match_score: student.match_score,
          },
        });
    }

    return result.success || false;
  } catch (error) {
    console.error('Error sending real-time match notification:', error);
    return false;
  }
}

/**
 * Check for new student matches and send real-time notifications
 */
export async function checkAndNotifyNewMatches(): Promise<{
  checked: number;
  notified: number;
  skipped: number;
}> {
  const supabase = createAdminSupabase();
  
  // Get all active sponsors
  const { data: sponsors } = await supabase
    .from('users')
    .select('id, email, full_name')
    .eq('role', 'sponsor')
    .not('email', 'is', null);

  if (!sponsors || sponsors.length === 0) {
    return { checked: 0, notified: 0, skipped: 0 };
  }

  let notified = 0;
  let skipped = 0;

  for (const sponsor of sponsors) {
    try {
      // Find new matching students (not notified in last 7 days)
      const matches = await findMatchingStudents(sponsor.id, 5, 50);
      
      // Send notification for top match only (to avoid spam)
      if (matches.length > 0 && matches[0].match_score >= 60) {
        const sent = await sendRealTimeMatchNotification(sponsor.id, matches[0]);
        if (sent) {
          notified++;
        } else {
          skipped++;
        }
      } else {
        skipped++;
      }

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 200));
    } catch (error) {
      console.error(`Error checking matches for sponsor ${sponsor.id}:`, error);
      skipped++;
    }
  }

  return {
    checked: sponsors.length,
    notified,
    skipped,
  };
}

/**
 * Send weekly digest to a sponsor with all matches from the week
 */
export async function sendWeeklyDigest(sponsorId: string): Promise<boolean> {
  try {
    const supabase = createAdminSupabase();
    
    // Get sponsor info
    const { data: sponsor } = await supabase
      .from('users')
      .select('email, full_name')
      .eq('id', sponsorId)
      .single();

    if (!sponsor) {
      return false;
    }

    // Get week start (last Monday)
    const now = new Date();
    const dayOfWeek = now.getDay();
    const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Monday is 1
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - diff);
    weekStart.setHours(0, 0, 0, 0);
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    // Get matches from this week that were notified
    const { data: matches } = await supabase
      .from('sponsor_student_matches')
      .select(`
        student_id,
        match_score,
        match_criteria,
        notified_at,
        users!sponsor_student_matches_student_id_fkey(
          id,
          full_name,
          email,
          major,
          skills,
          preferred_industry
        )
      `)
      .eq('sponsor_id', sponsorId)
      .gte('notified_at', weekStart.toISOString())
      .lte('notified_at', weekEnd.toISOString())
      .order('match_score', { ascending: false })
      .limit(10);

    if (!matches || matches.length === 0) {
      // No matches this week - skip digest
      return false;
    }

    // Format matches for email
    const formattedMatches = matches.map((match: any) => {
      const student = match.users;
      const matchReasons = match.match_criteria?.reasons || [];
      
      return {
        studentId: student.id,
        studentName: student.full_name || student.email.split('@')[0],
        studentEmail: student.email,
        matchScore: Math.round(parseFloat(match.match_score || 0)),
        matchCriteria: Array.isArray(matchReasons) ? matchReasons : [],
        studentMajor: student.major,
        studentSkills: student.skills || [],
      };
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    
    const response = await fetch(`${appUrl}/api/email/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'sponsor_weekly_digest',
        sponsorName: sponsor.full_name || sponsor.email.split('@')[0],
        sponsorEmail: sponsor.email,
        matches: formattedMatches,
        weekStart: weekStart.toISOString(),
        weekEnd: weekEnd.toISOString(),
      }),
    });

    const result = await response.json();

    if (result.success) {
      // Record digest sent
      await supabase
        .from('sponsor_digests')
        .upsert({
          sponsor_id: sponsorId,
          digest_date: weekStart.toISOString().split('T')[0],
          matches_included: formattedMatches.map((m: any) => m.studentId),
          sent_at: new Date().toISOString(),
        }, {
          onConflict: 'sponsor_id,digest_date',
        });
    }

    return result.success || false;
  } catch (error) {
    console.error('Error sending weekly digest:', error);
    return false;
  }
}

/**
 * Send weekly digest to all sponsors
 */
export async function processWeeklyDigests(): Promise<{
  processed: number;
  sent: number;
  skipped: number;
}> {
  const supabase = createAdminSupabase();
  
  // Get all active sponsors
  const { data: sponsors } = await supabase
    .from('users')
    .select('id')
    .eq('role', 'sponsor')
    .not('email', 'is', null);

  if (!sponsors || sponsors.length === 0) {
    return { processed: 0, sent: 0, skipped: 0 };
  }

  let sent = 0;
  let skipped = 0;

  for (const sponsor of sponsors) {
    try {
      const success = await sendWeeklyDigest(sponsor.id);
      
      if (success) {
        sent++;
      } else {
        skipped++;
      }

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 200));
    } catch (error) {
      console.error(`Error sending digest to sponsor ${sponsor.id}:`, error);
      skipped++;
    }
  }

  return {
    processed: sponsors.length,
    sent,
    skipped,
  };
}


