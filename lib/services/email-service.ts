import { sendEmail } from '@/lib/email/client';
import { createAdminSupabase } from '@/lib/supabase/server';
import type {
  CommunicationTemplate,
  EmailTemplateVariation,
  CommunicationQueue,
  CommunicationLog,
} from '@/lib/types/communications';

// ============================================================================
// TEMPLATE RENDERING
// ============================================================================

/**
 * Substitute variables in template content
 */
export function substituteVariables(
  content: string,
  variables: Record<string, unknown>
): string {
  let result = content;

  // Replace {{variable}} patterns
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
    result = result.replace(regex, String(value || ''));
  }

  // Replace {variable} patterns (without double braces)
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`{\\s*${key}\\s*}`, 'g');
    result = result.replace(regex, String(value || ''));
  }

  return result;
}

/**
 * Select a variation based on weight (for A/B testing)
 */
export function selectVariation(
  variations: EmailTemplateVariation[]
): EmailTemplateVariation | null {
  if (variations.length === 0) return null;
  if (variations.length === 1) return variations[0]!;

  // Calculate total weight
  const totalWeight = variations.reduce((sum, v) => sum + (v.weight || 1.0), 0);

  // Random selection based on weights
  let random = Math.random() * totalWeight;

  for (const variation of variations) {
    random -= variation.weight || 1.0;
    if (random <= 0) {
      return variation;
    }
  }

  // Fallback to first variation
  return variations[0]!;
}

/**
 * Render template with variations and variable substitution
 */
export async function renderTemplate(
  template: CommunicationTemplate,
  variables: Record<string, unknown> = {}
): Promise<{ subject: string; body: string }> {
  const supabase = createAdminSupabase();

  // Get variations for this template
  const { data: variations } = await supabase
    .from('email_template_variations')
    .select('*')
    .eq('template_id', template.id)
    .eq('is_active', true);

  let subject = template.subject || '';
  let body = template.body;

  // Apply variations if they exist
  if (variations && variations.length > 0) {
    const subjectVariations = variations.filter((v) => v.variation_type === 'subject');
    const greetingVariations = variations.filter((v) => v.variation_type === 'greeting');
    const bodyVariations = variations.filter((v) => v.variation_type === 'body');
    const closingVariations = variations.filter((v) => v.variation_type === 'closing');

    // Select random variations
    if (subjectVariations.length > 0) {
      const selected = selectVariation(subjectVariations);
      if (selected) subject = selected.content;
    }

    if (greetingVariations.length > 0) {
      const selected = selectVariation(greetingVariations);
      if (selected) {
        body = selected.content + '\n\n' + body;
      }
    }

    if (bodyVariations.length > 0) {
      const selected = selectVariation(bodyVariations);
      if (selected) {
        body = body.replace(/\{\{body\}\}/g, selected.content);
      }
    }

    if (closingVariations.length > 0) {
      const selected = selectVariation(closingVariations);
      if (selected) {
        body = body + '\n\n' + selected.content;
      }
    }
  }

  // Substitute variables
  subject = substituteVariables(subject, variables);
  body = substituteVariables(body, variables);

  return { subject, body };
}

// ============================================================================
// EMAIL SENDING
// ============================================================================

export interface SendEmailOptions {
  template: CommunicationTemplate;
  recipientId: string;
  recipientEmail: string;
  variables?: Record<string, unknown>;
  scheduleId?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Send email using template
 */
export async function sendTemplateEmail(
  options: SendEmailOptions
): Promise<{ success: boolean; logId?: string; error?: string }> {
  const supabase = createAdminSupabase();

  try {
    // Check user preferences
    const { data: preferences } = await supabase
      .from('communication_preferences')
      .select('email_enabled, unsubscribe_categories')
      .eq('user_id', options.recipientId)
      .single();

    // Check if email is disabled or user unsubscribed
    if (preferences) {
      if (!preferences.email_enabled) {
        return { success: false, error: 'Email disabled by user preference' };
      }

      // Check if template target_audience is in unsubscribe list
      if (
        options.template.target_audience &&
        preferences.unsubscribe_categories?.includes(options.template.target_audience)
      ) {
        return { success: false, error: 'User unsubscribed from this category' };
      }
    }

    // Render template
    const { subject, body } = await renderTemplate(
      options.template,
      options.variables || {}
    );

    // Send email
    const emailResult = await sendEmail({
      to: options.recipientEmail,
      subject,
      html: body,
    });

    if (!emailResult.success) {
      // Log failure
      const { data: log } = await supabase
        .from('communication_logs')
        .insert({
          schedule_id: options.scheduleId || null,
          template_id: options.template.id,
          recipient_id: options.recipientId,
          channel: 'email',
          status: 'failed',
          error_message: emailResult.error?.toString() || 'Unknown error',
          metadata: options.metadata || {},
        })
        .select()
        .single();

      return { success: false, error: emailResult.error?.toString(), logId: log?.id };
    }

    // Log success
    const { data: log } = await supabase
      .from('communication_logs')
      .insert({
        schedule_id: options.scheduleId || null,
        template_id: options.template.id,
        recipient_id: options.recipientId,
        channel: 'email',
        status: 'sent',
        metadata: options.metadata || {},
      })
      .select()
      .single();

    return { success: true, logId: log?.id };
  } catch (error: any) {
    console.error('Error sending template email:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Send bulk emails
 */
export async function sendBulkEmails(
  items: Array<{
    template: CommunicationTemplate;
    recipientId: string;
    recipientEmail: string;
    variables?: Record<string, unknown>;
  }>
): Promise<{ success: number; failed: number; errors: Array<{ email: string; error: string }> }> {
  const results = {
    success: 0,
    failed: 0,
    errors: [] as Array<{ email: string; error: string }>,
  };

  for (const item of items) {
    const result = await sendTemplateEmail({
      template: item.template,
      recipientId: item.recipientId,
      recipientEmail: item.recipientEmail,
      variables: item.variables,
    });

    if (result.success) {
      results.success++;
    } else {
      results.failed++;
      results.errors.push({
        email: item.recipientEmail,
        error: result.error || 'Unknown error',
      });
    }
  }

  return results;
}

// ============================================================================
// EMAIL TRACKING
// ============================================================================

/**
 * Track email open
 */
export async function trackEmailOpen(logId: string): Promise<void> {
  const supabase = createAdminSupabase();

  await supabase
    .from('communication_logs')
    .update({
      status: 'opened',
      opened_at: new Date().toISOString(),
    })
    .eq('id', logId)
    .eq('status', 'sent');
}

/**
 * Track email click
 */
export async function trackEmailClick(logId: string): Promise<void> {
  const supabase = createAdminSupabase();

  await supabase
    .from('communication_logs')
    .update({
      status: 'clicked',
      clicked_at: new Date().toISOString(),
    })
    .eq('id', logId)
    .in('status', ['sent', 'opened']);
}

/**
 * Track email bounce
 */
export async function trackEmailBounce(logId: string, errorMessage: string): Promise<void> {
  const supabase = createAdminSupabase();

  await supabase
    .from('communication_logs')
    .update({
      status: 'bounced',
      error_message: errorMessage,
    })
    .eq('id', logId);
}


