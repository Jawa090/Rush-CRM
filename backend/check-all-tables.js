const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

console.log('\n📊 CHECKING ALL TABLES IN DATABASE...\n');
console.log('='.repeat(70));

async function checkAllTables() {
  try {
    // Get total count
    const countResult = await pool.query(`
      SELECT COUNT(*) as total_tables 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
    `);
    
    console.log(`\n✅ Total Tables: ${countResult.rows[0].total_tables}\n`);
    
    // Get all table names
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);
    
    console.log('📋 All Tables:\n');
    tablesResult.rows.forEach((row, index) => {
      console.log(`${(index + 1).toString().padStart(3, ' ')}. ${row.table_name}`);
    });
    
    // Check which migrations have been run
    const migrationsResult = await pool.query(`
      SELECT filename, executed_at 
      FROM migrations 
      ORDER BY filename
    `);
    
    console.log('\n' + '='.repeat(70));
    console.log(`\n✅ Migrations Executed: ${migrationsResult.rows.length}\n`);
    
    migrationsResult.rows.forEach((row, index) => {
      console.log(`${(index + 1).toString().padStart(3, ' ')}. ${row.filename}`);
    });
    
    console.log('\n' + '='.repeat(70) + '\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkAllTables();
