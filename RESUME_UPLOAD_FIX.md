# Resume Upload "Unauthorized" Error - Fix Guide

## 🔴 Problem

Users see **"Unauthorized"** error when trying to upload a resume.

## 🔍 Root Causes

### 1. **Authentication Context Missing** ✅ FIXED
**Issue:** The API route was creating a fresh Supabase client without authentication cookies.

**Location:**
- `app/api/resume/upload/route.ts` (line 12)
- `lib/storage/resume.ts` (line 38)

**Problem:**
```typescript
// ❌ WRONG - No auth context
const supabase = createClient(supabaseUrl, supabaseAnonKey);
const { data: { user } } = await supabase.auth.getUser(); // Returns null!
```

**Fix Applied:**
```typescript
// ✅ CORRECT - Uses server-side client with cookies
const supabase = await createServerSupabase();
const { data: { user }, error: authError } = await supabase.auth.getUser();
```

### 2. **Storage Bucket Not Created** ⚠️ CHECK THIS
**Issue:** The `resumes` storage bucket doesn't exist in Supabase.

**How to Fix:**
1. Go to **Supabase Dashboard** → **Storage**
2. Click **"New bucket"**
3. Configure:
   - **Name:** `resumes`
   - **Public bucket:** ❌ **Unchecked** (Private)
   - **File size limit:** `10485760` (10 MB)
   - **Allowed MIME types:** `application/pdf`
4. Click **"Create bucket"**

**Verify:**
- Go to Storage → You should see `resumes` bucket
- Status should be "Private"

### 3. **Storage RLS Policies Missing** ⚠️ CHECK THIS
**Issue:** Row Level Security (RLS) policies not configured for the storage bucket.

**How to Fix:**

1. Go to **Supabase Dashboard** → **Storage** → `resumes` → **Policies**

2. **Create INSERT Policy:**
   - Click **"New Policy"**
   - **Policy Name:** "Users can upload their own resumes"
   - **Allowed Operation:** `INSERT`
   - **Policy Definition:**
   ```sql
   bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]
   ```

3. **Create SELECT Policy:**
   - Click **"New Policy"**
   - **Policy Name:** "Users can view their own resumes"
   - **Allowed Operation:** `SELECT`
   - **Policy Definition:**
   ```sql
   bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]
   ```

4. **Create UPDATE Policy (optional):**
   - Click **"New Policy"**
   - **Policy Name:** "Users can update their own resumes"
   - **Allowed Operation:** `UPDATE`
   - **Policy Definition:**
   ```sql
   bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]
   ```

5. **Create DELETE Policy:**
   - Click **"New Policy"**
   - **Policy Name:** "Users can delete their own resumes"
   - **Allowed Operation:** `DELETE`
   - **Policy Definition:**
   ```sql
   bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]
   ```

### 4. **User Not Logged In** ⚠️ CHECK THIS
**Issue:** User session expired or user not authenticated.

**How to Verify:**
1. Check browser console for auth errors
2. Try logging out and logging back in
3. Check if cookies are being set (DevTools → Application → Cookies)

### 5. **CORS Issues** (Less Likely)
**Issue:** Cross-origin requests blocked.

**Fix:** Usually handled automatically by Next.js, but verify:
- API route is at `/api/resume/upload`
- Frontend is calling from same origin

## ✅ Fixes Applied

### Files Modified:

1. **`app/api/resume/upload/route.ts`**
   - ✅ Changed to use `createServerSupabase()` instead of `createClient()`
   - ✅ Added proper error handling for auth errors
   - ✅ Better error messages

2. **`lib/storage/resume.ts`**
   - ✅ Changed to use `createServerSupabase()` in all functions
   - ✅ Removed hardcoded Supabase URL/key
   - ✅ Better auth error handling

## 🧪 Testing Steps

1. **Restart your dev server:**
   ```bash
   pnpm dev
   ```

2. **Test the upload:**
   - Log in to your account
   - Go to `/profile/resume`
   - Select a PDF file
   - Fill in optional fields
   - Click "Upload Resume"

3. **Check browser console:**
   - Open DevTools (F12)
   - Look for any errors in Console tab
   - Check Network tab for API response

4. **Verify in Supabase:**
   - Go to Storage → `resumes` bucket
   - You should see your uploaded file in `{userId}/` folder

## 📋 Checklist

- [x] Fixed authentication in API route
- [x] Fixed authentication in storage functions
- [ ] Verify `resumes` bucket exists in Supabase
- [ ] Verify RLS policies are configured
- [ ] Test upload after fixes
- [ ] Check browser console for errors

## 🚨 If Still Failing

1. **Check Supabase Dashboard:**
   - Storage → `resumes` bucket exists?
   - Storage → `resumes` → Policies configured?

2. **Check Environment Variables:**
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key
   ```

3. **Check Browser Console:**
   - Any JavaScript errors?
   - Network tab shows 401/403?

4. **Check Server Logs:**
   - Terminal running `pnpm dev`
   - Look for error messages

## 📞 Next Steps

If the issue persists after these fixes:
1. Check Supabase Storage bucket configuration
2. Verify RLS policies are active
3. Check user authentication status
4. Review server logs for detailed error messages


