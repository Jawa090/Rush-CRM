const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'CRM',
  password: 'ali980',
  port: 5432,
});

async function runMigration() {
  const client = await pool.connect();
  
  try {
    console.log('Starting migration 023: Complete Inventory System...');
    
    const migrationSQL = fs.readFileSync(
      path.join(__dirname, 'migrations', '023_complete_inventory_system.sql'),
      'utf8'
    );
    
    await client.query(migrationSQL);
    
    console.log('✓ Migration 023 completed successfully!');
    console.log('✓ Created tables: products, purchase_orders, employee_product_assignments, stock_adjustments');
    console.log('✓ Added indexes and foreign keys');
    console.log('✓ Created triggers for automatic stock tracking');
    
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration();
