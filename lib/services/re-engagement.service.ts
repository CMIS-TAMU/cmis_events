/**
 * Re-Engagement Service
 * Handles finding inactive users and sending personalized event recommendations
 */

import { createAdminSupabase } from '@/lib/supabase/server';

interface InactiveUser {
  user_id: string;
  email: string;
  full_name: string;
  last_registration_date: string | null;
  days_inactive: number;
  major: string | null;
  skills: string[] | null;
  preferred_industry: string | null;
}

interface EventRecommendation {
  id: string;
  title: string;
  description?: string;
  starts_at: string;
  ends_at?: string;
  capacity?: number;
  image_url?: string;
}

/**
 * Find users who haven't registered for events in specified days
 */
export async function findInactiveUsers(daysThreshold: number = 30): Promise<InactiveUser[]> {
  const supabase = createAdminSupabase();
  
  const { data, error } = await supabase.rpc('get_inactive_users', {
    days_threshold: daysThreshold,
  });

  if (error) {
    console.error('Error finding inactive users:', error);
    return [];
  }

  return (data || []) as InactiveUser[];
}

/**
 * Get personalized event recommendations for a user
 * Based on their major, skills, and interests
 */
export async function getPersonalizedEvents(
  userId: string,
  limit: number = 5
): Promise<EventRecommendation[]> {
  const supabase = createAdminSupabase();
  
  // Get user profile
  const { data: userProfile } = await supabase
    .from('users')
    .select('major, skills, preferred_industry, metadata')
    .eq('id', userId)
    .single();

  if (!userProfile) {
    return [];
  }

  // Get upcoming events (next 30 days)
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
  
  let query = supabase
    .from('events')
    .select('id, title, description, starts_at, ends_at, capacity, image_url')
    .gt('starts_at', new Date().toISOString())
    .lte('starts_at', thirtyDaysFromNow.toISOString())
    .order('starts_at', { ascending: true })
    .limit(limit * 2); // Get more to filter

  const { data: events, error } = await query;

  if (error || !events || events.length === 0) {
    return [];
  }

  // Simple scoring: prioritize events that might match user interests
  // In a more advanced version, we could use AI/ML for better matching
  const scoredEvents = events.map(event => {
    let score = 0;
    
    // Basic scoring (can be enhanced with AI)
    if (event.description) {
      const descriptionLower = event.description.toLowerCase();
      if (userProfile.major && descriptionLower.includes(userProfile.major.toLowerCase())) {
        score += 10;
      }
      if (userProfile.preferred_industry && descriptionLower.includes(userProfile.preferred_industry.toLowerCase())) {
        score += 10;
      }
      if (userProfile.skills && Array.isArray(userProfile.skills)) {
        userProfile.skills.forEach((skill: string) => {
          if (descriptionLower.includes(skill.toLowerCase())) {
            score += 5;
          }
        });
      }
    }
    
    return { ...event, _score: score };
  });

  // Sort by score (highest first), then by date
  scoredEvents.sort((a, b) => {
    if (b._score !== a._score) {
      return b._score - a._score;
    }
    return new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime();
  });

  // Remove score field and return top N
  return scoredEvents.slice(0, limit).map(({ _score, ...event }) => event);
}

/**
 * Send re-engagement email to a user
 */
export async function sendReEngagementEmail(
  user: InactiveUser,
  events: EventRecommendation[]
): Promise<boolean> {
  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    
    const response = await fetch(`${appUrl}/api/email/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 're_engagement_events',
        userName: user.full_name || user.email.split('@')[0],
        userEmail: user.email,
        daysInactive: user.days_inactive,
        events: events.map(e => ({
          id: e.id,
          title: e.title,
          description: e.description,
          starts_at: e.starts_at,
          ends_at: e.ends_at,
          capacity: e.capacity,
          image_url: e.image_url,
        })),
      }),
    });

    const result = await response.json();

    if (result.success) {
      // Log the campaign
      const supabase = createAdminSupabase();
      await supabase
        .from('re_engagement_campaigns')
        .insert({
          user_id: user.user_id,
          campaign_type: 'inactive_30d',
          events_recommended: events.map(e => e.id),
        });
    }

    return result.success || false;
  } catch (error) {
    console.error('Error sending re-engagement email:', error);
    return false;
  }
}

/**
 * Process re-engagement campaign for all inactive users
 */
export async function processReEngagementCampaign(): Promise<{
  processed: number;
  sent: number;
  failed: number;
}> {
  const inactiveUsers = await findInactiveUsers(30);
  
  let sent = 0;
  let failed = 0;

  for (const user of inactiveUsers) {
    try {
      // Get personalized events
      const events = await getPersonalizedEvents(user.user_id, 5);
      
      if (events.length === 0) {
        // Skip if no events to recommend
        continue;
      }

      // Send email
      const success = await sendReEngagementEmail(user, events);
      
      if (success) {
        sent++;
      } else {
        failed++;
      }
      
      // Add small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.error(`Error processing user ${user.user_id}:`, error);
      failed++;
    }
  }

  return {
    processed: inactiveUsers.length,
    sent,
    failed,
  };
}


