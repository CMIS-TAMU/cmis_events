# 🔧 Fix Starter File Upload Issue

## Issue
"Mission created but starter file upload failed" error when creating missions with starter files.

## Debugging Steps

### 1. Check Browser Console (F12)
When you try to upload, check the browser console for:
- `[Starter File Upload]` logs
- Error messages with details
- Network tab for the `/api/missions/upload-starter-files` request

### 2. Check Server Logs
Look at your terminal where `pnpm dev` is running for:
- `[Starter File Upload] Attempting upload:` logs
- `[Starter File Upload] Upload error details:` logs
- Any error messages

### 3. Verify Storage Bucket Exists

**Go to Supabase Dashboard:**
1. Navigate to: https://supabase.com/dashboard
2. Select your project
3. Go to **Storage** → **Buckets**

**Check if `mission-starter-files` bucket exists:**
- [ ] If it exists, verify it's **Public**
- [ ] If it doesn't exist, create it:

#### Create the Bucket:
1. Click **"New bucket"**
2. **Name:** `mission-starter-files`
3. **Public bucket:** ✅ **Check this box** (make it public)
4. **File size limit:** `50 MB` (or leave default)
5. Click **"Create bucket"**

### 4. Common Issues & Solutions

#### Issue: "Bucket not found"
**Solution:** Create the `mission-starter-files` bucket in Supabase Storage

#### Issue: "Permission denied" or "Access denied"
**Solution:** 
- Make sure bucket is **Public**
- Or add RLS policies (but using admin client should bypass this)

#### Issue: "File too large"
**Solution:** 
- Check file size is under 50 MB
- The file you're uploading might be too large

#### Issue: "Invalid file type"
**Solution:** 
- Only ZIP, PDF, TXT, and MD files are allowed
- Check the file extension matches

### 5. Test Upload Directly

You can test the upload API directly:

```bash
# Using curl (replace with your actual values)
curl -X POST http://localhost:3000/api/missions/upload-starter-files \
  -H "Cookie: your-auth-cookie" \
  -F "file=@/path/to/test.pdf" \
  -F "missionId=your-mission-id"
```

### 6. Check Environment Variables

Make sure these are set in `.env.local`:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (required for admin client)

### 7. Verify Admin Client Works

The upload uses `createAdminSupabase()` which requires `SUPABASE_SERVICE_ROLE_KEY`.

**Test if admin client works:**
1. Go to: `http://localhost:3000/api/test-admin-client`
2. Should return success message
3. If it fails, check `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`

## Quick Fix Checklist

- [ ] Storage bucket `mission-starter-files` exists
- [ ] Bucket is set to **Public**
- [ ] `SUPABASE_SERVICE_ROLE_KEY` is set in `.env.local`
- [ ] File size is under 50 MB
- [ ] File type is ZIP, PDF, TXT, or MD
- [ ] Check browser console for detailed error
- [ ] Check server logs for detailed error

## After Fixing

1. Restart dev server: `pnpm dev`
2. Try creating a mission with starter file again
3. Check console logs for success/error messages
4. If still failing, share the exact error message from console

---

**Most Common Issue:** Storage bucket doesn't exist or isn't public.

