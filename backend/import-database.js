const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

console.log('\n📥 IMPORTING DATABASE...\n');
console.log('='.repeat(70));

async function importDatabase() {
  // Check for CRM.sql in both locations
  let sqlFile = path.join(__dirname, 'src', 'database', 'CRM.sql');
  
  if (!fs.existsSync(sqlFile)) {
    sqlFile = path.join(__dirname, 'CRM.sql');
  }
  
  if (!fs.existsSync(sqlFile)) {
    console.error('❌ CRM.sql not found!');
    console.log('\n💡 Searched in:');
    console.log('   - backend/src/database/CRM.sql');
    console.log('   - backend/CRM.sql\n');
    process.exit(1);
  }

  console.log(`📄 Found SQL file: ${sqlFile}`);

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('� Reading SQL file...');
    const sqlContent = fs.readFileSync(sqlFile, 'utf8');
    
    console.log('� Enabling UUID extension...');
    await pool.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');
    await pool.query('CREATE EXTENSION IF NOT EXISTS "pgcrypto";');
    
    console.log('🔄 Processing SQL statements...\n');
    
    // Better SQL parsing - handle multi-line statements
    const statements = [];
    let currentStatement = '';
    let insideQuote = false;
    let quoteChar = '';
    
    for (let i = 0; i < sqlContent.length; i++) {
      const char = sqlContent[i];
      const prevChar = i > 0 ? sqlContent[i - 1] : '';
      
      // Track quotes
      if ((char === "'" || char === '"') && prevChar !== '\\') {
        if (!insideQuote) {
          insideQuote = true;
          quoteChar = char;
        } else if (char === quoteChar) {
          insideQuote = false;
        }
      }
      
      currentStatement += char;
      
      // Split on semicolon only if not inside quotes
      if (char === ';' && !insideQuote) {
        const stmt = currentStatement.trim();
        if (stmt.length > 0 && !stmt.startsWith('--')) {
          statements.push(stmt);
        }
        currentStatement = '';
      }
    }
    
    // Add last statement if exists
    if (currentStatement.trim().length > 0) {
      statements.push(currentStatement.trim());
    }
    
    console.log(`📊 Found ${statements.length} SQL statements to execute\n`);
    
    let successCount = 0;
    let errorCount = 0;
    let tableCount = 0;
    let insertCount = 0;
    const errors = [];
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      try {
        await pool.query(statement);
        successCount++;
        
        // Track what we're doing
        if (statement.toUpperCase().includes('CREATE TABLE')) {
          tableCount++;
          const match = statement.match(/CREATE TABLE\s+(?:IF NOT EXISTS\s+)?(\w+)/i);
          if (match) {
            console.log(`   ✅ Created table: ${match[1]}`);
          }
        } else if (statement.toUpperCase().includes('INSERT INTO')) {
          insertCount++;
        }
        
        // Progress indicator for large imports
        if ((i + 1) % 100 === 0) {
          console.log(`   📈 Progress: ${i + 1}/${statements.length} statements`);
        }
      } catch (error) {
        errorCount++;
        
        // Only show first 10 errors
        if (errorCount <= 10) {
          const preview = statement.substring(0, 60).replace(/\n/g, ' ');
          errors.push({
            statement: preview + '...',
            error: error.message.substring(0, 100)
          });
        }
      }
    }
    
    console.log('\n' + '='.repeat(70));
    console.log('✅ DATABASE IMPORT COMPLETED!');
    console.log('='.repeat(70));
    console.log(`\n📊 Summary:`);
    console.log(`   ✅ Total Statements: ${statements.length}`);
    console.log(`   ✅ Successful: ${successCount}`);
    console.log(`   ⚠️  Errors: ${errorCount}`);
    console.log(`   📦 Tables Created: ${tableCount}`);
    console.log(`   📝 Data Inserts: ${insertCount}`);
    
    if (errors.length > 0) {
      console.log(`\n⚠️  First ${Math.min(errors.length, 10)} Errors:`);
      errors.forEach((err, idx) => {
        console.log(`\n   ${idx + 1}. Statement: ${err.statement}`);
        console.log(`      Error: ${err.error}`);
      });
      console.log(`\n💡 Note: Some errors are expected (e.g., duplicate tables, constraints)`);
    }
    
    // Verify tables were created
    console.log('\n🔍 Verifying database...');
    const result = await pool.query(`
      SELECT COUNT(*) as table_count 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    `);
    
    console.log(`   ✅ Total tables in database: ${result.rows[0].table_count}`);
    console.log('\n💡 You can now start the server: npm run dev\n');
    
  } catch (error) {
    console.error('\n❌ Import failed:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

importDatabase();
