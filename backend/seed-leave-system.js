const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

console.log('\n🌱 SEEDING LEAVE SYSTEM...\n');
console.log('='.repeat(70));

async function seedLeaveSystem() {
  try {
    // Step 1: Create Leave Types
    console.log('\n📋 Step 1: Creating leave types...\n');
    
    const leaveTypes = [
      { name: 'Annual Leave', days: 20, color: '#3b82f6' },
      { name: 'Sick Leave', days: 10, color: '#ef4444' },
      { name: 'Casual Leave', days: 12, color: '#10b981' },
      { name: 'Unpaid Leave', days: 0, color: '#6b7280' },
    ];
    
    const orgResult = await pool.query('SELECT id FROM organizations LIMIT 1');
    const orgId = orgResult.rows[0]?.id;
    
    for (const type of leaveTypes) {
      await pool.query(`
        INSERT INTO leave_types (org_id, name, code, days_allowed, color, is_paid, requires_approval)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT DO NOTHING
      `, [orgId, type.name, type.name.toUpperCase().replace(/ /g, '_'), type.days, type.color, type.days > 0, true]);
      
      console.log(`✅ ${type.name} - ${type.days} days`);
    }
    
    // Step 2: Assign leave balances to all employees
    console.log('\n📋 Step 2: Assigning leave balances to employees...\n');
    
    const employees = await pool.query('SELECT id, org_id FROM employees');
    const leaveTypesResult = await pool.query('SELECT id, name, days_allowed FROM leave_types');
    
    let assignedCount = 0;
    
    for (const employee of employees.rows) {
      for (const leaveType of leaveTypesResult.rows) {
        await pool.query(`
          INSERT INTO employee_leave_balances (
            org_id, employee_id, leave_type_id, 
            total_allocated, used, remaining, year
          )
          VALUES ($1, $2, $3, $4, 0, $4, EXTRACT(YEAR FROM CURRENT_DATE))
          ON CONFLICT (employee_id, leave_type_id, year) DO NOTHING
        `, [employee.org_id, employee.id, leaveType.id, leaveType.days_allowed]);
        
        assignedCount++;
      }
    }
    
    console.log(`✅ Assigned leave balances to ${employees.rows.length} employees`);
    console.log(`   Total assignments: ${assignedCount}`);
    
    console.log('\n' + '='.repeat(70));
    console.log('🎉 LEAVE SYSTEM SEEDED SUCCESSFULLY!');
    console.log('='.repeat(70));
    console.log(`\n✅ Created ${leaveTypes.length} leave types`);
    console.log(`✅ Assigned balances to ${employees.rows.length} employees\n`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

seedLeaveSystem();
