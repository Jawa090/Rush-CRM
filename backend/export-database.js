const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

console.log('\n📤 EXPORTING DATABASE...\n');
console.log('='.repeat(70));

async function exportDatabase() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    let sqlOutput = '';
    
    // Header
    sqlOutput += `-- CRM Database Export\n`;
    sqlOutput += `-- Generated: ${new Date().toISOString()}\n`;
    sqlOutput += `-- PostgreSQL Database Dump\n\n`;
    sqlOutput += `SET statement_timeout = 0;\n`;
    sqlOutput += `SET lock_timeout = 0;\n`;
    sqlOutput += `SET client_encoding = 'UTF8';\n`;
    sqlOutput += `SET standard_conforming_strings = on;\n`;
    sqlOutput += `SET check_function_bodies = false;\n`;
    sqlOutput += `SET xmloption = content;\n`;
    sqlOutput += `SET client_min_messages = warning;\n\n`;
    sqlOutput += `-- Enable required extensions\n`;
    sqlOutput += `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";\n`;
    sqlOutput += `CREATE EXTENSION IF NOT EXISTS "pgcrypto";\n\n`;

    console.log('📋 Fetching all tables...');
    
    // Get all tables
    const tablesResult = await pool.query(`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public' 
      ORDER BY tablename
    `);
    
    const tables = tablesResult.rows.map(r => r.tablename);
    console.log(`   ✅ Found ${tables.length} tables\n`);

    // Export each table
    for (const tableName of tables) {
      console.log(`📦 Exporting table: ${tableName}`);
      
      // Get table structure
      const structureResult = await pool.query(`
        SELECT 
          column_name,
          data_type,
          character_maximum_length,
          column_default,
          is_nullable,
          udt_name
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = $1
        ORDER BY ordinal_position
      `, [tableName]);
      
      const columns = structureResult.rows;
      
      // Build CREATE TABLE statement
      sqlOutput += `\n-- Table: ${tableName}\n`;
      sqlOutput += `DROP TABLE IF EXISTS ${tableName} CASCADE;\n`;
      sqlOutput += `CREATE TABLE ${tableName} (\n`;
      
      const columnDefs = columns.map(col => {
        let def = `  ${col.column_name} `;
        
        // Data type
        if (col.data_type === 'ARRAY') {
          def += col.udt_name.replace('_', '') + '[]';
        } else if (col.data_type === 'USER-DEFINED') {
          def += col.udt_name;
        } else if (col.character_maximum_length) {
          def += `${col.data_type}(${col.character_maximum_length})`;
        } else {
          def += col.data_type;
        }
        
        // NOT NULL
        if (col.is_nullable === 'NO') {
          def += ' NOT NULL';
        }
        
        // Default value
        if (col.column_default) {
          def += ` DEFAULT ${col.column_default}`;
        }
        
        return def;
      });
      
      sqlOutput += columnDefs.join(',\n');
      sqlOutput += '\n);\n';
      
      // Get primary key
      const pkResult = await pool.query(`
        SELECT a.attname
        FROM pg_index i
        JOIN pg_attribute a ON a.attrelid = i.indrelid AND a.attnum = ANY(i.indkey)
        WHERE i.indrelid = $1::regclass AND i.indisprimary
      `, [tableName]);
      
      if (pkResult.rows.length > 0) {
        const pkColumns = pkResult.rows.map(r => r.attname).join(', ');
        sqlOutput += `ALTER TABLE ${tableName} ADD PRIMARY KEY (${pkColumns});\n`;
      }
      
      // Get indexes
      const indexResult = await pool.query(`
        SELECT indexname, indexdef
        FROM pg_indexes
        WHERE schemaname = 'public' AND tablename = $1
        AND indexname NOT LIKE '%_pkey'
      `, [tableName]);
      
      for (const idx of indexResult.rows) {
        sqlOutput += `${idx.indexdef};\n`;
      }
      
      // Get data
      const dataResult = await pool.query(`SELECT * FROM ${tableName}`);
      
      if (dataResult.rows.length > 0) {
        console.log(`   📝 Exporting ${dataResult.rows.length} rows`);
        sqlOutput += `\n-- Data for ${tableName}\n`;
        
        for (const row of dataResult.rows) {
          const columnNames = Object.keys(row);
          const values = columnNames.map(col => {
            const val = row[col];
            if (val === null) return 'NULL';
            if (typeof val === 'string') return `'${val.replace(/'/g, "''")}'`;
            if (typeof val === 'boolean') return val ? 'true' : 'false';
            if (val instanceof Date) return `'${val.toISOString()}'`;
            if (typeof val === 'object') return `'${JSON.stringify(val).replace(/'/g, "''")}'`;
            return val;
          });
          
          sqlOutput += `INSERT INTO ${tableName} (${columnNames.map(c => `"${c}"`).join(', ')}) VALUES (${values.join(', ')});\n`;
        }
      }
    }
    
    // Get foreign keys
    console.log('\n🔗 Exporting foreign keys...');
    const fkResult = await pool.query(`
      SELECT
        tc.table_name,
        tc.constraint_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_schema = 'public'
    `);
    
    if (fkResult.rows.length > 0) {
      sqlOutput += `\n-- Foreign Keys\n`;
      for (const fk of fkResult.rows) {
        sqlOutput += `ALTER TABLE ${fk.table_name} ADD CONSTRAINT ${fk.constraint_name} `;
        sqlOutput += `FOREIGN KEY (${fk.column_name}) REFERENCES ${fk.foreign_table_name}(${fk.foreign_column_name});\n`;
      }
    }
    
    // Get triggers
    console.log('⚡ Exporting triggers...');
    const triggerResult = await pool.query(`
      SELECT 
        trigger_name,
        event_manipulation,
        event_object_table,
        action_statement,
        action_timing
      FROM information_schema.triggers
      WHERE trigger_schema = 'public'
    `);
    
    if (triggerResult.rows.length > 0) {
      sqlOutput += `\n-- Triggers\n`;
      for (const trigger of triggerResult.rows) {
        sqlOutput += `-- Trigger: ${trigger.trigger_name} on ${trigger.event_object_table}\n`;
        sqlOutput += `CREATE TRIGGER ${trigger.trigger_name}\n`;
        sqlOutput += `  ${trigger.action_timing} ${trigger.event_manipulation}\n`;
        sqlOutput += `  ON ${trigger.event_object_table}\n`;
        sqlOutput += `  ${trigger.action_statement};\n\n`;
      }
    }
    
    // Get functions
    console.log('🔧 Exporting functions...');
    const funcResult = await pool.query(`
      SELECT 
        routine_name,
        routine_definition
      FROM information_schema.routines
      WHERE routine_schema = 'public' AND routine_type = 'FUNCTION'
    `);
    
    if (funcResult.rows.length > 0) {
      sqlOutput += `\n-- Functions\n`;
      for (const func of funcResult.rows) {
        if (func.routine_definition) {
          sqlOutput += `-- Function: ${func.routine_name}\n`;
          sqlOutput += `${func.routine_definition}\n\n`;
        }
      }
    }
    
    // Write to file
    const outputPath = path.join(__dirname, 'src', 'database', 'CRM.sql');
    fs.writeFileSync(outputPath, sqlOutput, 'utf8');
    
    console.log('\n' + '='.repeat(70));
    console.log('✅ DATABASE EXPORT COMPLETED!');
    console.log('='.repeat(70));
    console.log(`\n📊 Summary:`);
    console.log(`   ✅ Tables exported: ${tables.length}`);
    console.log(`   ✅ Foreign keys: ${fkResult.rows.length}`);
    console.log(`   ✅ Triggers: ${triggerResult.rows.length}`);
    console.log(`   ✅ Functions: ${funcResult.rows.length}`);
    console.log(`\n📁 File saved to: ${outputPath}`);
    console.log(`\n💡 Your team can now import using: node import-database.js\n`);
    
  } catch (error) {
    console.error('\n❌ Export failed:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

exportDatabase();
