# Fix .env.local Format Issue

## Problem

Database connection test shows:
```json
{
  "success": false,
  "error": "Invalid supabaseUrl: Must be a valid HTTP or HTTPS URL."
}
```

## Solution

Check your `.env.local` file format. The Supabase URL must be a valid HTTPS URL.

### Correct Format

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Common Mistakes

❌ **Wrong:**
```bash
NEXT_PUBLIC_SUPABASE_URL=xxxxxxxxxxxxx.supabase.co  # Missing https://
NEXT_PUBLIC_SUPABASE_URL="https://..."             # Extra quotes
NEXT_PUBLIC_SUPABASE_URL = https://...             # Extra spaces
```

✅ **Correct:**
```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## How to Get Your Supabase URL

1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to **Settings** → **API**
4. Copy the **Project URL** (starts with `https://`)
5. Copy the **anon public** key

## Steps to Fix

1. **Open `.env.local` file:**
   ```bash
   code .env.local
   # Or use your preferred editor
   ```

2. **Check the format:**
   - No quotes around values
   - No spaces around `=`
   - URL starts with `https://`
   - No trailing slashes

3. **Example correct format:**
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYzODM2NDU2OCwiZXhwIjoxOTUzOTQwNTY4fQ.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

4. **Restart the dev server** after making changes:
   ```bash
   # Stop server (Ctrl+C)
   # Then restart
   pnpm dev
   ```

5. **Test again:**
   ```bash
   curl http://localhost:3000/api/test-db
   ```

## Verification

After fixing, you should see:
```json
{
  "success": true,
  "message": "Database connection successful"
}
```

Or if tables don't exist yet:
```json
{
  "success": false,
  "error": "relation \"users\" does not exist"
}
```
→ This is OK! It means the connection works, you just need to run the schema.

---

**Fix the .env.local format and restart the server!** 🔧

