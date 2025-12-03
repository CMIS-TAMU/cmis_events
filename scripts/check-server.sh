#!/bin/bash

# ============================================================================
# Server Status Check Script
# ============================================================================
# Quick script to check if the development server is running
# ============================================================================

echo "🔍 Checking Server Status..."
echo ""

# Check if port 3000 is in use
PORT_3000_PIDS=$(lsof -ti:3000 2>/dev/null || true)

if [ -z "$PORT_3000_PIDS" ]; then
    echo "❌ Port 3000: FREE (Server not running)"
else
    echo "✅ Port 3000: IN USE (PIDs: $PORT_3000_PIDS)"
fi

echo ""

# Check health endpoint
echo "🔍 Checking health endpoint..."
HEALTH_RESPONSE=$(curl -s http://localhost:3000/api/health 2>&1 || echo "ERROR")

if echo "$HEALTH_RESPONSE" | grep -q "ok\|status"; then
    echo "✅ Health Check: PASSED"
    echo "   Response: $(echo $HEALTH_RESPONSE | head -c 100)..."
else
    echo "❌ Health Check: FAILED"
    echo "   Server not responding on http://localhost:3000"
fi

echo ""

# Summary
if [ ! -z "$PORT_3000_PIDS" ] && echo "$HEALTH_RESPONSE" | grep -q "ok\|status"; then
    echo "✅ STATUS: Server is UP and running"
    echo "🌐 URL: http://localhost:3000"
    exit 0
else
    echo "❌ STATUS: Server is DOWN"
    echo ""
    echo "To restart: ./scripts/restart-server.sh"
    exit 1
fi

