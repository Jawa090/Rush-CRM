require('dotenv').config();
const { Pool } = require('pg');
const { execSync } = require('child_process');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function setupCompleteDatabase() {
  console.log('🚀 Starting Complete Database Setup...\n');
  
  try {
    // Step 1: Run all migrations
    console.log('📝 Step 1: Running all migrations...');
    execSync('node src/run-all-migrations.js', { stdio: 'inherit' });
    
    // Step 2: Seed leave types
    console.log('\n📝 Step 2: Seeding leave types...');
    const client = await pool.connect();
    
    try {
      const leaveTypes = [
        { name: 'Annual Leave', days_per_year: 20, is_paid: true, color: '#3b82f6' },
        { name: 'Sick Leave', days_per_year: 10, is_paid: true, color: '#ef4444' },
        { name: 'Casual Leave', days_per_year: 7, is_paid: true, color: '#10b981' },
        { name: 'Unpaid Leave', days_per_year: 0, is_paid: false, color: '#6b7280' },
        { name: 'Maternity Leave', days_per_year: 90, is_paid: true, color: '#ec4899' },
        { name: 'Paternity Leave', days_per_year: 14, is_paid: true, color: '#8b5cf6' },
      ];

      for (const type of leaveTypes) {
        await client.query(
          `INSERT INTO leave_types (name, days_per_year, is_paid, color)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT (name) DO NOTHING`,
          [type.name, type.days_per_year, type.is_paid, type.color]
        );
      }
      
      console.log('✅ Leave types seeded successfully!');
      
      // Step 3: Initialize employee leave balances
      console.log('\n📝 Step 3: Initializing employee leave balances...');
      
      const result = await client.query(`
        INSERT INTO employee_leave_balances (employee_id, leave_type_id, year, total_days, used_days, remaining_days)
        SELECT 
          e.id,
          lt.id,
          EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER,
          lt.days_per_year,
          0,
          lt.days_per_year
        FROM employees e
        CROSS JOIN leave_types lt
        WHERE NOT EXISTS (
          SELECT 1 FROM employee_leave_balances elb
          WHERE elb.employee_id = e.id 
          AND elb.leave_type_id = lt.id 
          AND elb.year = EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER
        )
      `);
      
      console.log(`✅ Initialized leave balances for ${result.rowCount} employee-leave type combinations!`);
      
    } finally {
      client.release();
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('🎉 DATABASE SETUP COMPLETE!');
    console.log('='.repeat(60));
    console.log('✅ All migrations applied');
    console.log('✅ Leave types seeded');
    console.log('✅ Employee leave balances initialized');
    console.log('='.repeat(60));
    console.log('\n🚀 Your CRM database is ready to use!');
    
  } catch (error) {
    console.error('❌ Error during database setup:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

setupCompleteDatabase();
