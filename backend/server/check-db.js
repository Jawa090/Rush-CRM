const db = require('./src/config/database');

async function check() {
  try {
    const migrations = await db.query("SELECT filename FROM migrations ORDER BY filename");
    process.stdout.write("MIGRATIONS:\n");
    migrations.rows.forEach(r => process.stdout.write(r.filename + "\n"));
    
    const tables = await db.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name");
    process.stdout.write("TABLES:\n");
    tables.rows.forEach(r => process.stdout.write(r.table_name + "\n"));
  } catch (err) {
    process.stdout.write("ERROR: " + err.message + "\n");
  } finally {
    process.exit(0);
  }
}

check();
