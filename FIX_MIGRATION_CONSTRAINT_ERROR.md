# 🔧 Fix: Migration Constraint Error

## Error
```
ERROR: 42710: constraint "fk_scheduled_session" for relation "mini_mentorship_requests" already exists
```

## Problem
The foreign key constraint already exists, likely from a previous partial migration run.

## Solution

I've created a **fixed, idempotent version** of the migration that safely handles existing constraints.

### Option 1: Use the Fixed Migration File (Recommended)

**File:** `database/migrations/add_mini_mentorship_system_fixed.sql`

This version:
- ✅ Checks if constraints exist before creating
- ✅ Drops and recreates if needed
- ✅ Safe to run multiple times
- ✅ Handles all existing policies/constraints

**To use:**
1. Go to Supabase SQL Editor
2. Copy contents of `add_mini_mentorship_system_fixed.sql`
3. Run it

### Option 2: Quick Fix - Just Drop the Constraint

If you just want to continue with the current migration, run this first:

```sql
-- Drop the existing constraint
ALTER TABLE mini_mentorship_requests 
DROP CONSTRAINT IF EXISTS fk_scheduled_session;
```

Then continue with the rest of the original migration.

### Option 3: Manual Fix

Run these commands in Supabase SQL Editor:

```sql
-- Check if constraint exists
SELECT conname, contype 
FROM pg_constraint 
WHERE conrelid = 'mini_mentorship_requests'::regclass 
AND conname = 'fk_scheduled_session';

-- If it exists, drop it
ALTER TABLE mini_mentorship_requests 
DROP CONSTRAINT IF EXISTS fk_scheduled_session;

-- Then continue with the migration
```

---

## Recommended: Use the Fixed Migration

The **fixed migration file** (`add_mini_mentorship_system_fixed.sql`) is:
- ✅ Completely idempotent
- ✅ Safe to run multiple times
- ✅ Handles all edge cases
- ✅ Ready to use

Just copy and run it in Supabase SQL Editor!

---

**Quick Fix:** Use the fixed migration file! 🚀

