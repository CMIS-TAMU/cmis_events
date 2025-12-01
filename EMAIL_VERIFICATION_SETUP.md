# 📧 Email Verification Setup Guide

## 🔍 Understanding Email Verification

There are **TWO different email systems** in this application:

### 1. **Supabase Auth Email Verification** (Signup/Login)
- ✅ Handled automatically by Supabase
- ✅ Used for account verification when signing up
- ✅ Used for password reset
- ✅ Configured in Supabase Dashboard

### 2. **Resend Email Service** (Event Emails)
- ✅ Used for event registration confirmations
- ✅ Used for cancellation notifications
- ✅ Used for admin notifications
- ✅ Configured via `RESEND_API_KEY` environment variable

---

## ❌ Issue: No Verification Email on Signup

**Problem:** When you sign up, Supabase should automatically send a verification email, but you're not receiving it.

### ✅ Solution: Configure Supabase Email Settings

#### Step 1: Check Supabase Email Settings

1. **Go to Supabase Dashboard:**
   - Navigate to your project
   - Go to **Authentication** → **Email Templates**
   - Or **Authentication** → **Providers** → **Email**

2. **Check Email Provider:**
   - Supabase uses **Supabase SMTP** by default (limited)
   - For production, you should configure **Custom SMTP** or use Supabase's email service

#### Step 2: Configure Custom SMTP (Recommended)

1. **Go to:** Authentication → Providers → Email → SMTP Settings

2. **Enable Custom SMTP:**
   - Turn on "Enable Custom SMTP"
   - Configure with your email provider:
     - **Gmail:** smtp.gmail.com (port 587)
     - **SendGrid:** smtp.sendgrid.net (port 587)
     - **Mailgun:** smtp.mailgun.org (port 587)
     - **Or use Resend SMTP** (see below)

3. **Fill in SMTP credentials:**
   - Host
   - Port
   - Username
   - Password
   - From email address

#### Step 3: Use Resend for Supabase Auth (Alternative)

Resend provides SMTP credentials you can use:

1. **Get Resend SMTP credentials:**
   - Go to Resend Dashboard → Settings → SMTP
   - Copy SMTP settings

2. **Configure in Supabase:**
   - Use Resend's SMTP server
   - Use your Resend API key as password

---

## 🔐 Admin Role Setup

**Problem:** No option to create admin account during signup.

### ✅ Solution: Make User Admin Manually

#### Option 1: Via Supabase SQL Editor (Quick)

Run this SQL to make a user admin:

```sql
-- Find your user by email
SELECT id, email, full_name, role 
FROM users 
WHERE email = 'your-email@example.com';

-- Update role to admin
UPDATE users 
SET role = 'admin' 
WHERE email = 'your-email@example.com';

-- Verify
SELECT id, email, full_name, role 
FROM users 
WHERE email = 'your-email@example.com';
```

#### Option 2: Create Admin User via SQL

```sql
-- Create admin user directly (if user exists in auth.users)
UPDATE users 
SET role = 'admin' 
WHERE email = 'admin@example.com';

-- Or insert admin user if profile doesn't exist
INSERT INTO users (id, email, full_name, role)
SELECT 
    id,
    email,
    raw_user_meta_data->>'full_name' as full_name,
    'admin' as role
FROM auth.users
WHERE email = 'admin@example.com'
ON CONFLICT (email) DO UPDATE
SET role = 'admin';
```

#### Option 3: Create Admin Page (Future Enhancement)

We can create an admin page to manage user roles, but for now, use SQL.

---

## 📋 Quick Fix Checklist

### For Email Verification:

- [ ] Go to Supabase Dashboard
- [ ] Check Authentication → Email Templates
- [ ] Verify email is enabled
- [ ] Configure Custom SMTP (recommended)
- [ ] Test by creating a new account
- [ ] Check spam folder

### For Admin Access:

- [ ] Sign up as regular user (any role)
- [ ] Go to Supabase SQL Editor
- [ ] Run SQL to update role to 'admin'
- [ ] Logout and login again
- [ ] You should now have admin access

---

## 🧪 Testing Email Verification

### Test Signup Flow:

1. **Create new account:**
   - Go to `/signup`
   - Fill in details
   - Submit

2. **Check email:**
   - Look in inbox (and spam)
   - Should receive verification email from Supabase
   - Click verification link

3. **If no email:**
   - Check Supabase Dashboard → Authentication → Email Templates
   - Check SMTP configuration
   - Check spam folder
   - Verify email address is correct

---

## ⚙️ Supabase Email Configuration

### Default Supabase Email (Limited)

- Works for development
- Limited to 3 emails per hour
- May go to spam
- Not recommended for production

### Custom SMTP (Recommended)

**Advantages:**
- ✅ More reliable delivery
- ✅ Higher email limits
- ✅ Better deliverability
- ✅ Custom branding

**Setup:**
1. Get SMTP credentials from email provider
2. Configure in Supabase Dashboard
3. Test email delivery

---

## 🔧 Troubleshooting

### Issue: "Email not sent"
**Fix:**
- Check Supabase email configuration
- Verify SMTP settings
- Check email limits

### Issue: "Email in spam"
**Fix:**
- Configure Custom SMTP with verified domain
- Set up SPF/DKIM records
- Use professional email address

### Issue: "Cannot login as admin"
**Fix:**
- Update user role in database to 'admin'
- Logout and login again
- Clear browser cookies if needed

---

## 📝 Quick SQL Scripts

### Make User Admin:
```sql
UPDATE users 
SET role = 'admin' 
WHERE email = 'YOUR_EMAIL@example.com';
```

### Check User Role:
```sql
SELECT email, full_name, role 
FROM users 
WHERE email = 'YOUR_EMAIL@example.com';
```

### List All Admins:
```sql
SELECT email, full_name, role 
FROM users 
WHERE role = 'admin';
```

---

**Next Steps:** Configure Supabase email settings, then test signup again!

