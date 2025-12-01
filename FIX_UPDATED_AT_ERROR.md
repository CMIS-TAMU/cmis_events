# ✅ Fixed: updated_at Column Error

## Problem
```
Account created but profile setup failed: Could not find the 'updated_at' 
column of 'users' in the schema cache.
```

## Root Cause
The `users` table schema doesn't have an `updated_at` column, but the signup code was trying to insert it.

## Solution Applied ✅

**Fixed signup code** to only insert columns that exist:
- Removed `updated_at` (doesn't exist)
- Removed `created_at` (uses database default)
- Now only inserts: `id`, `email`, `full_name`, `role`

## Try Again

1. **Refresh your browser** (to get the updated code)
2. **Try creating a user account again**
3. ✅ Should work now!

## Optional: Add updated_at Column

If you want to track when users are updated, you can optionally add the `updated_at` column:

**Run in Supabase SQL Editor:**
```sql
-- File: scripts/add-updated-at-column.sql
-- This adds updated_at column with automatic update trigger
```

This is **optional** - the app works fine without it!

---

## What Changed

### Files Updated:
- ✅ `app/(auth)/signup/page.tsx` - Removed non-existent columns
- ✅ `server/routers/auth.router.ts` - Removed updated_at reference

### Schema Reference:
The `users` table has these columns:
- `id` (uuid, primary key)
- `email` (text, unique)
- `full_name` (text)
- `role` (text, default 'user')
- `metadata` (jsonb)
- `created_at` (timestamptz, default now())

**No `updated_at` column exists** (and that's okay - we fixed the code to match!)

---

✅ **Ready to test!** Try creating a user account again.

