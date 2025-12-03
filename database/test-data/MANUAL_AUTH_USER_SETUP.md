# 🔐 Manual Auth User Setup Guide

**Step-by-step instructions to create auth users manually in Supabase Dashboard**

---

## ⚠️ **IMPORTANT: UUID Mismatch Issue**

When you create auth users manually in Supabase Auth UI, Supabase generates **random UUIDs**. However, your test data uses **specific UUIDs**. 

**You have two options:**

### **Option A: Create Auth Users + Update Test Data UUIDs** (Easier)
1. Create auth users in Supabase Auth UI (gets random UUIDs)
2. Update test data to match those UUIDs

### **Option B: Use SQL with Service Role** (Requires service role access)
1. Create auth users directly in SQL with matching UUIDs

---

## 📋 **OPTION A: Supabase Auth UI + Update Test Data**

### **Step 1: Create Auth Users in Supabase Dashboard**

1. **Go to Supabase Dashboard**
   - Navigate to your project
   - Click **"Authentication"** in the left sidebar
   - Click **"Users"** tab

2. **Create Each Test User:**

   Click **"Add user"** → **"Create new user"** and fill in:

   **Student 1:**
   - Email: `test.student1@tamu.edu`
   - Password: `Test123!`
   - **Auto Confirm User:** ✅ (Check this!)
   - Click **"Create user"**

   **Student 2:**
   - Email: `test.student2@tamu.edu`
   - Password: `Test123!`
   - **Auto Confirm User:** ✅
   - Click **"Create user"**

   **Mentor 1:**
   - Email: `test.mentor1@example.com`
   - Password: `Test123!`
   - **Auto Confirm User:** ✅
   - Click **"Create user"**

   **Mentor 2:**
   - Email: `test.mentor2@example.com`
   - Password: `Test123!`
   - **Auto Confirm User:** ✅
   - Click **"Create user"**

   **Mentor 3:**
   - Email: `test.mentor3@example.com`
   - Password: `Test123!`
   - **Auto Confirm User:** ✅
   - Click **"Create user"**

3. **Copy the UUIDs:**
   - For each user you created, click on them
   - Copy their **UUID** (shown at the top of the user details page)
   - Keep this list handy - you'll need it in the next step

---

### **Step 2: Update Test Data to Match Auth UUIDs**

Run this SQL in Supabase SQL Editor, replacing the UUIDs with the actual auth user UUIDs you copied:

```sql
-- Update Student 1 UUID
-- Replace 'AUTH_UUID_HERE' with the actual UUID from Supabase Auth UI
UPDATE users
SET id = 'AUTH_UUID_HERE'
WHERE email = 'test.student1@tamu.edu';

-- Update Student 2 UUID
UPDATE users
SET id = 'AUTH_UUID_HERE'
WHERE email = 'test.student2@tamu.edu';

-- Update Mentor 1 UUID
UPDATE users
SET id = 'AUTH_UUID_HERE'
WHERE email = 'test.mentor1@example.com';

-- Update Mentor 2 UUID
UPDATE users
SET id = 'AUTH_UUID_HERE'
WHERE email = 'test.mentor2@example.com';

-- Update Mentor 3 UUID
UPDATE users
SET id = 'AUTH_UUID_HERE'
WHERE email = 'test.mentor3@example.com';
```

**⚠️ Warning:** This will break existing relationships (matches, profiles, etc.). After updating UUIDs, you'll need to:
1. Delete existing mentorship profiles
2. Delete existing matches
3. Re-run parts of the test data script to recreate relationships

---

## 📋 **OPTION B: Create Auth Users Directly in SQL** (Advanced)

If you have service role access, you can create auth users with matching UUIDs directly:

### **Step 1: Get Service Role Key**
- Go to Supabase Dashboard → Settings → API
- Copy the **"service_role"** key

### **Step 2: Use SQL Editor**

⚠️ **Note:** Direct SQL inserts into `auth.users` require service role access and are complex. The Supabase Auth UI method above is recommended.

---

## 🎯 **RECOMMENDED: Use Automated Script Instead**

The easiest way is to use the automated script which handles UUIDs correctly:

1. Add `SUPABASE_SERVICE_ROLE_KEY` to `.env.local`
2. Run: `node database/test-data/create_auth_users.js`

But if you prefer manual setup, Option A above will work!

---

## ✅ **After Setup - Verification**

Run this query to verify UUIDs match:

```sql
-- Check users and verify they exist
SELECT 
  u.id,
  u.email,
  u.full_name,
  u.role
FROM users u
WHERE u.email IN (
  'test.student1@tamu.edu',
  'test.student2@tamu.edu',
  'test.mentor1@example.com',
  'test.mentor2@example.com',
  'test.mentor3@example.com'
)
ORDER BY u.email;
```

Then check in Supabase Auth UI that the auth user UUIDs match the `users.id` values.

---

## 📝 **Quick Reference: Test Accounts**

| Email | Password | Type |
|-------|----------|------|
| `test.student1@tamu.edu` | `Test123!` | Student |
| `test.student2@tamu.edu` | `Test123!` | Student |
| `test.mentor1@example.com` | `Test123!` | Mentor |
| `test.mentor2@example.com` | `Test123!` | Mentor |
| `test.mentor3@example.com` | `Test123!` | Mentor |

---

**Need help?** If you run into issues, check `TROUBLESHOOT_AUTH_USER_ERROR.md`

