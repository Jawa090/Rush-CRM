const readline = require('readline');
const fs = require('fs');
const path = require('path');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🚀 Gmail OAuth Setup Wizard\n');
console.log('This wizard will help you configure Gmail OAuth for your CRM system.\n');

console.log('📋 Before we start, you need to:');
console.log('1. Go to https://console.cloud.google.com/');
console.log('2. Create a new project (or select existing)');
console.log('3. Enable Gmail API');
console.log('4. Create OAuth 2.0 credentials');
console.log('5. Add redirect URI: http://localhost:3000/auth/google/callback');
console.log('6. Copy the Client ID and Client Secret\n');

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

async function setupGmail() {
  try {
    console.log('Ready to configure? (Press Enter to continue or Ctrl+C to exit)');
    await askQuestion('');
    
    const clientId = await askQuestion('Enter your Google Client ID: ');
    if (!clientId) {
      console.log('❌ Client ID is required. Exiting...');
      process.exit(1);
    }
    
    const clientSecret = await askQuestion('Enter your Google Client Secret: ');
    if (!clientSecret) {
      console.log('❌ Client Secret is required. Exiting...');
      process.exit(1);
    }
    
    const redirectUri = await askQuestion('Enter redirect URI (or press Enter for default): ') || 'http://localhost:3000/auth/google/callback';
    
    // Read current .env file
    const envPath = path.join(__dirname, '.env');
    let envContent = fs.readFileSync(envPath, 'utf8');
    
    // Update the OAuth credentials
    envContent = envContent.replace(
      /GOOGLE_CLIENT_ID=.*/,
      `GOOGLE_CLIENT_ID=${clientId}`
    );
    envContent = envContent.replace(
      /GOOGLE_CLIENT_SECRET=.*/,
      `GOOGLE_CLIENT_SECRET=${clientSecret}`
    );
    envContent = envContent.replace(
      /GOOGLE_REDIRECT_URI=.*/,
      `GOOGLE_REDIRECT_URI=${redirectUri}`
    );
    
    // Write back to .env file
    fs.writeFileSync(envPath, envContent);
    
    console.log('\n✅ Gmail OAuth configuration updated successfully!');
    console.log('\n📝 Updated .env file with:');
    console.log(`   GOOGLE_CLIENT_ID=${clientId}`);
    console.log(`   GOOGLE_CLIENT_SECRET=${clientSecret.substring(0, 10)}...`);
    console.log(`   GOOGLE_REDIRECT_URI=${redirectUri}`);
    
    console.log('\n🔄 Please restart your server to apply changes:');
    console.log('   npm run dev');
    
    console.log('\n🎉 You can now connect Gmail from your CRM frontend!');
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
  } finally {
    rl.close();
  }
}

// Check if credentials are already configured
const currentClientId = process.env.GOOGLE_CLIENT_ID;
if (currentClientId && currentClientId !== 'your-google-client-id-here') {
  console.log('✅ Gmail OAuth appears to be already configured.');
  console.log('If you\'re still having issues, please restart your server.');
  process.exit(0);
}

setupGmail();