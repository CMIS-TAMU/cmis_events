#!/bin/bash

# ============================================================================
# MENTORSHIP TEST DATA SETUP SCRIPT
# ============================================================================
# This script helps set up test data for mentorship system testing
# ============================================================================

echo "🚀 Mentorship Test Data Setup"
echo "=============================="
echo ""

# Check if Supabase CLI is available
if command -v supabase &> /dev/null; then
    echo "✅ Supabase CLI detected"
    echo ""
    echo "Setting up test data via Supabase CLI..."
    echo ""
    
    # Read SQL file and execute
    if [ -f "database/test-data/setup_mentorship_test_data.sql" ]; then
        echo "📄 Found setup script: database/test-data/setup_mentorship_test_data.sql"
        echo ""
        echo "To set up test data:"
        echo "1. Copy the contents of database/test-data/setup_mentorship_test_data.sql"
        echo "2. Open Supabase Dashboard → SQL Editor"
        echo "3. Paste and run the SQL script"
        echo ""
    else
        echo "❌ Setup script not found!"
        exit 1
    fi
else
    echo "⚠️  Supabase CLI not detected"
    echo ""
    echo "Manual Setup Instructions:"
    echo "1. Open Supabase Dashboard"
    echo "2. Go to SQL Editor"
    echo "3. Open file: database/test-data/setup_mentorship_test_data.sql"
    echo "4. Copy entire contents"
    echo "5. Paste into SQL Editor"
    echo "6. Click 'Run'"
    echo ""
fi

echo "📋 What gets created:"
echo "  ✅ 2 Test Students"
echo "  ✅ 3 Test Mentors"
echo "  ✅ 3 Mentor Profiles (active)"
echo "  ✅ 1 Active Match"
echo "  ✅ 1 Pending Match Batch"
echo "  ✅ 2 Meeting Logs"
echo "  ✅ 3 Quick Questions"
echo "  ✅ 1 Feedback Entry"
echo ""

echo "📝 Next Steps:"
echo "  1. Run the SQL script in Supabase"
echo "  2. Create auth users for login (use Supabase Auth UI)"
echo "  3. Start testing features!"
echo ""

echo "📖 See: database/test-data/QUICK_SETUP_GUIDE.md for detailed instructions"
echo ""

echo "✅ Setup instructions ready!"

