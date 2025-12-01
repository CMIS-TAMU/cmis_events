# 🔧 Troubleshooting: User Signup & Resume Upload Issues

## Issue 1: User Created but Not Showing in Supabase

### Symptoms
- Signup form says "success"
- User appears in Supabase Authentication → Users
- User does NOT appear in `users` table in database

### Root Cause
**RLS (Row-Level Security) policies are blocking the INSERT** into the `users` table during signup.

### Solution

**Step 1: Fix RLS Policies**

Run this SQL in Supabase SQL Editor:

```sql
-- File: scripts/fix-user-signup-rls.sql
-- Or run the commands directly:

-- Enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Drop existing conflicting policies
DROP POLICY IF EXISTS "Users can insert their own profile" ON users;
DROP POLICY IF EXISTS "Authenticated users can insert own profile" ON users;

-- Create policy: Allow authenticated users to insert their own profile
CREATE POLICY "Authenticated users can insert own profile"
ON users FOR INSERT
WITH CHECK (auth.uid() = id);

-- Verify
SELECT policyname, cmd, with_check 
FROM pg_policies 
WHERE tablename = 'users';
```

**Step 2: Check Browser Console**

1. Open browser DevTools (F12)
2. Go to Console tab
3. Try signing up again
4. Look for errors like:
   - "permission denied"
   - "new row violates row-level security policy"
   - "Error creating user profile"

**Step 3: Manual User Creation (Quick Fix)**

If RLS is blocking, create the user manually in Supabase:

```sql
-- Get the user ID from Authentication → Users
-- Replace 'USER_ID_HERE' with actual UUID from auth.users

INSERT INTO users (id, email, full_name, role, created_at, updated_at)
VALUES (
  'USER_ID_HERE',
  'user@example.com',
  'User Name',
  'student',
  now(),
  now()
);
```

---

## Issue 2: Cannot Choose File for Resume Upload

### Symptoms
- File input appears on page
- Clicking "Choose File" does nothing
- File dialog doesn't open
- No error messages shown

### Root Causes & Solutions

#### Cause 1: Storage Bucket Not Created ❌ **MOST COMMON**

**Solution: Create Storage Bucket**

1. Go to Supabase Dashboard → **Storage**
2. Click **"New bucket"**
3. Configure:
   - **Name:** `resumes`
   - **Public bucket:** ❌ Unchecked (Private)
   - **File size limit:** `10485760` (10 MB)
   - **Allowed MIME types:** `application/pdf`
4. Click **"Create bucket"**

**Verify:**
- Go to Storage → You should see `resumes` bucket
- Status should be "Private"

#### Cause 2: JavaScript Error

**Check Browser Console:**
1. Open DevTools (F12)
2. Console tab
3. Look for errors when clicking file input

**Common Errors:**
- `TypeError: Cannot read property 'files' of undefined`
- `Uncaught ReferenceError: ... is not defined`

**Fix:** Check if file input component is properly loaded

#### Cause 3: File Input Disabled

**Check:**
- Is the form disabled?
- Is the input disabled?
- Is there a loading state preventing interaction?

**Check the code:**
```tsx
// In components/resumes/resume-upload.tsx
// Make sure input is not disabled:
<Input
  type="file"
  accept=".pdf,application/pdf"
  disabled={uploading}  // Should only be disabled while uploading
  // ... other props
/>
```

#### Cause 4: Storage RLS Policies

**Check Storage Policies:**

Go to Supabase Dashboard → Storage → `resumes` → Policies

**Required Policy:**
- Policy Name: "Users can upload their own resumes"
- Allowed Operation: INSERT
- Policy Definition:
```sql
bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]
```

**Quick Fix - Create Policy:**

```sql
-- Go to Storage → resumes → Policies → New Policy

-- Name: "Users can upload their own resumes"
-- Allowed Operation: INSERT
-- Policy Definition:
(bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1])

-- Also add SELECT policy:
-- Name: "Users can view their own resumes"
-- Allowed Operation: SELECT
-- Policy Definition:
(bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1])
```

---

## Complete Fix Checklist

### For User Signup Issue:

- [ ] Run `scripts/fix-user-signup-rls.sql` in Supabase SQL Editor
- [ ] Verify RLS policies exist for users table
- [ ] Check browser console for errors
- [ ] Try signing up again
- [ ] Verify user appears in `users` table

### For Resume Upload Issue:

- [ ] Create `resumes` storage bucket in Supabase
- [ ] Set bucket to Private
- [ ] Set file size limit to 10 MB
- [ ] Set allowed types to `application/pdf`
- [ ] Check storage bucket RLS policies
- [ ] Verify you're logged in
- [ ] Check browser console for errors
- [ ] Try uploading again

---

## Quick Diagnostic Queries

### Check if User Exists

```sql
-- Check auth users
SELECT id, email, created_at 
FROM auth.users 
WHERE email = 'your-email@example.com';

-- Check database users
SELECT id, email, full_name, role, created_at 
FROM users 
WHERE email = 'your-email@example.com';
```

### Check RLS Status

```sql
-- Check if RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'users';

-- Check policies
SELECT policyname, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'users';
```

### Check Storage Bucket

```sql
-- Check if bucket exists
SELECT * FROM storage.buckets WHERE name = 'resumes';

-- Check storage policies
SELECT * FROM storage.policies WHERE bucket_id = 'resumes';
```

---

## Still Having Issues?

1. **Check Supabase Logs:**
   - Dashboard → Logs → Postgres Logs
   - Look for errors during signup/upload

2. **Check Network Tab:**
   - Browser DevTools → Network
   - Look for failed requests (red)
   - Check error messages in response

3. **Verify Environment Variables:**
   ```bash
   # Check .env.local has correct values
   grep SUPABASE .env.local
   ```

4. **Test with Service Role Key:**
   - Temporarily use service role key for testing
   - **WARNING:** Only for testing, never in production!

---

## Success Indicators

✅ **User Signup Working:**
- User appears in `auth.users`
- User appears in `users` table
- Can login successfully

✅ **Resume Upload Working:**
- File input opens file dialog
- Can select PDF file
- File uploads successfully
- File appears in storage bucket
- User record updated with resume info

---

**Need more help?** Check:
- `TEST_USER_RESUME.md` - Complete testing guide
- `POST_MIGRATION_STEPS.md` - Setup instructions
- Supabase Documentation - RLS and Storage

