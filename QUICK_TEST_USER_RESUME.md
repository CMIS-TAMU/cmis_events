# ⚡ Quick Test: User + Resume (5 minutes)

## 🚀 Quick Steps

### 1. Create User (2 min)

1. Go to: http://localhost:3000/signup
2. Fill form:
   - Name: `Test Student`
   - Email: `test@example.com`
   - Password: `test123456`
   - Role: `Student`
3. Click "Create account"
4. ✅ Check Supabase Dashboard → `users` table to verify

### 2. Login (30 sec)

1. Go to: http://localhost:3000/login
2. Use credentials from step 1
3. ✅ Should see dashboard

### 3. Upload Resume (2 min)

1. Go to: http://localhost:3000/profile/resume
2. Click "Choose File" → Select any PDF file
3. Optional: Fill in Major, GPA, Skills, Graduation Year
4. Click "Upload Resume"
5. ✅ Should see success message and resume viewer

### 4. Verify (30 sec)

**Check Database:**
```sql
SELECT email, resume_filename, resume_version, major, gpa 
FROM users 
WHERE email = 'test@example.com';
```

**Check Storage:**
- Supabase Dashboard → Storage → `resumes` bucket
- ✅ File should exist

---

## 🐛 Quick Fixes

**Can't signup?**
- Use different email
- Check Supabase Auth settings

**Can't upload resume?**
- Check `resumes` bucket exists in Supabase Storage
- Verify bucket is Private
- Check file is PDF and < 10 MB

**Resume not showing?**
- Check browser console for errors
- Verify file uploaded to storage bucket
- Check RLS policies

---

✅ **All working?** Great! Full guide: `TEST_USER_RESUME.md`

