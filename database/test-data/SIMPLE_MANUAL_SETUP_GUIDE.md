# ✅ Simple Manual Setup Guide

**Easiest way to manually set up test users in Supabase**

---

## 🎯 **The Problem**

When you create auth users manually in Supabase, they get random UUIDs. Your test data uses specific UUIDs, causing a mismatch.

## ✅ **The Solution**

**Create auth users first, then create users table entries using the auth user UUIDs!**

---

## 📋 **Step-by-Step Instructions**

### **STEP 1: Create Auth Users in Supabase Dashboard**

1. Go to **Supabase Dashboard** → **Authentication** → **Users**
2. Click **"Add user"** → **"Create new user"**
3. Create these 5 users one by one:

| Email | Password | Auto Confirm |
|-------|----------|--------------|
| `test.student1@tamu.edu` | `Test123!` | ✅ Yes |
| `test.student2@tamu.edu` | `Test123!` | ✅ Yes |
| `test.mentor1@example.com` | `Test123!` | ✅ Yes |
| `test.mentor2@example.com` | `Test123!` | ✅ Yes |
| `test.mentor3@example.com` | `Test123!` | ✅ Yes |

4. **Copy the UUID for each user:**
   - Click on each user after creating them
   - The UUID is shown at the top of the user details (format: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`)
   - Copy and save them somewhere

---

### **STEP 2: Delete Old Test Data (if exists)**

If you already ran the test data script, delete the old users first:

```sql
-- Delete old test data
DELETE FROM mentorship_profiles WHERE user_id IN (
  SELECT id FROM users WHERE email LIKE 'test.%'
);

DELETE FROM users WHERE email LIKE 'test.%';
```

**OR** just skip this if you haven't run test data yet.

---

### **STEP 3: Create Users Table Entries with Auth UUIDs**

1. Open `database/test-data/simple_manual_setup.sql` in your editor
2. Replace the placeholder UUIDs with the actual UUIDs you copied:

   Find these lines:
   ```sql
   'AUTH_UUID_STUDENT1', -- REPLACE THIS
   'AUTH_UUID_STUDENT2', -- REPLACE THIS
   'AUTH_UUID_MENTOR1', -- REPLACE THIS
   'AUTH_UUID_MENTOR2', -- REPLACE THIS
   'AUTH_UUID_MENTOR3', -- REPLACE THIS
   ```

   Replace with your actual UUIDs, for example:
   ```sql
   'a1b2c3d4-e5f6-7890-abcd-ef1234567890', -- Student 1 UUID from Supabase
   'b2c3d4e5-f6a7-8901-bcde-f12345678901', -- Student 2 UUID from Supabase
   etc...
   ```

3. **Run the SQL script** in Supabase SQL Editor

---

### **STEP 4: Verify**

Run this query to check everything is correct:

```sql
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

You should see all 5 users with their UUIDs matching the auth users.

---

## ✅ **Done!**

Now you can:
- ✅ Log in with any test account (password: `Test123!`)
- ✅ Test the mentorship features
- ✅ Everything should work!

---

## 🔍 **Common Issues**

### **Issue: "User already exists"**
- Delete the user first in Supabase Auth UI
- Then create it again
- Use the new UUID

### **Issue: "Cannot log in"**
- Check that "Auto Confirm User" was checked when creating
- Verify the UUIDs match between auth.users and users table
- Check the password is correct (`Test123!`)

### **Issue: "UUID format error"**
- Make sure UUIDs are in format: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`
- No extra spaces or quotes
- Use single quotes in SQL: `'uuid-here'`

---

## 📝 **Quick Checklist**

- [ ] Created 5 auth users in Supabase Dashboard
- [ ] Copied UUIDs from each auth user
- [ ] Updated `simple_manual_setup.sql` with real UUIDs
- [ ] Ran the SQL script in Supabase SQL Editor
- [ ] Verified users exist with matching UUIDs
- [ ] Tested login with test accounts

---

**That's it! Much simpler than trying to match UUIDs after the fact.** 🎉

