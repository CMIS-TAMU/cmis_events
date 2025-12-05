// Quick script to verify Brevo environment variables are set
// Run: node verify-brevo-env.js

require('dotenv').config({ path: '.env.local' });

const requiredVars = {
  'BREVO_SMTP_HOST': process.env.BREVO_SMTP_HOST,
  'BREVO_SMTP_PORT': process.env.BREVO_SMTP_PORT,
  'BREVO_SMTP_USER': process.env.BREVO_SMTP_USER,
  'BREVO_SMTP_KEY': process.env.BREVO_SMTP_KEY,
  'BREVO_FROM_EMAIL': process.env.BREVO_FROM_EMAIL,
  'BREVO_FROM_NAME': process.env.BREVO_FROM_NAME,
};

console.log('\n🔍 Checking Brevo Environment Variables:\n');

let allSet = true;
for (const [key, value] of Object.entries(requiredVars)) {
  if (value) {
    // Mask sensitive values
    const displayValue = key.includes('KEY') || key.includes('USER') 
      ? value.substring(0, 10) + '...' 
      : value;
    console.log(`✅ ${key} = ${displayValue}`);
  } else {
    console.log(`❌ ${key} = NOT SET`);
    allSet = false;
  }
}

console.log('\n' + '='.repeat(50));
if (allSet) {
  console.log('✅ All Brevo variables are set!');
  console.log('\n⚠️  If emails still fail, make sure:');
  console.log('   1. Dev server was restarted after adding variables');
  console.log('   2. No extra quotes around values in .env.local');
  console.log('   3. No spaces before/after the = sign');
} else {
  console.log('❌ Some variables are missing!');
  console.log('\nCheck your .env.local file and ensure:');
  console.log('   - Variable names are exactly as shown (case-sensitive)');
  console.log('   - No # comment symbol before the variables');
  console.log('   - No quotes around values (unless needed)');
  console.log('   - No spaces around the = sign');
}
console.log('='.repeat(50) + '\n');


