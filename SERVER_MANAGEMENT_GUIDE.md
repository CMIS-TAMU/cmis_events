# 🔧 Server Management Guide

**How to check, restart, and troubleshoot the development server**

---

## 🚀 **Quick Commands**

### **Check if Server is Running**

```bash
# Quick check
curl http://localhost:3000/api/health

# Or use the check script
./scripts/check-server.sh
```

### **Restart the Server**

```bash
# Option 1: Use the restart script (recommended)
./scripts/restart-server.sh

# Option 2: Manual restart
# Kill existing processes
lsof -ti:3000 | xargs kill -9

# Start server
cd /Users/abhishekpatil/Documents/Projects/CMIS-Cursor
pnpm dev
```

---

## 📋 **Why Does the Server Go Down?**

Common reasons:

1. **Out of Memory (OOM)**
   - Next.js can use a lot of memory
   - Solution: Increase Node.js memory limit

2. **Port Conflicts**
   - Another app using port 3000
   - Solution: Kill conflicting process

3. **Unhandled Errors**
   - Code errors causing crashes
   - Solution: Check logs, fix errors

4. **Build Errors**
   - TypeScript/compilation errors
   - Solution: Fix build errors

5. **Database Connection Issues**
   - Supabase connection timeout
   - Solution: Check network, restart

---

## 🔧 **Solutions & Fixes**

### **Solution 1: Increase Node.js Memory**

Create/update `package.json` to increase memory:

```json
{
  "scripts": {
    "dev": "NODE_OPTIONS='--max-old-space-size=4096' next dev"
  }
}
```

### **Solution 2: Use Process Manager (PM2)**

Install PM2 for auto-restart:

```bash
# Install PM2 globally
npm install -g pm2

# Start with PM2
pm2 start "pnpm dev" --name cmis-events

# Auto-restart on crash
pm2 startup
pm2 save
```

### **Solution 3: Add Error Handling**

Create `server-keep-alive.sh`:

```bash
#!/bin/bash
while true; do
    echo "Starting server..."
    pnpm dev || echo "Server crashed, restarting in 5 seconds..."
    sleep 5
done
```

### **Solution 4: Check Logs**

```bash
# View recent logs
tail -f /tmp/cmis-server.log

# Check for errors
grep -i error /tmp/cmis-server.log
```

---

## 🛠️ **Quick Fix Script**

Run this to automatically fix and restart:

```bash
#!/bin/bash
echo "🔧 Fixing and restarting server..."

# Kill any processes on port 3000
lsof -ti:3000 | xargs kill -9 2>/dev/null || true

# Clean build cache (optional - uncomment if needed)
# rm -rf .next

# Start server
cd /Users/abhishekpatil/Documents/Projects/CMIS-Cursor
pnpm dev
```

---

## 📊 **Monitoring Script**

Create `scripts/monitor-server.sh`:

```bash
#!/bin/bash
while true; do
    if ! curl -s http://localhost:3000/api/health > /dev/null; then
        echo "$(date): Server is DOWN - restarting..."
        ./scripts/restart-server.sh
    fi
    sleep 60  # Check every minute
done
```

---

## 🎯 **Best Practices**

1. **Use the restart script** instead of manual commands
2. **Check logs** when server crashes
3. **Monitor memory usage** with `htop` or Activity Monitor
4. **Keep Node.js updated** (check with `node --version`)
5. **Use PM2 for production** or long-running development

---

## 🚨 **Troubleshooting**

### **Server won't start**

1. Check if port 3000 is free:
   ```bash
   lsof -ti:3000
   ```

2. Check for errors:
   ```bash
   pnpm dev 2>&1 | tee server-error.log
   ```

3. Check Node.js version:
   ```bash
   node --version  # Should be 18+ or 20+
   ```

### **Server crashes frequently**

1. Check memory usage:
   ```bash
   top | grep node
   ```

2. Increase memory limit:
   ```bash
   export NODE_OPTIONS="--max-old-space-size=4096"
   pnpm dev
   ```

3. Check for memory leaks in code

### **Port already in use**

1. Find what's using port 3000:
   ```bash
   lsof -i:3000
   ```

2. Kill the process:
   ```bash
   kill -9 $(lsof -ti:3000)
   ```

---

## ✅ **Quick Checklist**

- [ ] Server responding to health check?
- [ ] Port 3000 is in use?
- [ ] No errors in logs?
- [ ] Memory usage reasonable?
- [ ] Database connection working?

---

## 📝 **Quick Reference**

| Command | Purpose |
|---------|---------|
| `./scripts/check-server.sh` | Check if server is running |
| `./scripts/restart-server.sh` | Restart the server |
| `curl http://localhost:3000/api/health` | Quick health check |
| `lsof -ti:3000` | Find processes on port 3000 |
| `kill -9 $(lsof -ti:3000)` | Kill processes on port 3000 |
| `pnpm dev` | Start development server |

---

**Need help?** Check the logs first: `tail -f /tmp/cmis-server.log`

