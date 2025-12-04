# ✅ Minimal Setup Guide - Just Users Table

**Simplest option: Only create users table entries (no mentorship profiles)**

---

## 🎯 **What This Does**

Creates only the **minimum required** entries in the `users` table so you can:
- ✅ Log in
- ✅ Access dashboard
- ✅ Use basic features

**What you WON'T have:**
- ❌ Mentorship profiles (can create later via UI)
- ❌ Test matches, meetings, etc.
- ❌ Pre-filled mentorship data

---

## 📋 **Steps**

### **1. Create Auth Users in Supabase Dashboard**

- Go to **Supabase Dashboard** → **Authentication** → **Users**
- Click **"Add user"** → **"Create new user"**
- Create these 5 users:

| Email | Password | Auto Confirm |
|-------|----------|--------------|
| `test.student1@tamu.edu` | `Test123!` | ✅ |
| `test.student2@tamu.edu` | `Test123!` | ✅ |
| `test.mentor1@example.com` | `Test123!` | ✅ |
| `test.mentor2@example.com` | `Test123!` | ✅ |
| `test.mentor3@example.com` | `Test123!` | ✅ |

### **2. Copy UUIDs**

- Click each user you created
- Copy their UUID (shown at top of user details)

### **3. Update and Run SQL**

1. Open `database/test-data/minimal_setup.sql`
2. Replace the placeholder UUIDs:
   - `AUTH_UUID_STUDENT1` → Your actual Student 1 UUID
   - `AUTH_UUID_STUDENT2` → Your actual Student 2 UUID
   - `AUTH_UUID_MENTOR1` → Your actual Mentor 1 UUID
   - `AUTH_UUID_MENTOR2` → Your actual Mentor 2 UUID
   - `AUTH_UUID_MENTOR3` → Your actual Mentor 3 UUID

3. Run the SQL in Supabase SQL Editor

### **4. Done!**

Now you can:
- ✅ Log in with test accounts
- ✅ Access the dashboard
- ✅ Create mentorship profiles via UI later if needed

---

## 📝 **Example UUID Replacement**

Replace this:
```sql
'AUTH_UUID_STUDENT1', -- REPLACE with actual UUID
```

With your actual UUID:
```sql
'a1b2c3d4-e5f6-7890-abcd-ef1234567890', -- Student 1 UUID
```

---

## ⚠️ **Important Notes**

- **You still need Step 1** (create auth users) - can't skip that
- **You still need Step 2** (copy UUIDs) - can't skip that
- **This minimal script replaces Step 3** - much simpler!

The minimal script is **much shorter** - only creates users table entries, nothing else.

---

## 🔄 **Want Full Test Data Later?**

If you want mentorship profiles, matches, etc. later:
- Run `simple_manual_setup.sql` (includes mentorship profiles)
- Or create profiles via the UI at `/mentorship/profile`

---

**This is the simplest option - just users, no extra data!** 🎉

