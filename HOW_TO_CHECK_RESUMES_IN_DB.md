# How to Check if Resumes are Saved in Database

## ✅ Method 1: Check in Application UI (Easiest)

### View Your Resume:
1. **Navigate to:** `/profile/resume` in your browser
2. **After uploading**, you should see:
   - Your resume file name
   - Upload date
   - Version number
   - Major, GPA, Skills, Graduation Year (if provided)
   - A "View Resume" button
   - A "Delete Resume" button

### If you see your resume details:
✅ **Resume is saved in database!**

---

## 🔍 Method 2: Check in Supabase Dashboard

### Step 1: Open Supabase Dashboard
1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **Table Editor** (left sidebar)

### Step 2: Check `users` Table
1. Click on **`users`** table
2. Find your user record (by email or user ID)
3. Look for these columns:
   - `resume_url` - URL to the resume file
   - `resume_filename` - Path to file in storage
   - `resume_uploaded_at` - Timestamp of upload
   - `resume_version` - Version number (increments with each upload)
   - `major` - Major field (if provided)
   - `gpa` - GPA field (if provided)
   - `skills` - Skills array (if provided)
   - `graduation_year` - Graduation year (if provided)

### Step 3: Check Storage
1. Go to **Storage** (left sidebar)
2. Click on **`resumes`** bucket
3. You should see folders named with user IDs
4. Inside each folder, you'll see the uploaded PDF files

### If you see data in both places:
✅ **Resume is saved in database AND storage!**

---

## 💻 Method 3: SQL Query in Supabase

### Run this query in Supabase SQL Editor:

```sql
-- Check all users with resumes
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
WHERE resume_filename IS NOT NULL
ORDER BY resume_uploaded_at DESC;
```

### Or check your specific resume:

```sql
-- Replace 'your-email@example.com' with your email
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
WHERE email = 'your-email@example.com';
```

### If query returns your data:
✅ **Resume is saved in database!**

---

## 🔧 Method 4: Check via API Endpoint

### Test the API directly:

1. **Make sure you're logged in** in your browser
2. **Open browser console** (F12)
3. **Run this in console:**

```javascript
// Get your resume data
fetch('/api/trpc/resumes.getMyResume?batch=1&input=%7B%220%22%3A%7B%22json%22%3Anull%7D%7D', {
  credentials: 'include'
})
.then(res => res.json())
.then(data => {
  console.log('Resume data:', data);
  if (data[0]?.result?.data?.json) {
    console.log('✅ Resume found!', data[0].result.data.json);
  } else {
    console.log('❌ No resume found');
  }
});
```

### Or use curl (if you have auth token):

```bash
curl -X GET "http://localhost:3000/api/trpc/resumes.getMyResume?batch=1&input=%7B%220%22%3A%7B%22json%22%3Anull%7D%7D" \
  -H "Cookie: your-auth-cookie"
```

---

## 📊 Method 5: Check Server Logs

### When you uploaded, you should have seen:

```
[Resume Upload] Admin client created successfully
[Resume Upload] Uploading file to storage...
[Resume Upload] File uploaded successfully: <user-id>/<timestamp>-<filename>.pdf
[Resume Upload] Checking if user exists: <user-id>
[Resume Upload] User found, current version: <version>
[Resume Upload] Updating user record with admin client...
[Resume Upload] Update successful!
POST /api/resume/upload 200 in <time>ms
```

### If you see "Update successful!":
✅ **Resume is saved in database!**

---

## 🎯 Quick Verification Checklist

- [ ] **Application UI** shows your resume details at `/profile/resume`
- [ ] **Supabase Dashboard** → `users` table has your resume data
- [ ] **Supabase Dashboard** → Storage → `resumes` bucket has your file
- [ ] **SQL Query** returns your resume record
- [ ] **Server logs** show "Update successful!"

---

## 🐛 Troubleshooting

### If resume doesn't appear in UI but upload succeeded:

1. **Refresh the page** - Data might need to reload
2. **Check browser console** for errors
3. **Check if tRPC query is working:**
   - Look for errors in Network tab
   - Check if `resumes.getMyResume` returns data

### If resume doesn't appear in database:

1. **Check server logs** for errors during upload
2. **Verify admin client** is working (test endpoint)
3. **Check Supabase logs** for database errors
4. **Try uploading again** and watch logs carefully

### If file is in storage but not in database:

1. **Database update might have failed**
2. **Check server logs** for database update errors
3. **Manually update** via SQL if needed (not recommended)

---

## 📝 Expected Database Schema

Your resume data should be stored in the `users` table with these fields:

| Column | Type | Description |
|--------|------|-------------|
| `resume_url` | text | Public URL to resume file |
| `resume_filename` | text | Path in storage bucket |
| `resume_uploaded_at` | timestamptz | Upload timestamp |
| `resume_version` | integer | Version number (auto-increments) |
| `major` | text | User's major (optional) |
| `gpa` | numeric | User's GPA (optional) |
| `skills` | jsonb | Array of skills (optional) |
| `graduation_year` | integer | Graduation year (optional) |

---

## ✅ Success Indicators

You'll know your resume is saved when:

1. ✅ **UI shows resume details** at `/profile/resume`
2. ✅ **Database has resume fields** populated in `users` table
3. ✅ **Storage has PDF file** in `resumes` bucket
4. ✅ **Server logs show success** messages
5. ✅ **No errors** in browser console or server logs

---

## 🚀 Next Steps

Once verified, you can:
- **View your resume** from the profile page
- **Update your resume** by uploading a new version
- **Share with sponsors** (if you're a student)
- **View as sponsor** (if you're a sponsor/admin)


