import { z } from 'zod';
import { router, publicProcedure, adminProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';
import { createClient } from '@supabase/supabase-js';
import { sendEmail } from '@/lib/email/client';
import { newsletterSubscriptionConfirmationEmail } from '@/lib/email/templates/newsletter-confirmation';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const newsletterRouter = router({
  // Subscribe to newsletter (public - no auth required)
  subscribe: publicProcedure
    .input(
      z.object({
        email: z.string().email('Please enter a valid email address'),
        full_name: z.string().min(1, 'Name is required').optional(),
        role: z.enum(['student', 'mentor', 'sponsor', 'general']).default('general'),
      })
    )
    .mutation(async ({ input }) => {
      const supabase = createClient(supabaseUrl, supabaseAnonKey);

      // Check if already subscribed
      const { data: existing } = await supabase
        .from('newsletter_subscriptions')
        .select('id, is_active')
        .eq('email', input.email.toLowerCase())
        .single();

      if (existing) {
        if (existing.is_active) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'This email is already subscribed to our newsletter!',
          });
        } else {
          // Re-activate subscription
          const { error: updateError } = await supabase
            .from('newsletter_subscriptions')
            .update({
              is_active: true,
              unsubscribed_at: null,
              full_name: input.full_name || undefined,
              role: input.role,
            })
            .eq('id', existing.id);

          if (updateError) {
            throw new TRPCError({
              code: 'INTERNAL_SERVER_ERROR',
              message: 'Failed to reactivate subscription. Please try again.',
            });
          }

          // Send confirmation email for reactivation
          await sendSubscriptionEmail(input.email, input.full_name, input.role);

          return {
            success: true,
            message: 'Welcome back! Your subscription has been reactivated.',
          };
        }
      }

      // Create new subscription
      const { data, error } = await supabase
        .from('newsletter_subscriptions')
        .insert({
          email: input.email.toLowerCase(),
          full_name: input.full_name || null,
          role: input.role,
          source: 'website',
        })
        .select()
        .single();

      if (error) {
        console.error('Newsletter subscription error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to subscribe. Please try again.',
        });
      }

      // Send confirmation email
      await sendSubscriptionEmail(input.email, input.full_name, input.role);

      return {
        success: true,
        message: 'Successfully subscribed to the CMIS newsletter!',
      };
    }),

  // Unsubscribe from newsletter (public - uses email token or direct email)
  unsubscribe: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
      })
    )
    .mutation(async ({ input }) => {
      const supabase = createClient(supabaseUrl, supabaseAnonKey);

      const { error } = await supabase
        .from('newsletter_subscriptions')
        .update({
          is_active: false,
          unsubscribed_at: new Date().toISOString(),
        })
        .eq('email', input.email.toLowerCase());

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to unsubscribe. Please try again.',
        });
      }

      return {
        success: true,
        message: 'You have been unsubscribed from our newsletter.',
      };
    }),

  // Get all subscriptions (admin only)
  getAll: adminProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
        role: z.enum(['student', 'mentor', 'sponsor', 'general']).optional(),
        active_only: z.boolean().default(true),
      }).optional()
    )
    .query(async ({ ctx }) => {
      const supabase = ctx.supabase;

      if (!supabase) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Supabase client not available',
        });
      }

      let query = supabase
        .from('newsletter_subscriptions')
        .select('*')
        .order('subscribed_at', { ascending: false });

      const { data, error } = await query;

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to fetch subscriptions: ${error.message}`,
        });
      }

      return data || [];
    }),

  // Get subscription stats (admin only)
  getStats: adminProcedure.query(async ({ ctx }) => {
    const supabase = ctx.supabase;

    if (!supabase) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Supabase client not available',
      });
    }

    const { data, error } = await supabase
      .from('newsletter_subscriptions')
      .select('role, is_active');

    if (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: `Failed to fetch stats: ${error.message}`,
      });
    }

    const stats = {
      total: data?.length || 0,
      active: data?.filter((s) => s.is_active).length || 0,
      by_role: {
        student: data?.filter((s) => s.role === 'student' && s.is_active).length || 0,
        mentor: data?.filter((s) => s.role === 'mentor' && s.is_active).length || 0,
        sponsor: data?.filter((s) => s.role === 'sponsor' && s.is_active).length || 0,
        general: data?.filter((s) => s.role === 'general' && s.is_active).length || 0,
      },
    };

    return stats;
  }),
});

// Helper function to send subscription confirmation email
async function sendSubscriptionEmail(
  email: string,
  name?: string,
  role?: string
) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  try {
    const emailHtml = newsletterSubscriptionConfirmationEmail({
      recipientName: name || 'there',
      recipientRole: role || 'general',
      appUrl,
      unsubscribeUrl: `${appUrl}/unsubscribe?email=${encodeURIComponent(email)}`,
    });

    await sendEmail({
      to: email,
      subject: '🎉 Welcome to the CMIS Newsletter!',
      html: emailHtml,
    });

    console.log(`Newsletter confirmation email sent to ${email}`);
  } catch (error) {
    console.error('Failed to send newsletter confirmation email:', error);
    // Don't throw - subscription was successful even if email fails
  }
}

