# 🔧 Troubleshooting: Mentorship Dashboard Error

## Quick Fix Steps

### **Most Common Issue: Database Tables Don't Exist**

If you're getting errors when accessing the mentorship dashboard, **the database migration likely hasn't been run yet.**

### Step 1: Check Browser Console
1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for error messages
4. Common errors:
   - `relation "mini_mentorship_requests" does not exist`
   - `Table doesn't exist`
   - `permission denied`

### Step 2: Run Database Migration

**In Supabase SQL Editor:**

1. Open Supabase Dashboard
2. Go to **SQL Editor**
3. Click **New Query**
4. Copy the entire contents of:
   ```
   database/migrations/add_mini_mentorship_system.sql
   ```
5. Paste into SQL Editor
6. Click **Run** (or press Cmd/Ctrl + Enter)
7. Wait for success message

### Step 3: Verify Tables Were Created

Run this query in Supabase SQL Editor:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'mini_mentorship%'
ORDER BY table_name;
```

**Expected Output:**
- `mini_mentorship_availability`
- `mini_mentorship_requests`
- `mini_mentorship_sessions`

If you don't see these tables, the migration didn't run successfully. Check for errors in the SQL output.

### Step 4: Restart Your Dev Server

After running migration:
```bash
# Stop the server (Ctrl+C)
# Restart it
pnpm dev
```

### Step 5: Refresh Browser

1. Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
2. Clear cache if needed
3. Try accessing `/mentorship/dashboard` again

---

## Error Messages & Solutions

### Error: "relation does not exist"
**Cause:** Database tables not created  
**Solution:** Run the migration (see Step 2 above)

### Error: "permission denied"
**Cause:** RLS policies blocking access  
**Solution:** Check RLS policies are enabled:
```sql
-- In Supabase SQL Editor
SELECT tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename LIKE 'mini_mentorship%';
```

### Error: "column does not exist"
**Cause:** Migration incomplete  
**Solution:** Drop and recreate tables:
```sql
-- Only if you need to start over!
DROP TABLE IF EXISTS mini_mentorship_sessions CASCADE;
DROP TABLE IF EXISTS mini_mentorship_requests CASCADE;
DROP TABLE IF EXISTS mini_mentorship_availability CASCADE;
```
Then re-run the migration.

### Error: "TypeError: Cannot read property..."
**Cause:** Component trying to access undefined data  
**Solution:** The error handling fix should prevent this. If it still happens, check browser console for the exact line.

---

## Current Error Handling

The dashboard now:
- ✅ **Gracefully handles** missing tables
- ✅ **Shows error message** instead of crashing
- ✅ **Prevents page breakage**
- ✅ **Allows page to load** even if feature isn't ready

### What You'll See:

**If tables don't exist:**
```
Mini mentorship feature is not available yet. 
Please run the database migration first.
```

**If everything is working:**
- Mini Sessions card appears
- Can create requests
- Requests list displays

---

## Still Having Issues?

### Check 1: Is the migration file correct?
```bash
# Verify file exists
ls -la database/migrations/add_mini_mentorship_system.sql
```

### Check 2: Are there syntax errors?
- Copy the SQL file contents
- Paste into Supabase SQL Editor
- Look for red error messages
- Fix any syntax issues

### Check 3: Database Connection
```sql
-- Test connection
SELECT current_database(), current_user;
```

### Check 4: RLS Policies
```sql
-- Check if RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename LIKE 'mini_mentorship%';
```

All should show `true` for `rowsecurity`.

---

## Quick Test After Fix

1. **Login as student**
2. **Go to:** `/mentorship/dashboard`
3. **Should see:**
   - Mini Mentorship Sessions card
   - "Request Mini Session" button
4. **Click button:**
   - Dialog opens
   - Form displays
5. **Fill and submit:**
   - Request created
   - Appears in list

---

## Need Help?

Share these details:
1. **Browser console error** (exact message)
2. **Network tab** - check failed requests to `/api/trpc/miniMentorship...`
3. **Migration status** - did it run successfully?
4. **Supabase logs** - any errors in Supabase dashboard?

---

**Most likely fix:** Just run the database migration! 🚀

