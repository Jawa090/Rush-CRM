const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'CRM',
  password: 'ali980',
  port: 5432,
});

const defaultLeaveTypes = [
  {
    name: 'Annual Leave',
    code: 'AL',
    description: 'Paid annual vacation leave',
    color: '#3B82F6',
    days_allowed: 20,
    is_paid: true,
    requires_approval: true,
    can_carry_forward: true,
    max_carry_forward_days: 5,
  },
  {
    name: 'Sick Leave',
    code: 'SL',
    description: 'Medical or health-related leave',
    color: '#EF4444',
    days_allowed: 10,
    is_paid: true,
    requires_approval: false,
    can_carry_forward: false,
  },
  {
    name: 'Casual Leave',
    code: 'CL',
    description: 'Short-term personal leave',
    color: '#10B981',
    days_allowed: 7,
    is_paid: true,
    requires_approval: true,
    can_carry_forward: false,
  },
  {
    name: 'Unpaid Leave',
    code: 'UL',
    description: 'Leave without pay',
    color: '#6B7280',
    days_allowed: 30,
    is_paid: false,
    requires_approval: true,
    can_carry_forward: false,
  },
  {
    name: 'Maternity Leave',
    code: 'ML',
    description: 'Maternity leave for female employees',
    color: '#EC4899',
    days_allowed: 90,
    is_paid: true,
    requires_approval: true,
    can_carry_forward: false,
    applicable_to: 'female',
  },
  {
    name: 'Paternity Leave',
    code: 'PL',
    description: 'Paternity leave for male employees',
    color: '#8B5CF6',
    days_allowed: 7,
    is_paid: true,
    requires_approval: true,
    can_carry_forward: false,
    applicable_to: 'male',
  },
];

async function seedLeaveTypes() {
  const client = await pool.connect();
  
  try {
    console.log('🌱 Seeding default leave types...\n');

    // Get all organizations
    const orgsResult = await client.query('SELECT id, name FROM organizations');
    const organizations = orgsResult.rows;

    if (organizations.length === 0) {
      console.log('❌ No organizations found. Please create an organization first.');
      return;
    }

    console.log(`Found ${organizations.length} organization(s):\n`);

    for (const org of organizations) {
      console.log(`📋 Organization: ${org.name} (${org.id})`);

      // Check if leave types already exist
      const existingTypes = await client.query(
        'SELECT COUNT(*) FROM leave_types WHERE org_id = $1',
        [org.id]
      );

      if (parseInt(existingTypes.rows[0].count) > 0) {
        console.log(`   ⚠️  Already has ${existingTypes.rows[0].count} leave type(s). Skipping...\n`);
        continue;
      }

      // Insert default leave types
      for (const leaveType of defaultLeaveTypes) {
        await client.query(
          `INSERT INTO leave_types (
            org_id, name, code, description, color, days_allowed,
            is_paid, requires_approval, can_carry_forward, 
            max_carry_forward_days, applicable_to
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
          [
            org.id,
            leaveType.name,
            leaveType.code,
            leaveType.description,
            leaveType.color,
            leaveType.days_allowed,
            leaveType.is_paid,
            leaveType.requires_approval,
            leaveType.can_carry_forward,
            leaveType.max_carry_forward_days || 0,
            leaveType.applicable_to || 'all',
          ]
        );
        console.log(`   ✅ Created: ${leaveType.name} (${leaveType.code}) - ${leaveType.days_allowed} days`);
      }

      console.log(`   🎉 Successfully created ${defaultLeaveTypes.length} leave types!\n`);
    }

    console.log('✅ Seeding completed successfully!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

seedLeaveTypes().catch(console.error);
