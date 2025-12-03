#!/bin/bash

# ============================================================================
# Quick Server Restart (with cache clean)
# ============================================================================
# Fast restart script that cleans cache and restarts server
# ============================================================================

echo "🔄 Quick Server Restart..."
echo ""

# Kill existing server
echo "1️⃣  Stopping server..."
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
sleep 1

# Clean cache
echo "2️⃣  Cleaning build cache..."
rm -rf .next 2>/dev/null || true

# Start server
echo "3️⃣  Starting server..."
cd /Users/abhishekpatil/Documents/Projects/CMIS-Cursor
pnpm dev > /tmp/cmis-server.log 2>&1 &
SERVER_PID=$!

echo "✅ Server starting (PID: $SERVER_PID)"
echo "📄 Logs: /tmp/cmis-server.log"
echo ""
echo "⏳ Waiting for server to be ready..."
sleep 8

# Check if server is up
if curl -s http://localhost:3000/api/health > /dev/null 2>&1; then
    echo "✅ Server is UP!"
    echo "🌐 URL: http://localhost:3000"
else
    echo "⏳ Server still starting... Check logs: tail -f /tmp/cmis-server.log"
fi

