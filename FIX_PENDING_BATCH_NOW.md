# 🚨 Immediate Fix for "Student already has a pending match batch" Error

## Quick Fix (Do This First!)

### Step 1: Clear ALL Pending Batches in Supabase

Run this SQL in **Supabase SQL Editor**:

```sql
-- Delete ALL pending batches (nuclear option)
DELETE FROM match_batches WHERE status = 'pending';

-- Verify it's cleared
SELECT COUNT(*) FROM match_batches WHERE status = 'pending';
-- Should return: 0
```

Or use the script: **`database/test-data/FORCE_CLEAR_ALL_PENDING_BATCHES.sql`**

### Step 2: Update Database Function (Critical!)

Run this migration in **Supabase SQL Editor**:
- **File**: `database/migrations/fix_match_batch_expiration_check.sql`

This updates the function to ignore expired batches.

### Step 3: Restart Your Application Server

The code changes need the server to be restarted to take effect:

```bash
# Stop the current server (Ctrl+C)
# Then restart:
pnpm dev
```

Or if using a process manager:
```bash
pm2 restart all
# or
docker-compose restart
```

## Why This Happens

1. **Old pending batch exists** - Either expired or still active
2. **Database function hasn't been updated** - Still checks for ANY pending batch
3. **Server not restarted** - Code changes not active yet

## After Fixing

1. ✅ Clear batches in Supabase (Step 1)
2. ✅ Update database function (Step 2)  
3. ✅ Restart server (Step 3)
4. ✅ Try requesting mentor again

## If Still Not Working

1. Check if server restarted properly
2. Verify SQL migration ran successfully
3. Check server logs for errors
4. Run diagnostic: `database/test-data/COMPREHENSIVE_FIX_PENDING_BATCH.sql`

