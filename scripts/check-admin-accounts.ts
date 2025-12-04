/**
 * Script to check admin accounts in the database
 * 
 * Run with: npx tsx scripts/check-admin-accounts.ts
 * 
 * Or use the SQL script in Supabase SQL Editor: scripts/check-admin-accounts.sql
 */

import { createAdminSupabase } from '@/lib/supabase/server';

async function checkAdminAccounts() {
  console.log('🔍 Checking admin accounts...\n');

  const supabase = createAdminSupabase();

  // Get all admin users
  const { data: adminUsers, error: adminError } = await supabase
    .from('users')
    .select('id, email, full_name, role, created_at, metadata')
    .eq('role', 'admin')
    .order('created_at', { ascending: false });

  if (adminError) {
    console.error('❌ Error fetching admin accounts:', adminError.message);
    return;
  }

  // Get count
  const { count } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'admin');

  console.log(`📊 Total Admin Accounts: ${count || 0}\n`);

  if (!adminUsers || adminUsers.length === 0) {
    console.log('⚠️  No admin accounts found in the database.\n');
    console.log('💡 To create an admin account, run:');
    console.log('   SQL: UPDATE users SET role = \'admin\' WHERE email = \'your-email@example.com\';\n');
    return;
  }

  console.log('👥 Admin Accounts:\n');
  console.log('─'.repeat(80));
  
  adminUsers.forEach((user, index) => {
    console.log(`\n${index + 1}. Email: ${user.email}`);
    console.log(`   Name: ${user.full_name || 'N/A'}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   ID: ${user.id}`);
    console.log(`   Created: ${new Date(user.created_at).toLocaleString()}`);
    if (user.metadata && Object.keys(user.metadata).length > 0) {
      console.log(`   Metadata: ${JSON.stringify(user.metadata)}`);
    }
  });

  console.log('\n' + '─'.repeat(80));
  console.log(`\n✅ Found ${adminUsers.length} admin account(s)\n`);
}

// Run the check
checkAdminAccounts()
  .then(() => {
    console.log('✅ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });

