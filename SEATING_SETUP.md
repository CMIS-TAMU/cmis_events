# 🪑 Seat Booking System - Setup Guide

## Overview
A complete seat booking system that allows students to view room layouts and select their preferred seats for events.

## Features
- ✅ Visual seating layout with interactive seat map
- ✅ Real-time seat availability
- ✅ One seat per user per event
- ✅ Seat cancellation
- ✅ Accessible seat indicators
- ✅ Admin layout management

## Setup Instructions

### Step 1: Database Setup
Run the SQL schema in Supabase:

1. Go to Supabase Dashboard → SQL Editor
2. Open `database/seating_schema.sql`
3. Copy and paste the entire file
4. Click **Run**

This creates:
- `event_seating_layouts` - Room layouts for events
- `seats` - Individual seats in each layout
- `seat_reservations` - User seat bookings

### Step 2: Create a Seating Layout (Admin)

**Option A: Via Admin UI (Coming Soon)**
- Go to `/admin/events/[id]/seating`
- Create layout with rows and seats per row

**Option B: Via SQL**
```sql
-- Example: Create a 10x10 grid layout for an event
INSERT INTO event_seating_layouts (event_id, rows, seats_per_row, layout_type)
VALUES ('your-event-id', 10, 10, 'grid');

-- Get the layout ID
SELECT id FROM event_seating_layouts WHERE event_id = 'your-event-id';

-- Seats will be auto-created via the tRPC mutation
-- Or manually create seats:
INSERT INTO seats (layout_id, row_number, seat_number, seat_label, is_available)
SELECT 
  'layout-id',
  row_num,
  seat_num,
  CHR(64 + row_num) || seat_num::text,
  true
FROM generate_series(1, 10) row_num
CROSS JOIN generate_series(1, 10) seat_num;
```

**Option C: Via tRPC (Programmatic)**
```typescript
// In your admin page or API
trpc.seating.createLayout.mutate({
  event_id: 'event-id',
  rows: 10,
  seats_per_row: 10,
  layout_type: 'grid'
});
```

### Step 3: Test the Feature

1. **As Admin:**
   - Create a seating layout for an event
   - View the layout at `/admin/events/[id]/seating`

2. **As Student:**
   - Register for an event
   - Click "Book a Seat" button on event page
   - Select a seat from the visual layout
   - Confirm booking

## How It Works

### For Students:
1. Register for an event
2. Click "Book a Seat" button on event detail page
3. View interactive seating layout
4. Click on an available seat (blue)
5. Confirm booking
6. Your seat turns green
7. Can cancel and select a different seat

### For Admins:
1. Create seating layout when creating/editing event
2. Set number of rows and seats per row
3. Optionally mark seats as accessible
4. View all reservations

## Seat Status Colors:
- 🔵 **Blue** - Available
- 🟢 **Green** - Your seat
- 🔴 **Red** - Reserved by someone else
- ⚫ **Gray** - Unavailable

## Files Created:
- `database/seating_schema.sql` - Database schema
- `app/events/[id]/seating/page.tsx` - Seating layout page
- `server/routers/seating.router.ts` - API endpoints
- Updated `app/events/[id]/page.tsx` - Added "Book a Seat" button

## API Endpoints:
- `trpc.seating.getLayout` - Get layout for event
- `trpc.seating.getReservations` - Get all reservations
- `trpc.seating.getMyReservation` - Get user's reservation
- `trpc.seating.bookSeat` - Book a seat
- `trpc.seating.cancelSeat` - Cancel reservation
- `trpc.seating.createLayout` - Admin: Create layout

## Next Steps:
1. Run the database schema
2. Create a layout for a test event
3. Test booking as a student
4. (Optional) Add admin UI for layout management

