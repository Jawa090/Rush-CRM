const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://postgres:ali980@localhost:5432/CRM'
});

async function runMigration() {
  const client = await pool.connect();
  try {
    console.log('Running migration 024...');
    
    const migrationPath = path.join(__dirname, 'migrations', '024_fix_products_table_columns.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');
    
    // Split by semicolons
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s && !s.startsWith('--'));
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement) {
        try {
          await client.query(statement);
          console.log(`✓ Statement ${i + 1}/${statements.length} executed`);
        } catch (err) {
          if (err.code === '42701') {
            console.log(`⚠ Statement ${i + 1} skipped (column already exists)`);
          } else if (err.code === '42P07') {
            console.log(`⚠ Statement ${i + 1} skipped (index already exists)`);
          } else {
            throw err;
          }
        }
      }
    }
    
    console.log('✓ Migration 024 completed successfully');
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
