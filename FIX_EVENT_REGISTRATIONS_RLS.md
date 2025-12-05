# 🔧 Fix: Event Registrations RLS Policy Error

## Error Message
```
Registration failed: new row violates row-level security policy for table 'event_registrations'
```

## Problem
When a user tries to register for an event, the `register_for_event` database function tries to insert a row into the `event_registrations` table, but Row-Level Security (RLS) is blocking the INSERT because there's no policy allowing it.

## ✅ Solution: Create Event Registrations RLS Policies

### Step 1: Open Supabase SQL Editor
1. Go to your **Supabase Dashboard**
2. Click **"SQL Editor"** in the left sidebar
3. Click **"New Query"**

### Step 2: Run the Fix Script

Copy and paste the contents of `scripts/fix-event-registrations-rls.sql` into Supabase SQL Editor and run it.

Or copy this SQL directly:

```sql
-- ============================================
-- Fix Event Registrations RLS Policies
-- ============================================

-- Step 1: Enable RLS on event_registrations table
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;

-- Step 2: Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can insert own registration" ON event_registrations;
DROP POLICY IF EXISTS "Users can view own registrations" ON event_registrations;
DROP POLICY IF EXISTS "Users can update own registration" ON event_registrations;
DROP POLICY IF EXISTS "Users can delete own registration" ON event_registrations;
DROP POLICY IF EXISTS "Admins can view all registrations" ON event_registrations;
DROP POLICY IF EXISTS "Admins can manage all registrations" ON event_registrations;

-- Step 3: Allow authenticated users to insert their own registrations
CREATE POLICY "Users can insert own registration"
ON event_registrations FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Step 4: Allow users to view their own registrations
CREATE POLICY "Users can view own registrations"
ON event_registrations FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Step 5: Allow users to update their own registrations
CREATE POLICY "Users can update own registration"
ON event_registrations FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Step 6: Allow users to delete their own registrations
CREATE POLICY "Users can delete own registration"
ON event_registrations FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Step 7: Allow admins to view all registrations
CREATE POLICY "Admins can view all registrations"
ON event_registrations FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role = 'admin'
  )
);

-- Step 8: Allow admins to manage all registrations
CREATE POLICY "Admins can manage all registrations"
ON event_registrations FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role = 'admin'
  )
);
```

### Step 3: Verify It Worked

After running, you should see:
- ✅ 6 policies listed (INSERT, SELECT, UPDATE, DELETE for users, SELECT and ALL for admins)
- ✅ RLS is enabled on event_registrations table

---

## Alternative Fix: Update Function with SECURITY DEFINER

If the RLS policies don't work (which shouldn't happen, but just in case), you can update the function to use `SECURITY DEFINER`:

```sql
-- Update the register_for_event function to use SECURITY DEFINER
CREATE OR REPLACE FUNCTION register_for_event(p_event_id uuid, p_user_id uuid)
RETURNS jsonb
SECURITY DEFINER  -- This makes the function run with the function owner's privileges
SET search_path = public
AS $$
DECLARE
  v_capacity integer;
  v_registered_count integer;
  v_reg_id uuid;
  v_wait_id uuid;
  v_position integer;
BEGIN
  -- Validate that p_user_id matches the authenticated user
  IF p_user_id != auth.uid() THEN
    RETURN jsonb_build_object('ok', false, 'error', 'unauthorized');
  END IF;

  SELECT capacity INTO v_capacity FROM events WHERE id = p_event_id;
  IF v_capacity IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'event_not_found');
  END IF;

  SELECT count(*) INTO v_registered_count
    FROM event_registrations
   WHERE event_id = p_event_id AND status = 'registered';

  IF v_registered_count < v_capacity THEN
    INSERT INTO event_registrations (event_id, user_id, status)
    VALUES (p_event_id, p_user_id, 'registered')
    RETURNING id INTO v_reg_id;

    RETURN jsonb_build_object('ok', true, 'status', 'registered', 'registration_id', v_reg_id);
  ELSE
    SELECT COALESCE(MAX(position),0) + 1 INTO v_position FROM waitlist WHERE event_id = p_event_id;

    INSERT INTO waitlist (event_id, user_id, position)
    VALUES (p_event_id, p_user_id, v_position)
    RETURNING id INTO v_wait_id;

    RETURN jsonb_build_object('ok', true, 'status', 'waitlisted', 'waitlist_id', v_wait_id, 'position', v_position);
  END IF;
END;
$$ LANGUAGE plpgsql;
```

**Note:** The RLS policy approach (first solution) is preferred because it's more secure and follows best practices. Only use SECURITY DEFINER if absolutely necessary.

---

## Test After Fix

1. **Try registering for an event again**
   - Navigate to an event page
   - Click "Register for Event"
   - Should register successfully without RLS error

2. **Check the result:**
   - ✅ Registration should succeed (no RLS error)
   - ✅ User should see "Registered" status
   - ✅ Confirmation email should be sent (if configured)

---

## What This Does

The fix creates RLS policies that allow:
1. ✅ **INSERT:** Users can insert their own registration (`auth.uid() = user_id`)
2. ✅ **SELECT:** Users can view their own registrations
3. ✅ **UPDATE:** Users can update their own registrations (for cancellation, status changes)
4. ✅ **DELETE:** Users can delete their own registrations (for cancellation)
5. ✅ **Admin Access:** Admins can view and manage all registrations

---

## Troubleshooting

### Still Getting RLS Error?

1. **Check if RLS is enabled:**
   ```sql
   SELECT tablename, rowsecurity 
   FROM pg_tables 
   WHERE schemaname = 'public' AND tablename = 'event_registrations';
   ```
   Should show `rowsecurity = true`

2. **Check existing policies:**
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'event_registrations';
   ```
   Should show at least the INSERT policy

3. **Verify user authentication:**
   - Make sure user is logged in
   - Check that `auth.uid()` returns the user ID
   - Verify the function is being called with the correct user_id

4. **Check the function call:**
   ```sql
   -- Test the function directly (replace with actual IDs)
   SELECT register_for_event(
     'your-event-id'::uuid,
     auth.uid()
   );
   ```

5. **Verify user_id matches:**
   - The application should pass `ctx.user.id` (from tRPC context)
   - This should match `auth.uid()` when the user is authenticated

---

## Related Fixes

If you also see waitlist errors, run the waitlist RLS fix:
- See `FIX_WAITLIST_RLS.md` for waitlist RLS policies

---

**After running this fix, event registration should work!** ✅

