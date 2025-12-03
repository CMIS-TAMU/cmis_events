# Fix: Resume Upload RLS Policy Error

## 🔴 Problem

Users were unable to upload resumes due to **"new row violates row-level security policy"** error. The error was occurring in two places:

1. **Supabase Storage RLS** - Storage bucket policies were blocking file uploads
2. **Database RLS** - User table policies were blocking profile updates

## ✅ Solution

### 1. Storage Upload Fix
- **Changed:** Storage upload now uses admin Supabase client instead of regular client
- **File:** `app/api/resume/upload/route.ts`
- **Impact:** Storage uploads now bypass RLS policies

### 2. Database Update Fix
- **Changed:** Database updates use admin Supabase client
- **File:** `app/api/resume/upload/route.ts`
- **Impact:** Profile updates now bypass RLS policies

### 3. Client Component Fix
- **Changed:** Removed server-only imports from client components
- **Files:** 
  - `app/sponsor/resumes/page.tsx`
  - `app/sponsor/shortlist/page.tsx`
- **Impact:** Fixed build errors and created API route for signed URLs

### 4. New API Endpoints
- **Created:** `/api/resume/signed-url` - Server-side signed URL generation
- **Created:** `/api/test-admin-client` - Admin client verification endpoint
- **Impact:** Proper separation of client/server code

## 📝 Changes Made

### Modified Files:
- `app/api/resume/upload/route.ts` - Uses admin client for storage and database operations
- `app/sponsor/resumes/page.tsx` - Uses API route instead of server function
- `app/sponsor/shortlist/page.tsx` - Uses API route instead of server function
- `lib/storage/resume.ts` - Updated to use server-side client (for tRPC usage)

### New Files:
- `app/api/resume/signed-url/route.ts` - API endpoint for generating signed URLs
- `app/api/test-admin-client/route.ts` - Test endpoint for admin client verification
- `STORAGE_RLS_FIX.md` - Documentation of the fix
- `RESUME_RLS_FIX_COMPLETE.md` - Complete solution documentation

## 🔒 Security Considerations

Using admin client is safe because:
- ✅ User authentication is verified before using admin client
- ✅ Users can only upload to their own folder (`${userId}/...`)
- ✅ Users can only update their own profile record
- ✅ All operations are server-side (never exposed to client)
- ✅ File type and size validation is performed

## 🧪 Testing

### Tested:
- ✅ Resume upload works without RLS errors
- ✅ Storage upload bypasses RLS
- ✅ Database update bypasses RLS
- ✅ Build completes successfully
- ✅ Client components work correctly
- ✅ Signed URLs are generated properly

### Test Steps:
1. Log in to application
2. Navigate to `/profile/resume`
3. Upload a PDF file
4. Fill in optional fields (Major, GPA, Skills, Graduation Year)
5. Click "Upload Resume"
6. Verify success message appears
7. Verify resume appears in profile

## 📋 Requirements

### Environment Variables:
- `SUPABASE_SERVICE_ROLE_KEY` must be set in `.env.local`
- This is required for admin client to bypass RLS

### Supabase Configuration:
- Storage bucket `resumes` must exist
- Bucket should be set to Private (RLS enabled)

## 🚀 Deployment Notes

1. **Environment Variable:** Ensure `SUPABASE_SERVICE_ROLE_KEY` is set in production environment
2. **Storage Bucket:** Verify `resumes` bucket exists and is configured
3. **No Database Migrations:** No schema changes required
4. **Backward Compatible:** Existing resumes continue to work

## 📚 Related Documentation

- `STORAGE_RLS_FIX.md` - Detailed explanation of storage RLS fix
- `RESUME_RLS_FIX_COMPLETE.md` - Complete solution guide

## ✅ Checklist

- [x] Code changes implemented
- [x] Build passes successfully
- [x] Local testing completed
- [x] Documentation added
- [x] Security considerations addressed
- [x] No breaking changes

## 🔗 Related Issues

Fixes the resume upload functionality that was blocked by RLS policies.


