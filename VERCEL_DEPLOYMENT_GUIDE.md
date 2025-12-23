# Vercel Deployment Guide

Complete guide to deploy the CMIS Event Management System on Vercel.

## 📋 Pre-Deployment Checklist

### ✅ Required Steps

- [ ] **Database Migrations**: Run all migrations in Supabase SQL Editor
  - `001_enable_pgvector.sql` (for vector embeddings)
  - `002_create_embeddings_table.sql`
  - All other migrations from `database/migrations/`

- [ ] **Environment Variables**: Prepare all required env vars (see below)

- [ ] **GitHub Repository**: Code must be pushed to GitHub

- [ ] **Supabase Setup**: Database, auth, and storage configured

- [ ] **Resend Account**: Email service configured

- [ ] **OpenAI/Gemini API**: For AI features and embeddings

## 🚀 Deployment Steps

### Step 1: Install Vercel CLI (if not already installed)

```bash
npm i -g vercel
# OR
pnpm add -g vercel
```

### Step 2: Login to Vercel

```bash
vercel login
```

### Step 3: Link Your Project

```bash
vercel link
```

This will:
- Ask you to select/create a project
- Link your local project to Vercel

### Step 4: Set Environment Variables

#### Option A: Via Vercel Dashboard (Recommended)

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add all variables from the list below

#### Option B: Via CLI

```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL production
# Repeat for each variable
```

### Step 5: Deploy

```bash
vercel --prod
```

Or push to main branch (if connected to GitHub):
```bash
git push origin main
```

---

## 🔐 Required Environment Variables

Add these to Vercel Dashboard → Settings → Environment Variables:

### Core Configuration (REQUIRED)

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

RESEND_API_KEY=re_your_resend_key
RESEND_FROM_EMAIL=noreply@yourdomain.com

NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

### AI & Embeddings (Recommended)

```env
OPENAI_API_KEY=sk-your_openai_key
# OR
GOOGLE_AI_API_KEY=your_gemini_key

AI_PROVIDER=openai
```

### Cache (Optional but Recommended)

```env
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_redis_token
```

### Security (REQUIRED for Production)

Generate secure random strings:

```env
JWT_SECRET=<generate_32_char_random_string>
ENCRYPTION_KEY=<generate_32_char_random_string>
QR_CODE_SECRET=<generate_random_string>
CRON_SECRET=<generate_random_string>
QUEUE_PROCESSOR_TOKEN=<generate_random_string>
```

**Generate secrets:**
```bash
# Generate random strings
openssl rand -hex 32  # For JWT_SECRET, ENCRYPTION_KEY
openssl rand -hex 16  # For others
```

### Optional Services

```env
# Sentry (Error Tracking)
SENTRY_AUTH_TOKEN=your_sentry_token
SENTRY_DSN=your_sentry_dsn

# Cloudinary (if using)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

---

## ⚙️ Vercel Configuration

The project already includes `vercel.json` with:
- Cron job configuration for scheduled tasks
- Automatic deployments from GitHub

### Build Settings

Vercel will auto-detect:
- **Framework**: Next.js
- **Build Command**: `pnpm build` (or `npm run build`)
- **Output Directory**: `.next`
- **Install Command**: `pnpm install`

### Custom Build Settings (if needed)

In Vercel Dashboard → Settings → General:
- **Node.js Version**: 20.x (LTS)
- **Package Manager**: pnpm

---

## 🔍 Post-Deployment Verification

### 1. Check Build Logs

After deployment, verify:
- ✅ Build completed successfully
- ✅ No TypeScript errors
- ✅ All dependencies installed

### 2. Test Critical Features

- [ ] Homepage loads: `https://your-app.vercel.app`
- [ ] Health check: `https://your-app.vercel.app/api/health`
- [ ] Authentication works (login/signup)
- [ ] Database connection verified
- [ ] Email service configured

### 3. Verify Environment Variables

Check Vercel logs:
```bash
vercel logs
```

Or in Dashboard → Deployments → [Latest] → Functions tab

---

## 🛠️ Troubleshooting

### Build Failures

**Issue**: TypeScript errors
```bash
# Fix locally first
pnpm build
pnpm lint
```

**Issue**: Missing dependencies
```bash
# Ensure all dependencies are in package.json
pnpm install
```

**Issue**: Environment variables not loading
- Check variable names match exactly
- Ensure `NEXT_PUBLIC_` prefix for client-side vars
- Redeploy after adding env vars

### Runtime Errors

**Issue**: Database connection failed
- Verify Supabase credentials
- Check RLS policies
- Verify network access

**Issue**: API routes return 500
- Check Vercel function logs
- Verify server-side env vars are set
- Check Supabase service role key

**Issue**: Embeddings not working
- Verify pgvector extension enabled in Supabase
- Run migration `001_enable_pgvector.sql`
- Run migration `002_create_embeddings_table.sql`
- Check OpenAI/Gemini API key

---

## 📊 Vercel Features to Enable

### 1. Analytics (Optional)

Enable in Vercel Dashboard → Analytics tab

### 2. Speed Insights (Optional)

Enable in Vercel Dashboard → Speed Insights tab

### 3. Cron Jobs

Already configured in `vercel.json`:
- Daily email queue processing
- Daily reminder sending
- Daily sponsor digest

---

## 🔄 Continuous Deployment

### Automatic Deployments

Vercel automatically deploys:
- **Production**: From `main` branch
- **Preview**: From pull requests and other branches

### Manual Deployments

```bash
vercel --prod
```

---

## 🔐 Security Checklist

- [ ] All secrets are environment variables (not in code)
- [ ] `NEXT_PUBLIC_` vars are safe for client-side exposure
- [ ] Service role keys are server-side only
- [ ] Cron secrets configured
- [ ] CORS configured properly (if needed)

---

## 📈 Monitoring

### Vercel Dashboard

- Monitor deployments
- View function logs
- Check analytics
- Review errors

### External Monitoring

- **Sentry**: Error tracking (if configured)
- **Supabase Dashboard**: Database monitoring
- **Resend Dashboard**: Email delivery stats

---

## 🚨 Important Notes

1. **Database Migrations**: Must run manually in Supabase SQL Editor before deployment

2. **Environment Variables**: Set in Vercel Dashboard, not in code

3. **Secrets**: Generate strong random strings for production

4. **Build Time**: First build may take 5-10 minutes

5. **Cold Starts**: Serverless functions may have cold starts on first request

---

## ✅ Deployment Checklist

Before deploying:
- [ ] All migrations run in Supabase
- [ ] Environment variables prepared
- [ ] Code pushed to GitHub
- [ ] Build passes locally (`pnpm build`)
- [ ] Tests pass (if any)
- [ ] Secrets generated
- [ ] Vercel project created/linked

After deploying:
- [ ] Homepage loads
- [ ] API health check works
- [ ] Authentication works
- [ ] Database connection verified
- [ ] Email service tested
- [ ] Vector embeddings tested (if using)

---

## 🎯 Quick Deploy Command

```bash
# Login (first time only)
vercel login

# Link project (first time only)
vercel link

# Deploy to production
vercel --prod
```

---

## 📞 Need Help?

- **Vercel Docs**: https://vercel.com/docs
- **Next.js Deploy**: https://nextjs.org/docs/deployment
- **Supabase Docs**: https://supabase.com/docs

---

**Ready to deploy? Follow the steps above and you'll be live in minutes! 🚀**

