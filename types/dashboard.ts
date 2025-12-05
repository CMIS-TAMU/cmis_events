/**
 * TypeScript interfaces for Admin Dashboard
 */

export interface DashboardMetrics {
  total_users: number;
  new_users_7d: number;
  total_events: number;
  upcoming_events: number;
  events_today: number;
  events_this_week: number;
  total_registrations: number;
  pending_mentorship_requests: number;
  active_competitions: number;
  open_mini_sessions: number;
  // Sponsor engagement metrics
  total_sponsors: number;
  active_sponsors_30d: number;
  low_engagement_sponsors: number;
  total_resume_views: number;
  sponsor_notification_rate: number;
}

export type AlertSeverity = 'high' | 'medium' | 'low';
export type AlertType = 'low_registration' | 'missing_rubric' | 'upcoming_checkin' | 'low_sponsor_engagement' | 'event_not_notified_sponsors' | 'system';

export interface Alert {
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  description: string;
  action_url: string;
}

export interface UpcomingEvent {
  id: string;
  title: string;
  starts_at: string;
  capacity: number;
  registered: number;
  checked_in: number;
  fill_rate: number | null;
}

export interface EventNeedingAttention {
  id: string;
  title: string;
  starts_at: string;
  registered: number;
  capacity: number;
}

export interface DashboardData {
  metrics: DashboardMetrics;
  alerts: Alert[];
  upcoming_events: UpcomingEvent[];
  events_needing_attention: EventNeedingAttention[];
}
