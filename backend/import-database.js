const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

console.log('\n📥 IMPORTING DATABASE...\n');
console.log('='.repeat(70));

async function importDatabase() {
  const sqlFile = path.join(__dirname, 'CRM.sql');
  
  if (!fs.existsSync(sqlFile)) {
    console.error('❌ CRM.sql not found!');
    console.log('\n💡 Make sure CRM.sql file exists in backend folder\n');
    process.exit(1);
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('📄 Reading SQL file...');
    const sqlContent = fs.readFileSync(sqlFile, 'utf8');
    
    console.log('🔄 Executing SQL statements...\n');
    
    // Split by semicolon and execute each statement
    const statements = sqlContent
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      try {
        await pool.query(statement);
        successCount++;
        
        if ((i + 1) % 50 === 0) {
          console.log(`   ✅ Executed ${i + 1}/${statements.length} statements`);
        }
      } catch (error) {
        errorCount++;
        if (errorCount <= 5) {
          console.log(`   ⚠️  Error: ${error.message.substring(0, 80)}...`);
        }
      }
    }
    
    console.log('\n' + '='.repeat(70));
    console.log('✅ DATABASE IMPORT COMPLETED!');
    console.log('='.repeat(70));
    console.log(`\n📊 Results:`);
    console.log(`   ✅ Success: ${successCount} statements`);
    console.log(`   ⚠️  Errors: ${errorCount} statements`);
    console.log('\n💡 You can now start the server: npm run dev\n');
    
  } catch (error) {
    console.error('❌ Import failed:', error.message);
  } finally {
    await pool.end();
  }
}

importDatabase();
