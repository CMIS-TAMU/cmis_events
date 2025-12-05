import { createAdminSupabase } from '@/lib/supabase/server';

// ============================================================================
// VARIABLE TYPE DEFINITIONS
// ============================================================================

export interface UserVariables {
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  company?: string;
  role: string;
  major?: string;
  year?: string;
}

export interface EventVariables {
  name: string;
  date: string;
  time: string;
  location?: string;
  description?: string;
  registration_count: number;
  capacity: number;
  registration_id?: string;
}

export interface DynamicVariables {
  upcoming_events: Array<{
    name: string;
    date: string;
    location?: string;
    link: string;
  }>;
  new_students: Array<{
    name: string;
    major?: string;
    year?: string;
    profile_link: string;
  }>;
  registration_stats: {
    total: number;
    by_major: Record<string, number>;
    by_year: Record<string, number>;
  };
}

export interface LinkVariables {
  event_link: string;
  sponsor_dashboard_link: string;
  unsubscribe_link: string;
  profile_link?: string;
  scheduling_link?: string;
}

export interface TemplateVariableContext {
  user?: UserVariables;
  event?: EventVariables;
  dynamic?: DynamicVariables;
  links?: LinkVariables;
  [key: string]: unknown; // Allow custom variables
}

// ============================================================================
// VARIABLE FETCHERS
// ============================================================================

/**
 * Fetch user variables from database
 */
export async function fetchUserVariables(userId: string): Promise<UserVariables> {
  const supabase = createAdminSupabase();

  const { data: user, error } = await supabase
    .from('users')
    .select('id, email, full_name, role, major, graduation_year, metadata')
    .eq('id', userId)
    .single();

  if (error || !user) {
    throw new Error(`User not found: ${userId}`);
  }

  const nameParts = (user.full_name || '').split(' ');
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';

  return {
    first_name: firstName,
    last_name: lastName,
    full_name: user.full_name || user.email || 'User',
    email: user.email || '',
    company: (user.metadata as Record<string, unknown>)?.company as string | undefined,
    role: user.role || 'user',
    major: user.major || undefined,
    year: user.graduation_year ? String(user.graduation_year) : undefined,
  };
}

/**
 * Fetch event variables from database
 */
export async function fetchEventVariables(
  eventId: string,
  registrationId?: string
): Promise<EventVariables> {
  const supabase = createAdminSupabase();

  const { data: event, error } = await supabase
    .from('events')
    .select('id, title, description, starts_at, ends_at, capacity')
    .eq('id', eventId)
    .single();

  if (error || !event) {
    throw new Error(`Event not found: ${eventId}`);
  }

  // Get registration count
  const { count } = await supabase
    .from('event_registrations')
    .select('*', { count: 'exact', head: true })
    .eq('event_id', eventId)
    .eq('status', 'registered');

  const startDate = event.starts_at ? new Date(event.starts_at) : new Date();
  const dateStr = startDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const timeStr = startDate.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });

  return {
    name: event.title || 'Event',
    date: dateStr,
    time: timeStr,
    description: event.description || undefined,
    registration_count: count || 0,
    capacity: event.capacity || 0,
    registration_id: registrationId,
  };
}

/**
 * Fetch upcoming events for a user
 */
export async function fetchUpcomingEvents(userId: string, limit: number = 5): Promise<DynamicVariables['upcoming_events']> {
  const supabase = createAdminSupabase();

  // Get events user is registered for
  const { data: registrations } = await supabase
    .from('event_registrations')
    .select('event_id, events(id, title, starts_at)')
    .eq('user_id', userId)
    .eq('status', 'registered')
    .gte('events.starts_at', new Date().toISOString())
    .order('events.starts_at', { ascending: true })
    .limit(limit);

  if (!registrations) return [];

  return registrations.map((reg: any) => {
    const event = reg.events;
    const eventDate = event.starts_at ? new Date(event.starts_at) : new Date();
    
    return {
      name: event.title || 'Event',
      date: eventDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      link: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/events/${event.id}`,
    };
  });
}

/**
 * Fetch new students (for sponsors)
 */
export async function fetchNewStudents(eventId: string, limit: number = 10): Promise<DynamicVariables['new_students']> {
  const supabase = createAdminSupabase();

  const { data: registrations } = await supabase
    .from('event_registrations')
    .select('user_id, registered_at, users(id, full_name, major, graduation_year)')
    .eq('event_id', eventId)
    .eq('status', 'registered')
    .order('registered_at', { ascending: false })
    .limit(limit);

  if (!registrations) return [];

  return registrations.map((reg: any) => {
    const user = reg.users;
    return {
      name: user.full_name || 'Student',
      major: user.major || undefined,
      year: user.graduation_year ? String(user.graduation_year) : undefined,
      profile_link: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/profile/${user.id}`,
    };
  });
}

/**
 * Fetch registration statistics
 */
export async function fetchRegistrationStats(eventId: string): Promise<DynamicVariables['registration_stats']> {
  const supabase = createAdminSupabase();

  const { data: registrations } = await supabase
    .from('event_registrations')
    .select('user_id, users(major, graduation_year)')
    .eq('event_id', eventId)
    .eq('status', 'registered');

  if (!registrations) {
    return {
      total: 0,
      by_major: {},
      by_year: {},
    };
  }

  const byMajor: Record<string, number> = {};
  const byYear: Record<string, number> = {};

  registrations.forEach((reg: any) => {
    const user = reg.users;
    const major = user.major || 'Undeclared';
    const year = user.graduation_year ? String(user.graduation_year) : 'Unknown';

    byMajor[major] = (byMajor[major] || 0) + 1;
    byYear[year] = (byYear[year] || 0) + 1;
  });

  return {
    total: registrations.length,
    by_major: byMajor,
    by_year: byYear,
  };
}

/**
 * Generate link variables
 */
export function generateLinkVariables(
  userId?: string,
  eventId?: string,
  unsubscribeToken?: string
): LinkVariables {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  return {
    event_link: eventId ? `${baseUrl}/events/${eventId}` : `${baseUrl}/events`,
    sponsor_dashboard_link: `${baseUrl}/sponsor/dashboard`,
    unsubscribe_link: unsubscribeToken
      ? `${baseUrl}/unsubscribe/${unsubscribeToken}`
      : `${baseUrl}/settings/notifications`,
    profile_link: userId ? `${baseUrl}/profile/${userId}` : undefined,
    scheduling_link: userId ? `${baseUrl}/mentorship/schedule?mentor=${userId}` : undefined,
  };
}

/**
 * Build complete variable context
 */
export async function buildVariableContext(
  options: {
    userId?: string;
    eventId?: string;
    registrationId?: string;
    includeUpcomingEvents?: boolean;
    includeNewStudents?: boolean;
    includeStats?: boolean;
    unsubscribeToken?: string;
  }
): Promise<TemplateVariableContext> {
  const context: TemplateVariableContext = {};

  // Fetch user variables
  if (options.userId) {
    try {
      context.user = await fetchUserVariables(options.userId);
    } catch (error) {
      console.warn('Failed to fetch user variables:', error);
    }
  }

  // Fetch event variables
  if (options.eventId) {
    try {
      context.event = await fetchEventVariables(options.eventId, options.registrationId);
    } catch (error) {
      console.warn('Failed to fetch event variables:', error);
    }
  }

  // Fetch dynamic variables
  context.dynamic = {
    upcoming_events: [],
    new_students: [],
    registration_stats: {
      total: 0,
      by_major: {},
      by_year: {},
    },
  };

  if (options.includeUpcomingEvents && options.userId) {
    try {
      context.dynamic.upcoming_events = await fetchUpcomingEvents(options.userId);
    } catch (error) {
      console.warn('Failed to fetch upcoming events:', error);
    }
  }

  if (options.includeNewStudents && options.eventId) {
    try {
      context.dynamic.new_students = await fetchNewStudents(options.eventId);
    } catch (error) {
      console.warn('Failed to fetch new students:', error);
    }
  }

  if (options.includeStats && options.eventId) {
    try {
      context.dynamic.registration_stats = await fetchRegistrationStats(options.eventId);
    } catch (error) {
      console.warn('Failed to fetch registration stats:', error);
    }
  }

  // Generate links
  context.links = generateLinkVariables(
    options.userId,
    options.eventId,
    options.unsubscribeToken
  );

  return context;
}
