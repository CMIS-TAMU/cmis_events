# 📋 Email Notification System - Quick Setup Checklist

## ⚡ **5-Minute Quick Start**

### Step 1: Resend Account (2 minutes)
- [ ] Sign up at https://resend.com
- [ ] Get API key from dashboard
- [ ] Add to `.env.local`: `RESEND_API_KEY=re_...`
- [ ] Add to `.env.local`: `RESEND_FROM_EMAIL=noreply@yourdomain.com` (or use test domain)

### Step 2: Database Migration (1 minute)
- [ ] Open Supabase Dashboard → SQL Editor
- [ ] Copy contents of `database/migrations/add_communication_system.sql`
- [ ] Paste and Run
- [ ] Verify 8 tables created in Table Editor

### Step 3: Environment Variables (1 minute)
- [ ] Generate `CRON_SECRET`: `openssl rand -base64 32` (or use online generator)
- [ ] Add to `.env.local`:
  ```env
  CRON_SECRET=your_secret_here
  NEXT_PUBLIC_APP_URL=http://localhost:3000
  ```

### Step 4: Test (1 minute)
- [ ] Create test event as admin
- [ ] System automatically sends notifications!

---

## 🔧 **Full Production Setup**

### Required Services:
- [ ] **Resend:** API key + verified domain
- [ ] **Supabase:** Migration run + service role key
- [ ] **Vercel:** Project deployed + environment variables set

### Environment Variables Checklist:
```env
# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

# Resend (Required)
RESEND_API_KEY=...
RESEND_FROM_EMAIL=...

# App Config (Required)
NEXT_PUBLIC_APP_URL=...
CRON_SECRET=...

# Optional
UPSTASH_REDIS_REST_URL=...
UPSTASH_REDIS_REST_TOKEN=...
QUEUE_PROCESSOR_TOKEN=...
SENTRY_DSN=...
```

### Database:
- [ ] Migration `add_communication_system.sql` run successfully
- [ ] All 8 tables visible in Supabase Table Editor
- [ ] RLS policies active

### Vercel Deployment:
- [ ] Project deployed to Vercel
- [ ] All environment variables added to Vercel dashboard
- [ ] `vercel.json` with cron jobs (we'll create this)
- [ ] Cron jobs running (check Vercel logs)

### Domain & Email:
- [ ] Domain added to Resend
- [ ] DNS records added to domain
- [ ] Domain verified in Resend dashboard
- [ ] SPF/DKIM records active

---

## 🧪 **Testing Checklist**

### Test Accounts:
- [ ] 1 admin account
- [ ] 3-5 student accounts
- [ ] 2-3 sponsor accounts
- [ ] 1-2 mentor accounts
- [ ] 1-2 faculty accounts

### Test Scenarios:
- [ ] Admin creates event → notifications sent
- [ ] User registers → confirmation email
- [ ] 24h before event → reminder sent
- [ ] Monday morning → sponsor digest sent
- [ ] User unsubscribes → no more emails
- [ ] Email preferences updated → respected

---

## ✅ **Ready to Go?**

Once you've completed the **5-Minute Quick Start** checklist, the system will work!

The rest can be done incrementally as you move toward production.

---

**Need help?** Check `EMAIL_NOTIFICATION_SYSTEM_REQUIREMENTS.md` for detailed instructions.


