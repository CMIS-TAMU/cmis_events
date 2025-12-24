/**
 * Index All Resumes Script
 * 
 * This script fetches all users with resumes from Supabase and generates/stores
 * their embeddings for semantic search.
 * 
 * Usage: pnpm index-resumes
 */

// Load environment variables from .env.local
import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env.local file
config({ path: resolve(process.cwd(), '.env.local') });

import { createClient } from '@supabase/supabase-js';
import { indexResume, extractResumeText } from '../lib/services/resume-matching';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing environment variables:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅' : '❌ Missing');
  console.error('   SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseKey ? '✅' : '❌ Missing');
  console.error('\nPlease set these in your .env.local file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function indexAllResumes() {
  console.log('🔍 Fetching all users with resumes...\n');

  // Fetch all users with resumes
  const { data: users, error } = await supabase
    .from('users')
    .select('id, email, full_name, resume_filename, resume_url, major, skills, gpa, graduation_year')
    .not('resume_filename', 'is', null)
    .eq('role', 'student');

  if (error) {
    console.error('❌ Failed to fetch users:', error.message);
    process.exit(1);
  }

  if (!users || users.length === 0) {
    console.log('✅ No users with resumes found');
    return;
  }

  console.log(`📄 Found ${users.length} user(s) with resumes\n`);

  let successCount = 0;
  let errorCount = 0;
  let skippedCount = 0;

  for (const user of users) {
    try {
      console.log(`\n📝 Processing: ${user.full_name || user.email} (${user.id})`);

      // Download resume from storage
      if (!user.resume_filename) {
        console.log('   ⚠️  Skipping: No resume filename');
        skippedCount++;
        continue;
      }

      console.log('   📥 Downloading resume from storage...');
      const { data: fileData, error: downloadError } = await supabase.storage
        .from('resumes')
        .download(user.resume_filename);

      if (downloadError || !fileData) {
        console.log(`   ⚠️  Skipping: Failed to download resume: ${downloadError?.message}`);
        skippedCount++;
        continue;
      }

      // Convert blob to buffer
      const arrayBuffer = await fileData.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Extract text from PDF
      console.log('   🔤 Extracting text from PDF...');
      const resumeText = await extractResumeText(buffer);

      if (!resumeText || resumeText.trim().length === 0) {
        console.log('   ⚠️  Skipping: No text extracted from PDF');
        skippedCount++;
        continue;
      }

      // Index resume
      console.log('   🧠 Generating and storing embedding...');
      await indexResume(user.id, resumeText, user.id, {
        fileName: user.resume_filename,
        uploadedAt: new Date().toISOString(),
        skills: (user.skills as string[]) || [],
        major: user.major || undefined,
        gpa: user.gpa || undefined,
      });

      console.log('   ✅ Successfully indexed!');
      successCount++;
    } catch (error: any) {
      console.error(`   ❌ Error indexing resume for ${user.email}:`, error.message);
      errorCount++;
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log('📊 Indexing Summary:');
  console.log(`   ✅ Successfully indexed: ${successCount}`);
  console.log(`   ⚠️  Skipped: ${skippedCount}`);
  console.log(`   ❌ Errors: ${errorCount}`);
  console.log(`   📄 Total processed: ${users.length}`);
  console.log('='.repeat(50) + '\n');

  if (successCount > 0) {
    console.log('🎉 Resume indexing completed successfully!');
  }
}

// Run the script
indexAllResumes().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});

