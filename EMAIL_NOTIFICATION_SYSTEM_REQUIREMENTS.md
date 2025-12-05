# 📧 Email Notification System - Requirements from Your End

This document outlines everything you need to provide or configure to implement the automated email notification system.

---

## ✅ **ALREADY IN PLACE** (No Action Needed)

- ✅ Resend email service integration (`lib/email/client.ts`)
- ✅ React Email components installed
- ✅ Basic email templates structure
- ✅ Database schema migration file (`database/migrations/add_communication_system.sql`)
- ✅ tRPC infrastructure
- ✅ Supabase client setup
- ✅ Next.js 14 project structure

---

## 🔴 **REQUIRED: Services & API Keys**

### 1. **Resend Account & API Key** (CRITICAL)

**What you need:**
- Resend account: https://resend.com
- API key from Resend dashboard
- Verified domain for sending emails

**Steps:**
1. Sign up at https://resend.com
2. Go to **API Keys** → Create new API key
3. Copy the API key (starts with `re_`)
4. Add to `.env.local`:
   ```env
   RESEND_API_KEY=re_your_api_key_here
   RESEND_FROM_EMAIL=noreply@yourdomain.com
   ```

**Domain Verification:**
- In Resend dashboard, go to **Domains**
- Add your domain (e.g., `cmis.tamu.edu` or your custom domain)
- Add the DNS records Resend provides to your domain's DNS settings
- Wait for verification (usually 5-15 minutes)

**Note:** Without a verified domain, emails may go to spam. For testing, you can use Resend's test domain, but production requires your own domain.

---

### 2. **Vercel Account** (For Cron Jobs)

**What you need:**
- Vercel account (if not already set up)
- Project deployed on Vercel
- Cron secret for authentication

**Steps:**
1. If not already on Vercel, deploy your Next.js app to Vercel
2. Generate a secure random string for cron authentication:
   ```bash
   openssl rand -base64 32
   ```
3. Add to `.env.local` and Vercel environment variables:
   ```env
   CRON_SECRET=your_generated_secret_here
   ```

**Vercel Cron Configuration:**
- We'll create `vercel.json` with cron job definitions
- Vercel will automatically execute cron jobs on schedule
- No additional setup needed once deployed

---

### 3. **Supabase Database** (Already Set Up)

**What you need:**
- Supabase project URL
- Supabase anon key
- Supabase service role key (for server-side operations)

**Action Required:**
1. **Run the database migration:**
   - Go to Supabase Dashboard → SQL Editor
   - Open `database/migrations/add_communication_system.sql`
   - Copy entire contents
   - Paste into SQL Editor
   - Click **Run**
   - Verify all 8 tables are created

2. **Verify environment variables:**
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

---

## 📋 **OPTIONAL: Additional Services**

### 4. **Upstash Redis** (For Queue Management - Optional)

**If you want advanced queue management:**
- Sign up at https://upstash.com
- Create Redis database
- Get REST URL and token
- Add to `.env.local`:
  ```env
  UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
  UPSTASH_REDIS_REST_TOKEN=your_token
  ```

**Note:** The system will work without Redis using database-based queue, but Redis provides better performance for high-volume scenarios.

---

### 5. **Sentry** (For Error Tracking - Optional)

**If you want error monitoring:**
- Sign up at https://sentry.io
- Create project
- Get DSN
- Add to `.env.local`:
  ```env
  SENTRY_DSN=https://your-dsn@sentry.io/project-id
  ```

---

## 🔧 **CONFIGURATION REQUIRED**

### 6. **Environment Variables** (`.env.local`)

**Minimum required:**
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Resend Email
RESEND_API_KEY=re_your_api_key_here
RESEND_FROM_EMAIL=noreply@yourdomain.com

# App URL (for email links)
NEXT_PUBLIC_APP_URL=http://localhost:3000  # Development
# NEXT_PUBLIC_APP_URL=https://yourdomain.com  # Production

# Cron Secret (for scheduled jobs)
CRON_SECRET=your_random_secret_here

# Environment
NODE_ENV=development  # or production
```

**Optional but recommended:**
```env
# Redis (for queue)
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_token

# Error Tracking
SENTRY_DSN=https://your-dsn@sentry.io/project-id

# Queue Processor Token (for security)
QUEUE_PROCESSOR_TOKEN=another_random_secret
```

---

### 7. **Domain & Email Configuration**

**For Production:**
1. **Domain:** You need a domain (e.g., `cmis.tamu.edu` or custom domain)
2. **DNS Records:** Add Resend's DNS records to your domain
3. **SPF/DKIM:** Resend provides these automatically when you verify domain
4. **From Email:** Must match verified domain (e.g., `noreply@cmis.tamu.edu`)

**For Development/Testing:**
- Can use Resend's test domain temporarily
- Or use your verified domain

---

## 🗄️ **DATABASE SETUP**

### 8. **Run Database Migration**

**CRITICAL STEP - Must be done before system works:**

1. **Open Supabase SQL Editor:**
   - Go to your Supabase project dashboard
   - Click **SQL Editor** in left sidebar
   - Click **New Query**

2. **Run Migration:**
   - Open file: `database/migrations/add_communication_system.sql`
   - Copy **ENTIRE** file contents
   - Paste into SQL Editor
   - Click **Run** (or press Ctrl+Enter)
   - Wait for success message

3. **Verify Tables Created:**
   - Go to **Table Editor** in Supabase
   - Verify these 8 tables exist:
     - ✅ `communication_templates`
     - ✅ `communication_schedules`
     - ✅ `communication_queue`
     - ✅ `communication_logs`
     - ✅ `sponsor_tiers`
     - ✅ `communication_preferences`
     - ✅ `email_template_variations`
     - ✅ `surge_mode_config`

4. **Verify RLS Policies:**
   - Tables should have Row Level Security enabled
   - Policies should be created automatically by migration

---

## 🚀 **VERCEL DEPLOYMENT CONFIGURATION**

### 9. **Vercel Environment Variables**

**When deploying to Vercel, add these environment variables:**

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add all variables from `.env.local` (except `NODE_ENV` which is automatic)
3. **Important:** Set different values for:
   - **Development** (for preview deployments)
   - **Production** (for production domain)

**Required Vercel Variables:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`
- `NEXT_PUBLIC_APP_URL` (set to your production domain)
- `CRON_SECRET`
- `QUEUE_PROCESSOR_TOKEN` (optional but recommended)

---

### 10. **Vercel Cron Jobs**

**We'll create `vercel.json` with cron definitions:**
- Daily reminder job (runs every hour to check for 24h reminders)
- Weekly sponsor digest (runs every Monday at 8 AM)
- Queue processor (runs every 5 minutes)

**No action needed from you** - the file will be created automatically.

---

## 📊 **TESTING REQUIREMENTS**

### 11. **Test Accounts**

**You'll need:**
- 1 admin account (for creating events)
- 5-10 test user accounts with different roles:
  - Students (3-5 accounts)
  - Sponsors (2-3 accounts)
  - Mentors (1-2 accounts)
  - Faculty (1-2 accounts)

**Create test accounts:**
- Sign up via your app's signup page
- Or create directly in Supabase Auth dashboard

---

### 12. **Test Email Addresses**

**For testing email delivery:**
- Use real email addresses you can access
- Gmail, Outlook, or any email provider works
- **Important:** Don't use throwaway email services (they may block automated emails)

**Recommended:**
- Create a test Gmail account specifically for testing
- Or use your personal email for initial testing

---

## 🔐 **SECURITY REQUIREMENTS**

### 13. **Secret Generation**

**Generate secure secrets for:**
- `CRON_SECRET`
- `QUEUE_PROCESSOR_TOKEN` (optional)

**How to generate:**
```bash
# On Windows (PowerShell):
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))

# On Mac/Linux:
openssl rand -base64 32
```

**Or use online generator:**
- https://randomkeygen.com/
- Generate "CodeIgniter Encryption Keys" (32 characters)

---

## 📝 **DATA REQUIREMENTS**

### 14. **Initial Data Setup**

**After migration, you may want to:**
1. **Set default email preferences** for existing users
2. **Create initial email templates** (we'll provide seed data)
3. **Configure sponsor tiers** (if applicable)

**We'll provide SQL seed scripts for:**
- Default email templates (15 variations)
- Default communication preferences
- Sample sponsor tier configurations

---

## ✅ **CHECKLIST: What You Need to Provide**

### Immediate Requirements:
- [ ] Resend API key
- [ ] Resend domain verified
- [ ] Run database migration in Supabase
- [ ] Set environment variables in `.env.local`
- [ ] Generate `CRON_SECRET`
- [ ] Test email addresses (5-10 accounts)

### Before Production:
- [ ] Deploy to Vercel
- [ ] Add environment variables to Vercel
- [ ] Verify domain DNS records for Resend
- [ ] Test cron jobs are running
- [ ] Set up monitoring/error tracking (optional)

### Optional Enhancements:
- [ ] Upstash Redis account (for better queue performance)
- [ ] Sentry account (for error tracking)
- [ ] Custom domain configured
- [ ] SPF/DKIM records verified

---

## 🆘 **TROUBLESHOOTING**

### If emails aren't sending:
1. Check `RESEND_API_KEY` is set correctly
2. Verify domain is verified in Resend dashboard
3. Check Resend dashboard for error logs
4. Verify `RESEND_FROM_EMAIL` matches verified domain

### If cron jobs aren't running:
1. Verify `CRON_SECRET` is set in Vercel
2. Check `vercel.json` exists with cron definitions
3. Check Vercel function logs for errors
4. Verify deployment is on Vercel (not local)

### If database errors occur:
1. Verify migration was run successfully
2. Check Supabase connection strings
3. Verify RLS policies are correct
4. Check Supabase logs for errors

---

## 📞 **NEXT STEPS**

Once you've completed the checklist above:

1. **Run the database migration** (most critical)
2. **Set up Resend account** and verify domain
3. **Configure environment variables**
4. **Let me know when ready** - I'll implement the full system

The implementation will include:
- ✅ All email templates (15 variations)
- ✅ Queue processing system
- ✅ Cron job configuration
- ✅ Event creation triggers
- ✅ Reminder system
- ✅ Sponsor digest
- ✅ Analytics dashboard
- ✅ Unsubscribe/preference management

---

## 💡 **QUICK START (Minimum Setup)**

**To get started quickly with testing:**

1. **Resend:**
   - Sign up, get API key
   - Use Resend's test domain for now (no verification needed)

2. **Database:**
   - Run migration in Supabase SQL Editor

3. **Environment:**
   - Add minimum required variables to `.env.local`

4. **Test:**
   - Create a test event as admin
   - System will automatically send notifications

**That's it!** The system will work with minimal setup. You can add domain verification and other enhancements later.

---

**Questions?** Let me know what you need help with!


