const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://postgres:ali980@localhost:5432/CRM'
});

async function runMigration() {
  const client = await pool.connect();
  try {
    console.log('Running migration 019...');
    
    const migrationPath = path.join(__dirname, 'migrations', '019_add_workspace_lead_isolation.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');
    
    // Split by semicolons but keep function bodies intact
    const statements = sql.split(/;\s*$/gm).filter(s => s.trim());
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i].trim();
      if (statement) {
        try {
          await client.query(statement);
          console.log(`✓ Statement ${i + 1}/${statements.length} executed`);
        } catch (err) {
          if (err.code === '42P07' || err.code === '42710') {
            console.log(`⚠ Statement ${i + 1} skipped (already exists)`);
          } else {
            throw err;
          }
        }
      }
    }
    
    console.log('✓ Migration 019 completed successfully');
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
