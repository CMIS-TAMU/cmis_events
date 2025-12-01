#!/bin/bash

# Feature Testing Script
# Run this after completing migration and setting up storage

BASE_URL="${NEXT_PUBLIC_APP_URL:-http://localhost:3000}"

echo "🧪 Testing Application Features..."
echo "Base URL: $BASE_URL"
echo ""

# Test 1: Health Check
echo "1. Testing Health Check..."
HEALTH_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/health")
HEALTH_BODY=$(curl -s "$BASE_URL/api/health" 2>/dev/null || echo "")
if [ "$HEALTH_STATUS" = "200" ]; then
    echo "   ✅ Health check passed ($HEALTH_STATUS)"
elif [ "$HEALTH_STATUS" = "000" ]; then
    echo "   ⚠️  Server not running. Start with: pnpm dev"
else
    echo "   ⚠️  Health check returned: $HEALTH_STATUS"
fi

# Test 2: QR Code Generation
echo ""
echo "2. Testing QR Code Generation..."
QR_TEST=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/qr/generate?data=test123")
if [ "$QR_TEST" = "200" ]; then
    echo "   ✅ QR code generation works"
else
    echo "   ⚠️  QR code endpoint returned: $QR_TEST"
fi

# Test 3: Check Pages Load
echo ""
echo "3. Testing Pages..."
PAGES=("/" "/events" "/login" "/signup")
for page in "${PAGES[@]}"; do
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL$page" 2>/dev/null || echo "000")
    if [ "$STATUS" = "200" ] || [ "$STATUS" = "307" ] || [ "$STATUS" = "308" ]; then
        echo "   ✅ $page loads ($STATUS)"
    elif [ "$STATUS" = "000" ]; then
        echo "   ❌ $page - Server not responding"
    elif [ "$STATUS" = "404" ]; then
        echo "   ⚠️  $page returned 404 (page might not exist or server not running)"
    else
        echo "   ⚠️  $page returned: $STATUS"
    fi
done

echo ""
echo "✅ Basic feature tests complete!"
echo ""
echo "⚠️  Note: Full testing requires:"
echo "   - User authentication"
echo "   - Database with test data"
echo "   - Storage buckets configured"
echo ""
echo "📋 For comprehensive testing, follow TESTING_GUIDE.md"

