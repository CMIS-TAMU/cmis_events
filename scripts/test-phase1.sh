#!/bin/bash

# ============================================================================
# Phase 1 Automated Testing Script
# ============================================================================
# This script runs automated tests for Phase 1 implementation
# ============================================================================

set -e

echo "🧪 Phase 1 Automated Testing"
echo "============================"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

PASSED=0
FAILED=0

# Function to check test result
check_result() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ PASS${NC}: $1"
        ((PASSED++))
    else
        echo -e "${RED}❌ FAIL${NC}: $1"
        ((FAILED++))
    fi
}

echo "📁 Test 1: File Structure Verification"
echo "---------------------------------------"

# Check if all required files exist
echo "Checking Phase 1 files..."

[ -f "database/migrations/add_student_profile_fields.sql" ] && check_result "Migration file exists" || check_result "Migration file missing"
[ -f "lib/auth/roles.ts" ] && check_result "Roles utility exists" || check_result "Roles utility missing"
[ -f "lib/auth/permissions.ts" ] && check_result "Permissions utility exists" || check_result "Permissions utility missing"
[ -f "lib/hooks/useUserRole.ts" ] && check_result "useUserRole hook exists" || check_result "useUserRole hook missing"
[ -f "lib/hooks/usePermissions.ts" ] && check_result "usePermissions hook exists" || check_result "usePermissions hook missing"
[ -f "app/test-roles/page.tsx" ] && check_result "Test roles page exists" || check_result "Test roles page missing"
[ -f "app/test-profile/page.tsx" ] && check_result "Test profile page exists" || check_result "Test profile page missing"

echo ""
echo "📝 Test 2: Code Quality Checks"
echo "--------------------------------"

# Check if files have content
echo "Verifying file contents..."

[ -s "lib/auth/roles.ts" ] && check_result "roles.ts has content" || check_result "roles.ts is empty"
[ -s "lib/auth/permissions.ts" ] && check_result "permissions.ts has content" || check_result "permissions.ts is empty"
[ -s "lib/hooks/useUserRole.ts" ] && check_result "useUserRole.ts has content" || check_result "useUserRole.ts is empty"
[ -s "lib/hooks/usePermissions.ts" ] && check_result "usePermissions.ts has content" || check_result "usePermissions.ts is empty"

echo ""
echo "🔍 Test 3: Import/Export Verification"
echo "--------------------------------------"

# Check exports in roles.ts
grep -q "export type UserRole" lib/auth/roles.ts && check_result "UserRole type exported" || check_result "UserRole type not exported"
grep -q "export const ROLES" lib/auth/roles.ts && check_result "ROLES constant exported" || check_result "ROLES constant not exported"
grep -q "export function isValidRole" lib/auth/roles.ts && check_result "isValidRole function exported" || check_result "isValidRole function not exported"

# Check exports in permissions.ts
grep -q "export type Permission" lib/auth/permissions.ts && check_result "Permission type exported" || check_result "Permission type not exported"
grep -q "export const PERMISSIONS" lib/auth/permissions.ts && check_result "PERMISSIONS constant exported" || check_result "PERMISSIONS constant not exported"
grep -q "export function hasPermission" lib/auth/permissions.ts && check_result "hasPermission function exported" || check_result "hasPermission function not exported"

# Check exports in hooks
grep -q "export function useUserRole" lib/hooks/useUserRole.ts && check_result "useUserRole hook exported" || check_result "useUserRole hook not exported"
grep -q "export function usePermission" lib/hooks/usePermissions.ts && check_result "usePermission hook exported" || check_result "usePermission hook not exported"

echo ""
echo "🗄️  Test 4: Database Migration Verification"
echo "--------------------------------------------"

# Check SQL migration file
echo "Verifying SQL migration syntax..."

[ -s "database/migrations/add_student_profile_fields.sql" ] && check_result "Migration file has content" || check_result "Migration file is empty"

# Count ALTER TABLE statements
ALTER_COUNT=$(grep -c "ALTER TABLE" database/migrations/add_student_profile_fields.sql || echo "0")
if [ "$ALTER_COUNT" -ge "5" ]; then
    check_result "Migration has sufficient ALTER TABLE statements ($ALTER_COUNT)"
else
    check_result "Migration may be missing ALTER TABLE statements (found: $ALTER_COUNT)"
fi

# Count CREATE INDEX statements
INDEX_COUNT=$(grep -c "CREATE INDEX" database/migrations/add_student_profile_fields.sql || echo "0")
if [ "$INDEX_COUNT" -ge "5" ]; then
    check_result "Migration has sufficient indexes ($INDEX_COUNT)"
else
    check_result "Migration may be missing indexes (found: $INDEX_COUNT)"
fi

# Check for trigger
grep -q "CREATE TRIGGER" database/migrations/add_student_profile_fields.sql && check_result "Migration creates trigger" || check_result "Migration missing trigger"

# Check for new columns
grep -q "phone" database/migrations/add_student_profile_fields.sql && check_result "Phone column in migration" || check_result "Phone column missing"
grep -q "linkedin_url" database/migrations/add_student_profile_fields.sql && check_result "LinkedIn URL column in migration" || check_result "LinkedIn URL column missing"
grep -q "work_experience" database/migrations/add_student_profile_fields.sql && check_result "Work experience column in migration" || check_result "Work experience column missing"
grep -q "education" database/migrations/add_student_profile_fields.sql && check_result "Education column in migration" || check_result "Education column missing"

echo ""
echo "🔧 Test 5: tRPC Router Verification"
echo "-----------------------------------"

# Check if auth router has new mutations
grep -q "updateStudentProfile" server/routers/auth.router.ts && check_result "updateStudentProfile mutation exists" || check_result "updateStudentProfile mutation missing"
grep -q "updateWorkExperience" server/routers/auth.router.ts && check_result "updateWorkExperience mutation exists" || check_result "updateWorkExperience mutation missing"
grep -q "updateEducation" server/routers/auth.router.ts && check_result "updateEducation mutation exists" || check_result "updateEducation mutation missing"

# Check for new fields in updateStudentProfile
grep -q "phone" server/routers/auth.router.ts && check_result "Phone field in router" || check_result "Phone field missing"
grep -q "linkedin_url" server/routers/auth.router.ts && check_result "LinkedIn URL field in router" || check_result "LinkedIn URL field missing"
grep -q "preferred_industry" server/routers/auth.router.ts && check_result "Preferred industry field in router" || check_result "Preferred industry field missing"

echo ""
echo "📱 Test 6: Test Pages Verification"
echo "----------------------------------"

# Check if test pages use the hooks
grep -q "useUserRole" app/test-roles/page.tsx && check_result "Test roles page uses useUserRole" || check_result "Test roles page missing useUserRole"
grep -q "usePermission" app/test-roles/page.tsx && check_result "Test roles page uses usePermission" || check_result "Test roles page missing usePermission"
grep -q "trpc.auth.updateStudentProfile" app/test-profile/page.tsx && check_result "Test profile page uses updateStudentProfile" || check_result "Test profile page missing mutation"

echo ""
echo "📊 Test Summary"
echo "==============="
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ All automated tests passed!${NC}"
    echo ""
    echo "⚠️  Note: Manual testing still required:"
    echo "  1. Run database migration in Supabase"
    echo "  2. Test role system in browser"
    echo "  3. Test profile mutations in browser"
    echo "  4. Verify data persistence"
    exit 0
else
    echo -e "${RED}❌ Some tests failed. Please review the errors above.${NC}"
    exit 1
fi

