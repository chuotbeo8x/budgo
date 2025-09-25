#!/usr/bin/env node

const { execSync } = require('child_process');

console.log('🚀 Setting up Beta Environment...');

try {
  // Switch to beta project
  console.log('📋 Switching to budgo-aae32 project...');
  execSync('firebase use budgo-aae32', { stdio: 'inherit' });

  // Get project info
  console.log('📊 Getting project info...');
  const projectInfo = execSync('firebase projects:list', { encoding: 'utf8' });
  console.log('✅ Project switched successfully');

  console.log(`
🎯 Beta Setup Complete!

Next steps:
1. Go to Firebase Console: https://console.firebase.google.com/project/budgo-aae32/overview
2. Enable Authentication with Google Sign-in
3. Create Firestore Database
4. Get Web App config and update env.beta file
5. Run: npm run deploy:beta

Beta URL will be: https://budgo-aae32.web.app
`);

} catch (error) {
  console.error('❌ Error setting up beta:', error.message);
  process.exit(1);
}
