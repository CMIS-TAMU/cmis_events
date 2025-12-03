# 🔐 Auth User Setup Guide

**Guide to creating auth users for test accounts**

---

## 🎯 **OVERVIEW**

Test data SQL script creates users in the `users` table, but you also need to create corresponding auth users in Supabase Authentication to log in.

---

## 📋 **OPTION 1: Supabase Auth UI (EASIEST - RECOMMENDED)** ⭐

### **Steps:**

1. **Go to Supabase Dashboard**
   - Navigate to your Supabase project
   - Click **"Authentication"** in left sidebar
   - Click **"Users"** tab

2. **Create Each Test User:**
   - Click **"Add user"** button
   - Select **"Create new user"**
   - Fill in:
     - **Email:** `test.student1@tamu.edu`
     - **Password:** Set a password (e.g., `Test123!`)
     - **Auto Confirm User:** ✅ Check this box
   - Click **"Create user"**
   - Repeat for all 5 test accounts

### **Test Accounts to Create:**

| Email | Type | Password |
|-------|------|----------|
| `test.student1@tamu.edu` | Student | `Test123!` |
| `test.student2@tamu.edu` | Student | `Test123!` |
| `test.mentor1@example.com` | Mentor | `Test123!` |
| `test.mentor2@example.com` | Mentor | `Test123!` |
| `test.mentor3@example.com` | Mentor | `Test123!` |

**Time:** ~5 minutes

---

## 📋 **OPTION 2: Automated Script (FASTEST)** ⚡

### **Prerequisites:**
- Node.js installed
- `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`

### **Steps:**

1. **Get Service Role Key:**
   - Go to Supabase Dashboard → **Settings** → **API**
   - Copy **"service_role"** key (keep it secret!)
   - Add to `.env.local`:
     ```
     SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
     ```

2. **Run the Script:**
   ```bash
   chmod +x database/test-data/create_auth_users.sh
   ./database/test-data/create_auth_users.sh
   ```

   Or directly with Node:
   ```bash
   node database/test-data/create_auth_users.js
   ```

3. **Done!** ✅
   - All 5 auth users created automatically
   - Default password: `Test123!`

**Time:** ~1 minute

---

## 📋 **OPTION 3: Supabase CLI**

If you have Supabase CLI set up:

```bash
# Install Supabase CLI if not installed
npm install -g supabase

# Login to Supabase
supabase login

# Create users (manual commands for each)
supabase auth admin create-user \
  --email test.student1@tamu.edu \
  --password Test123! \
  --email-confirm true
```

---

## ✅ **VERIFICATION**

After creating auth users, verify with this SQL query in Supabase:

```sql
-- Check which test accounts have auth users
SELECT 
  u.email,
  u.full_name,
  CASE 
    WHEN au.id IS NOT NULL THEN '✅ Auth user exists'
    ELSE '❌ Auth user missing'
  END as auth_status
FROM users u
LEFT JOIN auth.users au ON u.email = au.email
WHERE u.id IN (
  '00000000-0000-0000-0000-000000000001', -- Student 1
  '00000000-0000-0000-0000-000000000002', -- Student 2
  '00000000-0000-0000-0000-000000000101', -- Mentor 1
  '00000000-0000-0000-0000-000000000102', -- Mentor 2
  '00000000-0000-0000-0000-000000000103'  -- Mentor 3
);
```

**Expected:** All 5 accounts should show "✅ Auth user exists"

---

## 🔑 **DEFAULT PASSWORDS**

If using automated script, default password is:
- **Password:** `Test123!`

You can change passwords later in Supabase Auth UI if needed.

---

## 🛠️ **TROUBLESHOOTING**

### **Issue: "Service Role Key not found"**
- **Solution:** Add `SUPABASE_SERVICE_ROLE_KEY` to `.env.local`
- Get key from: Supabase Dashboard → Settings → API → service_role key

### **Issue: "User already exists"**
- **Solution:** This is fine! The script will skip existing users
- Or delete user first in Supabase Auth UI if you want to recreate

### **Issue: "Permission denied"**
- **Solution:** Use Supabase Auth UI instead (Option 1)
- Or check service role key is correct

### **Issue: "Cannot log in"**
- **Solution:** 
  - Verify auth user was created
  - Check email is correct
  - Verify password is correct
  - Check "Auto Confirm User" was checked when creating

---

## 📝 **COMPLETE SETUP CHECKLIST**

### **Step 1: Database Setup**
- [ ] Run `setup_mentorship_test_data.sql` in Supabase SQL Editor
- [ ] Verify test data created (5 users, 3 mentors, etc.)

### **Step 2: Auth Users Setup**
- [ ] Create auth users (choose one method above)
- [ ] Verify all 5 accounts can log in

### **Step 3: Verification**
- [ ] Test login as Student 1
- [ ] Test login as Student 2
- [ ] Test login as Mentor 1
- [ ] Test login as Mentor 2
- [ ] Test login as Mentor 3

### **Step 4: Ready to Test!**
- [ ] All accounts can log in
- [ ] Can access mentorship dashboard
- [ ] Test data visible

---

## 🎯 **QUICK SETUP COMMANDS**

### **One-Line Setup (if script is ready):**

```bash
# 1. Run test data SQL (in Supabase SQL Editor)
# Copy: database/test-data/setup_mentorship_test_data.sql

# 2. Create auth users (automated)
./database/test-data/create_auth_users.sh

# 3. Done! Ready to test
```

---

## 📚 **FILES REFERENCE**

- **SQL Script:** `create_auth_users.sql` - Verification query
- **JS Script:** `create_auth_users.js` - Automated creation
- **Shell Script:** `create_auth_users.sh` - Helper script
- **Guide:** `AUTH_USER_SETUP_GUIDE.md` - This file

---

**Ready to set up auth users!** 🔐

Choose the method that works best for you:
- **Easiest:** Supabase Auth UI (Option 1)
- **Fastest:** Automated Script (Option 2)

