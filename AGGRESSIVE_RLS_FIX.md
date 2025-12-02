# 🔧 Aggressive RLS Fix - Still Getting Recursion Error

## 🚨 If You're Still Getting the Same Error

The recursion might be caused by:
1. **Policies we haven't found yet**
2. **Triggers or functions querying users table**
3. **Cached policies**

---

## ✅ Solution 1: Complete Reset (Recommended)

### Run This Complete Script

**Copy and paste this ENTIRE block:**

```sql
-- COMPLETE RLS RESET
-- Step 1: Drop ALL policies using dynamic SQL
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'users') 
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON users CASCADE';
    END LOOP;
END $$;

-- Step 2: Disable RLS
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Step 3: Re-enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Step 4: Create simple policies
CREATE POLICY "users_own_select"
ON users FOR SELECT TO authenticated
USING (auth.uid() = id);

CREATE POLICY "users_all_select"
ON users FOR SELECT TO authenticated
USING (true);

-- Step 5: Test
SELECT id, email, role FROM users WHERE email = 'abhishekp1703@gmail.com';
```

---

## ✅ Solution 2: Temporarily Disable RLS (Quick Test)

**If the above doesn't work, temporarily disable RLS to test:**

```sql
-- Disable RLS completely (for testing only)
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Test query
SELECT id, email, role FROM users WHERE email = 'abhishekp1703@gmail.com';
```

**After this works:**
1. Clear browser cache
2. Login and check `/debug-role`
3. If it works, then re-enable RLS with simple policies

---

## 🔍 Solution 3: Check for Hidden Issues

### Step 1: See All Policies

```sql
-- List ALL policies on users table
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'users';
```

**Look for:**
- Policies with complex `qual` conditions
- Policies that reference other tables
- Policies that might query `users` table

### Step 2: Check Triggers

```sql
-- Check for triggers that might query users table
SELECT 
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers
WHERE event_object_table = 'users';
```

### Step 3: Check Functions

```sql
-- Check for functions that might query users table
SELECT 
    routine_name,
    routine_definition
FROM information_schema.routines
WHERE routine_definition LIKE '%users%'
  AND routine_schema = 'public';
```

---

## ✅ Solution 4: Nuclear Option - Drop and Recreate Policies

```sql
-- Nuclear option: Drop EVERYTHING and start fresh

-- 1. Drop all policies
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'users') 
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON users';
    END LOOP;
END $$;

-- 2. Disable RLS
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- 3. Wait a moment (let database process)
SELECT pg_sleep(1);

-- 4. Re-enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 5. Create only ONE simple policy
CREATE POLICY "users_read_all"
ON users
FOR SELECT
TO authenticated
USING (true);

-- 6. Test
SELECT id, email, role FROM users WHERE email = 'abhishekp1703@gmail.com';
```

---

## 🎯 Try This Order

1. **First:** Run Solution 1 (Complete Reset)
2. **If still error:** Run Solution 2 (Disable RLS temporarily)
3. **If that works:** Re-enable RLS with Solution 4 (Nuclear Option)
4. **If still error:** Share the results of Solution 3 diagnostic queries

---

## 📋 What to Share If Still Not Working

After running Solution 3, share:

1. **All policies:**
```sql
SELECT policyname, cmd, qual FROM pg_policies WHERE tablename = 'users';
```

2. **All triggers:**
```sql
SELECT trigger_name, action_statement FROM information_schema.triggers WHERE event_object_table = 'users';
```

3. **RLS status:**
```sql
SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'users';
```

---

**Try Solution 1 first, then Solution 2 if it doesn't work!** 🚀

