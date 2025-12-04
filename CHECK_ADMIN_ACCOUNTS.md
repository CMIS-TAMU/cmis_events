# 🔍 Check Admin Accounts

## Quick Method: Run SQL in Supabase

1. Go to your **Supabase Dashboard**
2. Click on **SQL Editor** (left sidebar)
3. Copy and paste this query:

```sql
-- List all admin accounts
SELECT 
    id,
    email,
    full_name,
    role,
    created_at
FROM users
WHERE role = 'admin'
ORDER BY created_at DESC;
```

4. Click **Run**
5. You'll see all accounts with admin role

---

## Alternative: Check All Users and Roles

To see all users with their roles:

```sql
SELECT 
    email,
    full_name,
    role,
    created_at
FROM users
ORDER BY 
    CASE role
        WHEN 'admin' THEN 1
        WHEN 'faculty' THEN 2
        WHEN 'sponsor' THEN 3
        ELSE 4
    END,
    created_at DESC;
```

---

## Count Admin Accounts

```sql
SELECT COUNT(*) as total_admins
FROM users
WHERE role = 'admin';
```

---

## Check Specific Email

Replace `'your-email@example.com'` with the email you want to check:

```sql
SELECT 
    id,
    email,
    full_name,
    role,
    created_at
FROM users
WHERE email = 'your-email@example.com';
```

---

## Make a User Admin

If you need to make a user admin:

```sql
UPDATE users 
SET role = 'admin' 
WHERE email = 'your-email@example.com';
```

---

## Files Created

- `scripts/check-admin-accounts.sql` - Complete SQL script with all queries
- `scripts/check-admin-accounts.ts` - TypeScript script (requires env setup)

