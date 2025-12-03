# RLS Error Troubleshooting Guide

## 🔴 Current Issue
"new row violates row-level security policy" error persists even after:
- ✅ Code updated to use admin client
- ✅ SUPABASE_SERVICE_ROLE_KEY is in .env.local
- ✅ Server restarted

## 🔍 Diagnostic Steps

### Step 1: Test Admin Client
Visit this URL in your browser:
```
http://localhost:3000/api/test-admin-client
```

**Expected Result:**
```json
{
  "success": true,
  "message": "Admin client is working correctly",
  "hasServiceKey": true,
  "adminClientCreated": true,
  "querySuccessful": true
}
```

**If it fails:**
- Check the error message
- Verify SUPABASE_SERVICE_ROLE_KEY is correct
- Check server logs for details

### Step 2: Check Server Logs
When you try to upload a resume, check the terminal running `pnpm dev` for:
- Error messages
- "Failed to create admin client" messages
- Database error codes

### Step 3: Verify Environment Variable Format
The `.env.local` file should have:
```env
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Common Issues:**
- ❌ Extra spaces: `SUPABASE_SERVICE_ROLE_KEY = value` (should be no spaces around `=`)
- ❌ Quotes: `SUPABASE_SERVICE_ROLE_KEY="value"` (quotes not needed)
- ❌ Wrong variable name: Check spelling exactly

### Step 4: Check Browser Console
Open browser DevTools (F12) → Console tab:
- Look for error messages
- Check Network tab → `/api/resume/upload` → Response tab
- See the actual error message returned

## 🔧 Potential Solutions

### Solution 1: Verify Service Role Key
1. Go to Supabase Dashboard
2. Settings → API
3. Copy the `service_role` key (NOT the `anon` key)
4. Paste it into `.env.local` as `SUPABASE_SERVICE_ROLE_KEY`
5. **Restart dev server** (Ctrl+C, then `pnpm dev`)

### Solution 2: Check RLS Policies in Supabase
The admin client should bypass RLS, but if there's a recursive policy, it might still fail.

1. Go to Supabase Dashboard → SQL Editor
2. Run this query to check policies:
```sql
SELECT 
    policyname,
    cmd as operation,
    qual as using_clause,
    with_check as with_check_clause
FROM pg_policies
WHERE tablename = 'users'
ORDER BY cmd, policyname;
```

3. Look for policies that might cause recursion (e.g., policies that reference the users table in their conditions)

### Solution 3: Temporarily Disable RLS (Testing Only)
**⚠️ WARNING: Only for testing! Re-enable after testing!**

```sql
-- Disable RLS temporarily
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Test upload

-- Re-enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
```

### Solution 4: Fix RLS Policies Properly
Run this SQL in Supabase SQL Editor:

```sql
-- Drop all existing UPDATE policies
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Authenticated users can update own profile" ON users;

-- Create a simple, non-recursive UPDATE policy
CREATE POLICY "Users can update own profile"
ON users FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);
```

## 🐛 Debug Information to Collect

When reporting the issue, provide:

1. **Test endpoint result:**
   - Visit: http://localhost:3000/api/test-admin-client
   - Copy the full JSON response

2. **Browser console errors:**
   - F12 → Console tab
   - Screenshot or copy errors

3. **Network tab response:**
   - F12 → Network → `/api/resume/upload`
   - Click on the request → Response tab
   - Copy the error message

4. **Server terminal output:**
   - Copy any error messages

5. **Environment variable check:**
   ```bash
   # In PowerShell, check if variable is loaded (should show the key)
   $env:SUPABASE_SERVICE_ROLE_KEY
   ```
   Note: This might not work in Next.js context, but helps verify format

## ✅ Verification Checklist

- [ ] `.env.local` has `SUPABASE_SERVICE_ROLE_KEY` (no spaces, no quotes)
- [ ] Dev server was restarted after adding env variable
- [ ] Test endpoint `/api/test-admin-client` returns success
- [ ] Browser console shows no client-side errors
- [ ] Server logs show admin client is created successfully
- [ ] RLS policies don't have recursion issues

## 🎯 Next Steps

1. **First:** Test the admin client endpoint
2. **Then:** Check server logs when uploading
3. **If still failing:** Check RLS policies for recursion
4. **Last resort:** Temporarily disable RLS to verify admin client works


