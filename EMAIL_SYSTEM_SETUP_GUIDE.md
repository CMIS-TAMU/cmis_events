# 🚀 Email Notification System - Setup Guide

## 📊 **Visual Overview**

```
┌─────────────────────────────────────────────────────────────┐
│                    WHAT YOU NEED TO DO                       │
└─────────────────────────────────────────────────────────────┘

┌─────────────────┐      ┌─────────────────┐      ┌──────────────┐
│  1. Resend      │      │  2. Database    │      │  3. Env Vars │
│  Account        │ ────▶│   Migration     │ ────▶│   Config     │
│  (5 min)        │      │   (2 min)       │      │   (2 min)    │
└─────────────────┘      └─────────────────┘      └──────────────┘
         │                       │                       │
         └───────────────────────┴───────────────────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │   SYSTEM READY! ✅      │
                    │   I'll implement the    │
                    │   rest automatically    │
                    └─────────────────────────┘
```

---

## 🎯 **Step-by-Step Setup**

### **Step 1: Resend Account Setup**

**Time: 5 minutes**

1. **Sign Up:**
   - Go to https://resend.com
   - Click "Sign Up"
   - Create account (free tier is fine for testing)

2. **Get API Key:**
   - Go to Dashboard → API Keys
   - Click "Create API Key"
   - Name it: "CMIS Events"
   - Copy the key (starts with `re_`)

3. **Domain Setup (Choose One):**

   **Option A: Use Test Domain (Quick Start)**
   - No verification needed
   - Use: `onboarding@resend.dev` as FROM email
   - Limited to 100 emails/day
   - Good for development/testing

   **Option B: Verify Your Domain (Production)**
   - Go to Domains → Add Domain
   - Enter your domain (e.g., `cmis.tamu.edu`)
   - Add DNS records to your domain
   - Wait for verification (5-15 minutes)
   - Use: `noreply@yourdomain.com` as FROM email

4. **Add to `.env.local`:**
   ```env
   RESEND_API_KEY=re_your_actual_key_here
   RESEND_FROM_EMAIL=noreply@yourdomain.com
   # OR for testing:
   # RESEND_FROM_EMAIL=onboarding@resend.dev
   ```

---

### **Step 2: Database Migration**

**Time: 2 minutes**

1. **Open Supabase:**
   - Go to your Supabase project dashboard
   - Click "SQL Editor" in left sidebar
   - Click "New Query"

2. **Run Migration:**
   - Open file: `database/migrations/add_communication_system.sql`
   - **Copy ALL contents** (entire file)
   - Paste into SQL Editor
   - Click "Run" button (or press Ctrl+Enter / Cmd+Enter)

3. **Verify Success:**
   - You should see: "Success. No rows returned"
   - Go to "Table Editor"
   - Verify these 8 tables exist:
     - `communication_templates`
     - `communication_schedules`
     - `communication_queue`
     - `communication_logs`
     - `sponsor_tiers`
     - `communication_preferences`
     - `email_template_variations`
     - `surge_mode_config`

**✅ Migration Complete!**

---

### **Step 3: Environment Variables**

**Time: 2 minutes**

1. **Generate Cron Secret:**
   
   **Windows (PowerShell):**
   ```powershell
   [Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
   ```
   
   **Mac/Linux:**
   ```bash
   openssl rand -base64 32
   ```
   
   **Or use online:** https://randomkeygen.com/

2. **Update `.env.local`:**
   ```env
   # Add these if not already present:
   CRON_SECRET=your_generated_secret_here
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   
   # Verify these exist:
   RESEND_API_KEY=re_your_key_here
   RESEND_FROM_EMAIL=noreply@yourdomain.com
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

3. **Restart Dev Server:**
   ```bash
   # Stop current server (Ctrl+C)
   # Start again:
   npm run dev
   # or
   pnpm dev
   ```

---

## ✅ **Verification Checklist**

After completing all steps, verify:

- [ ] Resend API key is in `.env.local`
- [ ] `RESEND_FROM_EMAIL` is set
- [ ] Database migration ran successfully
- [ ] All 8 tables visible in Supabase
- [ ] `CRON_SECRET` is set in `.env.local`
- [ ] `NEXT_PUBLIC_APP_URL` is set
- [ ] Dev server restarted

---

## 🧪 **Quick Test**

1. **Create Test Event:**
   - Log in as admin
   - Go to `/admin/events/new`
   - Create a test event
   - Save

2. **Check Email:**
   - System should automatically queue emails
   - Check Resend dashboard → Emails
   - You should see emails being sent

3. **Check Database:**
   - Go to Supabase → Table Editor
   - Check `communication_queue` table
   - Should see queued emails

---

## 🚨 **Troubleshooting**

### **Emails Not Sending?**

1. **Check Resend Dashboard:**
   - Go to Resend → Emails
   - Look for error messages
   - Check API key is valid

2. **Check Environment Variables:**
   ```bash
   # Verify in .env.local:
   RESEND_API_KEY=re_... (should start with re_)
   RESEND_FROM_EMAIL=... (must match verified domain)
   ```

3. **Check Server Logs:**
   - Look for error messages in terminal
   - Check for "Email service not configured" warnings

### **Database Errors?**

1. **Verify Migration:**
   - Check all 8 tables exist
   - If missing, re-run migration

2. **Check Supabase Connection:**
   - Verify `NEXT_PUBLIC_SUPABASE_URL` is correct
   - Verify `SUPABASE_SERVICE_ROLE_KEY` is set

### **Cron Jobs Not Running?**

1. **Local Development:**
   - Cron jobs only run on Vercel
   - For local testing, we'll create manual triggers

2. **Vercel Deployment:**
   - Verify `CRON_SECRET` is set in Vercel
   - Check `vercel.json` exists (we'll create this)
   - Check Vercel function logs

---

## 📋 **What Happens Next**

Once you complete the setup:

1. **I'll implement:**
   - Email queue processing system
   - Event creation triggers
   - Reminder system (24h before events)
   - Weekly sponsor digest
   - 15 email template variations
   - Randomized send times
   - Preference management UI
   - Unsubscribe system
   - Analytics dashboard

2. **You'll be able to:**
   - Create events → automatic notifications
   - See email queue in admin dashboard
   - View analytics and metrics
   - Manage user preferences
   - Test all email types

---

## 🎯 **Summary**

**Minimum Setup (10 minutes):**
1. ✅ Resend account + API key
2. ✅ Run database migration
3. ✅ Set environment variables

**That's it!** The system will work after these 3 steps.

**Production Setup (30 minutes):**
- Add domain verification
- Deploy to Vercel
- Configure production environment variables
- Test cron jobs

---

## 📚 **Documentation Files**

- **`EMAIL_SYSTEM_SETUP_GUIDE.md`** (this file) - Step-by-step setup
- **`EMAIL_SYSTEM_QUICK_CHECKLIST.md`** - Quick reference checklist
- **`EMAIL_NOTIFICATION_SYSTEM_REQUIREMENTS.md`** - Detailed requirements
- **`EMAIL_SYSTEM_IMPLEMENTATION_SUMMARY.md`** - Overview and action plan

---

**Ready?** Start with Step 1! 🚀


