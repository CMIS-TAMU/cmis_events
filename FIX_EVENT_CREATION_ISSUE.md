# 🔧 Fix: Event Creation Not Working

## 🐛 **Problem**

When clicking "Create Event", the form circles back to the same page instead of creating the event and redirecting.

## ✅ **What I Fixed**

1. **Added Error Display**
   - Errors are now shown in a red alert box at the top of the form
   - Errors are also shown as toast notifications
   - Console errors are still logged for debugging

2. **Improved Error Handling**
   - Better validation of date/time inputs
   - More descriptive error messages
   - Errors are properly caught and displayed

3. **Fixed Async Email Trigger**
   - Wrapped email trigger in setTimeout to prevent blocking
   - Better error handling for email trigger failures

## 🔍 **How to Debug**

### **Step 1: Check Browser Console**

1. Open browser DevTools (F12)
2. Go to **Console** tab
3. Try creating an event
4. Look for any red error messages

**Common errors:**
- `UNAUTHORIZED` - You're not logged in
- `FORBIDDEN` - You don't have admin role
- `Failed to create event: ...` - Database error

### **Step 2: Check Network Tab**

1. Open browser DevTools (F12)
2. Go to **Network** tab
3. Try creating an event
4. Look for the tRPC request to `events.create`
5. Click on it and check:
   - **Status** - Should be 200 (success) or error code
   - **Response** - Check the error message

### **Step 3: Verify Admin Role**

Run this in Supabase SQL Editor:

```sql
-- Check your user's role
SELECT id, email, role 
FROM users 
WHERE email = 'YOUR_EMAIL@example.com';
```

Should show `role = 'admin'`

If not admin:
```sql
-- Set yourself as admin
UPDATE users 
SET role = 'admin' 
WHERE email = 'YOUR_EMAIL@example.com';
```

### **Step 4: Check Database Permissions**

Verify RLS policies allow inserts:

```sql
-- Check RLS policies on events table
SELECT * FROM pg_policies WHERE tablename = 'events';
```

## 🧪 **Test the Fix**

1. **Open the form** - `/admin/events/new`
2. **Fill in required fields:**
   - Title: "Test Event"
   - Start Date & Time: Tomorrow, any time
   - Capacity: 50 (or leave as 0)
3. **Click "Create Event"**
4. **Check for errors:**
   - If error appears in red box → Read the error message
   - If no error → Should redirect to edit page
   - Check browser console for details

## 🎯 **Common Issues & Solutions**

### **Issue: "Admin access required"**

**Solution:**
- Verify you're logged in
- Check your role is 'admin' in database
- Try logging out and back in

### **Issue: "Failed to create event: ..."**

**Solution:**
- Check the specific error message
- Common causes:
  - Invalid date format
  - Database connection issue
  - RLS policy blocking insert
  - Missing required fields

### **Issue: Form submits but nothing happens**

**Solution:**
- Check browser console for errors
- Check Network tab for failed requests
- Verify Supabase connection is working

## 📝 **What to Check**

After the fix, when you create an event:

1. ✅ **Error messages are visible** (if any errors occur)
2. ✅ **Toast notification appears** (success or error)
3. ✅ **Redirects to edit page** (on success)
4. ✅ **Event appears in database** (check `events` table)
5. ✅ **Emails are queued** (check `communication_queue` table)

## 🔧 **If Still Not Working**

1. **Check server logs** (if running locally)
2. **Check Supabase logs** (Dashboard → Logs)
3. **Verify environment variables** are set correctly
4. **Try creating event via SQL** to test database:

```sql
INSERT INTO events (title, starts_at, capacity, created_by)
VALUES (
  'Test Event',
  NOW() + INTERVAL '7 days',
  50,
  (SELECT id FROM users WHERE role = 'admin' LIMIT 1)
)
RETURNING *;
```

If this works, the issue is with the API/UI, not the database.

---

**The fix is now in place. Try creating an event and check the error message if it fails!**


