# Fix "Student already has a pending match batch" Error

## Problem
Even after deleting pending batches, the error persists because:
1. The database function still checks for ANY pending batch (including expired ones)
2. The function needs to be updated to ignore expired batches

## Solution: Run BOTH scripts in order

### Step 1: Clear ALL Pending Batches (Immediate Fix)

Run this in **Supabase SQL Editor**:

```sql
-- Delete ALL pending batches
DELETE FROM match_batches WHERE status = 'pending';

-- Delete expired batches
DELETE FROM match_batches WHERE expires_at < now() - interval '1 day';

-- Verify
SELECT COUNT(*) as remaining FROM match_batches WHERE status = 'pending';
-- Should return 0
```

**Or use the script:** `database/test-data/QUICK_CLEAR_PENDING_BATCHES.sql`

### Step 2: Update the Database Function (Long-term Fix)

**This is the critical step!** The function needs to be updated.

Run this migration in **Supabase SQL Editor**:
- **File:** `database/migrations/fix_match_batch_expiration_check.sql`

This will update the `create_match_batch` function to:
- ✅ Ignore expired pending batches
- ✅ Auto-delete expired batches before creating new one
- ✅ Only block if there's a NON-EXPIRED pending batch

### Step 3: Verify the Fix

Run this to see the function definition:

```sql
SELECT pg_get_functiondef(oid) 
FROM pg_proc 
WHERE proname = 'create_match_batch';
```

Look for this line in the function (around line 37):
```sql
AND (expires_at IS NULL OR expires_at > now()) -- Only block if not expired
```

If you see this line, the fix is applied! ✅

### Step 4: Test

1. Try requesting a mentor again in the app
2. It should work now!

## If Still Not Working

Run the comprehensive diagnostic:
- **File:** `database/test-data/COMPREHENSIVE_FIX_PENDING_BATCH.sql`

This will show:
- All match batches
- Which ones are pending
- The function definition
- Help identify any remaining issues

## Summary

**You MUST run BOTH:**
1. ✅ Delete pending batches (Step 1)
2. ✅ Update the function (Step 2) - **This is the key fix!**

Without Step 2, the function will keep blocking even if you delete batches manually.

