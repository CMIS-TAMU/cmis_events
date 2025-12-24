/**
 * Index All Mentorship Profiles Script
 * 
 * This script fetches all student and mentor profiles from Supabase and generates/stores
 * their embeddings for semantic matching.
 * 
 * Usage: pnpm index-mentorship-profiles
 */

// Load environment variables from .env.local
import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env.local file
config({ path: resolve(process.cwd(), '.env.local') });

import { createClient } from '@supabase/supabase-js';
import { indexStudentProfile, indexMentorProfile } from '../lib/services/mentor-matching';

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

async function indexAllProfiles() {
  console.log('🔍 Fetching all mentorship profiles...\n');

  // Fetch all mentorship profiles
  const { data: profiles, error } = await supabase
    .from('mentorship_profiles')
    .select(`
      *,
      users:user_id(id, email, full_name, major, skills, gpa, graduation_year)
    `);

  if (error) {
    console.error('❌ Failed to fetch profiles:', error.message);
    process.exit(1);
  }

  if (!profiles || profiles.length === 0) {
    console.log('✅ No mentorship profiles found');
    return;
  }

  console.log(`📄 Found ${profiles.length} profile(s)\n`);

  let studentSuccessCount = 0;
  let mentorSuccessCount = 0;
  let errorCount = 0;

  for (const profile of profiles) {
    try {
      const user = profile.users as any;
      console.log(`\n📝 Processing: ${user?.full_name || user?.email || profile.user_id} (${profile.profile_type})`);

      if (profile.profile_type === 'student') {
        // Index student profile
        await indexStudentProfile(profile.user_id, {
          goals: profile.career_goals || undefined,
          interests: Array.isArray(profile.research_interests) 
            ? profile.research_interests.join(', ')
            : profile.research_interests || undefined,
          careerPath: profile.career_goals || undefined,
          skills: (profile.technical_skills as string[]) || (user?.skills as string[]) || [],
          major: profile.major || user?.major || undefined,
          graduationYear: profile.graduation_year || user?.graduation_year || undefined,
          preferredMentorTraits: profile.preferred_mentor_traits || [],
          areasOfFocus: profile.areas_of_focus || [],
        });

        console.log('   ✅ Successfully indexed student profile!');
        studentSuccessCount++;
      } else if (profile.profile_type === 'mentor') {
        // Index mentor profile
        await indexMentorProfile(profile.user_id, {
          expertise: profile.areas_of_expertise 
            ? (Array.isArray(profile.areas_of_expertise) 
                ? profile.areas_of_expertise.join(', ')
                : profile.areas_of_expertise)
            : undefined,
          experience: profile.bio || undefined,
          specialization: profile.areas_of_expertise
            ? (Array.isArray(profile.areas_of_expertise) 
                ? profile.areas_of_expertise.join(', ')
                : profile.areas_of_expertise)
            : undefined,
          industry: profile.industry || undefined,
          skills: (profile.technical_skills as string[]) || (user?.skills as string[]) || [],
          background: profile.bio || undefined,
          mentoringStyle: profile.meeting_frequency || undefined,
          availability: profile.availability_status || undefined,
        });

        console.log('   ✅ Successfully indexed mentor profile!');
        mentorSuccessCount++;
      }
    } catch (error: any) {
      console.error(`   ❌ Error indexing profile for ${profile.user_id}:`, error.message);
      errorCount++;
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log('📊 Indexing Summary:');
  console.log(`   ✅ Successfully indexed students: ${studentSuccessCount}`);
  console.log(`   ✅ Successfully indexed mentors: ${mentorSuccessCount}`);
  console.log(`   ❌ Errors: ${errorCount}`);
  console.log(`   📄 Total processed: ${profiles.length}`);
  console.log('='.repeat(50) + '\n');

  if (studentSuccessCount > 0 || mentorSuccessCount > 0) {
    console.log('🎉 Mentorship profile indexing completed successfully!');
  }
}

// Run the script
indexAllProfiles().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});

