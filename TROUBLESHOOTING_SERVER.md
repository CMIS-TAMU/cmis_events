# 🔧 Server Troubleshooting Guide

## Server Down? Here's How to Fix It

### Quick Fix: Restart Server

```bash
# Stop any existing processes
lsof -ti:3000 | xargs kill -9

# Start server
cd /Users/abhishekpatil/Documents/Projects/CMIS-Cursor
pnpm dev
```

---

## Common Issues & Solutions

### Issue 1: Port 3000 Already in Use

**Symptoms:**
- Error: "Port 3000 is already in use"
- Server won't start

**Solution:**
```bash
# Find and kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use a different port
PORT=3001 pnpm dev
```

---

### Issue 2: Server Crashes on Start

**Symptoms:**
- Server starts then immediately crashes
- Error messages in terminal

**Solutions:**

1. **Check Environment Variables:**
```bash
# Verify .env.local exists and has all required variables
cat .env.local
```

2. **Clear Next.js Cache:**
```bash
rm -rf .next
pnpm dev
```

3. **Check for TypeScript Errors:**
```bash
pnpm run build
```

---

### Issue 3: "Cannot connect to database"

**Symptoms:**
- Database connection errors
- API routes fail

**Solution:**
- Check Supabase connection in `.env.local`
- Verify `NEXT_PUBLIC_SUPABASE_URL` is correct
- Verify `NEXT_PUBLIC_SUPABASE_ANON_KEY` is correct

---

### Issue 4: Build Errors

**Symptoms:**
- Compilation errors
- TypeScript errors

**Solution:**
```bash
# Clean build
rm -rf .next node_modules
pnpm install
pnpm run build
```

---

## Health Check Commands

### Check if server is running:
```bash
curl http://localhost:3000/api/health
```

### Check what's on port 3000:
```bash
lsof -i:3000
```

### Check server logs:
```bash
# Look for errors in terminal where server is running
```

---

## Restart Server (Complete)

```bash
# 1. Stop server (Ctrl+C in terminal)

# 2. Kill any stuck processes
lsof -ti:3000 | xargs kill -9

# 3. Clear cache (if needed)
rm -rf .next

# 4. Restart
pnpm dev
```

---

## Server Status Check

Run this to check server health:
```bash
# Check if responding
curl -I http://localhost:3000

# Check API health
curl http://localhost:3000/api/health

# Check specific route
curl http://localhost:3000/api/test-db
```

---

**Need more help?** Check server logs for specific error messages.

