import { z } from 'zod';
import { router, protectedProcedure, adminProcedure, publicProcedure } from '../trpc';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const seatingRouter = router({
  // Get seating layout for an event
  getLayout: publicProcedure
    .input(z.object({ event_id: z.string().uuid() }))
    .query(async ({ input }) => {
      const supabase = createClient(supabaseUrl, supabaseAnonKey);

      const { data: layout, error: layoutError } = await supabase
        .from('event_seating_layouts')
        .select('*')
        .eq('event_id', input.event_id)
        .single();

      if (layoutError && layoutError.code !== 'PGRST116') {
        throw new Error(`Failed to fetch layout: ${layoutError.message}`);
      }

      if (!layout) {
        return null;
      }

      // Get all seats for this layout
      const { data: seats, error: seatsError } = await supabase
        .from('seats')
        .select('*')
        .eq('layout_id', layout.id)
        .order('row_number', { ascending: true })
        .order('seat_number', { ascending: true });

      if (seatsError) {
        throw new Error(`Failed to fetch seats: ${seatsError.message}`);
      }

      return {
        ...layout,
        seats: seats || [],
      };
    }),

  // Get all reservations for an event
  getReservations: publicProcedure
    .input(z.object({ event_id: z.string().uuid() }))
    .query(async ({ input }) => {
      const supabase = createClient(supabaseUrl, supabaseAnonKey);

      const { data, error } = await supabase
        .from('seat_reservations')
        .select('*')
        .eq('event_id', input.event_id)
        .eq('status', 'reserved');

      if (error) {
        throw new Error(`Failed to fetch reservations: ${error.message}`);
      }

      return data || [];
    }),

  // Get user's reservation for an event
  getMyReservation: protectedProcedure
    .input(z.object({ event_id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const supabase = createClient(supabaseUrl, supabaseAnonKey);

      const { data, error } = await supabase
        .from('seat_reservations')
        .select('*')
        .eq('event_id', input.event_id)
        .eq('user_id', ctx.user.id)
        .eq('status', 'reserved')
        .single();

      if (error && error.code !== 'PGRST116') {
        throw new Error(`Failed to fetch reservation: ${error.message}`);
      }

      return data || null;
    }),

  // Book a seat
  bookSeat: protectedProcedure
    .input(
      z.object({
        event_id: z.string().uuid(),
        seat_id: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const supabase = createClient(supabaseUrl, supabaseAnonKey);

      // Check if user already has a reservation
      const { data: existingReservation } = await supabase
        .from('seat_reservations')
        .select('id')
        .eq('event_id', input.event_id)
        .eq('user_id', ctx.user.id)
        .eq('status', 'reserved')
        .single();

      if (existingReservation) {
        throw new Error('You already have a seat reserved for this event');
      }

      // Check if seat is available
      const { data: seat, error: seatError } = await supabase
        .from('seats')
        .select('id, is_available')
        .eq('id', input.seat_id)
        .single();

      if (seatError || !seat) {
        throw new Error('Seat not found');
      }

      if (!seat.is_available) {
        throw new Error('This seat is not available');
      }

      // Check if seat is already reserved
      const { data: existingSeatReservation } = await supabase
        .from('seat_reservations')
        .select('id')
        .eq('event_id', input.event_id)
        .eq('seat_id', input.seat_id)
        .eq('status', 'reserved')
        .single();

      if (existingSeatReservation) {
        throw new Error('This seat is already reserved');
      }

      // Create reservation
      const { data, error } = await supabase
        .from('seat_reservations')
        .insert({
          event_id: input.event_id,
          seat_id: input.seat_id,
          user_id: ctx.user.id,
          status: 'reserved',
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to book seat: ${error.message}`);
      }

      return data;
    }),

  // Cancel seat reservation
  cancelSeat: protectedProcedure
    .input(z.object({ event_id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const supabase = createClient(supabaseUrl, supabaseAnonKey);

      const { error } = await supabase
        .from('seat_reservations')
        .update({ status: 'cancelled' })
        .eq('event_id', input.event_id)
        .eq('user_id', ctx.user.id)
        .eq('status', 'reserved');

      if (error) {
        throw new Error(`Failed to cancel reservation: ${error.message}`);
      }

      return { success: true };
    }),

  // Admin: Create seating layout
  createLayout: adminProcedure
    .input(
      z.object({
        event_id: z.string().uuid(),
        layout_name: z.string().default('Main Hall'),
        rows: z.number().int().min(1).max(50),
        seats_per_row: z.number().int().min(1).max(50),
        layout_type: z.enum(['grid', 'theater', 'classroom']).default('grid'),
      })
    )
    .mutation(async ({ input }) => {
      const supabase = createClient(supabaseUrl, supabaseAnonKey);

      // Create layout
      const { data: layout, error: layoutError } = await supabase
        .from('event_seating_layouts')
        .insert({
          event_id: input.event_id,
          layout_name: input.layout_name,
          rows: input.rows,
          seats_per_row: input.seats_per_row,
          layout_type: input.layout_type,
        })
        .select()
        .single();

      if (layoutError) {
        throw new Error(`Failed to create layout: ${layoutError.message}`);
      }

      // Create seats
      const seats = [];
      for (let row = 1; row <= input.rows; row++) {
        for (let seatNum = 1; seatNum <= input.seats_per_row; seatNum++) {
          const rowLetter = String.fromCharCode(64 + row); // A, B, C, etc.
          seats.push({
            layout_id: layout.id,
            row_number: row,
            seat_number: seatNum,
            seat_label: `${rowLetter}${seatNum}`,
            is_available: true,
            is_accessible: false,
          });
        }
      }

      const { error: seatsError } = await supabase.from('seats').insert(seats);

      if (seatsError) {
        throw new Error(`Failed to create seats: ${seatsError.message}`);
      }

      return layout;
    }),

  // Admin: Get all layouts
  getAllLayouts: adminProcedure.query(async () => {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const { data, error } = await supabase
      .from('event_seating_layouts')
      .select('*, events(title)')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch layouts: ${error.message}`);
    }

    return data || [];
  }),
});

