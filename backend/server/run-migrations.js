const fs = require('fs');
const path = require('path');
const db = require('./src/config/database');

async function runMigrations() {
  try {
    console.log('Starting database migrations...');

    // Create migrations table if it doesn't exist
    await db.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMPTZ DEFAULT now()
      )
    `);

    // Get list of migration files
    const migrationsDir = path.join(__dirname, 'migrations');
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();

    console.log(`Found ${migrationFiles.length} migration files`);

    for (const file of migrationFiles) {
      // Check if migration has already been run
      const result = await db.query(
        'SELECT id FROM migrations WHERE filename = $1',
        [file]
      );

      if (result.rows.length > 0) {
        console.log(`Skipping ${file} (already executed)`);
        continue;
      }

      console.log(`Running migration: ${file}`);
      
      // Read and execute migration
      const migrationPath = path.join(migrationsDir, file);
      const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
      
      try {
        await db.query(migrationSQL);
        
        // Record successful migration
        await db.query(
          'INSERT INTO migrations (filename) VALUES ($1)',
          [file]
        );
        
        console.log(`✓ Successfully executed ${file}`);
      } catch (migrationError) {
        console.error(`✗ Failed to execute ${file}:`, migrationError.message);
        throw migrationError;
      }
    }

    console.log('All migrations completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error.message);
    process.exit(1);
  }
}

runMigrations();