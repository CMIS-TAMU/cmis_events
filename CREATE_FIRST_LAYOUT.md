# 🪑 Create Your First Seating Layout

Now that the database is set up, let's create a seating layout for an event!

## Option 1: Quick SQL Method (Easiest)

### Step 1: Get an Event ID
1. Go to your Supabase Dashboard → **Table Editor** → **events**
2. Find an event you want to add seating to
3. Copy its `id` (UUID)

### Step 2: Create Layout via SQL
1. Go to **SQL Editor** → **New Query**
2. Paste this SQL (replace `'your-event-id-here'` with actual event ID):

```sql
-- Create a 10x10 grid layout (10 rows, 10 seats per row)
INSERT INTO event_seating_layouts (event_id, rows, seats_per_row, layout_type, layout_name)
VALUES ('your-event-id-here', 10, 10, 'grid', 'Main Hall')
RETURNING id;
```

3. Click **Run**
4. Copy the `id` that's returned (this is the layout_id)

### Step 3: Create Seats
1. In the same SQL Editor, paste this (replace `'layout-id-here'` with the ID from step 2):

```sql
-- Create all seats for the layout
INSERT INTO seats (layout_id, row_number, seat_number, seat_label, is_available, is_accessible)
SELECT 
  'layout-id-here'::uuid,
  row_num,
  seat_num,
  CHR(64 + row_num) || seat_num::text,  -- Creates A1, A2, B1, B2, etc.
  true,
  false
FROM generate_series(1, 10) row_num
CROSS JOIN generate_series(1, 10) seat_num;
```

2. Click **Run**
3. You should see: "INSERT 0 100" (100 seats created)

## Option 2: All-in-One SQL (Copy-Paste Ready)

Replace `'your-event-id-here'` with your actual event ID and run:

```sql
-- Create layout and seats in one go
WITH new_layout AS (
  INSERT INTO event_seating_layouts (event_id, rows, seats_per_row, layout_type, layout_name)
  VALUES ('your-event-id-here', 10, 10, 'grid', 'Main Hall')
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

## Test It!

1. **Go to your event page:**
   - `http://localhost:3000/events/[your-event-id]`

2. **Register for the event** (if not already registered)

3. **Click "Book a Seat" button**

4. **You should see the seating layout!** 🎉

## Customize Layout Size

Want different dimensions? Change the numbers:

```sql
-- Example: 15 rows x 20 seats per row
INSERT INTO event_seating_layouts (event_id, rows, seats_per_row, layout_type, layout_name)
VALUES ('your-event-id', 15, 20, 'grid', 'Main Hall')
RETURNING id;
```

Then update the `generate_series(1, 15)` and `generate_series(1, 20)` in the seats query.

## Mark Seats as Accessible

To mark specific seats as accessible (for wheelchair users):

```sql
-- Mark first seat in each row as accessible
UPDATE seats
SET is_accessible = true
WHERE seat_number = 1 AND layout_id = 'your-layout-id';
```

---

**That's it! Your seating system is ready to use!** 🪑✨

