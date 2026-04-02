const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

async function setupDatabase() {
  // Connect directly to CRM database (NO DROP!)
  const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'CRM',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'ali980',
  });

  const client = await pool.connect();
  
  try {
    console.log('🚀 Running CRM Database Migration...\n');
    console.log('⚠️  Safe Mode: Only adds missing tables/columns');
    console.log('✅ Existing data will NOT be deleted\n');
    
    // Read the complete migration file
    const migrationPath = path.join(__dirname, '../migrations/000_complete_crm_setup.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('📄 Migration file: 000_complete_crm_setup.sql');
    console.log('⚙️  Executing migration...\n');
    
    // Execute the migration
    await client.query(migrationSQL);
    
    console.log('✅ Migration completed successfully!\n');
    
    // Verify tables
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);
    
    console.log('═══════════════════════════════════════════════════');
    console.log(`📋 Total tables: ${result.rows.length}`);
    console.log('═══════════════════════════════════════════════════\n');
    
    // Count existing data
    const userCount = await client.query('SELECT COUNT(*) FROM users');
    const contactCount = await client.query('SELECT COUNT(*) FROM contacts');
    const campaignCount = await client.query('SELECT COUNT(*) FROM marketing_campaigns');
    
    console.log('📊 Existing Data:');
    console.log(`   Users: ${userCount.rows[0].count}`);
    console.log(`   Contacts: ${contactCount.rows[0].count}`);
    console.log(`   Campaigns: ${campaignCount.rows[0].count}\n`);
    
    console.log('═══════════════════════════════════════════════════');
    console.log('🎉 Database is ready!');
    console.log('═══════════════════════════════════════════════════\n');
    
    console.log('💡 Next Steps:');
    console.log('   1. Start backend:  npm start');
    console.log('   2. Start frontend: npm run dev\n');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('\nError details:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

// Run setup
setupDatabase();
