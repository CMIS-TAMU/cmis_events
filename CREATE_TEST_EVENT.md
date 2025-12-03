# 🎉 Create a Test Event - Quick Guide

## Option 1: Via Admin UI (Recommended)

1. **Sign in as admin:**
   - Go to `http://localhost:3000/login`
   - Sign in with your admin account

2. **Create Event:**
   - Go to `http://localhost:3000/admin/dashboard`
   - Click **"Create New Event"** or go to `/admin/events/new`
   - Fill in:
     - Title: "Test Event with Seating"
     - Description: "Testing the seat booking feature"
     - Date & Time: Set to future date
     - Capacity: 100 (or any number)
   - Click **Save**

3. **Get Event ID:**
   - After creating, you'll be redirected to the event page
   - Copy the event ID from the URL: `/events/[event-id]`

4. **Create Seating Layout:**
   - Follow instructions in `CREATE_FIRST_LAYOUT.md`
   - Use the event ID you just copied

## Option 2: Via SQL (Quick Test)

If you want to quickly create a test event via SQL:

```sql
-- Create a test event
INSERT INTO events (title, description, capacity, starts_at, ends_at)
VALUES (
  'Test Event with Seating',
  'This is a test event to demonstrate the seat booking feature',
  100,
  NOW() + INTERVAL '7 days',  -- Starts in 7 days
  NOW() + INTERVAL '7 days' + INTERVAL '2 hours'  -- Ends 2 hours later
)
RETURNING id;
```

Then:
1. Copy the returned `id`
2. Use it in the seating layout creation SQL from `CREATE_FIRST_LAYOUT.md`

## Option 3: Create Event + Layout in One Go

```sql
-- Create event and layout together
WITH new_event AS (
  INSERT INTO events (title, description, capacity, starts_at, ends_at)
  VALUES (
    'Test Event with Seating',
    'Testing seat booking system',
    100,
    NOW() + INTERVAL '7 days',
    NOW() + INTERVAL '7 days' + INTERVAL '2 hours'
  )
  RETURNING id
),
new_layout AS (
  INSERT INTO event_seating_layouts (event_id, rows, seats_per_row, layout_type, layout_name)
  SELECT id, 10, 10, 'grid', 'Main Hall'
  FROM new_event
  RETURNING id
)
INSERT INTO seats (layout_id, row_number, seat_number, seat_label, is_available, is_accessible)
SELECT 
  new_layout.id,
  row_num,
  seat_num,
  CHR(64 + row_num) || seat_num::text,
  true,
  false
FROM new_layout
CROSS JOIN generate_series(1, 10) row_num
CROSS JOIN generate_series(1, 10) seat_num;
```

This creates:
- ✅ A test event
- ✅ A 10x10 seating layout
- ✅ 100 seats (A1-A10, B1-B10, etc.)

## Test the Feature

1. **View the event:**
   - Go to `http://localhost:3000/events`
   - You should see "Test Event with Seating"

2. **Register:**
   - Click on the event
   - Click "Register" button
   - Sign in if needed

3. **Book a seat:**
   - Click "Book a Seat" button
   - Select a seat from the layout
   - Confirm booking

**That's it! Your seating system is working!** 🪑✨

