# Post-Deployment Verification Checklist

## ✅ Immediate Checks

### 1. Get Your Deployment URL
- Check Netlify Dashboard: https://app.netlify.com/
- Your app should be at: `https://cmis-tamu.netlify.app`
- Or a custom domain if configured

### 2. Test Homepage
Visit your deployment URL and verify:
- [ ] Homepage loads without errors
- [ ] No build errors in browser console
- [ ] UI displays correctly
- [ ] Images load properly

### 3. Test API Health Check
Visit: `https://cmis-tamu.netlify.app/api/health`

Should return JSON:
```json
{
  "status": "ok",
  "environment": "production"
}
```

### 4. Check Environment Variables
In Netlify Dashboard → Site settings → Environment variables, verify you have:

#### Required:
- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`
- [ ] `RESEND_API_KEY`
- [ ] `RESEND_FROM_EMAIL`
- [ ] `NEXT_PUBLIC_APP_URL` (set to `https://cmis-tamu.netlify.app`)

#### Recommended:
- [ ] `OPENAI_API_KEY` or `GOOGLE_AI_API_KEY`
- [ ] `UPSTASH_REDIS_REST_URL`
- [ ] `UPSTASH_REDIS_REST_TOKEN`

#### Security (Important):
- [ ] `JWT_SECRET`
- [ ] `ENCRYPTION_KEY`
- [ ] `QR_CODE_SECRET`
- [ ] `CRON_SECRET`
- [ ] `QUEUE_PROCESSOR_TOKEN`

## 🔍 Feature Testing

### Authentication
- [ ] Visit `/login` - page loads
- [ ] Try signing up (test account)
- [ ] Verify email functionality (if configured)

### Database Connection
- [ ] Test Supabase connection
- [ ] Verify RLS policies work
- [ ] Check if migrations ran successfully

### Vector Embeddings (if API key set)
- [ ] Test: `POST /api/embeddings/generate`
- [ ] Verify embeddings table exists in Supabase
- [ ] Check if pgvector extension is enabled

### Email Service
- [ ] Test email sending (if configured)
- [ ] Check Resend dashboard for delivery

## 🐛 Troubleshooting

### If Homepage Shows Error:

**Check Vercel Logs:**
1. Go to Vercel Dashboard
2. Click on your deployment
3. Go to "Functions" tab
4. Check for error messages

**Common Issues:**

1. **Missing Environment Variables**
   - Add all required vars
   - Redeploy (or wait for auto-redeploy)

2. **Database Connection Failed**
   - Verify Supabase credentials
   - Check if RLS policies allow access
   - Ensure service role key is correct

3. **Build Errors**
   - Check build logs in Vercel Dashboard
   - Verify Node.js version (should be 20+)
   - Check TypeScript errors

4. **API Routes Return 500**
   - Check function logs
   - Verify server-side env vars are set
   - Check database connection

## 📊 Next Steps

### 1. Update NEXT_PUBLIC_APP_URL
If not already set, update this to your Netlify URL:
```
NEXT_PUBLIC_APP_URL=https://cmis-tamu.netlify.app
```
This will trigger a new deployment.

### 2. Run Database Migrations
If not done already:
- Go to Supabase SQL Editor
- Run: `database/migrations/001_enable_pgvector.sql`
- Run: `database/migrations/002_create_embeddings_table.sql`
- Run other migrations as needed

### 3. Set Up Monitoring (Optional)
- Enable Netlify Analytics
- Set up Sentry (if configured)
- Monitor function logs in Netlify Dashboard

### 4. Test Critical Features
- [ ] User registration/login
- [ ] Event creation (if admin)
- [ ] Resume upload
- [ ] Vector embeddings search
- [ ] Email notifications

## 🎉 Success Indicators

Your deployment is successful if:
- ✅ Homepage loads without errors
- ✅ `/api/health` returns success
- ✅ No build errors in logs
- ✅ Environment variables are configured
- ✅ Database connection works

## 📝 Quick Test Commands

### Test Health Endpoint:
```bash
curl https://cmis-tamu.netlify.app/api/health
```

### Test Embeddings (if API key set):
```bash
curl -X POST https://cmis-tamu.netlify.app/api/embeddings/generate \
  -H "Content-Type: application/json" \
  -d '{"text":"test embedding"}'
```

## 🆘 Need Help?

If something isn't working:
1. Check Netlify Dashboard → Deploys → Logs for build errors
2. Check browser console for client-side errors
3. Verify environment variables are set correctly in Netlify
4. Ensure database migrations ran successfully
5. Check Supabase dashboard for connection issues

---

**Share your deployment URL and I can help test specific features!**

