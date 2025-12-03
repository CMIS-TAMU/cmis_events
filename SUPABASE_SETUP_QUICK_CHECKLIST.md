# ✅ Supabase Phase 1 Setup - Quick Checklist

## 🚀 Quick Setup (15 minutes)

### Step 1: Database Migration (5 min)

1. **Open Supabase Dashboard** → Your Project
2. **Click "SQL Editor"** → "New query"
3. **Open file:** `database/migrations/add_technical_missions.sql`
4. **Copy ALL contents** → Paste into SQL Editor
5. **Click "Run"** (or `Ctrl+Enter`)
6. **Verify:** Should see "Success. No rows returned"

✅ **Check:** Go to "Table Editor" → See 5 new tables:
- `missions`
- `mission_submissions`
- `mission_interactions`
- `student_points`
- `point_transactions`

---

### Step 2: Storage Buckets (5 min)

#### Bucket 1: `mission-starter-files`
1. **Storage** → "New bucket"
2. **Name:** `mission-starter-files`
3. **✅ Public bucket:** Check this
4. **File size:** 50 MB
5. **Create bucket**

#### Bucket 2: `mission-submissions`
1. **Storage** → "New bucket"
2. **Name:** `mission-submissions`
3. **❌ Public bucket:** Leave unchecked (private)
4. **File size:** 100 MB
5. **Create bucket**

✅ **Check:** Both buckets appear in Storage list

---

### Step 3: Verify Setup (3 min)

1. **Table Editor** → Check tables exist
2. **Database → Functions** → Check 4 functions exist:
   - `calculate_mission_points`
   - `update_student_points`
   - `update_mission_stats`
   - `update_updated_at_column`
3. **Storage** → Check 2 buckets exist

---

### Step 4: Environment Variables (2 min)

Check `.env.local` has:
```env
NEXT_PUBLIC_SUPABASE_URL=your-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key
```

**Get keys from:** Settings → API

---

## ✅ Final Verification

- [ ] 5 tables created
- [ ] 4 functions created
- [ ] 2 storage buckets created
- [ ] Environment variables set
- [ ] Migration ran successfully

---

## 🎯 That's It!

**Phase 1 Backend is ready!** 🚀

**Next:** Test tRPC endpoints or proceed to Phase 2 (UI Components)

---

## 📖 Detailed Instructions

For step-by-step details, see: `SUPABASE_PHASE1_SETUP_GUIDE.md`

