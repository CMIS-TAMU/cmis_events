#!/usr/bin/env node

/**
 * Phase 4 Verification Script (JavaScript/Node.js version)
 * Checks code structure for Role-Specific Dashboards
 */

const fs = require('fs');
const path = require('path');

const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const RESET = '\x1b[0m';

let passed = 0;
let errors = 0;

function checkFile(filePath) {
  const fullPath = path.join(process.cwd(), filePath);
  if (fs.existsSync(fullPath)) {
    console.log(`${GREEN}✅${RESET} ${filePath}`);
    passed++;
    return true;
  } else {
    console.log(`${RED}❌${RESET} ${filePath} - MISSING`);
    errors++;
    return false;
  }
}

function checkContent(filePath, searchText, description) {
  const fullPath = path.join(process.cwd(), filePath);
  if (!fs.existsSync(fullPath)) {
    console.log(`${RED}❌${RESET} ${filePath} - FILE NOT FOUND`);
    errors++;
    return false;
  }

  const content = fs.readFileSync(fullPath, 'utf8');
  if (content.includes(searchText)) {
    console.log(`${GREEN}✅${RESET} ${filePath} contains: ${description}`);
    passed++;
    return true;
  } else {
    console.log(`${RED}❌${RESET} ${filePath} missing: ${description}`);
    errors++;
    return false;
  }
}

console.log('🔍 Phase 4: Role-Specific Dashboards - Code Verification');
console.log('');
console.log('═══════════════════════════════════════');
console.log('  FILE STRUCTURE VERIFICATION');
console.log('═══════════════════════════════════════');
console.log('');

console.log('📁 Checking Dashboard Files...');
console.log('');

// Main dashboard checks
checkFile('app/dashboard/page.tsx');
checkContent('app/dashboard/page.tsx', 'Student Dashboard', 'Student dashboard title');
checkContent('app/dashboard/page.tsx', 'Profile Completion', 'Profile completion card');
checkContent('app/dashboard/page.tsx', 'Academic Summary', 'Academic summary card');
checkContent('app/dashboard/page.tsx', 'Resume Status', 'Resume status card');
checkContent('app/dashboard/page.tsx', 'Upcoming Events', 'Upcoming events card');
checkContent('app/dashboard/page.tsx', 'Mentorship Program', 'Mentorship program card');
checkContent('app/dashboard/page.tsx', 'useUserRole', 'useUserRole hook');
checkContent('app/dashboard/page.tsx', 'StudentOnly', 'StudentOnly guard');
checkContent('app/dashboard/page.tsx', 'trpc.events.getAll', 'Events query');
checkContent('app/dashboard/page.tsx', 'trpc.registrations.getMyRegistrations', 'Registrations query');
checkContent('app/dashboard/page.tsx', 'trpc.resumes.getMyResume', 'Resume query');
checkContent('app/dashboard/page.tsx', 'trpc.mentorship.getActiveMatch', 'Mentorship query');
checkContent('app/dashboard/page.tsx', "router.push('/faculty/dashboard')", 'Faculty redirect');

console.log('');
console.log('📁 Checking Faculty Dashboard...');
console.log('');

// Faculty dashboard checks
checkFile('app/faculty/dashboard/page.tsx');
checkContent('app/faculty/dashboard/page.tsx', 'Faculty Dashboard', 'Faculty dashboard title');
checkContent('app/faculty/dashboard/page.tsx', 'Mentor Requests', 'Mentor requests card');
checkContent('app/faculty/dashboard/page.tsx', 'Active Mentees', 'Active mentees card');
checkContent('app/faculty/dashboard/page.tsx', 'FacultyOnly', 'FacultyOnly guard');
checkContent('app/faculty/dashboard/page.tsx', 'useUserRole', 'useUserRole hook');
checkContent('app/faculty/dashboard/page.tsx', 'trpc.mentorship.getMentorMatchBatch', 'Mentor match batch query');

console.log('');
console.log('📁 Checking Role Guard Components...');
console.log('');

// Role guard components
checkFile('components/auth/role-guard.tsx');
checkContent('components/auth/role-guard.tsx', 'RoleGuard', 'RoleGuard component');
checkContent('components/auth/role-guard.tsx', 'StudentOnly', 'StudentOnly component');
checkContent('components/auth/role-guard.tsx', 'FacultyOnly', 'FacultyOnly component');
checkContent('components/auth/role-guard.tsx', 'AdminOnly', 'AdminOnly component');
checkContent('components/auth/role-guard.tsx', 'AuthenticatedOnly', 'AuthenticatedOnly component');

checkFile('components/auth/index.ts');
checkContent('components/auth/index.ts', 'RoleGuard', 'RoleGuard export');
checkContent('components/auth/index.ts', 'StudentOnly', 'StudentOnly export');
checkContent('components/auth/index.ts', 'FacultyOnly', 'FacultyOnly export');

console.log('');
console.log('📁 Checking Hooks...');
console.log('');

// Hooks
checkFile('lib/hooks/useUserRole.ts');
checkContent('lib/hooks/useUserRole.ts', 'useUserRole', 'useUserRole hook');
checkFile('lib/hooks/usePermissions.ts');
checkContent('lib/hooks/usePermissions.ts', 'usePermission', 'usePermission hook');

console.log('');
console.log('📁 Checking Role Utilities...');
console.log('');

// Role utilities
checkFile('lib/auth/roles.ts');
checkContent('lib/auth/roles.ts', 'UserRole', 'UserRole type');
checkFile('lib/auth/permissions.ts');
checkContent('lib/auth/permissions.ts', 'Permission', 'Permission type');

console.log('');
console.log('═══════════════════════════════════════');
console.log('  VERIFICATION SUMMARY');
console.log('═══════════════════════════════════════');
console.log('');

const total = passed + errors;
const percentage = total > 0 ? Math.round((passed / total) * 100) : 0;

if (errors === 0) {
  console.log(`${GREEN}✅ All checks passed!${RESET}`);
  console.log(`${GREEN}✅ Passed: ${passed}${RESET}`);
  console.log(`${GREEN}✅ Errors: ${errors}${RESET}`);
  console.log(`${GREEN}📊 Success Rate: 100%${RESET}`);
  console.log('');
  console.log('🎉 Phase 4 code structure is valid!');
  process.exit(0);
} else {
  console.log(`${YELLOW}⚠️  Some checks failed${RESET}`);
  console.log(`${GREEN}✅ Passed: ${passed}${RESET}`);
  console.log(`${RED}❌ Failed: ${errors}${RESET}`);
  console.log(`${YELLOW}📊 Success Rate: ${percentage}%${RESET}`);
  console.log('');
  console.log('Please review the errors above and fix any issues.');
  process.exit(1);
}

