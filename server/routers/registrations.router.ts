import { z } from 'zod';
import { router, protectedProcedure, adminProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';
import { generateQRToken } from '@/lib/qr/generate';

export const registrationsRouter = router({
  // Register for an event
  register: protectedProcedure
    .input(z.object({ event_id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      // Use context supabase and user (already authenticated via protectedProcedure)
      const supabase = ctx.supabase;
      
      if (!supabase) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Supabase client not available',
        });
      }

      // Check if already registered
      const { data: existing } = await supabase
        .from('event_registrations')
        .select('id')
        .eq('event_id', input.event_id)
        .eq('user_id', ctx.user.id)
        .single();

      if (existing) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Already registered for this event',
        });
      }

      // Use the database function to register (handles capacity and waitlist)
      const { data, error } = await supabase.rpc('register_for_event', {
        p_event_id: input.event_id,
        p_user_id: ctx.user.id,
      });

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Registration failed: ${error.message}`,
        });
      }

      // Generate QR code token if registration was successful
      if (data && typeof data === 'object' && 'ok' in data && data.ok && 'registration_id' in data) {
        const qrToken = generateQRToken(
          data.registration_id,
          input.event_id,
          ctx.user.id
        );

        // Update registration with QR code token
        await supabase
          .from('event_registrations')
          .update({ qr_code_token: qrToken })
          .eq('id', data.registration_id);
      }

      // Send confirmation email (async, don't wait for it)
      if (data && typeof data === 'object' && 'ok' in data && data.ok) {
        // Get event details and user email for email
        const { data: eventData } = await supabase
          .from('events')
          .select('*')
          .eq('id', input.event_id)
          .single();

        const { data: userProfile } = await supabase
          .from('users')
          .select('full_name, email')
          .eq('id', ctx.user.id)
          .single();

        if (eventData && userProfile) {
          // Get QR code token if registration was successful
          let qrToken = null;
          if (data.registration_id) {
            const { data: regData } = await supabase
              .from('event_registrations')
              .select('qr_code_token')
              .eq('id', data.registration_id)
              .single();
            qrToken = regData?.qr_code_token || null;
          }

          // Extract proper user name - avoid generic role names
          let userName = userProfile.full_name;
          const genericNames = ['Student', 'User', 'Admin', 'student', 'user', 'admin', 'Guest', ''];
          
          // First, try to use full_name if it's valid and not generic
          if (userName && !genericNames.includes(userName?.trim() || '')) {
            // Extract just the first name
            userName = userName.split(' ')[0];
          } else {
            // Fallback to email username - extract first part and clean it
            let emailName = ctx.user.email?.split('@')[0] || '';
            let firstName = emailName.split(/[._-]/)[0];
            
            // Remove trailing numbers (e.g., "prasannasalunkhe5" -> "prasannasalunkhe")
            firstName = firstName.replace(/\d+$/, '');
            
            // If it's a long concatenated name (likely firstname+lastname), extract reasonable first name
            // Try to find natural break points first
            if (firstName && firstName.length > 8) {
              // Try camelCase: "prasannaSalunkhe" -> "prasanna"
              const camelCaseMatch = firstName.match(/^([a-z]+)([A-Z][a-z]+)/);
              if (camelCaseMatch && camelCaseMatch[1].length >= 4) {
                firstName = camelCaseMatch[1];
              } else {
                // No natural break - use first 8 characters as reasonable first name length
                // Common first names are 4-8 characters, so 8 chars should cover most
                firstName = firstName.substring(0, 8);
              }
            }
            
            // If we have something that looks reasonable, use it
            if (firstName && firstName.length >= 2) {
              userName = firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
            } else {
              // Last resort: generic greeting
              userName = 'there';
            }
          }

          // Send email in background (don't await)
          fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/email/send`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'registration_confirmation',
              userName: userName,
              userEmail: userProfile.email || ctx.user.email || '',
              event: {
                title: eventData.title,
                description: eventData.description,
                starts_at: eventData.starts_at,
                ends_at: eventData.ends_at,
                capacity: eventData.capacity,
              },
              registrationId: data.registration_id || data.waitlist_id || 'N/A',
              isWaitlisted: data.status === 'waitlisted',
              waitlistPosition: data.position,
              qrCodeToken: qrToken,
            }),
          }).catch((err) => console.error('Failed to send registration email:', err));
        }
      }

      return data;
    }),

  // Cancel registration
  cancel: protectedProcedure
    .input(z.object({ event_id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      // Use context supabase and user (already authenticated via protectedProcedure)
      const supabase = ctx.supabase;
      
      if (!supabase) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Supabase client not available',
        });
      }

      const { error } = await supabase
        .from('event_registrations')
        .update({ status: 'cancelled' })
        .eq('event_id', input.event_id)
        .eq('user_id', ctx.user.id);

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to cancel registration: ${error.message}`,
        });
      }

      // Promote next person from waitlist
      await supabase.rpc('promote_waitlist', {
        p_event_id: input.event_id,
      });

      // Send cancellation email (async, don't wait for it)
      const { data: eventData } = await supabase
        .from('events')
        .select('*')
        .eq('id', input.event_id)
        .single();

      const { data: userProfile } = await supabase
        .from('users')
        .select('full_name, email')
        .eq('id', ctx.user.id)
        .single();

      if (eventData && userProfile) {
        // Extract proper user name - avoid generic role names
        let userName = userProfile.full_name;
        const genericNames = ['Student', 'User', 'Admin', 'student', 'user', 'admin', 'Guest', ''];
        
        // First, try to use full_name if it's valid and not generic
        if (userName && !genericNames.includes(userName?.trim() || '')) {
          // Extract just the first name
          userName = userName.split(' ')[0];
        } else {
          // Fallback to email username - extract first part and clean it
          let emailName = ctx.user.email?.split('@')[0] || '';
          let firstName = emailName.split(/[._-]/)[0];
          
          // Remove trailing numbers (e.g., "prasannasalunkhe5" -> "prasannasalunkhe")
          firstName = firstName.replace(/\d+$/, '');
          
          // If it's a long concatenated name (likely firstname+lastname), extract reasonable first name
          // Try to find natural break points first
          if (firstName && firstName.length > 8) {
            // Try camelCase: "prasannaSalunkhe" -> "prasanna"
            const camelCaseMatch = firstName.match(/^([a-z]+)([A-Z][a-z]+)/);
            if (camelCaseMatch && camelCaseMatch[1].length >= 4) {
              firstName = camelCaseMatch[1];
            } else {
              // No natural break - use first 8 characters as reasonable first name length
              // Common first names are 4-8 characters, so 8 chars should cover most
              firstName = firstName.substring(0, 8);
            }
          }
          
          // If we have something that looks reasonable, use it
          if (firstName && firstName.length >= 2) {
            userName = firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
          } else {
            // Last resort: generic greeting
            userName = 'there';
          }
        }

        // Send email in background (don't await)
        fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/email/send`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'cancellation',
            userName: userName,
            userEmail: userProfile.email || ctx.user.email || '',
            event: {
              title: eventData.title,
              description: eventData.description,
              starts_at: eventData.starts_at,
              ends_at: eventData.ends_at,
            },
          }),
        }).catch((err) => console.error('Failed to send cancellation email:', err));
      }

      return { success: true };
    }),

  // Get user's registrations
  getMyRegistrations: protectedProcedure.query(async ({ ctx }) => {
    // Use context supabase and user (already authenticated via protectedProcedure)
    const supabase = ctx.supabase;
    
    if (!supabase) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Supabase client not available',
      });
    }

    const { data, error } = await supabase
      .from('event_registrations')
      .select(`
        *,
        events (*)
      `)
      .eq('user_id', ctx.user.id)
      .order('registered_at', { ascending: false });

    if (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: `Failed to fetch registrations: ${error.message}`,
      });
    }

    return data || [];
  }),

  // Get registration status for a specific event
  getStatus: protectedProcedure
    .input(z.object({ event_id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      // Use context supabase and user (already authenticated via protectedProcedure)
      const supabase = ctx.supabase;
      
      if (!supabase) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Supabase client not available',
        });
      }

      const { data, error } = await supabase
        .from('event_registrations')
        .select('*')
        .eq('event_id', input.event_id)
        .eq('user_id', ctx.user.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = not found
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to check registration: ${error.message}`,
        });
      }

      return data || null;
    }),

  // Get all registrations (admin only)
  getAll: adminProcedure
    .input(
      z.object({
        event_id: z.string().uuid().optional(),
        status: z.string().optional(),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      // Use context supabase client (already authenticated via adminProcedure)
      const supabase = ctx.supabase;
      
      if (!supabase) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Supabase client not available',
        });
      }

      let query = supabase
        .from('event_registrations')
        .select(`
          *,
          events (*),
          users:user_id (
            id,
            email,
            full_name,
            role
          )
        `)
        .order('registered_at', { ascending: false });

      if (input?.event_id) {
        query = query.eq('event_id', input.event_id);
      }

      if (input?.status) {
        query = query.eq('status', input.status);
      }

      const { data, error } = await query;

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to fetch registrations: ${error.message}`,
        });
      }

      return data || [];
    }),

  // Get registrations for a specific event (admin only)
  getByEvent: adminProcedure
    .input(z.object({ event_id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      // Use context supabase client (already authenticated via adminProcedure)
      const supabase = ctx.supabase;
      
      if (!supabase) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Supabase client not available',
        });
      }

      const { data, error } = await supabase
        .from('event_registrations')
        .select(`
          *,
          events (*),
          users:user_id (
            id,
            email,
            full_name,
            role
          )
        `)
        .eq('event_id', input.event_id)
        .order('registered_at', { ascending: false });

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to fetch registrations: ${error.message}`,
        });
      }

      return data || [];
    }),

  // Get user's waitlist entries
  getMyWaitlist: protectedProcedure.query(async ({ ctx }) => {
    // Use context supabase and user (already authenticated via protectedProcedure)
    const supabase = ctx.supabase;
    
    if (!supabase) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Supabase client not available',
      });
    }

    const { data, error } = await supabase
      .from('waitlist')
      .select(`
        *,
        events (*)
      `)
      .eq('user_id', ctx.user.id)
      .order('position', { ascending: true });

    if (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: `Failed to fetch waitlist: ${error.message}`,
      });
    }

    return data || [];
  }),

  // Get waitlist status for a specific event
  getWaitlistStatus: protectedProcedure
    .input(z.object({ event_id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      // Use context supabase and user (already authenticated via protectedProcedure)
      const supabase = ctx.supabase;
      
      if (!supabase) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Supabase client not available',
        });
      }

      const { data, error } = await supabase
        .from('waitlist')
        .select('*')
        .eq('event_id', input.event_id)
        .eq('user_id', ctx.user.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = not found
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to check waitlist: ${error.message}`,
        });
      }

      return data || null;
    }),
});

