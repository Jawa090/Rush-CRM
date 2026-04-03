const { exec } = require('child_process');
const path = require('path');
require('dotenv').config();

console.log('\n📦 EXPORTING DATABASE TO SQL FILE...\n');
console.log('='.repeat(70));

// Parse DATABASE_URL
const dbUrl = process.env.DATABASE_URL;
const urlPattern = /postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/;
const match = dbUrl.match(urlPattern);

if (!match) {
  console.error('❌ Invalid DATABASE_URL format');
  process.exit(1);
}

const [, user, password, host, port, database] = match;

// Set PGPASSWORD environment variable
process.env.PGPASSWORD = password;

const outputFile = path.join(__dirname, 'database-dump.sql');

const command = `pg_dump -h ${host} -p ${port} -U ${user} -d ${database} --clean --if-exists --no-owner --no-privileges -f "${outputFile}"`;

console.log('🔄 Exporting database...\n');
console.log(`Database: ${database}`);
console.log(`Host: ${host}:${port}`);
console.log(`Output: database-dump.sql\n`);

exec(command, (error, stdout, stderr) => {
  if (error) {
    console.error('❌ Export failed:', error.message);
    if (stderr) console.error(stderr);
    process.exit(1);
  }
  
  if (stderr && !stderr.includes('NOTICE')) {
    console.log('⚠️  Warnings:', stderr);
  }
  
  console.log('='.repeat(70));
  console.log('✅ DATABASE EXPORTED SUCCESSFULLY!');
  console.log('='.repeat(70));
  console.log('\n📄 File created: backend/database-dump.sql');
  console.log('\n📋 Team members can import using:');
  console.log('   psql -U username -d database_name -f database-dump.sql\n');
});
