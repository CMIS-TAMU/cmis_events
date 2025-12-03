# Local Testing Guide - Resume Upload Fix

## 🚀 Server Status

The development server should be running at: **http://localhost:3000**

## ✅ Test Checklist

### 1. **Basic Application Access**
- [ ] Open http://localhost:3000 in your browser
- [ ] Verify the homepage loads correctly
- [ ] Check browser console for errors (F12 → Console tab)

### 2. **Authentication Test**
- [ ] Navigate to `/login`
- [ ] Log in with your account credentials
- [ ] Verify you're redirected to dashboard after login
- [ ] Check that user session is maintained

### 3. **Resume Upload Test** (Main Fix)
- [ ] Navigate to `/profile/resume`
- [ ] Verify the resume upload form loads
- [ ] Select a PDF file (test file should be < 10 MB)
- [ ] Fill in optional fields:
  - Major (e.g., "Computer Science")
  - GPA (e.g., "3.75")
  - Skills (e.g., "Python, JavaScript, React")
  - Graduation Year (e.g., "2025")
- [ ] Click "Upload Resume"
- [ ] **Expected Result:** 
  - ✅ Upload succeeds
  - ✅ No "Unauthorized" error
  - ✅ No "RLS policy" error
  - ✅ Resume appears in profile
  - ✅ Success message displayed

### 4. **Resume View Test (Sponsor)**
- [ ] Log in as sponsor/admin account
- [ ] Navigate to `/sponsor/resumes`
- [ ] Verify resume list loads
- [ ] Click "View Resume" on any candidate
- [ ] **Expected Result:**
  - ✅ Resume opens in new tab
  - ✅ No errors in console
  - ✅ Signed URL is generated correctly

### 5. **Resume Shortlist Test**
- [ ] Navigate to `/sponsor/shortlist`
- [ ] Verify shortlist page loads
- [ ] Click "View Resume" on shortlisted candidate
- [ ] **Expected Result:**
  - ✅ Resume opens successfully
  - ✅ No API errors

## 🔍 What to Check

### Browser Console (F12)
- No red errors
- No "Unauthorized" errors
- No "RLS policy" errors
- API calls return 200 status

### Network Tab (F12 → Network)
- `/api/resume/upload` returns 200 OK
- `/api/resume/signed-url` returns 200 OK
- No 401 (Unauthorized) errors
- No 403 (Forbidden) errors

### Terminal Output
- No compilation errors
- No runtime errors
- Server running without crashes

## 🐛 Troubleshooting

### If Resume Upload Fails:

1. **Check Environment Variables:**
   ```bash
   # Verify these are in .env.local:
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   SUPABASE_SERVICE_ROLE_KEY=...  # ← Important for RLS bypass
   ```

2. **Check Supabase Storage:**
   - Go to Supabase Dashboard → Storage
   - Verify `resumes` bucket exists
   - Check bucket is set to Private

3. **Check Authentication:**
   - Verify you're logged in
   - Check cookies in DevTools (Application → Cookies)
   - Try logging out and back in

4. **Check Server Logs:**
   - Look at terminal output
   - Check for error messages
   - Verify API routes are accessible

### If Build Errors Occur:

1. **Clear Next.js Cache:**
   ```bash
   rm -rf .next
   pnpm build
   ```

2. **Reinstall Dependencies:**
   ```bash
   rm -rf node_modules
   pnpm install
   ```

## 📝 Test Scenarios

### Scenario 1: First Time Upload
1. User logs in
2. Navigates to `/profile/resume`
3. Uploads PDF
4. Fills optional fields
5. Clicks upload
6. **Expected:** Success, resume saved

### Scenario 2: Update Existing Resume
1. User already has resume uploaded
2. Navigates to `/profile/resume`
3. Uploads new PDF
4. **Expected:** Old resume replaced, new one saved

### Scenario 3: Sponsor Views Resume
1. Sponsor logs in
2. Navigates to `/sponsor/resumes`
3. Clicks "View Resume"
4. **Expected:** Resume opens in new tab

## ✅ Success Criteria

- ✅ Resume upload works without errors
- ✅ No "Unauthorized" errors
- ✅ No "RLS policy" errors
- ✅ Resumes are viewable by sponsors
- ✅ Signed URLs are generated correctly
- ✅ All API endpoints respond correctly

## 🎯 Next Steps After Testing

If all tests pass:
1. ✅ Resume upload functionality is working
2. ✅ RLS policy fix is successful
3. ✅ Client/server separation is correct
4. ✅ Ready for deployment

If tests fail:
1. Check error messages
2. Verify environment variables
3. Check Supabase configuration
4. Review server logs


