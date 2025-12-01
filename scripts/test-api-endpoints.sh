#!/bin/bash

# API Endpoint Testing Script
# Run this after starting the development server (pnpm dev)

BASE_URL="${NEXT_PUBLIC_APP_URL:-http://localhost:3000}"

echo "🧪 Testing API Endpoints..."
echo "Base URL: $BASE_URL"
echo ""

# Test Health Check
echo "1. Testing Health Check..."
HEALTH=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/health")
if [ "$HEALTH" = "200" ]; then
    echo "   ✅ Health check passed ($HEALTH)"
else
    echo "   ❌ Health check failed ($HEALTH)"
fi

# Test QR Code Generation API (should return 400 without data)
echo ""
echo "2. Testing QR Code Generation (without data - should fail)..."
QR_TEST=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/qr/generate")
if [ "$QR_TEST" = "400" ]; then
    echo "   ✅ QR code endpoint exists and validates input ($QR_TEST)"
else
    echo "   ⚠️  QR code endpoint returned ($QR_TEST)"
fi

# Test Check-In API (should return 401 without auth)
echo ""
echo "3. Testing Check-In API (without auth - should fail)..."
CHECKIN=$(curl -s -X POST -o /dev/null -w "%{http_code}" "$BASE_URL/api/checkin" -H "Content-Type: application/json" -d '{"qrData":"test"}')
if [ "$CHECKIN" = "401" ] || [ "$CHECKIN" = "400" ]; then
    echo "   ✅ Check-in endpoint exists ($CHECKIN)"
else
    echo "   ⚠️  Check-in endpoint returned ($CHECKIN)"
fi

# Test Resume Upload API (should return 401 without auth)
echo ""
echo "4. Testing Resume Upload API (without auth - should fail)..."
RESUME=$(curl -s -X POST -o /dev/null -w "%{http_code}" "$BASE_URL/api/resume/upload")
if [ "$RESUME" = "401" ] || [ "$RESUME" = "400" ]; then
    echo "   ✅ Resume upload endpoint exists ($RESUME)"
else
    echo "   ⚠️  Resume upload endpoint returned ($RESUME)"
fi

echo ""
echo "✅ Basic endpoint tests complete!"
echo ""
echo "Note: Full testing requires authentication and database setup."

