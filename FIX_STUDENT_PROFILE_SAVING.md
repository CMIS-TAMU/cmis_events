# 🔧 Fix: Student Profile Data Not Saving

## 🎯 **Problem**

When students log in and try to upload resume or update interests, the data is not being saved to the database, preventing mentor matching from working.

---

## ✅ **Solution Created**

I've created a **Student Profile Edit Page** where students can update ALL their information:

### **New Files Created:**

1. **`app/profile/edit/page.tsx`** - Student profile edit form
   - Update Major
   - Update Skills (comma-separated)
   - Update Research Interests (comma-separated) 
   - Update Career Goals (text area)
   - Update Graduation Year
   - Update GPA

2. **`server/routers/auth.router.ts`** - Added `updateStudentProfile` endpoint
   - Saves all fields correctly
   - Uses admin client to bypass RLS
   - Stores research_interests and career_goals in metadata JSONB

3. **`app/profile/page.tsx`** - Added link to "Edit Student Profile"

---

## 🚀 **How to Use**

### **Step 1: Access Edit Page**

1. Log in as a student
2. Go to **Profile** page (`/profile`)
3. Click **"Edit Student Profile"** button
4. Or go directly to: `/profile/edit`

### **Step 2: Fill in Information**

Fill in these fields (at minimum for matching):
- **Major** * (required)
- **Skills** - comma-separated (e.g., "Python, JavaScript, React")
- **Research Interests** - comma-separated (e.g., "Machine Learning, Web Development")
- **Career Goals** - text description (e.g., "Software Engineering")
- **Graduation Year** (optional)
- **GPA** (optional)

### **Step 3: Save**

Click **"Save Changes"** - data will be saved correctly!

### **Step 4: Request Mentor**

After saving, go to `/mentorship/dashboard` and click **"Request a Mentor"** - matching should work now!

---

## 📋 **What Gets Saved Where**

| Field | Database Column | Notes |
|-------|----------------|-------|
| Major | `users.major` | Direct column |
| Skills | `users.skills` | PostgreSQL array |
| Research Interests | `users.metadata->research_interests` | JSON array in metadata |
| Career Goals | `users.metadata->career_goals` | String in metadata |
| Graduation Year | `users.graduation_year` | Direct column |
| GPA | `users.gpa` | Direct column |

---

## 🔍 **Verify Data Was Saved**

Run this SQL in Supabase to check:

```sql
SELECT 
  id,
  email,
  major,
  skills,
  metadata->'research_interests' as research_interests,
  metadata->>'career_goals' as career_goals,
  graduation_year,
  gpa
FROM users
WHERE email = 'YOUR_STUDENT_EMAIL_HERE';
```

---

## ✅ **Next Steps After Fixing**

1. ✅ Clear any pending match batches (if needed)
2. ✅ Update student profile via `/profile/edit`
3. ✅ Verify data is saved (run SQL query above)
4. ✅ Try requesting a mentor again

---

## 🐛 **If Still Not Working**

### **Check Browser Console:**
- Open Developer Tools (F12)
- Check Console tab for errors
- Look for RLS errors or database errors

### **Check Database:**
- Run the verification SQL query above
- Verify data is actually in the database

### **Check RLS Policies:**
- Make sure RLS allows users to read their own data
- The endpoint uses admin client, so it should bypass RLS

---

**The student profile edit page is now available at `/profile/edit` - use it to update your information!** 🎉

