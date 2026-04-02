const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

console.log('\n🔍 CHECKING SETUP STATUS...\n');
console.log('='.repeat(70));

async function checkSetup() {
  try {
    // Check migration files
    console.log('\n📋 Step 1: Checking migration files...\n');
    const migrationsDir = path.join(__dirname, 'src', 'migrations');
    
    if (!fs.existsSync(migrationsDir)) {
      console.log('❌ Migrations directory not found!');
      console.log('   Expected: ' + migrationsDir);
      console.log('\n⚠️  ACTION REQUIRED:');
      console.log('   1. Make sure you pulled the latest code from git');
      console.log('   2. Check if src/migrations folder exists');
      console.log('   3. Run: git pull origin main\n');
      await pool.end();
      return;
    }
    
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();
    
    console.log(`✅ Found ${migrationFiles.length} migration files`);
    
    if (migrationFiles.length < 30) {
      console.log('\n⚠️  WARNING: Expected 50+ migration files but found ' + migrationFiles.length);
      console.log('   ACTION: Pull latest code from git repository\n');
    }
    
    // Check database connection
    console.log('\n📋 Step 2: Checking database connection...\n');
    try {
      await pool.query('SELECT NOW()');
      console.log('✅ Database connection successful');
    } catch (err) {
      console.log('❌ Database connection failed!');
      console.log('   Error: ' + err.message);
      console.log('\n⚠️  ACTION REQUIRED:');
      console.log('   1. Check DATABASE_URL in .env file');
      console.log('   2. Make sure PostgreSQL is running');
      console.log('   3. Verify database credentials\n');
      await pool.end();
      return;
    }
    
    // Check migrations table
    console.log('\n📋 Step 3: Checking migrations table...\n');
    let executedMigrations = [];
    try {
      const result = await pool.query('SELECT filename FROM migrations ORDER BY filename');
      executedMigrations = result.rows.map(r => r.filename);
      console.log(`✅ Found ${executedMigrations.length} executed migrations`);
    } catch (err) {
      console.log('⚠️  Migrations table does not exist (will be created on first run)');
    }
    
    // Check tables
    console.log('\n📋 Step 4: Checking database tables...\n');
    const tablesResult = await pool.query(`
      SELECT COUNT(*) as total_tables 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
    `);
    
    const totalTables = parseInt(tablesResult.rows[0].total_tables);
    console.log(`✅ Total tables in database: ${totalTables}`);
    
    // Summary
    console.log('\n' + '='.repeat(70));
    console.log('📊 SETUP STATUS SUMMARY:');
    console.log('='.repeat(70));
    console.log(`Migration files available: ${migrationFiles.length}`);
    console.log(`Migrations executed: ${executedMigrations.length}`);
    console.log(`Database tables: ${totalTables}`);
    console.log('='.repeat(70));
    
    if (migrationFiles.length < 30) {
      console.log('\n❌ ISSUE: Missing migration files');
      console.log('\n📝 SOLUTION:');
      console.log('   1. Pull latest code: git pull origin main');
      console.log('   2. Verify src/migrations folder has 50+ .sql files');
      console.log('   3. Run setup again: node complete-setup-for-team.js\n');
    } else if (totalTables < 90) {
      console.log('\n⚠️  ISSUE: Database not fully set up');
      console.log('\n📝 SOLUTION:');
      console.log('   Run: node complete-setup-for-team.js');
      console.log('   This will execute all pending migrations\n');
    } else {
      console.log('\n🎉 SETUP COMPLETE! Database is ready to use.\n');
      console.log('📝 Next steps:');
      console.log('   1. Start server: npm start');
      console.log('   2. Test API: http://localhost:3000/api/health\n');
    }
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkSetup();
