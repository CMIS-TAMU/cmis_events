# ⚡ Quick Fix: Email & Admin Issues (5 minutes)

## 🚨 Two Issues to Fix

1. **No verification email on signup**
2. **Cannot login as admin**

---

## ✅ Fix 1: Make Yourself Admin (1 minute)

### Step 1: Open Supabase SQL Editor

1. Go to Supabase Dashboard
2. Click **SQL Editor** (left sidebar)
3. Click **New query**

### Step 2: Run This SQL

**Replace `your-email@example.com` with your actual email:**

```sql
-- Make yourself admin
UPDATE users 
SET role = 'admin' 
WHERE email = 'your-email@example.com';

-- Verify it worked
SELECT email, full_name, role 
FROM users 
WHERE email = 'your-email@example.com';
```

**Expected Result:** Should show `role = 'admin'`

### Step 3: Login Again

1. **Logout** from the application
2. **Login** again with your credentials
3. ✅ You should now have admin access!

---

## ✅ Fix 2: Enable Email Verification (2 minutes)

### Step 1: Check Supabase Email Settings

1. Go to Supabase Dashboard
2. Click **Authentication** (left sidebar)
3. Click **Providers**
4. Click **Email** tab

### Step 2: Enable Email Confirmation

**Check these settings:**
- ✅ **Enable email provider** - Should be ON
- ✅ **Confirm email** - Should be CHECKED

**If not checked:**
- Check the box
- Click **Save**

### Step 3: Test Email

1. Create a new account at `/signup`
2. Check your email inbox
3. Check **spam folder** too
4. Click verification link in email

**If still no email:**
- Go to **Authentication** → **Email Templates**
- Check if templates are configured
- Consider setting up Custom SMTP (see below)

---

## 🔧 Optional: Setup Custom SMTP (Better Email Delivery)

If emails are not arriving or going to spam:

### Option A: Use Gmail SMTP

1. Go to Supabase → **Authentication** → **SMTP Settings**
2. Enable **Custom SMTP**
3. Fill in:
   ```
   Host: smtp.gmail.com
   Port: 587
   Username: your-email@gmail.com
   Password: [Gmail App Password]
   From: your-email@gmail.com
   ```
4. Click **Save**

**Note:** For Gmail, you need to create an "App Password":
- Google Account → Security → 2-Step Verification → App Passwords

### Option B: Use Resend SMTP

1. Get Resend SMTP credentials:
   - Resend Dashboard → Settings → SMTP
2. Configure in Supabase:
   - Use Resend SMTP server and credentials
   - Use your Resend API key

---

## ✅ Quick Checklist

### Admin Access:
- [ ] Ran SQL to update role to 'admin'
- [ ] Logged out
- [ ] Logged back in
- [ ] Can access `/admin/dashboard` ✅

### Email Verification:
- [ ] Checked Supabase email settings
- [ ] Email confirmation enabled
- [ ] Created test account
- [ ] Received verification email ✅

---

## 🧪 Test It Now

### Test Admin:
1. Go to: http://localhost:3000/admin/dashboard
2. ✅ Should work!

### Test Email:
1. Create new account
2. Check email
3. ✅ Should receive verification email!

---

## 🆘 Still Not Working?

### Admin Issue:
- **Check:** Did you logout and login again?
- **Check:** Run SQL again to verify role
- **Check:** Look for any error messages

### Email Issue:
- **Check:** Spam folder
- **Check:** Email address is correct
- **Check:** Supabase email settings enabled
- **Try:** Configure Custom SMTP

---

**Files created:**
- ✅ `scripts/make-user-admin.sql` - SQL script ready to use
- ✅ `EMAIL_VERIFICATION_SETUP.md` - Detailed email setup
- ✅ `FIX_EMAIL_AND_ADMIN.md` - Complete troubleshooting guide

**Ready to fix?** Start with the SQL script above! 🚀

