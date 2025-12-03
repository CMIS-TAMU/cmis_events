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

