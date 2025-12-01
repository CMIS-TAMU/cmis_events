# ✅ Pre-Test Checklist

## Before Testing User Signup & Resume Upload

### 1. Database Migration ✅
- [ ] Migration executed: `master_migration.sql` in Supabase
- [ ] Verification passed: Run `scripts/verify-migration.sql`
- [ ] All tables created: `users`, `events`, `event_registrations`, etc.

**How to verify:**
```sql
-- Run in Supabase SQL Editor
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('users', 'events', 'event_registrations', 'resume_views');
```

---

### 2. Storage Bucket Setup ⚠️ **REQUIRED**

**Create `resumes` bucket:**
1. Go to Supabase Dashboard → Storage
2. Click "New bucket"
3. Name: `resumes`
4. Settings:
   - **Public:** No (Private)
   - **File size limit:** 10 MB
   - **Allowed MIME types:** `application/pdf`
5. Click "Create bucket"

**How to verify:**
- Go to Storage → You should see `resumes` bucket listed
- Check it's marked as "Private"

---

### 3. RLS Policies ✅

**Set up Row-Level Security:**
1. Go to Supabase SQL Editor
2. Run: `scripts/setup-rls-policies.sql`
3. Verify policies created

**How to verify:**
```sql
-- Check RLS enabled on tables
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'resume_views');
```

---

### 4. Development Server ✅

**Server Status:**
- [ ] Server running: `pnpm dev`
- [ ] Accessible at: http://localhost:3000
- [ ] Health check works: http://localhost:3000/api/health

**How to verify:**
```bash
curl http://localhost:3000/api/health
# Should return: {"status":"ok",...}
```

---

### 5. Environment Variables ✅

**Check `.env.local` has:**
- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `SUPABASE_SERVICE_ROLE_KEY` (optional, for admin)

**How to verify:**
```bash
# Check if env vars are set
grep -E "NEXT_PUBLIC_SUPABASE|SUPABASE_SERVICE" .env.local
```

---

## 🚨 Common Issues

### Storage Bucket Not Created
**Symptom:** Resume upload fails with "Bucket not found"
**Fix:** Create `resumes` bucket (see Step 2 above)

### RLS Blocking Access
**Symptom:** Upload fails with "Permission denied"
**Fix:** Run `scripts/setup-rls-policies.sql`

### Email Verification Required
**Symptom:** Can't login after signup
**Fix:** 
- Go to Supabase Dashboard → Authentication → Users
- Find your user and click "Confirm" to verify manually
- OR disable email confirmation in Auth settings

---

## ✅ Ready to Test?

Once all checkboxes are ✅:
- **Quick Test:** Follow `QUICK_TEST_USER_RESUME.md` (5 minutes)
- **Detailed Test:** Follow `TEST_USER_RESUME.md` (comprehensive)

---

**Need help?** Check:
- `POST_MIGRATION_STEPS.md` - Complete setup guide
- `TEST_USER_RESUME.md` - Detailed testing instructions

