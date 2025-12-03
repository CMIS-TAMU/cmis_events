#!/bin/bash

# ============================================================================
# CREATE AUTH USERS - AUTOMATED SCRIPT
# ============================================================================
# This script helps create auth users for test accounts
# ============================================================================

echo "🚀 Create Auth Users for Test Accounts"
echo "========================================"
echo ""

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "⚠️  .env.local file not found"
    echo ""
    echo "Please create .env.local with:"
    echo "  SUPABASE_URL=your_supabase_url"
    echo "  SUPABASE_SERVICE_ROLE_KEY=your_service_role_key"
    echo ""
    exit 1
fi

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo "⚠️  Node.js not found"
    echo ""
    echo "Options:"
    echo "  1. Install Node.js: https://nodejs.org"
    echo "  2. Use Supabase Auth UI (manual):"
    echo "     - Go to Supabase Dashboard → Authentication → Users"
    echo "     - Click 'Add user' → 'Create new user'"
    echo ""
    exit 1
fi

# Check if @supabase/supabase-js is installed
if [ ! -d "node_modules/@supabase/supabase-js" ]; then
    echo "📦 Installing @supabase/supabase-js..."
    npm install @supabase/supabase-js dotenv
    echo ""
fi

# Run the JavaScript script
echo "🔧 Running auth user creation script..."
echo ""

node database/test-data/create_auth_users.js

exit_code=$?

if [ $exit_code -eq 0 ]; then
    echo ""
    echo "✅ Success! Auth users created."
    echo ""
    echo "📝 Test Accounts:"
    echo "  - test.student1@tamu.edu"
    echo "  - test.student2@tamu.edu"
    echo "  - test.mentor1@example.com"
    echo "  - test.mentor2@example.com"
    echo "  - test.mentor3@example.com"
    echo ""
    echo "🔑 Default Password: Test123!"
    echo ""
else
    echo ""
    echo "❌ Failed to create auth users"
    echo ""
    echo "💡 Alternative: Use Supabase Auth UI"
    echo "   1. Go to Supabase Dashboard → Authentication → Users"
    echo "   2. Click 'Add user' → 'Create new user'"
    echo "   3. Enter email and password for each test account"
    echo ""
fi

