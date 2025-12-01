# 🚀 Quick Migration Guide

## What to Do Right Now

### Step 1: Run Database Migration (5 minutes)

1. **Open Supabase:**
   - Go to: https://supabase.com/dashboard
   - Select your project
   - Click **"SQL Editor"** → **"New query"**

2. **Copy Migration Script:**
   - Open: `database/migrations/master_migration.sql`
   - Copy all contents (Cmd+A, Cmd+C)

3. **Paste & Run:**
   - Paste into SQL Editor
   - Click **"Run"** (or Cmd+Enter)
   - ✅ Should complete without errors

4. **Verify Migration:**
   - Open: `scripts/verify-migration.sql`
   - Copy and run in SQL Editor
   - ✅ All checks should pass

### Step 2: Set Up Storage (2 minutes)

1. Go to **Storage** → **Buckets**
2. Create bucket: `resumes`
   - Private ✓
   - Max size: 10 MB
   - MIME: `application/pdf`
3. Create bucket: `event-images` (optional)
   - Public ✓
   - Max size: 5 MB

### Step 3: Quick Test (5 minutes)

```bash
# Start server
pnpm dev

# Test health check
curl http://localhost:3000/api/health

# Run quick tests
# Follow: QUICK_TEST_CHECKLIST.md
```

## ✅ Verification Checklist

After migration, verify:

- [ ] Migration ran without errors
- [ ] Verification script shows all ✅
- [ ] Storage buckets created
- [ ] Health check works
- [ ] Can login/create account
- [ ] Can create event (as admin)
- [ ] Can register for event
- [ ] QR code appears on registration

## 📚 Full Documentation

- **Detailed Instructions:** `MIGRATION_INSTRUCTIONS.md`
- **Testing Guide:** `TESTING_GUIDE.md`
- **Quick Tests:** `QUICK_TEST_CHECKLIST.md`
- **Status Tracker:** `MIGRATION_STATUS.md`

## 🆘 Need Help?

Check `DATABASE_MIGRATIONS.md` troubleshooting section.

---

**Time to complete:** ~15 minutes
**Difficulty:** Easy (just copy/paste SQL)

