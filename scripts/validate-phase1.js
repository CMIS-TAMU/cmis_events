#!/usr/bin/env node

/**
 * Phase 1 Validation Script
 * Validates all Phase 1 implementations automatically
 */

const fs = require('fs');
const path = require('path');

const tests = [];
let passed = 0;
let failed = 0;

function test(name, condition, details = '') {
  tests.push({ name, condition, details });
  if (condition) {
    passed++;
    console.log(`✅ PASS: ${name}`);
    if (details) console.log(`   ${details}`);
  } else {
    failed++;
    console.log(`❌ FAIL: ${name}`);
    if (details) console.log(`   ${details}`);
  }
}

console.log('🧪 Phase 1 Automated Testing\n');
console.log('='.repeat(50));
console.log('');

// Test 1: File Existence
console.log('📁 Test 1: File Structure Verification');
console.log('-'.repeat(50));

const filesToCheck = [
  'database/migrations/add_student_profile_fields.sql',
  'lib/auth/roles.ts',
  'lib/auth/permissions.ts',
  'lib/hooks/useUserRole.ts',
  'lib/hooks/usePermissions.ts',
  'app/test-roles/page.tsx',
  'app/test-profile/page.tsx',
  'server/routers/auth.router.ts',
];

filesToCheck.forEach(file => {
  const exists = fs.existsSync(file);
  test(`File exists: ${file}`, exists, exists ? '' : 'File not found');
});

console.log('');

// Test 2: File Content Verification
console.log('📝 Test 2: File Content Verification');
console.log('-'.repeat(50));

filesToCheck.forEach(file => {
  if (fs.existsSync(file)) {
    const content = fs.readFileSync(file, 'utf8');
    const hasContent = content.length > 100; // At least 100 characters
    test(`File has content: ${file}`, hasContent, hasContent ? `${content.length} characters` : 'File seems empty');
  }
});

console.log('');

// Test 3: Exports Verification
console.log('🔍 Test 3: Export Verification');
console.log('-'.repeat(50));

if (fs.existsSync('lib/auth/roles.ts')) {
  const rolesContent = fs.readFileSync('lib/auth/roles.ts', 'utf8');
  test('roles.ts exports UserRole type', rolesContent.includes('export type UserRole'), '');
  test('roles.ts exports ROLES constant', rolesContent.includes('export const ROLES'), '');
  test('roles.ts exports isValidRole function', rolesContent.includes('export function isValidRole'), '');
  test('roles.ts exports hasRoleLevel function', rolesContent.includes('export function hasRoleLevel'), '');
}

if (fs.existsSync('lib/auth/permissions.ts')) {
  const permContent = fs.readFileSync('lib/auth/permissions.ts', 'utf8');
  test('permissions.ts exports Permission type', permContent.includes('export type Permission'), '');
  test('permissions.ts exports PERMISSIONS constant', permContent.includes('export const PERMISSIONS'), '');
  test('permissions.ts exports hasPermission function', permContent.includes('export function hasPermission'), '');
}

if (fs.existsSync('lib/hooks/useUserRole.ts')) {
  const hookContent = fs.readFileSync('lib/hooks/useUserRole.ts', 'utf8');
  test('useUserRole.ts exports useUserRole hook', hookContent.includes('export function useUserRole'), '');
  test('useUserRole.ts exports useHasRole hook', hookContent.includes('export function useHasRole'), '');
}

if (fs.existsSync('lib/hooks/usePermissions.ts')) {
  const permHookContent = fs.readFileSync('lib/hooks/usePermissions.ts', 'utf8');
  test('usePermissions.ts exports usePermission hook', permHookContent.includes('export function usePermission'), '');
  test('usePermissions.ts exports useAuth hook', permHookContent.includes('export function useAuth'), '');
}

console.log('');

// Test 4: SQL Migration Verification
console.log('🗄️  Test 4: SQL Migration Verification');
console.log('-'.repeat(50));

if (fs.existsSync('database/migrations/add_student_profile_fields.sql')) {
  const sqlContent = fs.readFileSync('database/migrations/add_student_profile_fields.sql', 'utf8');
  
  const alterCount = (sqlContent.match(/ALTER TABLE/gi) || []).length;
  const indexCount = (sqlContent.match(/CREATE INDEX/gi) || []).length;
  const triggerCount = (sqlContent.match(/CREATE TRIGGER/gi) || []).length;
  
  test('Migration has ALTER TABLE statements', alterCount >= 5, `Found ${alterCount} statements`);
  test('Migration has CREATE INDEX statements', indexCount >= 5, `Found ${indexCount} statements`);
  test('Migration creates trigger', triggerCount >= 1, `Found ${triggerCount} triggers`);
  
  // Check for required columns
  const requiredColumns = ['phone', 'linkedin_url', 'github_url', 'website_url', 'address', 
                          'preferred_industry', 'degree_type', 'work_experience', 'education', 'updated_at'];
  requiredColumns.forEach(col => {
    test(`Migration includes ${col} column`, sqlContent.includes(col), '');
  });
}

console.log('');

// Test 5: tRPC Router Verification
console.log('🔧 Test 5: tRPC Router Verification');
console.log('-'.repeat(50));

if (fs.existsSync('server/routers/auth.router.ts')) {
  const routerContent = fs.readFileSync('server/routers/auth.router.ts', 'utf8');
  
  test('Router has updateStudentProfile mutation', routerContent.includes('updateStudentProfile'), '');
  test('Router has updateWorkExperience mutation', routerContent.includes('updateWorkExperience'), '');
  test('Router has updateEducation mutation', routerContent.includes('updateEducation'), '');
  
  // Check for new fields
  const newFields = ['phone', 'linkedin_url', 'github_url', 'preferred_industry', 'work_experience', 'education'];
  newFields.forEach(field => {
    test(`Router handles ${field} field`, routerContent.includes(field), '');
  });
  
  test('Router imports randomUUID from crypto', routerContent.includes('randomUUID'), '');
}

console.log('');

// Test 6: Test Pages Verification
console.log('📱 Test 6: Test Pages Verification');
console.log('-'.repeat(50));

if (fs.existsSync('app/test-roles/page.tsx')) {
  const testRolesContent = fs.readFileSync('app/test-roles/page.tsx', 'utf8');
  test('Test roles page uses useUserRole hook', testRolesContent.includes('useUserRole'), '');
  test('Test roles page uses usePermission hook', testRolesContent.includes('usePermission') || testRolesContent.includes('usePermissions'), '');
}

if (fs.existsSync('app/test-profile/page.tsx')) {
  const testProfileContent = fs.readFileSync('app/test-profile/page.tsx', 'utf8');
  test('Test profile page uses updateStudentProfile', testProfileContent.includes('updateStudentProfile'), '');
  test('Test profile page uses updateWorkExperience', testProfileContent.includes('updateWorkExperience'), '');
  test('Test profile page uses updateEducation', testProfileContent.includes('updateEducation'), '');
}

console.log('');

// Test 7: Import Verification
console.log('📦 Test 7: Import Verification');
console.log('-'.repeat(50));

if (fs.existsSync('lib/auth/permissions.ts')) {
  const permContent = fs.readFileSync('lib/auth/permissions.ts', 'utf8');
  test('permissions.ts imports UserRole from roles', permContent.includes("from './roles'") || permContent.includes("from '@/lib/auth/roles'"), '');
}

if (fs.existsSync('lib/hooks/usePermissions.ts')) {
  const permHookContent = fs.readFileSync('lib/hooks/usePermissions.ts', 'utf8');
  test('usePermissions.ts imports from permissions', permHookContent.includes("from '@/lib/auth/permissions'"), '');
  test('usePermissions.ts imports from roles', permHookContent.includes("from '@/lib/auth/roles'"), '');
  test('usePermissions.ts imports useUserRole', permHookContent.includes("from './useUserRole'"), '');
}

console.log('');

// Summary
console.log('='.repeat(50));
console.log('📊 Test Summary');
console.log('='.repeat(50));
console.log(`✅ Passed: ${passed}`);
console.log(`❌ Failed: ${failed}`);
console.log(`📈 Total:  ${tests.length}`);
console.log(`📊 Success Rate: ${((passed / tests.length) * 100).toFixed(1)}%`);
console.log('');

if (failed === 0) {
  console.log('✅ All automated tests passed!');
  console.log('');
  console.log('⚠️  Note: Manual testing still required:');
  console.log('  1. Run database migration in Supabase');
  console.log('  2. Test role system in browser (/test-roles)');
  console.log('  3. Test profile mutations in browser (/test-profile)');
  console.log('  4. Verify data persistence in database');
  process.exit(0);
} else {
  console.log('❌ Some tests failed. Please review the errors above.');
  process.exit(1);
}

