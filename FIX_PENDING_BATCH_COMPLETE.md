# Complete Fix for "Student already has a pending match batch" Error

## The Problem

The error occurs because:
1. **Database Function Issue**: The `create_match_batch` function checks for ANY pending batch, even if it's expired
2. **No Application-Level Cleanup**: The application code doesn't clear expired batches before calling the function

## The Solution: Two-Layer Fix

We've implemented **both** database-level and application-level fixes:

### ✅ Layer 1: Database Function Fix (Primary Fix)

**File**: `database/migrations/fix_match_batch_expiration_check.sql`

This updates the database function to:
- ✅ Ignore expired pending batches when checking
- ✅ Auto-delete expired batches before creating a new one
- ✅ Only block if there's a NON-EXPIRED pending batch

**You MUST run this migration in Supabase!**

### ✅ Layer 2: Application Code Fix (Defensive Fix)

**File**: `server/routers/mentorship.router.ts` (lines 286-303)

The application code now:
- ✅ Clears expired pending batches BEFORE calling the database function
- ✅ Provides better error messages for users
- ✅ Works even if the database function hasn't been updated yet (safety net)

**Already implemented in the code!** ✅

## What Changed in the Code

### Before:
```typescript
// Just called the function - no cleanup
const { data: batchResult, error: batchError } = await supabase.rpc('create_match_batch', {
  p_student_id: userId,
  p_request_id: requestId,
});
```

### After:
```typescript
// DEFENSIVE FIX: Clear expired pending batches before creating new one
try {
  await supabase
    .from('match_batches')
    .delete()
    .eq('student_id', userId)
    .eq('status', 'pending')
    .lt('expires_at', new Date().toISOString()); // Only delete expired ones
  
  // Continue even if cleanup fails (non-critical)
} catch (err) {
  console.warn('Error clearing expired batches (non-critical):', err);
}

// Then call the function
const { data: batchResult, error: batchError } = await supabase.rpc('create_match_batch', {
  p_student_id: userId,
  p_request_id: requestId,
});
```

## Why Both Layers?

1. **Database Fix** = Long-term, proper solution at the data layer
2. **Application Fix** = Safety net + better UX + works immediately

Even if the database function hasn't been updated yet, the application code will clear expired batches automatically!

## Steps to Apply

### Step 1: Clear Existing Pending Batches (One-time)

Run in Supabase SQL Editor:
```sql
DELETE FROM match_batches WHERE status = 'pending';
```

Or use: `database/test-data/QUICK_CLEAR_PENDING_BATCHES.sql`

### Step 2: Update Database Function (Critical!)

Run in Supabase SQL Editor:
- **File**: `database/migrations/fix_match_batch_expiration_check.sql`

### Step 3: Code Already Updated! ✅

The application code fix is already in place. No need to change anything.

### Step 4: Test

Try requesting a mentor again - it should work now!

## Summary

✅ **SQL Migration**: Updates database function (run this!)
✅ **Code Changes**: Already done (defensive cleanup)
✅ **Better Error Messages**: Already implemented

The combination of both fixes ensures:
- Immediate relief (code cleanup)
- Long-term fix (database function)
- Better user experience (helpful error messages)

