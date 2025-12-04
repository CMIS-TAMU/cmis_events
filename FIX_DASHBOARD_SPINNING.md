# Fix: Mentorship Dashboard Page Spinning

## 🚨 Problem
The mentorship dashboard page (`/mentorship/dashboard`) keeps spinning and won't load.

## 🔍 Most Likely Causes

1. **Queries hanging** - `getMatchBatch` or `getActiveMatch` queries taking too long
2. **Role check hanging** - User role query taking too long
3. **Database connection issue** - Supabase queries timing out
4. **Missing data causing infinite retries** - Queries retrying forever

## ✅ Quick Fix Steps

### Step 1: Check Browser Console

1. Open DevTools (F12)
2. Go to **Console** tab
3. Look for error messages
4. Go to **Network** tab
5. Find the tRPC requests
6. Check if they're pending or have errors

### Step 2: Check Database

Run this in Supabase SQL Editor:

```sql
-- Check for blocking data
SELECT 
  'Match batches' as check_type,
  COUNT(*) as count
FROM match_batches
WHERE status = 'pending';

-- Check if mentors exist
SELECT COUNT(*) as mentor_count
FROM mentorship_profiles
WHERE profile_type = 'mentor'
  AND in_matching_pool = true
  AND availability_status = 'active';
```

### Step 3: Clear Any Blocking Data

```sql
-- Clear expired pending batches
UPDATE match_batches
SET status = 'expired'
WHERE status = 'pending' AND expires_at < NOW();

-- Or delete all pending batches for testing
DELETE FROM match_batches WHERE status = 'pending';
```

### Step 4: Check Server Logs

Look at your Next.js server terminal for:
- Database query errors
- Timeout errors
- tRPC errors

### Step 5: Try Hard Refresh

1. Clear browser cache
2. Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
3. Try in incognito mode

## 🔧 Code Fixes Applied

I've improved the dashboard with:
- ✅ Shorter timeout (8 seconds instead of 15)
- ✅ Better error handling
- ✅ Graceful degradation (shows content even if some queries fail)
- ✅ More specific loading conditions

## 🐛 Common Issues

### Issue 1: Page spins forever
**Cause**: Query hanging or infinite retry  
**Fix**: Check browser console and server logs for errors

### Issue 2: "Loading..." never stops
**Cause**: Role check or match queries hanging  
**Fix**: Clear browser cache, check database connection

### Issue 3: Error but no message
**Cause**: Error not being displayed  
**Fix**: Check browser console for actual error

## 📋 Diagnostic Checklist

- [ ] Checked browser console for errors
- [ ] Checked Network tab for hanging requests
- [ ] Checked server logs for backend errors
- [ ] Ran diagnostic SQL queries
- [ ] Cleared pending match batches
- [ ] Verified mentors exist in database
- [ ] Tried hard refresh/incognito mode

## 🚀 If Still Spinning

1. **Open browser DevTools** (F12)
2. **Check Console tab** - look for errors
3. **Check Network tab** - find the hanging request
4. **Check server terminal** - look for backend errors
5. **Share the error messages** - so we can fix the root cause

The page should now timeout after 8 seconds and show an error message instead of spinning forever!
