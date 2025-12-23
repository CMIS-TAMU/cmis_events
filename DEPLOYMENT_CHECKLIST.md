# Vercel Deployment Checklist

## ✅ Pre-Deployment Requirements

### 1. Database Setup (CRITICAL)
- [ ] Run `database/migrations/001_enable_pgvector.sql` in Supabase SQL Editor
- [ ] Run `database/migrations/002_create_embeddings_table.sql` in Supabase SQL Editor
- [ ] Run all other migrations from `database/migrations/` folder
- [ ] Verify tables exist: `users`, `events`, `embeddings`, etc.

### 2. Environment Variables to Set in Vercel

#### REQUIRED (Must have):
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
RESEND_API_KEY
RESEND_FROM_EMAIL
NEXT_PUBLIC_APP_URL (set after deployment)
```

#### HIGHLY RECOMMENDED:
```
OPENAI_API_KEY (or GOOGLE_AI_API_KEY)
UPSTASH_REDIS_REST_URL
UPSTASH_REDIS_REST_TOKEN
```

#### SECURITY (Generate random strings):
```
JWT_SECRET (32+ chars)
ENCRYPTION_KEY (exactly 32 chars)
QR_CODE_SECRET
CRON_SECRET
QUEUE_PROCESSOR_TOKEN
```

#### OPTIONAL:
```
SENTRY_AUTH_TOKEN
SENTRY_DSN
AI_PROVIDER
AI_CHAT_MODEL
```

### 3. Generate Security Secrets

Run these commands to generate secrets:
```bash
# For JWT_SECRET and ENCRYPTION_KEY (32 chars)
openssl rand -hex 16

# For others (16 chars)
openssl rand -hex 8
```

---

## 🚀 Quick Deployment Steps

### Option 1: Deploy via Vercel Dashboard (Easiest)

1. **Go to**: https://vercel.com/new
2. **Import** your GitHub repository: `CMIS-TAMU/cmis_events`
3. **Configure Project**:
   - Framework Preset: Next.js (auto-detected)
   - Root Directory: `./`
   - Build Command: `pnpm build` (or leave default)
   - Output Directory: `.next` (auto)
   - Install Command: `pnpm install`
4. **Add Environment Variables** (see list above)
5. **Deploy**

### Option 2: Deploy via CLI

```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Login
vercel login

# 3. Link project (first time)
vercel link

# 4. Set environment variables (or add via dashboard)
vercel env add NEXT_PUBLIC_SUPABASE_URL

# 5. Deploy
vercel --prod
```

---

## 🔍 Post-Deployment Verification

After deployment, test:

1. **Homepage**: `https://your-app.vercel.app`
2. **Health Check**: `https://your-app.vercel.app/api/health`
3. **Authentication**: Try login/signup
4. **Database**: Verify connection works
5. **Embeddings**: Test `/api/embeddings/generate` (if API key set)

---

## ⚠️ Common Issues & Fixes

### Build Fails
- Check TypeScript errors: `pnpm build` locally
- Verify all dependencies in `package.json`
- Check Node.js version (should be 20+)

### Environment Variables Not Working
- Redeploy after adding env vars
- Check `NEXT_PUBLIC_` prefix for client-side vars
- Verify variable names match exactly

### Database Connection Fails
- Double-check Supabase credentials
- Verify RLS policies allow access
- Check service role key is correct

### Embeddings Not Working
- Ensure pgvector extension is enabled in Supabase
- Run both migration files in Supabase SQL Editor
- Verify OpenAI/Gemini API key is set

---

## 📝 After Deployment

1. **Update NEXT_PUBLIC_APP_URL**: Set to your Vercel URL
2. **Test all features**: Authentication, events, embeddings
3. **Monitor logs**: Check Vercel Dashboard → Functions
4. **Set up monitoring**: Configure Sentry (optional)

---

**Ready? Start with Option 1 (Dashboard) - it's the easiest!**

