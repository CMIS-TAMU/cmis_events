/**
 * Script to index all events with embeddings for semantic search
 * 
 * Usage:
 *   pnpm index-events          # Recommended: uses npm script
 *   npx tsx scripts/index-all-events.ts
 *   pnpm tsx scripts/index-all-events.ts
 * 
 * Requirements:
 *   - tsx must be installed: pnpm add -D tsx
 *   - dotenv must be installed: pnpm add -D dotenv
 *   - Environment variables must be set in .env.local
 */

// Load environment variables from .env.local FIRST (before other imports)
import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env.local file
const envResult = config({ path: resolve(process.cwd(), '.env.local') });

if (envResult.error) {
  console.warn('⚠️  Warning: Could not load .env.local file:', envResult.error.message);
  console.warn('   Trying to use environment variables from system...\n');
}

// Now import other modules (after env vars are loaded)
import { createClient } from '@supabase/supabase-js';
import { indexEvent } from '../lib/services/content-search';

// Load environment variables
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

async function indexAllEvents() {
  console.log('🚀 Starting event indexing...\n');
  
  try {
    // Fetch all events
    const { data: events, error } = await supabase
      .from('events')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching events:', error.message);
      console.error('   Details:', error);
      process.exit(1);
    }

    if (!events || events.length === 0) {
      console.log('⚠️  No events found in database.');
      console.log('   Create some events first, then run this script again.');
      process.exit(0);
    }

    console.log(`📋 Found ${events.length} events to index\n`);

    let successCount = 0;
    let errorCount = 0;

    // Index each event
    for (let i = 0; i < events.length; i++) {
      const event = events[i];
      const progress = `[${i + 1}/${events.length}]`;
      
      try {
        await indexEvent(
          event.id,
          event.title || 'Untitled Event',
          event.description || '',
          {
            startsAt: event.starts_at,
            location: event.location || undefined,
            type: event.type || undefined,
            capacity: event.capacity || undefined,
          }
        );
        console.log(`${progress} ✅ Indexed: "${event.title || 'Untitled Event'}"`);
        successCount++;
      } catch (error) {
        console.error(`${progress} ❌ Failed to index "${event.title || 'Untitled Event'}":`);
        if (error instanceof Error) {
          console.error(`   Error: ${error.message}`);
        } else {
          console.error('   Error:', error);
        }
        errorCount++;
      }
    }

    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('📊 Indexing Summary:');
    console.log(`   ✅ Success: ${successCount}`);
    console.log(`   ❌ Failed: ${errorCount}`);
    console.log(`   📝 Total: ${events.length}`);
    console.log('='.repeat(50));

    if (successCount > 0) {
      console.log('\n🎉 Successfully indexed events!');
      console.log('   You can now use semantic search at: /demo/semantic-search');
    }

    if (errorCount > 0) {
      console.log('\n⚠️  Some events failed to index. Check the errors above.');
      process.exit(1);
    }
  } catch (error) {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  }
}

// Run the script
indexAllEvents().catch((error) => {
  console.error('❌ Unhandled error:', error);
  process.exit(1);
});

