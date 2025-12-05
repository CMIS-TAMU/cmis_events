# 🚀 Vercel Deployment Guide

## Prerequisites

✅ Vercel CLI is installed (already done)
✅ Project is pushed to GitHub
✅ All code changes are committed

---

## Step 1: Login to Vercel

Run this command in your terminal:

```bash
vercel login
```

This will:
- Open your browser for authentication
- Or prompt you to enter your email
- Follow the prompts to complete login

---

## Step 2: Deploy to Vercel

### Option A: Deploy via CLI (Recommended)

Run this command:

```bash
vercel --prod
```

**Follow the prompts:**
1. **Set up and deploy?** → Type `Y` and press Enter
2. **Which scope?** → Select your account/team
3. **Link to existing project?** → Type `N` (for first deployment) or `Y` (if redeploying)
4. **Project name?** → Press Enter to use default or type a custom name
5. **Directory?** → Press Enter (uses current directory)
6. **Override settings?** → Press Enter (uses defaults)

### Option B: Deploy via Vercel Dashboard

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import your GitHub repository: `CMIS-TAMU/cmis_events`
4. Configure project settings
5. Click "Deploy"

---

## Step 3: Set Up Environment Variables

**CRITICAL:** Your app needs environment variables to work!

### Via Vercel Dashboard (Recommended):

1. Go to your project on Vercel Dashboard
2. Click **Settings** → **Environment Variables**
3. Add all variables from your `.env.local`:

#### Required Environment Variables:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Email (Brevo)
BREVO_API_KEY=your_brevo_api_key
BREVO_FROM_EMAIL=your_verified_email@domain.com
BREVO_FROM_NAME=CMIS Events

# Application URL (IMPORTANT!)
NEXT_PUBLIC_APP_URL=https://your-project.vercel.app

# QR Code
QR_CODE_SECRET=your_random_secret_string

# Optional: Other services
NEXT_PUBLIC_N8N_WEBHOOK_URL=your_webhook_url
N8N_WEBHOOK_SECRET=your_secret
UPSTASH_REDIS_REST_URL=your_redis_url
UPSTASH_REDIS_REST_TOKEN=your_redis_token
```

**Important Notes:**
- Set `NEXT_PUBLIC_APP_URL` to your Vercel deployment URL after first deploy
- Add variables for **Production**, **Preview**, and **Development** environments
- Click "Save" after adding each variable

### Via CLI:

```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL production
# Paste your value when prompted
# Repeat for each environment variable
```

---

## Step 4: Redeploy After Setting Environment Variables

After adding environment variables:

1. Go to Vercel Dashboard → Your Project → **Deployments**
2. Click the **three dots** (⋯) on the latest deployment
3. Click **Redeploy**
4. Or run: `vercel --prod` again

---

## Step 5: Verify Deployment

1. **Check Build Logs:**
   - Go to Vercel Dashboard → Your Project → **Deployments**
   - Click on the deployment to see build logs
   - Ensure build succeeds without errors

2. **Test Your App:**
   - Visit your deployment URL: `https://your-project.vercel.app`
   - Test key features:
     - Login/Signup
     - Event registration
     - Email sending

3. **Check Environment Variables:**
   - Verify all variables are set correctly
   - Check that `NEXT_PUBLIC_APP_URL` matches your Vercel URL

---

## Common Issues & Solutions

### Issue: Build Fails

**Solution:**
- Check build logs in Vercel Dashboard
- Ensure all dependencies are in `package.json`
- Check for TypeScript errors: `npm run build` locally first

### Issue: Environment Variables Not Working

**Solution:**
- Verify variables are set in Vercel Dashboard
- Redeploy after adding variables
- Check variable names match exactly (case-sensitive)
- Ensure `NEXT_PUBLIC_*` variables are set for client-side access

### Issue: Email Not Sending

**Solution:**
- Verify `BREVO_API_KEY` and `BREVO_FROM_EMAIL` are set
- Check `NEXT_PUBLIC_APP_URL` is set to your Vercel URL
- Verify Brevo email is verified in Brevo dashboard

### Issue: Database Connection Errors

**Solution:**
- Verify Supabase environment variables are correct
- Check Supabase project is active
- Ensure RLS policies are set up correctly

### Issue: QR Codes Not Generating

**Solution:**
- Verify `QR_CODE_SECRET` is set
- Check `NEXT_PUBLIC_APP_URL` is correct
- Ensure database migration for QR codes is run

---

## Post-Deployment Checklist

- [ ] All environment variables are set
- [ ] Build succeeds without errors
- [ ] App loads at Vercel URL
- [ ] Login/Signup works
- [ ] Event registration works
- [ ] Email confirmation sends
- [ ] QR codes generate correctly
- [ ] Database connections work
- [ ] Admin features accessible (if applicable)

---

## Updating Your Deployment

### Automatic Deployments (Recommended):

Vercel automatically deploys when you push to GitHub:
- **Production:** Pushes to `main` branch
- **Preview:** Pushes to other branches or pull requests

### Manual Deployment:

```bash
vercel --prod
```

---

## Custom Domain (Optional)

1. Go to Vercel Dashboard → Your Project → **Settings** → **Domains**
2. Add your custom domain
3. Follow DNS configuration instructions
4. Update `NEXT_PUBLIC_APP_URL` to your custom domain

---

## Monitoring & Logs

- **View Logs:** Vercel Dashboard → Your Project → **Deployments** → Click deployment → **Logs**
- **Function Logs:** Vercel Dashboard → Your Project → **Functions**
- **Analytics:** Vercel Dashboard → Your Project → **Analytics** (if enabled)

---

## Need Help?

- Vercel Docs: https://vercel.com/docs
- Vercel Support: https://vercel.com/support
- Check build logs for specific errors

---

**Good luck with your deployment! 🚀**

