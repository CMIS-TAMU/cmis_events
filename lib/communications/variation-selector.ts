import { createAdminSupabase } from '@/lib/supabase/server';
import type { EmailTemplateVariation } from '@/lib/types/communications';

// ============================================================================
// VARIATION SELECTION
// ============================================================================

interface VariationSelection {
  subject?: string;
  greeting?: string;
  body?: string;
  closing?: string;
}

/**
 * Select a variation based on weight (for A/B testing)
 */
function selectVariationByWeight(
  variations: EmailTemplateVariation[]
): EmailTemplateVariation | null {
  if (variations.length === 0) return null;
  if (variations.length === 1) return variations[0]!;

  // Calculate total weight
  const totalWeight = variations.reduce(
    (sum, v) => sum + (v.weight || 1.0),
    0
  );

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
 * Get variations for a template and select one of each type
 */
export async function selectVariations(
  templateId: string,
  userId?: string
): Promise<VariationSelection> {
  const supabase = createAdminSupabase();

  // Get all active variations for this template
  const { data: variations } = await supabase
    .from('email_template_variations')
    .select('*')
    .eq('template_id', templateId)
    .eq('is_active', true);

  if (!variations || variations.length === 0) {
    return {};
  }

  const selection: VariationSelection = {};

  // Group by type
  const byType: Record<string, EmailTemplateVariation[]> = {
    subject: [],
    greeting: [],
    body: [],
    closing: [],
  };

  variations.forEach((variation) => {
    if (variation.variation_type in byType) {
      byType[variation.variation_type]!.push(variation);
    }
  });

  // Select one of each type
  for (const [type, typeVariations] of Object.entries(byType)) {
    if (typeVariations.length > 0) {
      const selected = selectVariationByWeight(typeVariations);
      if (selected) {
        // Ensure variety - don't send same variation twice in a row
        const finalVariation = await ensureVariety(
          selected,
          typeVariations,
          userId
        );
        (selection as Record<string, string>)[type] = finalVariation.content;
      }
    }
  }

  return selection;
}

/**
 * Ensure variety - avoid sending same variation twice in a row
 */
async function ensureVariety(
  selected: EmailTemplateVariation,
  allVariations: EmailTemplateVariation[],
  userId?: string
): Promise<EmailTemplateVariation> {
  if (!userId || allVariations.length <= 1) {
    return selected;
  }

  const supabase = createAdminSupabase();

  // Check last sent variation for this user and template
  const { data: lastLog } = await supabase
    .from('communication_logs')
    .select('metadata')
    .eq('recipient_id', userId)
    .eq('template_id', selected.template_id)
    .order('sent_at', { ascending: false })
    .limit(1)
    .single();

  if (lastLog?.metadata) {
    const metadata = lastLog.metadata as Record<string, unknown>;
    const lastVariationId = metadata.variation_id as string | undefined;

    // If same variation was used last time, pick a different one
    if (lastVariationId === selected.id && allVariations.length > 1) {
      const otherVariations = allVariations.filter((v) => v.id !== selected.id);
      if (otherVariations.length > 0) {
        return selectVariationByWeight(otherVariations) || selected;
      }
    }
  }

  return selected;
}

/**
 * Apply variations to template content
 */
export function applyVariations(
  template: {
    subject?: string | null;
    body: string;
  },
  variations: VariationSelection
): {
  subject: string;
  body: string;
} {
  let subject = variations.subject || template.subject || '';
  let body = template.body;

  // Apply greeting variation
  if (variations.greeting) {
    body = variations.greeting + '\n\n' + body;
  }

  // Apply body variation (replace {{body}} placeholder if exists)
  if (variations.body) {
    body = body.replace(/\{\{body\}\}/g, variations.body);
  }

  // Apply closing variation
  if (variations.closing) {
    body = body + '\n\n' + variations.closing;
  }

  return { subject, body };
}

/**
 * Get variation statistics
 */
export async function getVariationStats(
  templateId: string
): Promise<Record<string, { sent: number; opened: number; clicked: number }>> {
  const supabase = createAdminSupabase();

  const { data: logs } = await supabase
    .from('communication_logs')
    .select('metadata, status')
    .eq('template_id', templateId);

  const stats: Record<string, { sent: number; opened: number; clicked: number }> = {};

  logs?.forEach((log) => {
    const metadata = log.metadata as Record<string, unknown>;
    const variationId = metadata.variation_id as string | undefined;

    if (variationId) {
      if (!stats[variationId]) {
        stats[variationId] = { sent: 0, opened: 0, clicked: 0 };
      }

      stats[variationId]!.sent++;
      if (log.status === 'opened' || log.status === 'clicked') {
        stats[variationId]!.opened++;
      }
      if (log.status === 'clicked') {
        stats[variationId]!.clicked++;
      }
    }
  });

  return stats;
}
