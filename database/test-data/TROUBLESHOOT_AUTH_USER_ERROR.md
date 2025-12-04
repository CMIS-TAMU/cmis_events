# 🔧 Troubleshooting: "Database error creating new user"

**Problem:** Getting "Database error creating new user" when creating auth users in Supabase Auth UI.

---

## 🔍 **Root Cause**

The test data script created users in the `users` table with **specific UUIDs**:
- Student 1: `00000000-0000-0000-0000-000000000001`
- Student 2: `00000000-0000-0000-0000-000000000002`
- Mentor 1: `00000000-0000-0000-0000-000000000101`
- etc.

When you create auth users in Supabase Auth UI, Supabase generates **new random UUIDs**, which don't match the test data UUIDs. This causes a mismatch and database errors.

---

## ✅ **SOLUTION: Use Automated Script**

The automated script creates auth users with the **exact same UUIDs** as the test data.

### **Steps:**

1. **Delete any incorrectly created auth users:**
   - Go to Supabase Dashboard → Authentication → Users
   - Delete any test users you already created (test.student1@tamu.edu, etc.)

2. **Get your Service Role Key:**
   - Go to Supabase Dashboard → Settings → API
   - Copy the **"service_role"** key (keep it secret!)
   - Add to `.env.local`:
     ```env
     SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
     ```

3. **Run the automated script:**
   ```bash
   node database/test-data/create_auth_users.js
   ```
   
   Or use the helper script:
   ```bash
   ./database/test-data/create_auth_users.sh
   ```

4. **Done!** ✅
   - Auth users created with matching UUIDs
   - Can now log in with test accounts
   - Default password: `Test123!`

---

## 🔍 **Alternative: Manual Fix (Advanced)**

If you already created auth users and want to keep them:

1. **Check current UUIDs:**
   - Run the verification query in `fix_auth_user_uuids.sql`
   - Note the auth user UUIDs from Supabase Dashboard

2. **Update users table to match:**
   - Update each user's UUID to match the auth user UUID
   - ⚠️ **Warning:** This will break existing relationships (matches, profiles, etc.)
   - You'll need to re-run the test data script after updating

---

## ✅ **Quick Fix (Recommended)**

**Just delete the wrong auth users and use the script!**

1. Delete auth users in Supabase Auth UI
2. Run: `node database/test-data/create_auth_users.js`
3. Log in with test accounts

**Time:** ~2 minutes

---

## 📝 **Why This Happens**

- Test data uses **fixed UUIDs** for consistency
- Supabase Auth UI generates **random UUIDs**
- They must **match** for the system to work
- The script uses Supabase Admin API to set custom UUIDs

---

## 🔐 **Test Accounts After Fix**

| Email | Password | UUID |
|-------|----------|------|
| `test.student1@tamu.edu` | `Test123!` | `00000000-0000-0000-0000-000000000001` |
| `test.student2@tamu.edu` | `Test123!` | `00000000-0000-0000-0000-000000000002` |
| `test.mentor1@example.com` | `Test123!` | `00000000-0000-0000-0000-000000000101` |
| `test.mentor2@example.com` | `Test123!` | `00000000-0000-0000-0000-000000000102` |
| `test.mentor3@example.com` | `Test123!` | `00000000-0000-0000-0000-000000000103` |

---

**Need help?** Check `AUTH_USER_SETUP_GUIDE.md` for detailed instructions.

