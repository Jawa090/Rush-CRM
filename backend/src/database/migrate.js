const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

const fs = require('fs');
const path = require('path');
const migrationSQL = fs.readFileSync(path.join(__dirname, 'database.sql'), 'utf8');

async function runMigration() {
  const client = await pool.connect();
  try {
    console.log('Running database migration...');
    await client.query(migrationSQL);
    console.log('Migration completed successfully!');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration();
