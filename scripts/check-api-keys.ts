/**
 * Script to check if API keys are properly configured
 * 
 * Usage:
 *   pnpm tsx scripts/check-api-keys.ts
 */

// Load environment variables from .env.local
import { config } from 'dotenv';
import { resolve } from 'path';

const envResult = config({ path: resolve(process.cwd(), '.env.local') });

if (envResult.error) {
  console.warn('⚠️  Warning: Could not load .env.local file:', envResult.error.message);
}

console.log('🔍 Checking API Key Configuration...\n');

// Check OpenAI API Key
const openAIKey = process.env.OPENAI_API_KEY;
if (openAIKey) {
  const keyLength = openAIKey.length;
  const keyPreview = openAIKey.substring(0, 7) + '...' + openAIKey.substring(keyLength - 4);
  
  if (keyLength < 20 || openAIKey.includes('your_') || openAIKey.includes('YOUR_')) {
    console.log('❌ OPENAI_API_KEY: Found but appears to be a placeholder');
    console.log(`   Key preview: ${keyPreview}`);
    console.log('   ⚠️  Please replace with a real API key from https://platform.openai.com/api-keys\n');
  } else {
    console.log('✅ OPENAI_API_KEY: Found and looks valid');
    console.log(`   Key preview: ${keyPreview}\n`);
  }
} else {
  console.log('❌ OPENAI_API_KEY: Not found\n');
}

// Check Google Gemini API Key
const geminiKey = process.env.GOOGLE_AI_API_KEY;
if (geminiKey) {
  const keyLength = geminiKey.length;
  const keyPreview = geminiKey.substring(0, 7) + '...' + geminiKey.substring(keyLength - 4);
  
  if (keyLength < 20 || geminiKey.includes('your_') || geminiKey.includes('YOUR_')) {
    console.log('❌ GOOGLE_AI_API_KEY: Found but appears to be a placeholder');
    console.log(`   Key preview: ${keyPreview}`);
    console.log('   ⚠️  Please replace with a real API key from https://makersuite.google.com/app/apikey\n');
  } else {
    console.log('✅ GOOGLE_AI_API_KEY: Found and looks valid');
    console.log(`   Key preview: ${keyPreview}\n`);
  }
} else {
  console.log('❌ GOOGLE_AI_API_KEY: Not found\n');
}

// Summary
console.log('='.repeat(50));
const hasValidOpenAI = openAIKey && openAIKey.length > 20 && !openAIKey.includes('your_') && !openAIKey.includes('YOUR_');
const hasValidGemini = geminiKey && geminiKey.length > 20 && !geminiKey.includes('your_') && !geminiKey.includes('YOUR_');

if (hasValidOpenAI || hasValidGemini) {
  console.log('✅ Valid API key(s) found!');
  if (hasValidOpenAI && hasValidGemini) {
    console.log('   📌 Both OpenAI and Gemini keys are available');
    console.log('   📌 System will prefer OpenAI, with Gemini as fallback');
  } else if (hasValidGemini) {
    console.log('   📌 Using Gemini API for embeddings');
  } else {
    console.log('   📌 Using OpenAI API for embeddings');
  }
  console.log('   ✅ You should be able to run: pnpm index-events');
} else {
  console.log('❌ No valid API keys found!');
  console.log('\n📝 To fix this:');
  console.log('   1. Get an API key (at least one required):');
  console.log('      - Google Gemini (Recommended, free tier): https://makersuite.google.com/app/apikey');
  console.log('      - OpenAI: https://platform.openai.com/api-keys');
  console.log('   2. Add it to .env.local:');
  console.log('      GOOGLE_AI_API_KEY=your-actual-gemini-key-here  # Recommended');
  console.log('      # OR');
  console.log('      OPENAI_API_KEY=sk-your-actual-key-here');
  console.log('   3. Run this check again to verify');
}
console.log('='.repeat(50));

