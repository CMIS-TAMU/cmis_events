# 🚀 Quick Restart Guide

**Fast commands to restart your server when it goes down**

---

## ✅ **Server is Now Running!**

The server has been fixed and is currently running at: **http://localhost:3000**

---

## 🔧 **Why Does the Server Go Down?**

The issue was: **Next.js build cache corruption**
- Error: "Cannot find module './4611.js'"
- Cause: Webpack cache files get corrupted
- Fix: Clean `.next` folder and restart

---

## 🚀 **Quick Restart Commands**

### **Option 1: Use Quick Restart Script (Fastest)**

```bash
cd /Users/abhishekpatil/Documents/Projects/CMIS-Cursor
./scripts/quick-restart.sh
```

This will:
- ✅ Kill existing server
- ✅ Clean build cache
- ✅ Start fresh server

### **Option 2: Manual Restart (3 Commands)**

```bash
# 1. Kill server
lsof -ti:3000 | xargs kill -9

# 2. Clean cache
rm -rf .next

# 3. Start server
pnpm dev
```

### **Option 3: Desktop Shortcut**

I've created `/Users/abhishekpatil/Documents/CMIS_QUICK_RESTART.sh`

You can:
- Double-click it to restart
- Or run: `bash ~/Documents/CMIS_QUICK_RESTART.sh`

---

## 🔍 **Check if Server is Running**

```bash
# Quick check
curl http://localhost:3000/api/health

# Or use the check script
./scripts/check-server.sh
```

---

## 🛠️ **Permanent Solutions**

### **Solution 1: Auto-Restart Script**

Create a script that monitors and auto-restarts:

```bash
# Monitor and auto-restart
while true; do
  if ! curl -s http://localhost:3000/api/health > /dev/null; then
    echo "$(date): Server down - restarting..."
    ./scripts/quick-restart.sh
  fi
  sleep 60  # Check every minute
done
```

### **Solution 2: Use PM2 Process Manager**

```bash
# Install PM2
npm install -g pm2

# Start with PM2 (auto-restarts on crash)
pm2 start "pnpm dev" --name cmis-events

# Make it auto-start on boot
pm2 startup
pm2 save
```

### **Solution 3: Increase Node.js Memory**

Add to `package.json`:

```json
{
  "scripts": {
    "dev": "NODE_OPTIONS='--max-old-space-size=4096' next dev"
  }
}
```

---

## 📋 **Common Issues & Fixes**

| Issue | Solution |
|-------|----------|
| Server won't start | Clean cache: `rm -rf .next` |
| Port already in use | Kill process: `lsof -ti:3000 \| xargs kill -9` |
| Memory errors | Increase memory: `NODE_OPTIONS='--max-old-space-size=4096'` |
| Build cache errors | Always clean `.next` folder before restart |

---

## ✅ **Quick Reference**

```bash
# Check server
curl http://localhost:3000/api/health

# Quick restart
./scripts/quick-restart.sh

# Check status
./scripts/check-server.sh

# Full restart (with cache clean)
./scripts/restart-server.sh
```

---

## 🎯 **Recommended Workflow**

When server goes down:

1. **Try quick restart:**
   ```bash
   ./scripts/quick-restart.sh
   ```

2. **If that doesn't work, manual restart:**
   ```bash
   lsof -ti:3000 | xargs kill -9
   rm -rf .next
   pnpm dev
   ```

3. **Check logs if still having issues:**
   ```bash
   tail -f /tmp/cmis-server.log
   ```

---

**Server is now running! 🚀**

