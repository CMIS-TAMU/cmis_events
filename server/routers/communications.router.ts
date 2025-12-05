import { z } from 'zod';
import { router, publicProcedure, protectedProcedure, adminProcedure } from '../trpc';
import { supabaseAdmin } from '../trpc';
import type {
  CommunicationTemplate,
  CommunicationSchedule,
  CommunicationQueue,
  CommunicationLog,
  SponsorTier,
  CommunicationPreference,
  EmailTemplateVariation,
  SurgeModeConfig,
} from '@/lib/types/communications';

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const templateSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional().nullable(),
  type: z.enum(['email', 'sms', 'social']),
  channel: z.string().optional().nullable(),
  subject: z.string().optional().nullable(),
  body: z.string().min(1, 'Body is required'),
  variables: z.record(z.string(), z.unknown()).default({}),
  target_audience: z.string().optional().nullable(),
  is_active: z.boolean().default(true),
});

const scheduleSchema = z.object({
  template_id: z.string().uuid(),
  event_id: z.string().uuid().optional().nullable(),
  trigger_type: z.string().min(1, 'Trigger type is required'),
  trigger_condition: z.record(z.string(), z.unknown()).default({}),
  schedule_time: z.string().datetime().optional().nullable(),
  recurrence: z.string().optional().nullable(),
  status: z.enum(['active', 'paused', 'completed', 'cancelled']).default('active'),
  recipient_filter: z.record(z.string(), z.unknown()).default({}),
});

const queueItemSchema = z.object({
  template_id: z.string().uuid(),
  recipient_id: z.string().uuid(),
  scheduled_for: z.string().datetime(),
  priority: z.number().int().default(0),
  metadata: z.record(z.string(), z.unknown()).default({}),
});

const preferenceSchema = z.object({
  email_enabled: z.boolean().default(true),
  sms_enabled: z.boolean().default(false),
  unsubscribe_categories: z.array(z.string()).default([]),
  preferred_time_windows: z.record(z.string(), z.unknown()).default({}),
});

// ============================================================================
// COMMUNICATION TEMPLATES ROUTER
// ============================================================================

export const communicationsRouter = router({
  // ============================================================================
  // TEMPLATES
  // ============================================================================

  templates: router({
    // Get all templates (admins see all, others see active only)
    getAll: publicProcedure
      .input(
        z
          .object({
            type: z.enum(['email', 'sms', 'social']).optional(),
            is_active: z.boolean().optional(),
            limit: z.number().min(1).max(100).default(50),
            offset: z.number().min(0).default(0),
          })
          .optional()
      )
      .query(async ({ input, ctx }) => {
        let query = supabaseAdmin
          .from('communication_templates')
          .select('*')
          .order('created_at', { ascending: false })
          .range(input?.offset || 0, (input?.offset || 0) + (input?.limit || 50) - 1);

        // Non-admins only see active templates
        if (ctx.user?.role !== 'admin') {
          query = query.eq('is_active', true);
        }

        if (input?.type) {
          query = query.eq('type', input.type);
        }

        if (input?.is_active !== undefined && ctx.user?.role === 'admin') {
          query = query.eq('is_active', input.is_active);
        }

        const { data, error } = await query;

        if (error) {
          throw new Error(`Failed to fetch templates: ${error.message}`);
        }

        return (data || []) as CommunicationTemplate[];
      }),

    // Get template by ID
    getById: publicProcedure.input(z.string().uuid()).query(async ({ input, ctx }) => {
      const { data, error } = await supabaseAdmin
        .from('communication_templates')
        .select('*')
        .eq('id', input)
        .single();

      if (error) {
        throw new Error(`Failed to fetch template: ${error.message}`);
      }

      // Non-admins can only see active templates
      if (ctx.user?.role !== 'admin' && !data.is_active) {
        throw new Error('Template not found');
      }

      return data as CommunicationTemplate;
    }),

    // Create template (admin only)
    create: adminProcedure
      .input(templateSchema)
      .mutation(async ({ input, ctx }) => {
        const { data, error } = await supabaseAdmin
          .from('communication_templates')
          .insert({
            ...input,
            created_by: ctx.user.id,
          })
          .select()
          .single();

        if (error) {
          throw new Error(`Failed to create template: ${error.message}`);
        }

        return data as CommunicationTemplate;
      }),

    // Update template (admin or creator)
    update: protectedProcedure
      .input(
        z.object({
          id: z.string().uuid(),
          updates: templateSchema.partial(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        // Check if user is admin or creator
        const { data: template } = await supabaseAdmin
          .from('communication_templates')
          .select('created_by')
          .eq('id', input.id)
          .single();

        if (!template) {
          throw new Error('Template not found');
        }

        if (ctx.user.role !== 'admin' && template.created_by !== ctx.user.id) {
          throw new Error('You do not have permission to update this template');
        }

        const { data, error } = await supabaseAdmin
          .from('communication_templates')
          .update(input.updates)
          .eq('id', input.id)
          .select()
          .single();

        if (error) {
          throw new Error(`Failed to update template: ${error.message}`);
        }

        return data as CommunicationTemplate;
      }),

    // Delete template (admin only)
    delete: adminProcedure.input(z.string().uuid()).mutation(async ({ input }) => {
      const { error } = await supabaseAdmin
        .from('communication_templates')
        .delete()
        .eq('id', input);

      if (error) {
        throw new Error(`Failed to delete template: ${error.message}`);
      }

      return { success: true };
    }),

    // Toggle template active status
    toggleActive: adminProcedure
      .input(z.string().uuid())
      .mutation(async ({ input }) => {
        // Get current status
        const { data: template } = await supabaseAdmin
          .from('communication_templates')
          .select('is_active')
          .eq('id', input)
          .single();

        if (!template) {
          throw new Error('Template not found');
        }

        const { data, error } = await supabaseAdmin
          .from('communication_templates')
          .update({ is_active: !template.is_active })
          .eq('id', input)
          .select()
          .single();

        if (error) {
          throw new Error(`Failed to toggle template: ${error.message}`);
        }

        return data as CommunicationTemplate;
      }),
  }),

  // ============================================================================
  // SCHEDULES
  // ============================================================================

  schedules: router({
    // Get all schedules (admin only)
    getAll: adminProcedure
      .input(
        z
          .object({
            status: z.enum(['active', 'paused', 'completed', 'cancelled']).optional(),
            event_id: z.string().uuid().optional(),
            limit: z.number().min(1).max(100).default(50),
            offset: z.number().min(0).default(0),
          })
          .optional()
      )
      .query(async ({ input }) => {
        let query = supabaseAdmin
          .from('communication_schedules')
          .select('*, communication_templates(*)')
          .order('created_at', { ascending: false })
          .range(input?.offset || 0, (input?.offset || 0) + (input?.limit || 50) - 1);

        if (input?.status) {
          query = query.eq('status', input.status);
        }

        if (input?.event_id) {
          query = query.eq('event_id', input.event_id);
        }

        const { data, error } = await query;

        if (error) {
          throw new Error(`Failed to fetch schedules: ${error.message}`);
        }

        return data || [];
      }),

    // Get schedule by ID
    getById: adminProcedure.input(z.string().uuid()).query(async ({ input }) => {
      const { data, error } = await supabaseAdmin
        .from('communication_schedules')
        .select('*, communication_templates(*), events(*)')
        .eq('id', input)
        .single();

      if (error) {
        throw new Error(`Failed to fetch schedule: ${error.message}`);
      }

      return data;
    }),

    // Create schedule
    create: adminProcedure.input(scheduleSchema).mutation(async ({ input }) => {
      const { data, error } = await supabaseAdmin
        .from('communication_schedules')
        .insert(input)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create schedule: ${error.message}`);
      }

      return data as CommunicationSchedule;
    }),

    // Update schedule
    update: adminProcedure
      .input(
        z.object({
          id: z.string().uuid(),
          updates: scheduleSchema.partial(),
        })
      )
      .mutation(async ({ input }) => {
        const { data, error } = await supabaseAdmin
          .from('communication_schedules')
          .update(input.updates)
          .eq('id', input.id)
          .select()
          .single();

        if (error) {
          throw new Error(`Failed to update schedule: ${error.message}`);
        }

        return data as CommunicationSchedule;
      }),

    // Pause schedule
    pause: adminProcedure.input(z.string().uuid()).mutation(async ({ input }) => {
      const { data, error } = await supabaseAdmin
        .from('communication_schedules')
        .update({ status: 'paused' })
        .eq('id', input)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to pause schedule: ${error.message}`);
      }

      return data as CommunicationSchedule;
    }),

    // Resume schedule
    resume: adminProcedure.input(z.string().uuid()).mutation(async ({ input }) => {
      const { data, error } = await supabaseAdmin
        .from('communication_schedules')
        .update({ status: 'active' })
        .eq('id', input)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to resume schedule: ${error.message}`);
      }

      return data as CommunicationSchedule;
    }),

    // Delete schedule
    delete: adminProcedure.input(z.string().uuid()).mutation(async ({ input }) => {
      const { error } = await supabaseAdmin
        .from('communication_schedules')
        .delete()
        .eq('id', input);

      if (error) {
        throw new Error(`Failed to delete schedule: ${error.message}`);
      }

        return { success: true };
      }),
  }),

  // ============================================================================
  // QUEUE
  // ============================================================================

  queue: router({
    // Get queue items (admin only)
    getAll: adminProcedure
      .input(
        z
          .object({
            status: z
              .enum(['pending', 'processing', 'sent', 'failed', 'cancelled'])
              .optional(),
            limit: z.number().min(1).max(100).default(50),
            offset: z.number().min(0).default(0),
          })
          .optional()
      )
      .query(async ({ input }) => {
        let query = supabaseAdmin
          .from('communication_queue')
          .select('*, communication_templates(*), users(id, email, full_name)')
          .order('priority', { ascending: false })
          .order('scheduled_for', { ascending: true })
          .range(input?.offset || 0, (input?.offset || 0) + (input?.limit || 50) - 1);

        if (input?.status) {
          query = query.eq('status', input.status);
        }

        const { data, error } = await query;

        if (error) {
          throw new Error(`Failed to fetch queue: ${error.message}`);
        }

        return data || [];
      }),

    // Get user's own queue items
    getMyQueue: protectedProcedure
      .input(
        z
          .object({
            status: z
              .enum(['pending', 'processing', 'sent', 'failed', 'cancelled'])
              .optional(),
          })
          .optional()
      )
      .query(async ({ input, ctx }) => {
        let query = supabaseAdmin
          .from('communication_queue')
          .select('*, communication_templates(*)')
          .eq('recipient_id', ctx.user.id)
          .order('scheduled_for', { ascending: false });

        if (input?.status) {
          query = query.eq('status', input.status);
        }

        const { data, error } = await query;

        if (error) {
          throw new Error(`Failed to fetch queue: ${error.message}`);
        }

        return (data || []) as CommunicationQueue[];
      }),

    // Add item to queue
    add: adminProcedure.input(queueItemSchema).mutation(async ({ input }) => {
      const { data, error } = await supabaseAdmin
        .from('communication_queue')
        .insert({
          ...input,
          status: 'pending',
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to add to queue: ${error.message}`);
      }

      return data as CommunicationQueue;
    }),

    // Retry failed items
    retryFailed: adminProcedure
      .input(z.array(z.string().uuid()).optional())
      .mutation(async ({ input }) => {
        let query = supabaseAdmin
          .from('communication_queue')
          .update({ status: 'pending' })
          .eq('status', 'failed');

        if (input && input.length > 0) {
          query = query.in('id', input);
        }

        const { data, error } = await query.select();

        if (error) {
          throw new Error(`Failed to retry items: ${error.message}`);
        }

        return data as CommunicationQueue[];
      }),
  }),

  // ============================================================================
  // LOGS
  // ============================================================================

  logs: router({
    // Get all logs (admin only)
    getAll: adminProcedure
      .input(
        z
          .object({
            status: z
              .enum(['sent', 'delivered', 'opened', 'clicked', 'bounced', 'failed'])
              .optional(),
            channel: z.string().optional(),
            template_id: z.string().uuid().optional(),
            recipient_id: z.string().uuid().optional(),
            limit: z.number().min(1).max(100).default(50),
            offset: z.number().min(0).default(0),
          })
          .optional()
      )
      .query(async ({ input }) => {
        let query = supabaseAdmin
          .from('communication_logs')
          .select(
            '*, communication_templates(*), users(id, email, full_name), communication_schedules(*)'
          )
          .order('sent_at', { ascending: false })
          .range(input?.offset || 0, (input?.offset || 0) + (input?.limit || 50) - 1);

        if (input?.status) {
          query = query.eq('status', input.status);
        }

        if (input?.channel) {
          query = query.eq('channel', input.channel);
        }

        if (input?.template_id) {
          query = query.eq('template_id', input.template_id);
        }

        if (input?.recipient_id) {
          query = query.eq('recipient_id', input.recipient_id);
        }

        const { data, error } = await query;

        if (error) {
          throw new Error(`Failed to fetch logs: ${error.message}`);
        }

        return data || [];
      }),

    // Get user's own logs
    getMyLogs: protectedProcedure
      .input(
        z
          .object({
            limit: z.number().min(1).max(100).default(50),
            offset: z.number().min(0).default(0),
          })
          .optional()
      )
      .query(async ({ input, ctx }) => {
        const { data, error } = await supabaseAdmin
          .from('communication_logs')
          .select('*, communication_templates(*)')
          .eq('recipient_id', ctx.user.id)
          .order('sent_at', { ascending: false })
          .range(input?.offset || 0, (input?.offset || 0) + (input?.limit || 50) - 1);

        if (error) {
          throw new Error(`Failed to fetch logs: ${error.message}`);
        }

        return (data || []) as CommunicationLog[];
      }),

    // Get statistics
    getStats: adminProcedure
      .input(
        z
          .object({
            start_date: z.string().datetime().optional(),
            end_date: z.string().datetime().optional(),
          })
          .optional()
      )
      .query(async ({ input }) => {
        let query = supabaseAdmin.from('communication_logs').select('status, channel');

        if (input?.start_date) {
          query = query.gte('sent_at', input.start_date);
        }

        if (input?.end_date) {
          query = query.lte('sent_at', input.end_date);
        }

        const { data, error } = await query;

        if (error) {
          throw new Error(`Failed to fetch stats: ${error.message}`);
        }

        // Calculate statistics
        const stats = {
          total: data?.length || 0,
          by_status: {} as Record<string, number>,
          by_channel: {} as Record<string, number>,
          opened: 0,
          clicked: 0,
          bounced: 0,
          failed: 0,
        };

        data?.forEach((log) => {
          stats.by_status[log.status] = (stats.by_status[log.status] || 0) + 1;
          stats.by_channel[log.channel] = (stats.by_channel[log.channel] || 0) + 1;
          if (log.status === 'opened') stats.opened++;
          if (log.status === 'clicked') stats.clicked++;
          if (log.status === 'bounced') stats.bounced++;
          if (log.status === 'failed') stats.failed++;
        });

        return stats;
      }),
  }),

  // ============================================================================
  // PREFERENCES
  // ============================================================================

  preferences: router({
    // Get user preferences
    get: protectedProcedure.query(async ({ ctx }) => {
      const { data, error } = await supabaseAdmin
        .from('communication_preferences')
        .select('*')
        .eq('user_id', ctx.user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        // PGRST116 = no rows returned
        throw new Error(`Failed to fetch preferences: ${error.message}`);
      }

      // Return default preferences if none exist
      if (!data) {
        return {
          id: '',
          user_id: ctx.user.id,
          email_enabled: true,
          sms_enabled: false,
          unsubscribe_categories: [],
          preferred_time_windows: {},
          updated_at: new Date().toISOString(),
        } as CommunicationPreference;
      }

      return data as CommunicationPreference;
    }),

    // Update preferences
    update: protectedProcedure
      .input(preferenceSchema)
      .mutation(async ({ input, ctx }) => {
        const { data, error } = await supabaseAdmin
          .from('communication_preferences')
          .upsert(
            {
              user_id: ctx.user.id,
              ...input,
            },
            { onConflict: 'user_id' }
          )
          .select()
          .single();

        if (error) {
          throw new Error(`Failed to update preferences: ${error.message}`);
        }

        return data as CommunicationPreference;
      }),

    // Unsubscribe from category
    unsubscribe: protectedProcedure
      .input(z.object({ category: z.string() }))
      .mutation(async ({ input, ctx }) => {
        // Get current preferences
        const { data: current } = await supabaseAdmin
          .from('communication_preferences')
          .select('unsubscribe_categories')
          .eq('user_id', ctx.user.id)
          .single();

        const categories = current?.unsubscribe_categories || [];
        const updated = [...new Set([...categories, input.category])];

        const { data, error } = await supabaseAdmin
          .from('communication_preferences')
          .upsert(
            {
              user_id: ctx.user.id,
              unsubscribe_categories: updated,
            },
            { onConflict: 'user_id' }
          )
          .select()
          .single();

        if (error) {
          throw new Error(`Failed to unsubscribe: ${error.message}`);
        }

        return data as CommunicationPreference;
      }),
  }),

  // ============================================================================
  // TEMPLATE VARIATIONS
  // ============================================================================

  variations: router({
    // Get variations for template
    getByTemplate: publicProcedure
      .input(z.string().uuid())
      .query(async ({ input }) => {
        const { data, error } = await supabaseAdmin
          .from('email_template_variations')
          .select('*')
          .eq('template_id', input)
          .eq('is_active', true)
          .order('variation_type', { ascending: true });

        if (error) {
          throw new Error(`Failed to fetch variations: ${error.message}`);
        }

        return (data || []) as EmailTemplateVariation[];
      }),

    // Create variation (admin only)
    create: adminProcedure
      .input(
        z.object({
          template_id: z.string().uuid(),
          variation_type: z.enum(['subject', 'greeting', 'body', 'closing']),
          content: z.string().min(1),
          weight: z.number().min(0).max(1).default(1.0),
          is_active: z.boolean().default(true),
        })
      )
      .mutation(async ({ input }) => {
        const { data, error } = await supabaseAdmin
          .from('email_template_variations')
          .insert(input)
          .select()
          .single();

        if (error) {
          throw new Error(`Failed to create variation: ${error.message}`);
        }

        return data as EmailTemplateVariation;
      }),

    // Update variation
    update: adminProcedure
      .input(
        z.object({
          id: z.string().uuid(),
          updates: z
            .object({
              content: z.string().min(1).optional(),
              weight: z.number().min(0).max(1).optional(),
              is_active: z.boolean().optional(),
            })
            .optional()
        })
      )
      .mutation(async ({ input }) => {
        const { data, error } = await supabaseAdmin
          .from('email_template_variations')
          .update(input.updates)
          .eq('id', input.id)
          .select()
          .single();

        if (error) {
          throw new Error(`Failed to update variation: ${error.message}`);
        }

        return data as EmailTemplateVariation;
      }),

    // Delete variation
    delete: adminProcedure.input(z.string().uuid()).mutation(async ({ input }) => {
      const { error } = await supabaseAdmin
        .from('email_template_variations')
        .delete()
        .eq('id', input);

      if (error) {
        throw new Error(`Failed to delete variation: ${error.message}`);
      }

        return { success: true };
      }),
  }),

  // ============================================================================
  // SURGE MODE CONFIG
  // ============================================================================

  surgeMode: router({
    // Get surge mode config (admin only)
    get: adminProcedure.query(async () => {
      const { data, error } = await supabaseAdmin
        .from('surge_mode_config')
        .select('*')
        .eq('is_active', true)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw new Error(`Failed to fetch surge mode config: ${error.message}`);
      }

      // Return default if none exists
      if (!data) {
        return {
          id: '',
          is_active: false,
          threshold_registrations_per_hour: 10,
          batch_interval_hours: 1,
          max_emails_per_recipient_per_day: 5,
          active_date_ranges: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        } as SurgeModeConfig;
      }

      return data as SurgeModeConfig;
    }),

    // Update surge mode config
    update: adminProcedure
      .input(
        z.object({
          is_active: z.boolean().optional(),
          threshold_registrations_per_hour: z.number().int().min(1).optional(),
          batch_interval_hours: z.number().int().min(1).optional(),
          max_emails_per_recipient_per_day: z.number().int().min(1).optional(),
          active_date_ranges: z.array(z.unknown()).optional(),
        })
      )
      .mutation(async ({ input }) => {
        // Check if config exists
        const { data: existing } = await supabaseAdmin
          .from('surge_mode_config')
          .select('id')
          .eq('is_active', true)
          .single();

        let result;
        if (existing) {
          const { data, error } = await supabaseAdmin
            .from('surge_mode_config')
            .update(input)
            .eq('id', existing.id)
            .select()
            .single();

          if (error) {
            throw new Error(`Failed to update surge mode config: ${error.message}`);
          }
          result = data;
        } else {
          const { data, error } = await supabaseAdmin
            .from('surge_mode_config')
            .insert({
              ...input,
              is_active: input.is_active ?? false,
            })
            .select()
            .single();

          if (error) {
            throw new Error(`Failed to create surge mode config: ${error.message}`);
          }
          result = data;
        }

        return result as SurgeModeConfig;
      }),
  }),
});

