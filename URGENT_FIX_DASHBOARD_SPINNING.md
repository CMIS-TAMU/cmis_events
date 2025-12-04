# 🔴 URGENT: Mentorship Dashboard Spinning - Quick Fix

## 🚨 Problem
Mentorship dashboard page (`/mentorship/dashboard`) keeps spinning and won't load.

## ✅ IMMEDIATE FIX (2 Minutes)

### Step 1: Check Browser Console

**Press F12** → Go to **Console** tab → Look for errors

Share the error message you see!

### Step 2: Check Network Tab

1. Press F12
2. Go to **Network** tab
3. Click "Request a Mentor" or reload page
4. Find the tRPC request (look for `/api/trpc/...`)
5. Click on it → Check the **Response** tab
6. Share the error message

### Step 3: Quick Database Check

Run this in Supabase SQL Editor:

```sql
-- Check if mentors exist
SELECT COUNT(*) 
FROM mentorship_profiles
WHERE profile_type = 'mentor'
  AND in_matching_pool = true
  AND availability_status = 'active';

-- Clear pending batches
DELETE FROM match_batches WHERE status = 'pending';
```

## 🎯 Most Likely Issues

### Issue 1: Query Hanging
**Symptoms**: Spinner never stops, no error message  
**Fix**: Check browser console and network tab

### Issue 2: No Mentors
**Symptoms**: "No mentors found" error  
**Fix**: Create a mentor using `CREATE_MENTOR_SIMPLE.sql`

### Issue 3: Pending Batch Blocking
**Symptoms**: "Already has pending batch"  
**Fix**: Run `DELETE FROM match_batches WHERE status = 'pending';`

### Issue 4: Database Connection
**Symptoms**: Timeout errors  
**Fix**: Check Supabase connection, restart server

## 🔧 Quick Actions

1. **Open browser DevTools** (F12)
2. **Check Console** for errors
3. **Check Network** tab for failed requests
4. **Run diagnostic SQL** (see file: `CHECK_MENTORSHIP_PAGE_ISSUE.sql`)
5. **Clear pending batches** if needed
6. **Create mentor** if none exist

## 📞 Need More Help?

Share:
1. Error message from browser console
2. Error from Network tab response
3. Result of the mentor count query

Then we can fix the exact issue!

