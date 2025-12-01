# Post-Migration Steps

## ✅ Migration Completed Successfully!

Great! Now let's verify everything and set up the remaining components.

---

## Step 1: Verify Migration

Run the verification script in Supabase SQL Editor:

1. **Open SQL Editor** (same place where you ran the migration)
2. **Copy and paste:** `scripts/verify-migration.sql`
3. **Click "Run"**
4. **Check results:** All checks should show ✅

**Expected Results:**
- ✅ QR code columns exist
- ✅ QR code indexes exist
- ✅ Resume columns exist
- ✅ resume_views table exists
- ✅ Resume indexes exist
- ✅ session_registrations table exists
- ✅ Session indexes exist
- ✅ Session functions exist

---

## Step 2: Set Up Storage Buckets

### Create Resumes Bucket

1. Go to **Storage** → **Buckets** in Supabase dashboard
2. Click **"New bucket"**
3. Configure:
   - **Name:** `resumes`
   - **Public bucket:** ❌ Unchecked (Private)
   - **File size limit:** `10485760` (10 MB)
   - **Allowed MIME types:** `application/pdf`
4. Click **"Create bucket"**

### Create Event Images Bucket (Optional)

1. Click **"New bucket"** again
2. Configure:
   - **Name:** `event-images`
   - **Public bucket:** ✅ Checked (Public)
   - **File size limit:** `5242880` (5 MB)
   - **Allowed MIME types:** `image/*`
3. Click **"Create bucket"**

---

## Step 3: Set Up Row-Level Security (RLS)

Run this SQL in Supabase SQL Editor:

```sql
-- Enable RLS on resume_views
ALTER TABLE resume_views ENABLE ROW LEVEL SECURITY;

-- Enable RLS on session_registrations
ALTER TABLE session_registrations ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own resume views
CREATE POLICY "Users can view own resume views"
ON resume_views FOR SELECT
USING (user_id = auth.uid() OR viewed_by = auth.uid());

-- Policy: Authenticated users can insert resume views (for tracking)
CREATE POLICY "Authenticated users can track views"
ON resume_views FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- Policy: Authenticated users can register for sessions
CREATE POLICY "Authenticated users can register for sessions"
ON session_registrations FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can view their own session registrations
CREATE POLICY "Users can view own session registrations"
ON session_registrations FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Users can delete their own session registrations
CREATE POLICY "Users can cancel own session registrations"
ON session_registrations FOR DELETE
USING (auth.uid() = user_id);
```

---

## Step 4: Test Application

### Quick Test (5 minutes)

1. **Start development server:**
   ```bash
   pnpm dev
   ```

2. **Create test users:**
   - Go to `/signup`
   - Create: `admin@test.com` (role: admin)
   - Create: `sponsor@test.com` (role: sponsor)
   - Create: `student@test.com` (role: user/student)

3. **Test core features:**
   - [ ] Login as admin
   - [ ] Create an event at `/admin/events/new`
   - [ ] Login as student
   - [ ] Register for the event
   - [ ] Check QR code appears at `/registrations`
   - [ ] Login as admin
   - [ ] Check in student at `/admin/checkin`

4. **Test resume features:**
   - [ ] Login as student
   - [ ] Upload resume at `/profile/resume`
   - [ ] Login as sponsor
   - [ ] Search resumes at `/sponsor/resumes`
   - [ ] View a resume
   - [ ] Add to shortlist

5. **Test session features:**
   - [ ] Login as admin
   - [ ] Add session to event
   - [ ] Login as student
   - [ ] Register for session
   - [ ] View at `/sessions`

---

## Step 5: Verify Environment Variables

Check `.env.local` has all required variables:

```bash
# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key

# Email (Required for email features)
RESEND_API_KEY=your_resend_key
RESEND_FROM_EMAIL=your_email@domain.com
NEXT_PUBLIC_APP_URL=http://localhost:3000

# QR Code (Required)
QR_CODE_SECRET=your_random_secret_string

# Optional
NODE_ENV=development
```

---

## Step 6: Test All Features

Follow the comprehensive testing guide:

**Quick Test:** `QUICK_TEST_CHECKLIST.md` (10 minutes)
**Full Test:** `TESTING_GUIDE.md` (1-2 hours)

---

## ✅ Verification Checklist

After completing all steps, verify:

- [ ] Migration verification script shows all ✅
- [ ] Storage buckets created
- [ ] RLS policies set up
- [ ] Can create and login users
- [ ] Can create events (admin)
- [ ] Can register for events
- [ ] QR codes generate correctly
- [ ] Can check in users
- [ ] Can upload resumes
- [ ] Can search resumes (sponsor)
- [ ] Can create sessions
- [ ] Can register for sessions
- [ ] No console errors
- [ ] All pages load correctly

---

## 🎉 Success!

If all checks pass, your CMIS Event Management System is fully configured and ready to use!

---

## 🆘 Troubleshooting

### Storage Bucket Issues

**Problem:** Can't upload resumes
**Solution:** 
- Check bucket name is exactly `resumes`
- Verify bucket is Private
- Check file size limit is set to 10 MB
- Verify MIME type allows `application/pdf`

### RLS Policy Issues

**Problem:** Can't access data
**Solution:**
- Check RLS is enabled on tables
- Verify policies are created
- Check user authentication
- Review Supabase logs for errors

### QR Code Not Generating

**Problem:** QR code doesn't appear
**Solution:**
- Verify `QR_CODE_SECRET` is set in `.env.local`
- Check `qr_code_token` column exists in database
- Verify registration was successful
- Check browser console for errors

---

## Next Steps

1. ✅ Complete verification
2. ✅ Set up storage
3. ✅ Test all features
4. 🚀 Deploy to production (when ready)

**Need help?** Check `TESTING_GUIDE.md` or `DATABASE_MIGRATIONS.md`

