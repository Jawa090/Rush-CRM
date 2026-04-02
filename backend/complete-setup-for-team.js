const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

console.log('\n🚀 COMPLETE CRM SETUP FOR TEAM MEMBERS\n');
console.log('='.repeat(70));

async function completeSetup() {
  try {
    // Step 1: Create migrations table
    console.log('\n📋 Step 1: Creating migrations tracking table...\n');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMPTZ DEFAULT now()
      )
    `);
    console.log('✅ Migrations table ready');
    
    // Step 2: Get list of migration files
    console.log('\n📋 Step 2: Scanning migration files...\n');
    const migrationsDir = path.join(__dirname, 'src', 'migrations');
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();
    
    console.log(`✅ Found ${migrationFiles.length} migration files`);
    
    // Step 3: Run each migration
    console.log('\n📋 Step 3: Running migrations...\n');
    let executedCount = 0;
    let skippedCount = 0;
    
    for (const file of migrationFiles) {
      // Check if migration has already been run
      const result = await pool.query(
        'SELECT id FROM migrations WHERE filename = $1',
        [file]
      );
      
      if (result.rows.length > 0) {
        console.log(`⏭️  ${file} (already executed)`);
        skippedCount++;
        continue;
      }
      
      console.log(`🔄 Running: ${file}`);
      
      // Read and execute migration
      const migrationPath = path.join(migrationsDir, file);
      const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
      
      try {
        await pool.query(migrationSQL);
        
        // Record successful migration
        await pool.query(
          'INSERT INTO migrations (filename) VALUES ($1)',
          [file]
        );
        
        console.log(`✅ Success: ${file}`);
        executedCount++;
      } catch (migrationError) {
        console.error(`❌ Failed: ${file}`);
        console.error(`   Error: ${migrationError.message}`);
        // Continue with other migrations instead of stopping
      }
    }
    
    // Step 4: Verify tables
    console.log('\n📋 Step 4: Verifying database...\n');
    const tablesResult = await pool.query(`
      SELECT COUNT(*) as total_tables 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
    `);
    
    const totalTables = parseInt(tablesResult.rows[0].total_tables);
    console.log(`✅ Total tables in database: ${totalTables}`);
    
    // Step 5: Summary
    console.log('\n' + '='.repeat(70));
    console.log('📊 SETUP SUMMARY:');
    console.log('='.repeat(70));
    console.log(`✅ Migrations executed: ${executedCount}`);
    console.log(`⏭️  Migrations skipped: ${skippedCount}`);
    console.log(`📊 Total tables: ${totalTables}`);
    console.log('='.repeat(70));
    
    if (totalTables >= 95) {
      console.log('\n🎉 SUCCESS! Database is fully set up and ready!');
      console.log('\n📝 You can now:');
      console.log('   1. Start the server: npm start');
      console.log('   2. Test endpoints: GET /api/contacts, /api/companies, etc.');
      console.log('   3. Check logs for any issues\n');
    } else {
      console.log('\n⚠️  WARNING: Expected ~98 tables but found ' + totalTables);
      console.log('   Some migrations may have failed. Check logs above.\n');
    }
    
  } catch (error) {
    console.error('\n❌ SETUP FAILED:', error.message);
    console.error('\nPlease check:');
    console.error('1. DATABASE_URL is correct in .env file');
    console.error('2. PostgreSQL is running');
    console.error('3. Database exists and is accessible\n');
  } finally {
    await pool.end();
  }
}

completeSetup();
