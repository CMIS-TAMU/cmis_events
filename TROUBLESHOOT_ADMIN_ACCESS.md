# 🔧 Troubleshoot Admin Access Issue

## 🚨 Problem

You set `abhishekp1703@gmail.com` as admin but:
- Cannot see admin links in navigation
- Cannot access admin pages
- Cannot see Case Competitions option

---

## ✅ Step-by-Step Fix

### Step 1: Verify Role in Database

**Run this in Supabase SQL Editor:**

```sql
-- Check your current role
SELECT email, full_name, role 
FROM users 
WHERE email = 'abhishekp1703@gmail.com';
```

**Expected:** Should show `role = 'admin'`

**If not 'admin', run:**
```sql
UPDATE users 
SET role = 'admin' 
WHERE email = 'abhishekp1703@gmail.com';
```

---

### Step 2: Verify User Profile Exists

**Check if your user exists in both tables:**

```sql
-- Check auth.users
SELECT id, email, email_confirmed_at 
FROM auth.users 
WHERE email = 'abhishekp1703@gmail.com';

-- Check public.users
SELECT id, email, role 
FROM users 
WHERE email = 'abhishekp1703@gmail.com';
```

**Both should return your user.**

---

### Step 3: Clear Browser Cache & Cookies

1. **Clear browser cache:**
   - Chrome: Settings → Clear browsing data → Cached images and files
   - Or use Incognito/Private window

2. **Clear cookies for localhost:**
   - Chrome: Settings → Privacy → Cookies → See all cookies
   - Delete all cookies for `localhost:3000`

3. **Hard refresh:**
   - Mac: `Cmd + Shift + R`
   - Windows: `Ctrl + Shift + R`

---

### Step 4: Logout Completely

1. **Logout** from the application
2. **Close all browser tabs** for localhost
3. **Wait 30 seconds**
4. **Open new incognito/private window**
5. **Login again**

---

### Step 5: Test Direct Admin Access

**Try accessing admin pages directly:**

1. **Admin Dashboard:** http://localhost:3000/admin/dashboard
2. **Admin Competitions:** http://localhost:3000/admin/competitions

**If you get redirected:** Role is not set correctly or cached.

**If you see the page:** Role is correct but navigation isn't updating.

---

### Step 6: Check Browser Console

1. **Open browser DevTools** (F12)
2. **Go to Console tab**
3. **Look for errors** related to:
   - User role fetching
   - Authentication
   - Database queries

---

### Step 7: Verify Role Query Works

**Test if the role query works:**

Open browser console and run:
```javascript
// Check what role is being returned
fetch('/api/trpc/auth.getCurrentUser')
  .then(r => r.json())
  .then(console.log);
```

---

## 🐛 Common Issues

### Issue 1: Role Updated but Not Refreshing

**Symptoms:**
- Role is 'admin' in database
- But header still doesn't show admin link

**Fix:**
1. Clear browser cache
2. Logout completely
3. Close all tabs
4. Login in incognito window

---

### Issue 2: User Not in public.users Table

**Symptoms:**
- User exists in auth.users
- But not in public.users

**Fix:**
Run this SQL:
```sql
INSERT INTO users (id, email, full_name, role)
SELECT 
    id,
    email,
    COALESCE(raw_user_meta_data->>'full_name', 'User'),
    'admin'
FROM auth.users
WHERE email = 'abhishekp1703@gmail.com'
ON CONFLICT (email) DO UPDATE
SET role = 'admin';
```

---

### Issue 3: Email Not Verified

**Symptoms:**
- Can't login properly
- Session issues

**Fix:**
1. Check if email is verified in auth.users
2. If not, verify email or disable email confirmation in Supabase

---

## 🔍 Debug Checklist

- [ ] Role is 'admin' in database
- [ ] User exists in both auth.users and public.users
- [ ] Cleared browser cache
- [ ] Cleared cookies
- [ ] Logged out completely
- [ ] Logged in again (in incognito)
- [ ] Checked browser console for errors
- [ ] Tried direct URL access: `/admin/dashboard`

---

## 🧪 Quick Test

1. **Run this SQL:**
```sql
UPDATE users SET role = 'admin' WHERE email = 'abhishekp1703@gmail.com';
SELECT email, role FROM users WHERE email = 'abhishekp1703@gmail.com';
```

2. **Clear everything:**
   - Close all browser tabs
   - Clear cache
   - Clear cookies

3. **Open incognito window:**
   - Go to http://localhost:3000
   - Login
   - Should see "Admin" link in header

4. **If still not working:**
   - Check browser console for errors
   - Try accessing `/admin/dashboard` directly
   - Share any error messages

---

## 📋 Complete Fix Script

Run this complete script in Supabase SQL Editor:

```sql
-- Complete fix for admin access
-- Replace email if different

-- 1. Ensure user profile exists
INSERT INTO users (id, email, full_name, role)
SELECT 
    id,
    email,
    COALESCE(raw_user_meta_data->>'full_name', 'Admin User'),
    'admin'
FROM auth.users
WHERE email = 'abhishekp1703@gmail.com'
ON CONFLICT (email) DO UPDATE
SET role = 'admin';

-- 2. Verify
SELECT 
    u.email,
    u.role,
    u.full_name,
    au.email_confirmed_at
FROM users u
JOIN auth.users au ON u.id = au.id
WHERE u.email = 'abhishekp1703@gmail.com';
```

---

**Try these steps in order and let me know what happens!** 🚀

