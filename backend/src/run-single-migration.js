const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'CRM',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
});

async function runMigration(filename) {
  const client = await pool.connect();
  
  try {
    const migrationPath = path.join(__dirname, 'migrations', filename);
    
    if (!fs.existsSync(migrationPath)) {
      console.error(`❌ Migration file not found: ${filename}`);
      process.exit(1);
    }

    const sql = fs.readFileSync(migrationPath, 'utf8');
    
    console.log(`\n🚀 Running migration: ${filename}`);
    console.log('─'.repeat(60));
    
    await client.query('BEGIN');
    await client.query(sql);
    await client.query('COMMIT');
    
    console.log(`✅ Migration completed successfully: ${filename}\n`);
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(`\n❌ Migration failed: ${filename}`);
    console.error('Error:', error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

const filename = process.argv[2];

if (!filename) {
  console.error('Usage: node run-single-migration.js <migration-filename>');
  process.exit(1);
}

runMigration(filename);
