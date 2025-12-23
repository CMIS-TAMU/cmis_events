# Fixing 4000 Error on Vercel

## Understanding the Error

A **4000 error** is likely:
- A typo for **400 Bad Request**
- A typo for **500 Internal Server Error**
- A custom error code from Vercel

## Common Causes

### 1. Proxy/Middleware Issues
- Proxy blocking legitimate requests
- Incorrect route matching
- Cookie handling errors

### 2. Environment Variables
- Missing required env vars
- Invalid Supabase credentials
- Redis URL issues (non-blocking but shows warnings)

### 3. Build Script Warnings
- pnpm blocking build scripts
- Missing native dependencies

## ✅ Fixes Applied

### 1. Build Script Warning
**Fixed:** Created `.npmrc` to allow build scripts for:
- `@sentry/cli` - Sentry integration
- `sharp` - Image optimization
- `unrs-resolver` - Dependency resolver

### 2. Proxy Configuration
**Updated:** Proxy now:
- Explicitly skips static files and API routes
- Allows public routes (homepage, events, etc.)
- Handles errors gracefully

### 3. Redis Warning
**Status:** Non-blocking warning
- Redis is optional (caching only)
- App works without Redis
- Set `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` in Vercel to enable caching

## 🔍 Debugging Steps

### Step 1: Check Vercel Logs
1. Go to Vercel Dashboard → Your Project → Logs
2. Look for the exact error message
3. Check the timestamp when the error occurred
4. Look for stack traces

### Step 2: Check Deployment Status
1. Vercel Dashboard → Deployments
2. Check if deployment is "Ready" or "Error"
3. Click on the deployment to see build logs
4. Look for any build errors

### Step 3: Test Specific Routes
Try accessing:
- `https://your-project.vercel.app/` - Homepage
- `https://your-project.vercel.app/events` - Events page
- `https://your-project.vercel.app/login` - Login page

### Step 4: Check Environment Variables
In Vercel Dashboard → Settings → Environment Variables, verify:
- ✅ `NEXT_PUBLIC_SUPABASE_URL`
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- ⚠️ `UPSTASH_REDIS_REST_URL` (optional)
- ⚠️ `UPSTASH_REDIS_REST_TOKEN` (optional)

## 🛠️ Quick Fixes

### If Error is 400 (Bad Request):
- Check if proxy is blocking requests incorrectly
- Verify route paths are correct
- Check for malformed requests

### If Error is 500 (Internal Server Error):
- Check Vercel logs for stack traces
- Verify environment variables are set
- Check Supabase connection
- Look for runtime errors in logs

### If Error is Actually 4000:
- This is unusual - check Vercel-specific error codes
- May be a rate limit or quota issue
- Check Vercel plan limits

## 📋 Checklist

- [x] Build scripts warning fixed (`.npmrc` created)
- [x] Proxy configuration updated
- [x] Public routes explicitly allowed
- [ ] Environment variables verified in Vercel
- [ ] Deployment status checked
- [ ] Vercel logs reviewed
- [ ] Specific error message identified

## 🚀 Next Steps

1. **Push the fixes:**
   ```bash
   git add .npmrc proxy.ts
   git commit -m "Fix build script warnings and improve proxy configuration"
   git push
   ```

2. **Wait for Vercel to redeploy** (1-2 minutes)

3. **Check the deployment:**
   - Verify build completes successfully
   - Check for any new errors in logs
   - Test accessing the homepage

4. **If still failing:**
   - Share the exact error message from Vercel logs
   - Include the route that's failing
   - Check browser console for client-side errors

## 📝 Notes

- The build script warning is **informational only** - it won't break the app
- Redis warnings are **non-blocking** - app works without Redis
- The 4000 error needs the exact error message from Vercel logs to diagnose

## 🔗 Resources

- [Vercel Error Codes](https://vercel.com/docs/errors)
- [Next.js Middleware/Proxy](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- [pnpm Build Scripts](https://pnpm.io/npmrc#enable-pre-post-scripts)

