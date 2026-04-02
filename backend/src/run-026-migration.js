const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgres://postgres:ali980@localhost:5432/CRM'
});

async function runMigration() {
  const client = await pool.connect();
  try {
    console.log('Running migration 026 - Fix stock movement trigger...');
    
    const migrationPath = path.join(__dirname, 'migrations', '026_fix_stock_movement_trigger.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');
    
    await client.query(sql);
    
    console.log('✓ Migration 026 completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('✗ Migration failed:', error.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration();
