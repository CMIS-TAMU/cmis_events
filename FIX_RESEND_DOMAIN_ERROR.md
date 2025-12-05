# 🔧 Fix: Resend Domain Verification Error

## ❌ **Error**
```
403 Forbidden - The yourdomain.com domain is not verified. 
Please, add and verify your domain on https://resend.com/domains
```

## 🎯 **Problem**

Emails are being queued successfully, but **failing to send** because:
- The `RESEND_FROM_EMAIL` is set to `yourdomain.com` (placeholder)
- This domain is not verified in Resend
- Resend requires domain verification before sending emails

---

## ✅ **Solution: Two Options**

### **Option 1: Use Resend Test Domain (Quick Fix for Development)**

For testing/development, use Resend's built-in test domain:

**Update `.env.local`:**
```bash
RESEND_FROM_EMAIL=onboarding@resend.dev
```

**This domain is pre-verified** and works immediately - no setup needed!

**Limitations:**
- Only sends to your verified email addresses in Resend
- Good for development/testing only
- Not for production

---

### **Option 2: Verify Your Own Domain (Production)**

For production, verify your own domain:

#### **Step 1: Add Domain in Resend**

1. Go to https://resend.com/domains
2. Click **"Add Domain"**
3. Enter your domain (e.g., `cmis.tamu.edu` or `yourdomain.com`)
4. Click **"Add"**

#### **Step 2: Add DNS Records**

Resend will show you DNS records to add. Add them to your domain's DNS:

**Example records:**
```
Type: TXT
Name: @
Value: resend._domainkey.yourdomain.com (DKIM record)

Type: MX
Name: @
Value: feedback-smtp.resend.com (for bounce handling)
```

#### **Step 3: Verify Domain**

1. Wait for DNS propagation (can take a few minutes to 24 hours)
2. Click **"Verify"** in Resend dashboard
3. Status should change to **"Verified"** ✅

#### **Step 4: Update Environment Variable**

**Update `.env.local`:**
```bash
RESEND_FROM_EMAIL=noreply@yourdomain.com
# Or
RESEND_FROM_EMAIL=noreply@cmis.tamu.edu
```

**Replace `yourdomain.com` with your actual verified domain!**

---

## 🧪 **Test After Fix**

### **Step 1: Restart Server**
```bash
# Stop server (Ctrl+C)
npm run dev
```

### **Step 2: Create Test Event**
1. Go to `/admin/events/new`
2. Create a test event
3. Watch server logs

### **Step 3: Check Logs**

**Before fix:**
```
❌ Resend error: 403 Forbidden - domain not verified
✔ Queue processed: 0 sent, 4 failed
```

**After fix:**
```
✅ Queue processed: 4 sent, 0 failed
✅ Emails sent successfully!
```

### **Step 4: Check Email Inboxes**

- Check recipient email inboxes
- Check spam folder
- Verify emails were received

---

## 📋 **Quick Checklist**

- [ ] **For Development:** Set `RESEND_FROM_EMAIL=onboarding@resend.dev` in `.env.local`
- [ ] **For Production:** Verify your domain in Resend dashboard
- [ ] **Update `.env.local`** with verified domain email
- [ ] **Restart server** to load new environment variable
- [ ] **Test by creating an event**
- [ ] **Check logs** - should see "4 sent, 0 failed"
- [ ] **Check email inboxes** - should receive emails

---

## 🔍 **Verify Current Configuration**

**Check what email is being used:**
```bash
# In your terminal, check .env.local
cat .env.local | grep RESEND_FROM_EMAIL
```

**Or check in code:**
The default is `noreply@cmis.tamu.edu` if `RESEND_FROM_EMAIL` is not set.

**Current code (lib/email/client.ts):**
```typescript
const fromEmail = process.env.RESEND_FROM_EMAIL || 'noreply@cmis.tamu.edu';
```

---

## 🚀 **Recommended: Use Test Domain for Now**

**Quick fix - add to `.env.local`:**
```bash
RESEND_FROM_EMAIL=onboarding@resend.dev
```

**Then restart server and test!**

This will work immediately without any domain verification.

---

## 📝 **Note**

- The error shows `yourdomain.com` which is a placeholder
- You need to either:
  1. Use `onboarding@resend.dev` (test domain - works immediately)
  2. Verify your actual domain in Resend (for production)

**The email system is working correctly - it's just the domain that needs to be verified!** ✅


