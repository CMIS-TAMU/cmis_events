# 🔧 Fix: Waitlist RLS Policy Error

## Error Message
```
Registration failed: new row violates row-level security policy for table 'waitlist'
```

## Problem
When an event is full, the `register_for_event` database function tries to add the user to the waitlist, but Row-Level Security (RLS) is blocking the INSERT because there's no policy allowing it.

## ✅ Solution: Create Waitlist RLS Policies

### Step 1: Open Supabase SQL Editor
1. Go to your **Supabase Dashboard**
2. Click **"SQL Editor"** in the left sidebar
3. Click **"New Query"**

### Step 2: Run the Fix Script

Copy and paste this SQL into Supabase SQL Editor:

```sql
-- ============================================
-- Fix Waitlist RLS Policies
-- ============================================

-- Step 1: Enable RLS on waitlist table (if not already enabled)
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

-- Step 2: Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can insert into waitlist" ON waitlist;
DROP POLICY IF EXISTS "Users can view own waitlist entries" ON waitlist;
DROP POLICY IF EXISTS "Users can delete own waitlist entries" ON waitlist;
DROP POLICY IF EXISTS "Admins can view all waitlist" ON waitlist;
DROP POLICY IF EXISTS "Admins can manage waitlist" ON waitlist;

-- Step 3: Allow authenticated users to insert their own waitlist entry
CREATE POLICY "Users can insert into waitlist"
ON waitlist FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Step 4: Allow users to view their own waitlist entries
CREATE POLICY "Users can view own waitlist entries"
ON waitlist FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Step 5: Allow users to delete their own waitlist entries (for cancellation)
CREATE POLICY "Users can delete own waitlist entries"
ON waitlist FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Step 6: Allow admins to view all waitlist entries
CREATE POLICY "Admins can view all waitlist"
ON waitlist FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role = 'admin'
  )
);

-- Step 7: Allow admins to manage waitlist (for promoting users)
CREATE POLICY "Admins can manage waitlist"
ON waitlist FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role = 'admin'
  )
);

-- Step 8: Verify policies were created
SELECT 
    policyname, 
    cmd as operation,
    '✅ Created' as status
FROM pg_policies
WHERE tablename = 'waitlist'
ORDER BY cmd;
```

### Step 3: Verify It Worked

After running, you should see:
- ✅ 5 policies listed (INSERT, SELECT, DELETE for users, SELECT and ALL for admins)
- ✅ RLS is enabled on waitlist table

---

## Also Fix Event Registrations RLS (If Needed)

If event registrations are also failing, run this additional fix:

```sql
-- ============================================
-- Fix Event Registrations RLS Policies
-- ============================================

ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can insert own registration" ON event_registrations;
DROP POLICY IF EXISTS "Users can view own registrations" ON event_registrations;
DROP POLICY IF EXISTS "Users can update own registration" ON event_registrations;
DROP POLICY IF EXISTS "Admins can view all registrations" ON event_registrations;

-- Allow users to insert their own registrations
CREATE POLICY "Users can insert own registration"
ON event_registrations FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Allow users to view their own registrations
CREATE POLICY "Users can view own registrations"
ON event_registrations FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Allow users to update their own registrations (for cancellation)
CREATE POLICY "Users can update own registration"
ON event_registrations FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Allow admins to view all registrations
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
```

---

## Test After Fix

1. **Try registering for an event again**
   - If event has capacity: Should register successfully
   - If event is full: Should add to waitlist successfully

2. **Check the result:**
   - ✅ Registration should succeed (no RLS error)
   - ✅ User should see "Registered" or "Waitlisted" status
   - ✅ Confirmation email should be sent (if configured)

---

## What This Does

The fix creates RLS policies that allow:
1. ✅ **INSERT:** Users can insert their own waitlist entry (`auth.uid() = user_id`)
2. ✅ **SELECT:** Users can view their own waitlist entries
3. ✅ **DELETE:** Users can delete their own waitlist entries (for cancellation)
4. ✅ **Admin Access:** Admins can view and manage all waitlist entries

---

## Troubleshooting

### Still Getting RLS Error?

1. **Check if RLS is enabled:**
   ```sql
   SELECT tablename, rowsecurity 
   FROM pg_tables 
   WHERE schemaname = 'public' AND tablename = 'waitlist';
   ```
   Should show `rowsecurity = true`

2. **Check existing policies:**
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'waitlist';
   ```

3. **Verify user authentication:**
   - Make sure user is logged in
   - Check that `auth.uid()` returns the user ID

4. **Check database function:**
   - The function should be using the authenticated user's context
   - Verify the function is being called with the correct user_id

---

**After running this fix, registration should work!** ✅

