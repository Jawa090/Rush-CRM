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
    const migrationPath = path.join(__dirname, 'migrations', '020_enhance_employee_fields.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('Running migration 020_enhance_employee_fields.sql...');
    await client.query(sql);
    console.log('✓ Migration completed successfully!');
    
  } catch (error) {
    console.error('✗ Migration failed:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration().catch(console.error);
