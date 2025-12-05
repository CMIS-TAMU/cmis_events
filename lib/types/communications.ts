// Communication System Types and Interfaces

// ============================================================================
// 1. COMMUNICATION TEMPLATES
// ============================================================================

export interface CommunicationTemplate {
  id: string;
  name: string;
  description: string | null;
  type: 'email' | 'sms' | 'social';
  channel: string | null;
  subject: string | null;
  body: string;
  variables: Record<string, unknown>;
  target_audience: string | null;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export type CommunicationTemplateInsert = Omit<
  CommunicationTemplate,
  'id' | 'created_at' | 'updated_at'
>;

export type CommunicationTemplateUpdate = Partial<
  Omit<CommunicationTemplate, 'id' | 'created_at' | 'updated_at'>
>;

// ============================================================================
// 2. COMMUNICATION SCHEDULES
// ============================================================================

export interface CommunicationSchedule {
  id: string;
  template_id: string;
  event_id: string | null;
  trigger_type: string;
  trigger_condition: Record<string, unknown>;
  schedule_time: string | null;
  recurrence: string | null;
  status: 'active' | 'paused' | 'completed' | 'cancelled';
  last_sent_at: string | null;
  next_send_at: string | null;
  recipient_filter: Record<string, unknown>;
  created_at: string;
}

export type CommunicationScheduleInsert = Omit<
  CommunicationSchedule,
  'id' | 'created_at'
>;

export type CommunicationScheduleUpdate = Partial<
  Omit<CommunicationSchedule, 'id' | 'created_at'>
>;

// ============================================================================
// 3. COMMUNICATION QUEUE
// ============================================================================

export interface CommunicationQueue {
  id: string;
  template_id: string;
  recipient_id: string;
  scheduled_for: string;
  status: 'pending' | 'processing' | 'sent' | 'failed' | 'cancelled';
  priority: number;
  metadata: Record<string, unknown>;
  created_at: string;
}

export type CommunicationQueueInsert = Omit<
  CommunicationQueue,
  'id' | 'created_at'
>;

export type CommunicationQueueUpdate = Partial<
  Omit<CommunicationQueue, 'id' | 'created_at'>
>;

// ============================================================================
// 4. COMMUNICATION LOGS
// ============================================================================

export interface CommunicationLog {
  id: string;
  schedule_id: string | null;
  template_id: string | null;
  recipient_id: string | null;
  channel: string;
  status: 'sent' | 'delivered' | 'opened' | 'clicked' | 'bounced' | 'failed';
  sent_at: string;
  opened_at: string | null;
  clicked_at: string | null;
  error_message: string | null;
  metadata: Record<string, unknown>;
}

export type CommunicationLogInsert = Omit<CommunicationLog, 'id'>;

export type CommunicationLogUpdate = Partial<
  Omit<CommunicationLog, 'id' | 'sent_at'>
>;

// ============================================================================
// 5. SPONSOR TIERS
// ============================================================================

export interface SponsorTier {
  id: string;
  user_id: string;
  tier_level: 'premium' | 'standard' | 'basic';
  notification_frequency: string | null;
  custom_filters: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export type SponsorTierInsert = Omit<
  SponsorTier,
  'id' | 'created_at' | 'updated_at'
>;

export type SponsorTierUpdate = Partial<
  Omit<SponsorTier, 'id' | 'created_at' | 'updated_at'>
>;

// ============================================================================
// 6. COMMUNICATION PREFERENCES
// ============================================================================

export interface CommunicationPreference {
  id: string;
  user_id: string;
  email_enabled: boolean;
  sms_enabled: boolean;
  unsubscribe_categories: string[];
  preferred_time_windows: Record<string, unknown>;
  updated_at: string;
}

export type CommunicationPreferenceInsert = Omit<
  CommunicationPreference,
  'id' | 'updated_at'
>;

export type CommunicationPreferenceUpdate = Partial<
  Omit<CommunicationPreference, 'id' | 'updated_at'>
>;

// ============================================================================
// 7. EMAIL TEMPLATE VARIATIONS
// ============================================================================

export interface EmailTemplateVariation {
  id: string;
  template_id: string;
  variation_type: 'subject' | 'greeting' | 'body' | 'closing';
  content: string;
  weight: number;
  is_active: boolean;
}

export type EmailTemplateVariationInsert = Omit<EmailTemplateVariation, 'id'>;

export type EmailTemplateVariationUpdate = Partial<
  Omit<EmailTemplateVariation, 'id'>
>;

// ============================================================================
// 8. SURGE MODE CONFIG
// ============================================================================

export interface SurgeModeConfig {
  id: string;
  is_active: boolean;
  threshold_registrations_per_hour: number;
  batch_interval_hours: number;
  max_emails_per_recipient_per_day: number;
  active_date_ranges: unknown[];
  created_at: string;
  updated_at: string;
}

export type SurgeModeConfigInsert = Omit<
  SurgeModeConfig,
  'id' | 'created_at' | 'updated_at'
>;

export type SurgeModeConfigUpdate = Partial<
  Omit<SurgeModeConfig, 'id' | 'created_at' | 'updated_at'>
>;

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type CommunicationChannel = 'email' | 'sms' | 'social';

export type CommunicationStatus =
  | 'pending'
  | 'processing'
  | 'sent'
  | 'delivered'
  | 'opened'
  | 'clicked'
  | 'bounced'
  | 'failed'
  | 'cancelled';

export type ScheduleStatus = 'active' | 'paused' | 'completed' | 'cancelled';

export type TierLevel = 'premium' | 'standard' | 'basic';

export type VariationType = 'subject' | 'greeting' | 'body' | 'closing';

// ============================================================================
// COMPOSITE TYPES
// ============================================================================

export interface CommunicationWithTemplate extends CommunicationQueue {
  template: CommunicationTemplate;
}

export interface CommunicationLogWithDetails extends CommunicationLog {
  template: CommunicationTemplate | null;
  recipient: {
    id: string;
    email: string;
    full_name: string | null;
  } | null;
}

export interface ScheduleWithTemplate extends CommunicationSchedule {
  template: CommunicationTemplate;
  event: {
    id: string;
    title: string;
  } | null;
}


