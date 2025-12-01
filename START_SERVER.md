# Starting the Development Server

## Quick Start

The development server is starting in the background. Here's how to use it:

### Option 1: Server Already Running (Background)

If the server started successfully, you can now test:

```bash
# Test health endpoint
curl http://localhost:3000/api/health

# Test database connection
curl http://localhost:3000/api/test-db

# Or open in browser:
# http://localhost:3000
# http://localhost:3000/api/health
# http://localhost:3000/api/test-db
```

### Option 2: Start Server Manually (Recommended)

For better control and to see logs, start it in your own terminal:

```bash
cd /Users/abhishekpatil/Documents/Projects/CMIS-Cursor
export PATH=~/.npm-global/bin:$PATH
pnpm dev
```

**You'll see:**
```
▲ Next.js 14.2.0
- Local:        http://localhost:3000
- Ready in X.Xs
```

**Keep this terminal open** - the server runs until you press `Ctrl+C`

---

## Testing Endpoints

Once the server is running:

### 1. Health Check
```bash
curl http://localhost:3000/api/health
```

**Expected:**
```json
{
  "status": "ok",
  "timestamp": "2024-12-01T...",
  "environment": "development",
  "version": "1.0.0"
}
```

### 2. Database Connection Test
```bash
curl http://localhost:3000/api/test-db
```

**Expected (if Supabase is configured and tables exist):**
```json
{
  "success": true,
  "message": "Database connection successful",
  "error": null
}
```

**Expected (if tables don't exist yet):**
```json
{
  "success": false,
  "message": "Database connection failed",
  "error": "relation \"users\" does not exist"
}
```
→ This means you need to run `database/schema.sql` in Supabase!

### 3. Home Page
Open in browser: http://localhost:3000

---

## Troubleshooting

### Server Won't Start

**Check if port is in use:**
```bash
lsof -ti:3000 | xargs kill -9
```

**Or use different port:**
```bash
pnpm dev -- -p 3001
```

### "Command not found: pnpm"

```bash
export PATH=~/.npm-global/bin:$PATH
```

Or reload your shell:
```bash
source ~/.zshrc
```

---

**Start the server and test the endpoints!** 🚀

