# 🧪 Test: Adding User & Uploading Resume

## Prerequisites

Before testing, ensure:
- ✅ Development server is running (`pnpm dev`)
- ✅ Database migration completed
- ✅ Storage bucket `resumes` is created in Supabase (see POST_MIGRATION_STEPS.md)
- ✅ You have a test PDF file ready (or we'll create one)

---

## Step 1: Create Test User Account

### Via Signup Page

1. **Open Browser:**
   - Navigate to: http://localhost:3000/signup

2. **Fill Signup Form:**
   - **Full Name:** `Test Student`
   - **Email:** `teststudent@example.com` (use your own email or a test email)
   - **Password:** `test123456` (min 6 characters)
   - **Role:** Select `Student`
   - Click **"Create account"**

3. **Expected Results:**
   - ✅ Success message: "Check your email"
   - ✅ Redirected to login page
   - ✅ Email verification sent (if email service configured)

### Verify User in Database

**Option 1: Supabase Dashboard**
1. Go to Supabase Dashboard → Table Editor → `users`
2. Find your test user by email
3. ✅ Verify user record exists with:
   - `email`: your test email
   - `full_name`: "Test Student"
   - `role`: "student"
   - `created_at`: current timestamp

**Option 2: SQL Query (Supabase SQL Editor)**
```sql
SELECT * FROM users WHERE email = 'teststudent@example.com';
```

---

## Step 2: Login as Test User

1. **Navigate to Login:**
   - Go to: http://localhost:3000/login

2. **Login Credentials:**
   - **Email:** `teststudent@example.com`
   - **Password:** `test123456`

3. **Expected Results:**
   - ✅ Successfully logged in
   - ✅ Redirected to dashboard
   - ✅ Header shows your name

**Note:** If email verification is required, you may need to:
- Check email for verification link, OR
- In Supabase Dashboard → Authentication → Users, manually verify the user

---

## Step 3: Prepare Test Resume PDF

### Option A: Use Existing PDF
- Use any PDF file (resume, document, etc.)
- File should be less than 10 MB

### Option B: Create Simple Test PDF

If you don't have a PDF, create a simple test file:

**On macOS (Terminal):**
```bash
# Create a simple text file
echo "TEST RESUME
Name: Test Student
Email: teststudent@example.com
Major: Computer Science
GPA: 3.75
Skills: Python, JavaScript, React
Graduation Year: 2025" > test-resume.txt

# Convert to PDF (requires textutil)
# OR use an online converter
# OR use: https://www.ilovepdf.com/txt_to_pdf
```

**Quick Alternative:**
- Download any PDF from internet
- Or use a sample resume template

---

## Step 4: Upload Resume

1. **Navigate to Resume Page:**
   - After logging in, go to: http://localhost:3000/profile/resume
   - Or click on "Profile" → "Resume" in navigation

2. **Upload Form:**
   - Click **"Choose File"** or drag and drop
   - Select your test PDF file
   - **Optional Fields:**
     - **Major:** `Computer Science`
     - **GPA:** `3.75`
     - **Skills:** `Python, JavaScript, React` (comma-separated)
     - **Graduation Year:** `2025`

3. **Click "Upload Resume"**

4. **Expected Results:**
   - ✅ Upload progress indicator
   - ✅ Success message: "Resume uploaded successfully!"
   - ✅ Resume displayed in viewer
   - ✅ Download button appears
   - ✅ Resume metadata shown (upload date, version)

---

## Step 5: Verify Resume in Database

### Check User Record

**Supabase SQL Editor:**
```sql
SELECT 
  id,
  email,
  full_name,
  resume_filename,
  resume_url,
  resume_uploaded_at,
  resume_version,
  major,
  gpa,
  skills,
  graduation_year
FROM users 
WHERE email = 'teststudent@example.com';
```

**Expected Results:**
- ✅ `resume_filename`: Path to file in storage
- ✅ `resume_url`: URL to resume
- ✅ `resume_uploaded_at`: Current timestamp
- ✅ `resume_version`: 1
- ✅ `major`: "Computer Science" (if provided)
- ✅ `gpa`: 3.75 (if provided)
- ✅ `skills`: ["Python", "JavaScript", "React"] (if provided)
- ✅ `graduation_year`: 2025 (if provided)

### Check Storage Bucket

**Supabase Dashboard:**
1. Go to Storage → `resumes` bucket
2. ✅ Verify file exists:
   - Path: `{user_id}/{timestamp}-{filename}.pdf`
   - File size matches your upload
   - File type: application/pdf

---

## Step 6: Test Resume Viewing

1. **View Resume:**
   - On `/profile/resume` page
   - ✅ Resume should display in PDF viewer
   - ✅ Can scroll through pages
   - ✅ Download button works

2. **Test Download:**
   - Click "Download Resume"
   - ✅ PDF downloads correctly
   - ✅ File opens and displays correctly

---

## Step 7: Test Resume Replacement

1. **Upload New Version:**
   - On `/profile/resume` page
   - Click "Upload a new version"
   - Select a different PDF file
   - Fill in form again
   - Click "Upload Resume"

2. **Expected Results:**
   - ✅ Old resume replaced
   - ✅ Version number incremented (now 2)
   - ✅ New upload date
   - ✅ New file in storage

3. **Verify Version:**
   ```sql
   SELECT resume_version, resume_uploaded_at 
   FROM users 
   WHERE email = 'teststudent@example.com';
   ```
   - ✅ `resume_version` should be 2
   - ✅ `resume_uploaded_at` should be updated

---

## 🐛 Troubleshooting

### User Signup Issues

**Problem:** "Email already exists"
- **Solution:** Use a different email address or delete existing user in Supabase

**Problem:** "Failed to create user profile"
- **Solution:** Check database connection and RLS policies

**Problem:** Email verification required
- **Solution:** 
  - Check Supabase Dashboard → Authentication → Users
  - Click "Confirm" to manually verify user
  - Or disable email confirmation in Auth settings

### Resume Upload Issues

**Problem:** "Unauthorized"
- **Solution:** 
  - Make sure you're logged in
  - Check session is valid
  - Refresh page and try again

**Problem:** "Only PDF files are allowed"
- **Solution:** Ensure file is a valid PDF (.pdf extension)

**Problem:** "File size must be less than 10 MB"
- **Solution:** Use a smaller PDF file

**Problem:** "Storage bucket not found"
- **Solution:** 
  - Go to Supabase Dashboard → Storage
  - Create bucket named `resumes` (Private)
  - Set file size limit: 10 MB
  - See POST_MIGRATION_STEPS.md

**Problem:** "Permission denied"
- **Solution:** 
  - Check RLS policies on `resumes` bucket
  - Run `scripts/setup-rls-policies.sql` in Supabase SQL Editor

---

## ✅ Success Checklist

- [ ] User account created successfully
- [ ] User record exists in database
- [ ] Can login with test credentials
- [ ] Resume upload page accessible
- [ ] Resume file uploads successfully
- [ ] Resume metadata saved correctly
- [ ] Resume displays in PDF viewer
- [ ] Can download resume
- [ ] Can replace resume with new version
- [ ] Version number increments correctly

---

## 📊 Testing Summary

**Date:** _______________
**Tester:** _______________

**User Created:** ☐ Yes ☐ No
**Resume Uploaded:** ☐ Yes ☐ No
**Issues Found:** _______________

**Overall Status:** ☐ Pass ☐ Needs Fixes

---

**Next Steps:**
- Test sponsor resume search functionality
- Test resume shortlisting
- Test resume analytics tracking

