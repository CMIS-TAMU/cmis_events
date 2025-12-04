# ⚡ Phase 1 Quick Test Guide

## 🚀 5-Minute Quick Test

### Step 1: Run Database Migration (2 min)

1. **Open Supabase Dashboard** → SQL Editor
2. **Copy and run**: `database/migrations/add_student_profile_fields.sql`
3. **Verify** (run in SQL Editor):
   ```sql
   SELECT COUNT(*) FROM information_schema.columns 
   WHERE table_name = 'users' 
   AND column_name IN ('phone', 'linkedin_url', 'github_url', 'website_url', 'address', 'preferred_industry', 'degree_type', 'work_experience', 'education', 'updated_at');
   ```
   **Expected**: Should return `10`

---

### Step 2: Test Role System (1 min)

1. **Start server**: `pnpm dev`
2. **Open**: `http://localhost:3000/test-roles`
3. **Verify**:
   - ✅ Your role displays correctly
   - ✅ Permissions list shows permissions for your role
   - ✅ Permission tests show correct results

---

### Step 3: Test Profile Updates (2 min)

**Note**: You need to be logged in as a student for this test.

1. **Make sure you're logged in as a student**
   - If not, update your role in Supabase:
     ```sql
     UPDATE users SET role = 'student' WHERE email = 'your-email@example.com';
     ```

2. **Visit**: `http://localhost:3000/test-profile`

3. **Test Contact Details**:
   - Fill in: Phone, LinkedIn URL, GitHub URL
   - Click "Update Contact Details"
   - Check browser console for success ✅

4. **Test Work Experience**:
   - Fill in: Company, Position, Dates
   - Click "Add Work Experience"
   - Check browser console for success ✅

5. **Verify in Database**:
   ```sql
   SELECT phone, linkedin_url, github_url, work_experience 
   FROM users 
   WHERE email = 'your-email@example.com';
   ```
   **Expected**: Should show your entered data

---

## ✅ Success Indicators

- [ ] Database migration runs without errors
- [ ] All 10 new columns exist in users table
- [ ] `/test-roles` page shows your role correctly
- [ ] Permissions list matches your role
- [ ] Profile update forms submit successfully
- [ ] Data appears in database after update
- [ ] No console errors

---

## 🐛 Quick Troubleshooting

### "Only students can update student profile"
**Fix**: Update your role in Supabase:
```sql
UPDATE users SET role = 'student' WHERE email = 'your-email@example.com';
```

### "Column does not exist"
**Fix**: Run the migration again in Supabase SQL Editor

### Role is null/undefined
**Fix**: 
- Make sure you're logged in
- Check if user has role in database
- Refresh the page

---

## 📝 Full Testing Guide

For detailed testing instructions, see: `PHASE1_TESTING_GUIDE.md`

---

**Time Estimate**: 5-10 minutes for quick test

**Status**: ✅ Ready to test!

