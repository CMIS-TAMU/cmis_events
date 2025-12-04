#!/usr/bin/env node

/**
 * ============================================================================
 * CREATE AUTH USERS FOR TEST ACCOUNTS
 * ============================================================================
 * This script automatically creates auth users for test accounts using
 * Supabase Management API
 * ============================================================================
 * 
 * Prerequisites:
 * 1. Install dependencies: npm install @supabase/supabase-js
 * 2. Set SUPABASE_SERVICE_ROLE_KEY in environment or .env.local
 * 3. Set SUPABASE_URL in environment or .env.local
 * 
 * Usage:
 *   node database/test-data/create_auth_users.js
 * ============================================================================
 */

const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  console.error('❌ ERROR: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_URL not set');
  console.error('   Set it in .env.local file');
  process.exit(1);
}

if (!serviceRoleKey) {
  console.error('❌ ERROR: SUPABASE_SERVICE_ROLE_KEY not set');
  console.error('   Set it in .env.local file');
  console.error('   Get it from: Supabase Dashboard → Settings → API → service_role key');
  process.exit(1);
}

// Create Supabase admin client (with service role key)
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Test accounts to create with matching UUIDs from test data
const testAccounts = [
  {
    id: '00000000-0000-0000-0000-000000000001', // Must match users.id from test data
    email: 'test.student1@tamu.edu',
    password: 'Test123!',
    user_metadata: {
      full_name: 'Test Student One',
      role: 'student'
    }
  },
  {
    id: '00000000-0000-0000-0000-000000000002',
    email: 'test.student2@tamu.edu',
    password: 'Test123!',
    user_metadata: {
      full_name: 'Test Student Two',
      role: 'student'
    }
  },
  {
    id: '00000000-0000-0000-0000-000000000101',
    email: 'test.mentor1@example.com',
    password: 'Test123!',
    user_metadata: {
      full_name: 'Test Mentor One',
      role: 'faculty'
    }
  },
  {
    id: '00000000-0000-0000-0000-000000000102',
    email: 'test.mentor2@example.com',
    password: 'Test123!',
    user_metadata: {
      full_name: 'Test Mentor Two',
      role: 'faculty'
    }
  },
  {
    id: '00000000-0000-0000-0000-000000000103',
    email: 'test.mentor3@example.com',
    password: 'Test123!',
    user_metadata: {
      full_name: 'Test Mentor Three',
      role: 'faculty'
    }
  }
];

async function createAuthUsers() {
  console.log('🚀 Creating Auth Users for Test Accounts');
  console.log('==========================================\n');

  const results = {
    created: [],
    skipped: [],
    errors: []
  };

  for (const account of testAccounts) {
    try {
      console.log(`Creating: ${account.email}...`);

      // Check if user already exists
      const { data: existingUsers } = await supabase.auth.admin.listUsers();
      const exists = existingUsers?.users?.some(u => u.email === account.email);

      if (exists) {
        console.log(`  ⚠️  Already exists, skipping...\n`);
        results.skipped.push(account.email);
        continue;
      }

      // Create auth user with specific UUID to match test data
      const { data, error } = await supabase.auth.admin.createUser({
        id: account.id, // Use the same UUID as in users table
        email: account.email,
        password: account.password,
        email_confirm: true, // Auto-confirm email
        user_metadata: account.user_metadata
      });

      if (error) {
        console.error(`  ❌ Error: ${error.message}\n`);
        results.errors.push({ email: account.email, error: error.message });
      } else {
        console.log(`  ✅ Created successfully!\n`);
        results.created.push(account.email);
      }
    } catch (err) {
      console.error(`  ❌ Exception: ${err.message}\n`);
      results.errors.push({ email: account.email, error: err.message });
    }
  }

  // Summary
  console.log('==========================================');
  console.log('📊 SUMMARY');
  console.log('==========================================\n');
  console.log(`✅ Created: ${results.created.length}`);
  results.created.forEach(email => console.log(`   - ${email}`));
  
  if (results.skipped.length > 0) {
    console.log(`\n⚠️  Skipped (already exist): ${results.skipped.length}`);
    results.skipped.forEach(email => console.log(`   - ${email}`));
  }

  if (results.errors.length > 0) {
    console.log(`\n❌ Errors: ${results.errors.length}`);
    results.errors.forEach(({ email, error }) => {
      console.log(`   - ${email}: ${error}`);
    });
  }

  console.log('\n==========================================');
  console.log('✅ Auth User Creation Complete!\n');
  console.log('📝 Default Password: Test123!');
  console.log('💡 You can change passwords in Supabase Auth UI if needed.\n');
}

// Run the script
createAuthUsers().catch(err => {
  console.error('\n❌ Fatal Error:', err.message);
  process.exit(1);
});

