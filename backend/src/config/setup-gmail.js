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
console.log('5. Add redirect URI (for Calendar): http://localhost:4000/api/calendar/auth/google/callback');
console.log('5b. Add redirect URI (for Email): http://localhost:4000/api/email/oauth-callback');
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
    
    const port = 4000;
    const gmailRedirectUri = `http://localhost:${port}/api/email/oauth-callback`;
    const calendarRedirectUri = `http://localhost:${port}/api/calendar/auth/google/callback`;
    
    // Read current .env file (assuming it's in the root folder of backend)
    const envPath = path.join(__dirname, '..', '..', '.env');
    
    if (!fs.existsSync(envPath)) {
      console.log('❌ .env file not found at:', envPath);
      process.exit(1);
    }

    let envContent = fs.readFileSync(envPath, 'utf8');
    
    // Update or append the OAuth credentials
    const updateEnv = (key, value) => {
      if (envContent.includes(`${key}=`)) {
        envContent = envContent.replace(new RegExp(`${key}=.*`), `${key}=${value}`);
      } else {
        envContent += `\n${key}=${value}`;
      }
    };

    updateEnv('GOOGLE_CLIENT_ID', clientId);
    updateEnv('GOOGLE_CLIENT_SECRET', clientSecret);
    updateEnv('GOOGLE_GMAIL_REDIRECT_URI', gmailRedirectUri);
    updateEnv('GOOGLE_CALENDAR_REDIRECT_URI', calendarRedirectUri);
    
    // Write back to .env file
    fs.writeFileSync(envPath, envContent);
    
    console.log('\n✅ Google OAuth configuration updated successfully!');
    console.log('\n📝 Updated .env file with port 4000 redirect URIs.');
    console.log('\n🔄 Please restart your server to apply changes.');
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
  } finally {
    rl.close();
  }
}

setupGmail();

