import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const registrationsRouter = router({
  // Register for an event
  register: protectedProcedure
    .input(z.object({ event_id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const supabase = createClient(supabaseUrl, supabaseAnonKey);
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('User not authenticated');
      }

      // Check if already registered
      const { data: existing } = await supabase
        .from('event_registrations')
        .select('id')
        .eq('event_id', input.event_id)
        .eq('user_id', user.id)
        .single();

      if (existing) {
        throw new Error('Already registered for this event');
      }

      // Use the database function to register (handles capacity and waitlist)
      const { data, error } = await supabase.rpc('register_for_event', {
        p_event_id: input.event_id,
        p_user_id: user.id,
      });

      if (error) {
        throw new Error(`Registration failed: ${error.message}`);
      }

      // Send confirmation email (async, don't wait for it)
      if (data && typeof data === 'object' && 'ok' in data && data.ok) {
        // Get event details and user email for email
        const { data: eventData } = await supabase
          .from('events')
          .select('*')
          .eq('id', input.event_id)
          .single();

        const { data: userData } = await supabase.auth.getUser();
        const { data: userProfile } = await supabase
          .from('users')
          .select('full_name, email')
          .eq('id', user?.id)
          .single();

        if (eventData && userData?.user && userProfile) {
          // Send email in background (don't await)
          fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/email/send`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'registration_confirmation',
              userName: userProfile.full_name || userData.user.email?.split('@')[0] || 'User',
              userEmail: userProfile.email || userData.user.email || '',
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
      const supabase = createClient(supabaseUrl, supabaseAnonKey);
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('event_registrations')
        .update({ status: 'cancelled' })
        .eq('event_id', input.event_id)
        .eq('user_id', user.id);

      if (error) {
        throw new Error(`Failed to cancel registration: ${error.message}`);
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

      const { data: userData } = await supabase.auth.getUser();
      const { data: userProfile } = await supabase
        .from('users')
        .select('full_name, email')
        .eq('id', user?.id)
        .single();

      if (eventData && userData?.user && userProfile) {
        // Send email in background (don't await)
        fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/email/send`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'cancellation',
            userName: userProfile.full_name || userData.user.email?.split('@')[0] || 'User',
            userEmail: userProfile.email || userData.user.email || '',
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
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('event_registrations')
      .select(`
        *,
        events (*)
      `)
      .eq('user_id', user.id)
      .order('registered_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch registrations: ${error.message}`);
    }

    return data || [];
  }),

  // Get registration status for a specific event
  getStatus: protectedProcedure
    .input(z.object({ event_id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const supabase = createClient(supabaseUrl, supabaseAnonKey);
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('event_registrations')
        .select('*')
        .eq('event_id', input.event_id)
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = not found
        throw new Error(`Failed to check registration: ${error.message}`);
      }

      return data || null;
    }),
});

