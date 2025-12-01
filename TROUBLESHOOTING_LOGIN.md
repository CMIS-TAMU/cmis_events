# 🔧 Troubleshooting: Login Spinning & Profile Access

## Issues You're Experiencing

1. **Login spins indefinitely** when entering credentials
2. **Profile page asks to sign in** even after creating account
3. **Redirect not working** after login

---

## ✅ Fixes Applied

### Fix 1: Profile Page Infinite Loop
- **Problem:** `useEffect` had no dependency array, causing infinite re-renders
- **Solution:** Added `[router]` dependency array
- **File:** `app/profile/resume/page.tsx`

### Fix 2: Login Session Saving
- **Problem:** Session might not be saved before redirect
- **Solution:** 
  - Added delay before redirect
  - Changed to `window.location.href` for full page reload
  - Better error handling
- **File:** `app/(auth)/login/page.tsx`

---

## Common Causes & Solutions

### Issue 1: Email Verification Required

**Symptom:** Login spins or shows "Email not confirmed"

**Solution:**
1. Go to **Supabase Dashboard → Authentication → Users**
2. Find your user
3. Click the user
4. Click **"Confirm"** button to manually verify

**Or disable email confirmation:**
1. Go to **Supabase Dashboard → Authentication → Providers → Email**
2. Uncheck **"Enable email confirmations"**
3. Save

---

### Issue 2: User Profile Doesn't Exist

**Symptom:** Login works but profile page redirects to login

**Check:**
1. Go to **Supabase Dashboard → Table Editor → `users`**
2. Find your user by email
3. If missing, user profile wasn't created

**Fix:**
- Run the database trigger: `BEST_RLS_FIX_TRIGGER.sql`
- Or create profile manually via API route
- Or check if API route has service role key

---

### Issue 3: Session Not Persisting

**Symptom:** Have to login every time, session lost

**Check:**
1. Browser DevTools → Application → Cookies
2. Look for Supabase session cookies
3. Should see cookies like `sb-*-auth-token`

**Fix:**
- Clear cookies and try again
- Check if cookies are being blocked
- Verify Supabase client is using `persistSession: true`

---

### Issue 4: Infinite Loop in Profile Page

**Symptom:** Page keeps reloading/redirecting

**Already Fixed:**
- Added dependency array to `useEffect`
- Should work now after code update

---

## Step-by-Step Debugging

### Step 1: Check User in Database

Run in Supabase SQL Editor:
```sql
SELECT id, email, full_name, role, created_at
FROM users
ORDER BY created_at DESC
LIMIT 5;
```

Should show your user.

---

### Step 2: Check Auth User

In Supabase Dashboard:
- Go to **Authentication → Users**
- Find your email
- Check status (Confirmed/Unconfirmed)

---

### Step 3: Test Login in Browser Console

Open browser console (F12) and run:
```javascript
// Check if you can get session
const { data: { session }, error } = await supabase.auth.getSession();
console.log('Session:', session);
console.log('Error:', error);

// Check if user exists
const { data: { user }, error: userError } = await supabase.auth.getUser();
console.log('User:', user);
console.log('Error:', userError);
```

---

### Step 4: Check Environment Variables

```bash
# Check .env.local
grep SUPABASE .env.local
```

Should have:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (for API route)

---

## Quick Fixes

### Fix 1: Restart Server
```bash
# Stop server (Ctrl+C)
rm -rf .next
pnpm dev
```

### Fix 2: Clear Browser Data
1. Open DevTools (F12)
2. Application tab
3. Clear cookies for localhost:3000
4. Try again

### Fix 3: Verify Email Manually
1. Supabase Dashboard → Authentication → Users
2. Find your user
3. Click "Confirm" to verify

### Fix 4: Create Profile Manually
If profile doesn't exist, create it:
```sql
-- Get user ID from auth.users first
SELECT id, email FROM auth.users WHERE email = 'your-email@example.com';

-- Then insert into users table
INSERT INTO users (id, email, full_name, role)
VALUES (
  'USER_ID_FROM_ABOVE',
  'your-email@example.com',
  'Your Name',
  'student'
);
```

---

## Expected Behavior After Fixes

1. ✅ Create user account → Success message
2. ✅ Login with credentials → Redirects to dashboard
3. ✅ Access profile page → Shows resume upload form
4. ✅ Session persists → Don't have to login again

---

## Still Having Issues?

1. **Check browser console** (F12) for errors
2. **Check server logs** in terminal
3. **Verify email is confirmed** in Supabase
4. **Check user exists in database**
5. **Clear cookies and try again**

---

✅ **After these fixes, login should work properly!**

