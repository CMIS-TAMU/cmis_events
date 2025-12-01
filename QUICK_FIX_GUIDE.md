# ⚡ Quick Fix Guide for Your Issues

## 🐛 Your Issues:

1. ✅ User created but not showing in Supabase `users` table
2. ✅ Cannot choose file in resume upload

---

## 🔧 Fix #1: User Not Showing in Supabase

### Problem:
User is created in Auth, but INSERT into `users` table is blocked by RLS policies.

### Solution (2 minutes):

1. **Open Supabase SQL Editor**
   - Go to your Supabase Dashboard
   - Click "SQL Editor" in left sidebar

2. **Run the Fix Script:**
   - Open file: `scripts/fix-user-signup-rls.sql`
   - Copy ALL the SQL commands
   - Paste into Supabase SQL Editor
   - Click "Run"

3. **Verify:**
   ```sql
   SELECT policyname, cmd 
   FROM pg_policies 
   WHERE tablename = 'users';
   ```
   Should show at least:
   - ✅ "Authenticated users can insert own profile" (INSERT)
   - ✅ "Users can view own profile" (SELECT)

4. **Test:**
   - Try creating a new user
   - Check if user appears in `users` table

---

## 🔧 Fix #2: Cannot Choose File for Resume

### Problem:
Storage bucket `resumes` doesn't exist yet.

### Solution (3 minutes):

1. **Create Storage Bucket:**
   - Go to Supabase Dashboard → **Storage**
   - Click **"New bucket"** button
   - Configure:
     - **Name:** `resumes` (exactly this name)
     - **Public bucket:** ❌ Unchecked (must be Private)
     - **File size limit:** `10485760` (10 MB)
     - **Allowed MIME types:** `application/pdf`
   - Click **"Create bucket"**

2. **Set Up Storage Policies:**
   - Go to Storage → `resumes` → **Policies** tab
   - Click **"New Policy"**

   **Policy 1: Upload**
   - Name: `Users can upload their own resumes`
   - Allowed Operation: `INSERT`
   - Policy Definition:
   ```sql
   bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]
   ```

   **Policy 2: View**
   - Name: `Users can view their own resumes`
   - Allowed Operation: `SELECT`
   - Policy Definition:
   ```sql
   bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]
   ```

   **Policy 3: Delete**
   - Name: `Users can delete their own resumes`
   - Allowed Operation: `DELETE`
   - Policy Definition:
   ```sql
   bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]
   ```

3. **Test:**
   - Go to `/profile/resume`
   - Click "Choose File"
   - ✅ File dialog should open
   - Select a PDF and upload

---

## ✅ Quick Checklist

### User Signup Fix:
- [ ] Ran `scripts/fix-user-signup-rls.sql` in Supabase
- [ ] Verified policies exist
- [ ] Created a test user
- [ ] Verified user appears in `users` table

### Resume Upload Fix:
- [ ] Created `resumes` storage bucket (Private)
- [ ] Set file size limit to 10 MB
- [ ] Set allowed types to `application/pdf`
- [ ] Created storage policies (INSERT, SELECT, DELETE)
- [ ] Tested file upload

---

## 🚀 Next Steps

1. **Fix User Signup:**
   ```bash
   # Open Supabase SQL Editor
   # Run: scripts/fix-user-signup-rls.sql
   ```

2. **Fix Resume Upload:**
   ```bash
   # Create storage bucket in Supabase Dashboard
   # See POST_MIGRATION_STEPS.md Section 2
   ```

3. **Test Everything:**
   - Create a new user
   - Login
   - Upload resume
   - Verify in database and storage

---

## 📋 Detailed Guides

- **TROUBLESHOOTING_USER_RESUME.md** - Complete troubleshooting guide
- **TEST_USER_RESUME.md** - Full testing instructions
- **POST_MIGRATION_STEPS.md** - Complete setup guide

---

## 🆘 Still Having Issues?

1. **Check Browser Console:**
   - Press F12
   - Look for red errors

2. **Check Supabase Logs:**
   - Dashboard → Logs → Postgres Logs

3. **Verify Environment:**
   ```bash
   # Make sure .env.local has correct values
   grep SUPABASE .env.local
   ```

---

**Ready to fix?** Start with Fix #1 (RLS policies) - it's the quickest! 🚀

