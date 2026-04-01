const db = require('./src/config/database');

async function check() {
  try {
    const filename = '000_core_auth_extensions.sql';
    const migration = await db.query("SELECT id FROM migrations WHERE filename = $1", [filename]);
    console.log(`${filename} in migrations table?`, migration.rows.length > 0);
    
    const tableExists = await db.query("SELECT table_name FROM information_schema.tables WHERE table_name = 'unibox_emails'");
    console.log(`unibox_emails in information_schema?`, tableExists.rows.length > 0);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    process.exit(0);
  }
}

check();
