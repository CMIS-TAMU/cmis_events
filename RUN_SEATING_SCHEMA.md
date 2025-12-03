# 🪑 How to Run Seating Schema - Step by Step

## Step 1: Open Supabase Dashboard
1. Go to **https://supabase.com/dashboard**
2. Sign in to your account
3. Select your project (the one you're using for CMIS Events)

## Step 2: Open SQL Editor
1. In the left sidebar, click on **SQL Editor**
2. Click the **New Query** button (top right, green button)

## Step 3: Copy the Schema
1. Open the file: `database/seating_schema.sql` in your project
2. **Select ALL** the content (Ctrl+A or Cmd+A)
3. **Copy** it (Ctrl+C or Cmd+C)

## Step 4: Paste into Supabase
1. Go back to the Supabase SQL Editor
2. Click in the query editor area
3. **Paste** the schema (Ctrl+V or Cmd+V)

## Step 5: Run the Query
1. Click the **Run** button (bottom right, or press `Ctrl+Enter`)
2. Wait for it to complete
3. You should see: **"Success. No rows returned"** or similar success message

## Step 6: Verify It Worked
1. In the left sidebar, click on **Table Editor**
2. You should see these new tables:
   - ✅ `event_seating_layouts`
   - ✅ `seats`
   - ✅ `seat_reservations`

## That's It! ✅

Your seating system database is now set up and ready to use.

---

## Quick Copy-Paste Version

If you want to copy directly, here's the full schema:

```sql
-- ============================================
-- Seat Booking System
-- ============================================

-- Event seating layouts (defines the room layout for each event)
CREATE TABLE IF NOT EXISTS event_seating_layouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  layout_name text NOT NULL DEFAULT 'Main Hall',
  rows integer NOT NULL DEFAULT 10,
  seats_per_row integer NOT NULL DEFAULT 10,
  layout_type text DEFAULT 'grid', -- grid, theater, classroom
  metadata jsonb DEFAULT '{}'::jsonb, -- For custom layouts
  created_at timestamptz DEFAULT now(),
  UNIQUE (event_id, layout_name)
);

-- Individual seats
CREATE TABLE IF NOT EXISTS seats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  layout_id uuid NOT NULL REFERENCES event_seating_layouts(id) ON DELETE CASCADE,
  row_number integer NOT NULL,
  seat_number integer NOT NULL,
  seat_label text, -- e.g., "A1", "B5", etc.
  is_available boolean DEFAULT true,
  is_accessible boolean DEFAULT true, -- For accessibility seats
  metadata jsonb DEFAULT '{}'::jsonb,
  UNIQUE (layout_id, row_number, seat_number)
);

-- Seat reservations
CREATE TABLE IF NOT EXISTS seat_reservations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  seat_id uuid NOT NULL REFERENCES seats(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reserved_at timestamptz DEFAULT now(),
  status text DEFAULT 'reserved', -- reserved, cancelled, checked_in
  UNIQUE (seat_id, event_id), -- One reservation per seat per event
  UNIQUE (event_id, user_id) -- One seat per user per event
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_seats_layout_id ON seats(layout_id);
CREATE INDEX IF NOT EXISTS idx_seats_available ON seats(is_available);
CREATE INDEX IF NOT EXISTS idx_seat_reservations_event_id ON seat_reservations(event_id);
CREATE INDEX IF NOT EXISTS idx_seat_reservations_user_id ON seat_reservations(user_id);
CREATE INDEX IF NOT EXISTS idx_seat_reservations_seat_id ON seat_reservations(seat_id);
CREATE INDEX IF NOT EXISTS idx_seat_reservations_status ON seat_reservations(status);

-- RLS Policies
ALTER TABLE event_seating_layouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE seats ENABLE ROW LEVEL SECURITY;
ALTER TABLE seat_reservations ENABLE ROW LEVEL SECURITY;

-- Admins can manage layouts
CREATE POLICY "Admins can manage seating layouts"
  ON event_seating_layouts FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Users can view available seats
CREATE POLICY "Users can view seats"
  ON seats FOR SELECT
  USING (true);

-- Admins can manage seats
CREATE POLICY "Admins can manage seats"
  ON seats FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Users can view their own reservations
CREATE POLICY "Users can view own reservations"
  ON seat_reservations FOR SELECT
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Users can create reservations for themselves
CREATE POLICY "Users can reserve seats"
  ON seat_reservations FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Users can cancel their own reservations
CREATE POLICY "Users can cancel own reservations"
  ON seat_reservations FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Admins can manage all reservations
CREATE POLICY "Admins can manage all reservations"
  ON seat_reservations FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );
```

---

## Troubleshooting

### Error: "relation already exists"
- This means the tables already exist
- You can either:
  - Drop them first: `DROP TABLE IF EXISTS seat_reservations, seats, event_seating_layouts CASCADE;`
  - Or just continue - the `IF NOT EXISTS` will skip creation

### Error: "permission denied"
- Make sure you're logged in as the project owner
- Or use the Service Role key in your connection

### Error: "foreign key constraint"
- Make sure the `events` and `users` tables exist first
- Run the main schema.sql if you haven't already

---

## Visual Guide

1. **Supabase Dashboard** → Click **SQL Editor** (left sidebar)
2. **New Query** button (top right)
3. **Paste** the SQL code
4. **Run** button (bottom right, or Ctrl+Enter)
5. **Success!** ✅

That's it! Your seating system is ready.

