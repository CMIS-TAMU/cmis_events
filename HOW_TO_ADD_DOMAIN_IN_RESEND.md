# 📧 How to Add Domain in Resend - Step by Step

## ⚠️ **Important: Don't Add Subdomains!**

The error shows you tried to add `updates.example.com`, but Resend needs the **base domain**, not a subdomain.

---

## ✅ **EASIEST OPTION: Use Test Domain (No Setup Needed)**

**You don't need to add any domain for testing!**

### **Step 1: Update `.env.local`**

Add this line (no domain verification needed):
```bash
RESEND_FROM_EMAIL=onboarding@resend.dev
```

### **Step 2: Verify Recipients in Resend**

1. Go to https://resend.com/emails
2. Click on **"Verified Recipients"** or **"Settings"**
3. Add these emails (so they can receive test emails):
   - `prasanna.salunkhe@tamu.edu`
   - `nisarg.sonar@tamu.edu`

### **Step 3: Restart Server**

```bash
# Stop server (Ctrl+C)
npm run dev
```

**Done!** Emails will work immediately. ✅

---

## 🔧 **OPTION 2: Add Your Own Domain (For Production)**

### **What Domain to Add?**

You need to add the **BASE DOMAIN**, not a subdomain:

**❌ WRONG (Subdomain):**
```
updates.example.com  ❌
notifications.tamu.edu  ❌
cmis.tamu.edu  ❌ (if it's a subdomain)
```

**✅ CORRECT (Base Domain):**
```
example.com  ✅
tamu.edu  ✅ (if you own/manage it)
yourdomain.com  ✅
```

### **Step-by-Step: Add Base Domain**

#### **Step 1: Determine Your Base Domain**

Choose one:
- **If you own `example.com`** → Add `example.com`
- **If you manage TAMU domain** → Add `tamu.edu` (requires IT access)
- **If you have your own domain** → Add your base domain

#### **Step 2: Add Domain in Resend**

1. Go to https://resend.com/domains
2. Click **"+ Add Domain"**
3. In the **"Name"** field, enter **ONLY the base domain**:
   ```
   example.com
   ```
   **NOT** `updates.example.com` or `notifications.example.com`

4. Select **Region**: "North Virginia (us-east-1)" or your preferred region
5. Click **"+ Add Domain"**

#### **Step 3: Add DNS Records**

After adding, Resend will show you DNS records to add:

**Example DNS Records:**
```
Type: TXT
Name: @
Value: resend._domainkey=... (DKIM record)

Type: MX  
Name: @
Value: feedback-smtp.resend.com (for bounce handling)
```

**Where to add DNS records:**
- Go to your domain's DNS provider (GoDaddy, Namecheap, Cloudflare, etc.)
- Add the DNS records Resend provides
- Save changes

#### **Step 4: Wait for Verification**

- DNS changes can take 5 minutes to 24 hours
- Resend will automatically verify when DNS propagates
- Status will change from "Pending" to "Verified" ✅

#### **Step 5: Use Subdomain in Email**

After domain is verified, you can use **any subdomain** for sending:

**Update `.env.local`:**
```bash
RESEND_FROM_EMAIL=noreply@example.com
# OR any subdomain:
RESEND_FROM_EMAIL=updates@example.com
RESEND_FROM_EMAIL=notifications@example.com
RESEND_FROM_EMAIL=cmis@example.com
```

---

## 🎯 **What Should YOU Add?**

Based on your project, here are your options:

### **Option A: Use Test Domain (Easiest - Recommended)**

**No domain to add!** Just use:
```bash
RESEND_FROM_EMAIL=onboarding@resend.dev
```

**Pros:**
- ✅ Works immediately
- ✅ No DNS setup needed
- ✅ Perfect for testing

### **Option B: Add `tamu.edu` (If You Have Access)**

**Only if you can manage TAMU DNS:**
1. Add domain: `tamu.edu` (not `cmis.tamu.edu`)
2. Add DNS records at TAMU DNS provider
3. Wait for verification
4. Use: `RESEND_FROM_EMAIL=noreply@tamu.edu`

**Note:** This requires TAMU IT department access.

### **Option C: Add Your Own Domain**

**If you have your own domain:**
1. Add base domain: `yourdomain.com` (not `updates.yourdomain.com`)
2. Add DNS records at your domain provider
3. Wait for verification
4. Use: `RESEND_FROM_EMAIL=noreply@yourdomain.com`

---

## 📋 **Quick Decision Tree**

```
Do you want to test emails RIGHT NOW?
├─ YES → Use: onboarding@resend.dev (no domain needed!)
└─ NO → Continue below

Do you own/manage a domain?
├─ YES → Add base domain (example.com)
│        Then use any subdomain (noreply@example.com)
└─ NO → Use onboarding@resend.dev for testing
```

---

## 🚀 **My Recommendation for You**

**Start with test domain:**

1. **Update `.env.local`:**
   ```bash
   RESEND_FROM_EMAIL=onboarding@resend.dev
   ```

2. **Verify recipients:**
   - Go to https://resend.com/emails
   - Add: `prasanna.salunkhe@tamu.edu`
   - Add: `nisarg.sonar@tamu.edu`

3. **Restart server and test!**

**Later, for production:**
- Contact TAMU IT to verify `tamu.edu` domain
- OR use your own domain
- OR continue with test domain (but only for verified recipients)

---

## 🔍 **Common Mistakes**

### **Mistake 1: Adding Subdomain**
❌ `updates.example.com`
✅ `example.com`

### **Mistake 2: Using Unverified Domain**
❌ Using domain before verification
✅ Wait for "Verified" status

### **Mistake 3: Wrong DNS Records**
❌ Not adding all DNS records
✅ Add ALL records Resend provides

---

## ✅ **Summary**

**For testing (NOW):**
- **Add nothing!** Just use `onboarding@resend.dev`
- Verify recipients in Resend dashboard
- Works immediately ✅

**For production (LATER):**
- Add base domain (e.g., `example.com`)
- Add DNS records
- Wait for verification
- Use any subdomain (e.g., `noreply@example.com`)

---

**Start with the test domain to get emails working right away!** 🚀


