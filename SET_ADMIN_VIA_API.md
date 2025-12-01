# 🚀 Set Admin Role via API (Easier Method)

## ⚡ Quick Fix: Use API Route Instead of SQL

Instead of running SQL, you can use this API route which handles everything automatically!

---

## ✅ Method 1: Use the API Route (Easiest)

### Step 1: Make API Call

**Open your browser console** (F12 → Console tab) and run:

```javascript
fetch('/api/admin/set-role', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'abhishekp1703@gmail.com'
  })
})
.then(r => r.json())
.then(data => {
  console.log('Result:', data);
  if (data.success) {
    alert('✅ You are now an admin! Refresh the page.');
    window.location.reload();
  } else {
    alert('Error: ' + data.error);
  }
});
```

**Or use curl:**

```bash
curl -X POST http://localhost:3000/api/admin/set-role \
  -H "Content-Type: application/json" \
  -d '{"email": "abhishekp1703@gmail.com"}'
```

---

## ✅ Method 2: Use the Complete SQL Script

**If API doesn't work, run this SQL in Supabase:**

```sql
-- COMPLETE FIX - Copy entire block
DO $$
DECLARE
    v_user_id uuid;
    v_email text := 'abhishekp1703@gmail.com';
BEGIN
    -- Get user ID
    SELECT id INTO v_user_id
    FROM auth.users
    WHERE email = v_email
    LIMIT 1;

    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'User not found in auth.users';
    END IF;

    -- Insert or update with admin role
    INSERT INTO users (id, email, full_name, role)
    VALUES (
        v_user_id,
        v_email,
        'Admin User',
        'admin'
    )
    ON CONFLICT (id) DO UPDATE
    SET role = 'admin';

    RAISE NOTICE 'User % is now admin', v_email;
END $$;

-- Verify
SELECT email, role FROM users WHERE email = 'abhishekp1703@gmail.com';
```

---

## ✅ Method 3: Manual Check and Fix

**Step 1: Check if user exists**

```sql
-- Check auth.users
SELECT id, email FROM auth.users WHERE email = 'abhishekp1703@gmail.com';

-- Check public.users
SELECT id, email, role FROM users WHERE email = 'abhishekp1703@gmail.com';
```

**Step 2: If user exists in auth but not in public.users:**

```sql
-- Create profile
INSERT INTO users (id, email, full_name, role)
SELECT 
    id,
    email,
    'Admin User',
    'admin'
FROM auth.users
WHERE email = 'abhishekp1703@gmail.com';
```

**Step 3: If user exists in both:**

```sql
-- Just update role
UPDATE users 
SET role = 'admin' 
WHERE email = 'abhishekp1703@gmail.com';
```

---

## 🧪 After Setting Admin

1. **Clear browser cache completely**
2. **Logout** from application
3. **Close all tabs**
4. **Open incognito window**
5. **Login again**
6. **Visit:** http://localhost:3000/debug-role
7. **Should show:** `role = 'admin'` ✅

---

## 🔍 Verify It Worked

**Run this SQL to verify:**

```sql
SELECT 
    u.email,
    u.role,
    au.email_confirmed_at,
    CASE 
        WHEN u.role = 'admin' THEN '✅ ADMIN'
        ELSE '❌ NOT ADMIN - Role: ' || u.role
    END as status
FROM users u
LEFT JOIN auth.users au ON u.id = au.id
WHERE u.email = 'abhishekp1703@gmail.com';
```

**Expected Result:** Should show `role = 'admin'` and status `✅ ADMIN`

---

**Try the API method first - it's the easiest!** 🚀

