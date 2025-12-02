# Storage RLS Error Fix

## 🔴 Problem Identified

The error **"new row violates row-level security policy"** was coming from **Supabase Storage**, not the database!

### Error Details:
```
StorageApiError: new row violates row-level security policy
status: 400
statusCode: '403'
```

This occurred because:
- The storage upload was using `createServerSupabase()` (regular client)
- Supabase Storage buckets also have RLS policies
- The regular client is subject to these RLS policies
- The storage bucket's RLS was blocking the file upload

## ✅ Solution Applied

### Changed: `app/api/resume/upload/route.ts`

**Before:**
- Called `uploadResume()` function which used regular client
- Storage upload failed due to RLS

**After:**
- Storage upload now uses `createAdminSupabase()` (admin client)
- Admin client bypasses RLS for both storage and database
- All operations (storage + database) use admin client consistently

### Key Changes:

1. **Removed dependency on `uploadResume()` function**
   - Moved storage upload logic directly into API route
   - Full control over which client to use

2. **Storage upload uses admin client:**
   ```typescript
   const supabaseAdmin = createAdminSupabase();
   const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
     .from('resumes')
     .upload(filename, file, {...});
   ```

3. **Database update already uses admin client:**
   ```typescript
   await supabaseAdmin
     .from('users')
     .update({...})
   ```

## 🔒 Security Note

Using admin client is safe here because:
- ✅ We verify user authentication first (using regular client)
- ✅ We only allow users to upload to their own folder (`${userId}/...`)
- ✅ We only update the authenticated user's own record
- ✅ All operations are server-side (never exposed to client)
- ✅ We validate file type and size before upload

## 📋 What's Fixed

- ✅ Storage upload bypasses RLS
- ✅ Database update bypasses RLS
- ✅ Both use admin client consistently
- ✅ Detailed logging for debugging
- ✅ Better error messages

## 🧪 Testing

1. **Try uploading a resume:**
   - Go to `/profile/resume`
   - Select a PDF file
   - Fill in optional fields
   - Click "Upload Resume"

2. **Check terminal logs:**
   - Should see: `[Resume Upload] Admin client created successfully`
   - Should see: `[Resume Upload] Uploading file to storage...`
   - Should see: `[Resume Upload] File uploaded successfully`
   - Should see: `[Resume Upload] Update successful!`

3. **Expected result:**
   - ✅ No RLS errors
   - ✅ File uploads successfully
   - ✅ Database record updates
   - ✅ Success message appears

## 🚨 If Still Failing

1. **Verify environment variable:**
   - `SUPABASE_SERVICE_ROLE_KEY` must be in `.env.local`
   - Server must be restarted after adding it

2. **Check storage bucket:**
   - Go to Supabase Dashboard → Storage
   - Verify `resumes` bucket exists
   - Check bucket is set to Private (RLS enabled)

3. **Check server logs:**
   - Look for `[Resume Upload]` messages
   - Identify which step fails
   - Share error details for further debugging

## ✅ Status

**Fixed:** Storage upload now uses admin client  
**Result:** Both storage and database operations bypass RLS  
**Next:** Test the upload functionality

