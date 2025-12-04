#!/bin/bash

# Phase 4 Verification Script
# Checks code structure for Role-Specific Dashboards

set -e

echo "🔍 Phase 4: Role-Specific Dashboards - Code Verification"
echo ""
echo "═══════════════════════════════════════"
echo "  FILE STRUCTURE VERIFICATION"
echo "═══════════════════════════════════════"
echo ""

ERRORS=0
PASSED=0

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✅${NC} $1"
        PASSED=$((PASSED + 1))
        return 0
    else
        echo -e "${RED}❌${NC} $1 - MISSING"
        ERRORS=$((ERRORS + 1))
        return 1
    fi
}

check_content() {
    if grep -q "$2" "$1" 2>/dev/null; then
        echo -e "${GREEN}✅${NC} $1 contains: $3"
        PASSED=$((PASSED + 1))
        return 0
    else
        echo -e "${RED}❌${NC} $1 missing: $3"
        ERRORS=$((ERRORS + 1))
        return 1
    fi
}

echo "📁 Checking Dashboard Files..."
echo ""

# 1. Check main dashboard file
check_file "app/dashboard/page.tsx"
check_content "app/dashboard/page.tsx" "Student Dashboard" "Student dashboard title"
check_content "app/dashboard/page.tsx" "Profile Completion" "Profile completion card"
check_content "app/dashboard/page.tsx" "Academic Summary" "Academic summary card"
check_content "app/dashboard/page.tsx" "Resume Status" "Resume status card"
check_content "app/dashboard/page.tsx" "Upcoming Events" "Upcoming events card"
check_content "app/dashboard/page.tsx" "Mentorship Program" "Mentorship program card"
check_content "app/dashboard/page.tsx" "Mentorship Status Card" "Mentorship status card"
check_content "app/dashboard/page.tsx" "useUserRole" "useUserRole hook"
check_content "app/dashboard/page.tsx" "StudentOnly" "StudentOnly guard"
check_content "app/dashboard/page.tsx" "trpc.events.getAll" "Events query"
check_content "app/dashboard/page.tsx" "trpc.registrations.getMyRegistrations" "Registrations query"
check_content "app/dashboard/page.tsx" "trpc.resumes.getMyResume" "Resume query"
check_content "app/dashboard/page.tsx" "trpc.mentorship.getActiveMatch" "Mentorship query"
check_content "app/dashboard/page.tsx" "router.push('/faculty/dashboard')" "Faculty redirect"

echo ""
echo "📁 Checking Faculty Dashboard..."
echo ""

# 2. Check faculty dashboard file
check_file "app/faculty/dashboard/page.tsx"
check_content "app/faculty/dashboard/page.tsx" "Faculty Dashboard" "Faculty dashboard title"
check_content "app/faculty/dashboard/page.tsx" "Mentor Requests" "Mentor requests card"
check_content "app/faculty/dashboard/page.tsx" "Active Mentees" "Active mentees card"
check_content "app/faculty/dashboard/page.tsx" "FacultyOnly" "FacultyOnly guard"
check_content "app/faculty/dashboard/page.tsx" "useUserRole" "useUserRole hook"
check_content "app/faculty/dashboard/page.tsx" "trpc.mentorship.getMentorMatchBatch" "Mentor match batch query"

echo ""
echo "📁 Checking Role Guard Components..."
echo ""

# 3. Check role guard components
check_file "components/auth/role-guard.tsx"
check_content "components/auth/role-guard.tsx" "RoleGuard" "RoleGuard component"
check_content "components/auth/role-guard.tsx" "StudentOnly" "StudentOnly component"
check_content "components/auth/role-guard.tsx" "FacultyOnly" "FacultyOnly component"
check_content "components/auth/role-guard.tsx" "AdminOnly" "AdminOnly component"
check_content "components/auth/role-guard.tsx" "AuthenticatedOnly" "AuthenticatedOnly component"

check_file "components/auth/index.ts"
check_content "components/auth/index.ts" "RoleGuard" "RoleGuard export"
check_content "components/auth/index.ts" "StudentOnly" "StudentOnly export"
check_content "components/auth/index.ts" "FacultyOnly" "FacultyOnly export"

echo ""
echo "📁 Checking Hooks..."
echo ""

# 4. Check hooks
check_file "lib/hooks/useUserRole.ts"
check_content "lib/hooks/useUserRole.ts" "useUserRole" "useUserRole hook"
check_file "lib/hooks/usePermissions.ts"
check_content "lib/hooks/usePermissions.ts" "usePermission" "usePermission hook"

echo ""
echo "📁 Checking Role Utilities..."
echo ""

# 5. Check role utilities
check_file "lib/auth/roles.ts"
check_content "lib/auth/roles.ts" "UserRole" "UserRole type"
check_file "lib/auth/permissions.ts"
check_content "lib/auth/permissions.ts" "Permission" "Permission type"

echo ""
echo "🔍 Checking Code Quality..."
echo ""

# 6. Check imports and exports
echo "Checking imports in dashboard files..."

if grep -q "from '@/lib/hooks/useUserRole'" "app/dashboard/page.tsx" && \
   grep -q "from '@/components/auth'" "app/dashboard/page.tsx"; then
    echo -e "${GREEN}✅${NC} Dashboard imports are correct"
    PASSED=$((PASSED + 1))
else
    echo -e "${RED}❌${NC} Dashboard imports are missing or incorrect"
    ERRORS=$((ERRORS + 1))
fi

if grep -q "from '@/lib/hooks/useUserRole'" "app/faculty/dashboard/page.tsx" && \
   grep -q "from '@/components/auth'" "app/faculty/dashboard/page.tsx"; then
    echo -e "${GREEN}✅${NC} Faculty dashboard imports are correct"
    PASSED=$((PASSED + 1))
else
    echo -e "${RED}❌${NC} Faculty dashboard imports are missing or incorrect"
    ERRORS=$((ERRORS + 1))
fi

echo ""
echo "🔍 Checking tRPC Query Usage..."
echo ""

# 7. Check tRPC queries
check_content "app/dashboard/page.tsx" "trpc.auth.getCurrentUser" "Get current user query"
check_content "app/dashboard/page.tsx" "trpc.events.getAll" "Get all events query"
check_content "app/dashboard/page.tsx" "trpc.registrations.getMyRegistrations" "Get registrations query"
check_content "app/dashboard/page.tsx" "trpc.resumes.getMyResume" "Get resume query"
check_content "app/dashboard/page.tsx" "trpc.mentorship.getActiveMatch" "Get active match query"

echo ""
echo "🔍 Checking Role Redirects..."
echo ""

# 8. Check redirect logic
check_content "app/dashboard/page.tsx" "case 'admin':" "Admin redirect case"
check_content "app/dashboard/page.tsx" "case 'sponsor':" "Sponsor redirect case"
check_content "app/dashboard/page.tsx" "case 'faculty':" "Faculty redirect case"
check_content "app/dashboard/page.tsx" "router.push('/faculty/dashboard')" "Faculty redirect implementation"

echo ""
echo "🔍 Checking UI Components..."
echo ""

# 9. Check UI component usage
check_content "app/dashboard/page.tsx" "from '@/components/ui/card'" "Card component import"
check_content "app/dashboard/page.tsx" "from '@/components/ui/button'" "Button component import"
check_content "app/dashboard/page.tsx" "from '@/components/ui/badge'" "Badge component import"

echo ""
echo "═══════════════════════════════════════"
echo "  VERIFICATION SUMMARY"
echo "═══════════════════════════════════════"
echo ""

TOTAL=$((PASSED + ERRORS))
if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✅ All checks passed!${NC}"
    echo -e "${GREEN}✅ Passed: $PASSED${NC}"
    echo -e "${GREEN}✅ Errors: $ERRORS${NC}"
    echo -e "${GREEN}📊 Success Rate: 100%${NC}"
    echo ""
    echo "🎉 Phase 4 code structure is valid!"
    exit 0
else
    echo -e "${YELLOW}⚠️  Some checks failed${NC}"
    echo -e "${GREEN}✅ Passed: $PASSED${NC}"
    echo -e "${RED}❌ Failed: $ERRORS${NC}"
    PERCENTAGE=$((PASSED * 100 / TOTAL))
    echo -e "${YELLOW}📊 Success Rate: $PERCENTAGE%${NC}"
    echo ""
    echo "Please review the errors above and fix any issues."
    exit 1
fi

