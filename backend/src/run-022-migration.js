const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'CRM',
  password: 'ali980',
  port: 5432,
});

async function runMigration() {
  const client = await pool.connect();
  
  try {
    console.log('Starting migration 022 - Professional Leave System...');
    
    const migrationSQL = fs.readFileSync(
      path.join(__dirname, 'migrations', '022_professional_leave_system.sql'),
      'utf8'
    );
    
    await client.query('BEGIN');
    await client.query(migrationSQL);
    await client.query('COMMIT');
    
    console.log('✅ Migration 022 completed successfully!');
    console.log('📋 Created tables:');
    console.log('   - leave_types (with policies)');
    console.log('   - employee_leave_balances');
    console.log('   - leave_requests (enhanced)');
    console.log('   - leave_request_comments');
    console.log('   - public_holidays');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration().catch(console.error);
