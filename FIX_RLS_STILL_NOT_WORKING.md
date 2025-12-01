# 🔧 Fix: RLS Policy Still Not Working

## Error Still Happening
```
Account created but profile setup failed: new row violates row-level security 
policy for table "users". Please contact support.
```

Even though the policy exists, it's not working. Let's try different approaches.

---

## Solution 1: Fix the RLS Policy (Recommended)

### Run this in Supabase SQL Editor:

**File: `scripts/fix-rls-policy-working.sql`**

This creates a more explicit policy with `TO authenticated` role specification.

### Or try this quick fix:

```sql
-- Drop and recreate with explicit role
DROP POLICY IF EXISTS "Authenticated users can insert own profile" ON users;

CREATE POLICY "Users can insert own profile during signup"
ON users FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);
```

---

## Solution 2: Use Database Trigger (Alternative)

If RLS policies continue to fail, use a database trigger instead:

**File: `scripts/fix-rls-alternative-approach.sql`**

This creates a trigger that automatically creates the user profile when an auth user is created.

**Then update signup code** to remove the manual INSERT (the trigger handles it).

---

## Solution 3: Temporarily Disable RLS (Testing Only!)

**WARNING:** Only for testing, not for production!

```sql
-- Disable RLS temporarily
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Test signup - should work now

-- Re-enable RLS after testing
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
```

If this works, then RLS policies are the issue.

---

## Solution 4: Check Auth Context

The issue might be that `auth.uid()` is not available during the INSERT. Let's verify:

```sql
-- Check if you can see auth.uid()
SELECT auth.uid() as current_user_id;
```

If this returns NULL, then the user isn't authenticated during signup.

---

## Most Likely Fix

The RLS policy might not be recognizing the authenticated user. Try this:

```sql
-- Complete reset of RLS policies
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Drop all policies
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'users') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON users';
    END LOOP;
END $$;

-- Re-enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create a simpler, more permissive policy
CREATE POLICY "Allow authenticated insert"
ON users FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = id);

CREATE POLICY "Allow authenticated select"
ON users FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Allow authenticated update"
ON users FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);
```

---

## Debugging Steps

1. **Check current policies:**
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'users';
   ```

2. **Check RLS status:**
   ```sql
   SELECT tablename, rowsecurity 
   FROM pg_tables 
   WHERE tablename = 'users';
   ```

3. **Test auth context:**
   ```sql
   SELECT auth.uid(), auth.email();
   ```

4. **Check browser console:**
   - Press F12
   - Look for the exact error message
   - Check network tab for failed requests

---

## Recommended Action

**Try Solution 1 first** (the fix-rls-policy-working.sql script).

If that doesn't work, **try Solution 2** (database trigger approach).

The trigger approach is more reliable because it bypasses RLS entirely by using `SECURITY DEFINER`.

---

## After Fixing

1. Run the fix script in Supabase
2. Refresh your browser
3. Try creating a user account again
4. Should work! ✅

