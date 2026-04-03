const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'CRM',
  password: 'ali980',
  port: 5432,
});

async function initializeBalances() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Initializing employee leave balances...\n');

    const year = new Date().getFullYear();

    // Get all active employees
    const employeesResult = await client.query(
      `SELECT e.id, e.first_name, e.last_name, e.org_id, o.name as org_name
       FROM employees e
       JOIN organizations o ON e.org_id = o.id
       WHERE e.status = 'active'
       ORDER BY o.name, e.first_name`
    );

    const employees = employeesResult.rows;

    if (employees.length === 0) {
      console.log('❌ No active employees found.');
      return;
    }

    console.log(`Found ${employees.length} active employee(s)\n`);

    let totalInitialized = 0;
    let currentOrg = null;

    for (const employee of employees) {
      if (currentOrg !== employee.org_name) {
        if (currentOrg) console.log('');
        currentOrg = employee.org_name;
        console.log(`📋 Organization: ${employee.org_name}`);
      }

      // Get leave types for this org
      const leaveTypesResult = await client.query(
        'SELECT * FROM leave_types WHERE org_id = $1 AND is_active = true',
        [employee.org_id]
      );

      const leaveTypes = leaveTypesResult.rows;

      if (leaveTypes.length === 0) {
        console.log(`   ⚠️  ${employee.first_name} ${employee.last_name} - No leave types found for organization`);
        continue;
      }

      let employeeInitialized = 0;

      for (const leaveType of leaveTypes) {
        // Check if balance already exists
        const existingBalance = await client.query(
          `SELECT id FROM employee_leave_balances
           WHERE employee_id = $1 AND leave_type_id = $2 AND year = $3`,
          [employee.id, leaveType.id, year]
        );

        if (existingBalance.rows.length > 0) {
          continue; // Skip if already exists
        }

        // Create balance
        await client.query(
          `INSERT INTO employee_leave_balances (
            employee_id, leave_type_id, org_id, year, total_allocated
          ) VALUES ($1, $2, $3, $4, $5)`,
          [employee.id, leaveType.id, employee.org_id, year, leaveType.days_allowed]
        );

        employeeInitialized++;
        totalInitialized++;
      }

      if (employeeInitialized > 0) {
        console.log(`   ✅ ${employee.first_name} ${employee.last_name} - Initialized ${employeeInitialized} leave type(s)`);
      } else {
        console.log(`   ⏭️  ${employee.first_name} ${employee.last_name} - Already initialized`);
      }
    }

    console.log(`\n🎉 Successfully initialized ${totalInitialized} leave balance(s) for year ${year}!`);
  } catch (error) {
    console.error('❌ Initialization failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

initializeBalances().catch(console.error);
