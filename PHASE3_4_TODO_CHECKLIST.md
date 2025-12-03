# ✅ Phase 3 & 4 - Your To-Do Checklist

## 🎯 Quick Checklist (5-10 minutes)

### 1. ✅ Verify Storage Buckets (REQUIRED)

**Go to Supabase Dashboard:**
1. Navigate to: https://supabase.com/dashboard
2. Select your project
3. Go to **Storage** → **Buckets**

**Check if these buckets exist:**
- [ ] `mission-starter-files` (should be Public)
- [ ] `mission-submissions` (should be Private)

**If buckets DON'T exist, create them:**

#### Create `mission-starter-files` Bucket:
1. Click **"New bucket"**
2. **Name:** `mission-starter-files`
3. **Public bucket:** ✅ **Check this box** (make it public)
4. **File size limit:** `50 MB`
5. Click **"Create bucket"**

#### Create `mission-submissions` Bucket:
1. Click **"New bucket"** again
2. **Name:** `mission-submissions`
3. **Public bucket:** ❌ **Leave unchecked** (keep it private)
4. **File size limit:** `100 MB`
5. Click **"Create bucket"**

**Time:** ~2 minutes

---

### 2. ⚠️ Verify Storage RLS Policies (OPTIONAL - Can test later)

**For `mission-submissions` bucket (private):**
- Students should be able to upload to their own folder
- Sponsors should be able to view submissions for their missions

**Note:** If RLS policies aren't set up, we can use admin client (like we did for missions table) or set them up when testing file uploads.

**Time:** ~5 minutes (optional)

---

### 3. ✅ Verify Database Migration (Should already be done)

**Check in Supabase:**
1. Go to **Table Editor**
2. Verify these tables exist:
   - [x] `missions`
   - [x] `mission_submissions`
   - [x] `mission_interactions`
   - [x] `student_points`
   - [x] `point_transactions`

**If tables don't exist:**
- Run the migration: `database/migrations/add_technical_missions.sql`
- See `SUPABASE_PHASE1_SETUP_GUIDE.md` for instructions

**Time:** ~1 minute to verify

---

## 📋 Summary

### Must Do Before Starting:
- [ ] **Verify/Create Storage Buckets** (2 minutes)
  - `mission-starter-files` (public)
  - `mission-submissions` (private)

### Can Do Later (During Testing):
- [ ] Storage RLS policies (if needed)
- [ ] Navigation links (we'll add as we build)

---

## 🚀 Ready to Start?

**Minimum Required:**
1. ✅ Storage buckets created
2. ✅ Database tables exist (should already be done from Phase 1)

**Everything else can be done during/after building!**

---

## ⏱️ Total Time: ~3-5 minutes

**Quick Steps:**
1. Open Supabase Dashboard
2. Go to Storage → Buckets
3. Create 2 buckets (if they don't exist)
4. Done! ✅

---

## 🆘 If You Need Help

**Storage Bucket Creation:**
- See `SUPABASE_PHASE1_SETUP_GUIDE.md` → Step 2 (lines 78-118)

**Database Migration:**
- See `SUPABASE_PHASE1_SETUP_GUIDE.md` → Step 1 (lines 15-75)

---

**Once storage buckets are created, we're ready to start Phase 3!** 🚀

