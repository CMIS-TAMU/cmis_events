#!/bin/bash

# ============================================================================
# Server Restart Script for CMIS Event Management System
# ============================================================================
# This script safely stops and restarts the Next.js development server
# ============================================================================

set -e

echo "🔄 Restarting Development Server..."
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get the project directory (where this script is located)
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_DIR="$( cd "$SCRIPT_DIR/.." && pwd )"

cd "$PROJECT_DIR"

echo "📂 Project Directory: $PROJECT_DIR"
echo ""

# Step 1: Find and kill any processes on port 3000
echo "1️⃣  Checking for processes on port 3000..."

PORT_3000_PIDS=$(lsof -ti:3000 2>/dev/null || true)

if [ -z "$PORT_3000_PIDS" ]; then
    echo -e "   ${GREEN}✅ Port 3000 is free${NC}"
else
    echo -e "   ${YELLOW}⚠️  Found processes on port 3000: $PORT_3000_PIDS${NC}"
    echo "   Killing processes..."
    
    for PID in $PORT_3000_PIDS; do
        echo "   Killing PID: $PID"
        kill -9 $PID 2>/dev/null || true
    done
    
    # Wait a moment for processes to fully terminate
    sleep 2
    
    echo -e "   ${GREEN}✅ Port 3000 cleared${NC}"
fi

echo ""

# Step 2: Clean up any Next.js build artifacts (helps fix cache issues)
echo "2️⃣  Cleaning build cache..."
rm -rf .next 2>/dev/null || true
echo -e "   ${GREEN}✅ Cache cleaned${NC}"
echo ""

# Step 3: Start the development server
echo "2️⃣  Starting development server..."
echo ""

# Start server in background and capture PID
pnpm dev > /tmp/cmis-server.log 2>&1 &
SERVER_PID=$!

echo "   Server starting (PID: $SERVER_PID)..."
echo "   Logs: /tmp/cmis-server.log"
echo ""

# Wait for server to start (check health endpoint)
echo "3️⃣  Waiting for server to be ready..."
MAX_WAIT=30
WAIT_COUNT=0

while [ $WAIT_COUNT -lt $MAX_WAIT ]; do
    if curl -s http://localhost:3000/api/health > /dev/null 2>&1; then
        echo -e "   ${GREEN}✅ Server is UP and responding!${NC}"
        echo ""
        echo "🌐 Server URL: http://localhost:3000"
        echo "📊 Health Check: http://localhost:3000/api/health"
        echo ""
        echo "To view logs: tail -f /tmp/cmis-server.log"
        echo "To stop server: kill $SERVER_PID"
        exit 0
    fi
    
    WAIT_COUNT=$((WAIT_COUNT + 1))
    sleep 1
    echo -n "."
done

echo ""
echo -e "   ${RED}❌ Server did not start within $MAX_WAIT seconds${NC}"
echo "   Check logs: tail -f /tmp/cmis-server.log"
echo "   Check for errors: cat /tmp/cmis-server.log"
exit 1

