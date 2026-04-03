require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// All migrations in correct order
const migrations = [
  '000_core_auth_extensions.sql',
  '001_add_vendors_and_update_contacts.sql',
  '002_fix_leads_table_structure.sql',
  '003_fix_deals_table_structure.sql',
  '004a_fix_missing_tables.sql',
  '004b_restore_missing_core_tables.sql',
  '004_create_documents_table.sql',
  '004_fix_crm_critical_issues.sql',
  '005_hrms_system.sql',
  '006_create_inventory_tables.sql',
  '007_complete_marketing_system.sql',
  '007_fix_inventory_schema.sql',
  '008_create_workflow_system.sql',
  '009_performance_indexes.sql',
  '010_add_marketing_lead_fields.sql',
  '011_add_deal_marketing_fields.sql',
  '012_create_calendar_system.sql',
  '013_create_drive_system.sql',
  '014_create_enhanced_workgroups_system.sql',
  '015_create_workgroup_features.sql',
  '016_enhance_unibox_system.sql',
  '016a_fix_employees_schema.sql',
  '017_enhance_hrms_system.sql',
  '018_add_foreign_key_constraints.sql',
  '019_simple.sql',
  '019_fix_leads_workspace_and_drives.sql',
  '019_add_workspace_lead_isolation.sql',
  '020_restore_missing_drive_and_lead_tables.sql',
  '020_enhance_employee_fields.sql',
  '021_create_employee_documents_simple.sql',
  '021_add_all_lead_fields_to_deals.sql',
  '022_professional_leave_system.sql',
  '022_fix_workflows_schema.sql',
  '023_complete_inventory_system.sql',
  '023_fix_companies_schema.sql',
  '024_fix_contacts_schema.sql',
  '024_fix_products_table_columns.sql',
  '025_add_vendor_business_type.sql',
  '025_add_industry_to_customers.sql',
  '026_fix_stock_movement_trigger.sql',
  '026_fix_vendors_schema.sql',
  '027_create_payroll_system.sql',
  '027_fix_contacts_schema_v2.sql',
  '028_complete_marketing_module.sql',
  '028_add_company_name_to_contacts.sql',
  '029_add_extended_contact_fields.sql',
  '030_fix_calendar_timezone_persistence.sql',
];

async function runAllMigrations() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Starting all migrations...\n');
    
    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;

    for (const migration of migrations) {
      const migrationPath = path.join(__dirname, '../migrations', migration);
      
      // Check if file exists
      if (!fs.existsSync(migrationPath)) {
        console.log(`⚠️  SKIP: ${migration} (file not found)`);
        skipCount++;
        continue;
      }

      try {
        const sql = fs.readFileSync(migrationPath, 'utf8');
        
        console.log(`📝 Running: ${migration}`);
        await client.query(sql);
        console.log(`✅ SUCCESS: ${migration}\n`);
        successCount++;
        
      } catch (error) {
        // Check if error is due to already existing objects
        if (
          error.message.includes('already exists') ||
          error.message.includes('duplicate key') ||
          error.code === '42P07' || // duplicate table
          error.code === '42710' || // duplicate object
          error.code === '42P16'    // invalid table definition
        ) {
          console.log(`⏭️  SKIP: ${migration} (already applied)`);
          skipCount++;
        } else {
          console.error(`❌ ERROR in ${migration}:`);
          console.error(`   ${error.message}\n`);
          errorCount++;
          // Continue with next migration instead of stopping
        }
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 MIGRATION SUMMARY:');
    console.log('='.repeat(60));
    console.log(`✅ Successful: ${successCount}`);
    console.log(`⏭️  Skipped:    ${skipCount}`);
    console.log(`❌ Errors:     ${errorCount}`);
    console.log(`📁 Total:      ${migrations.length}`);
    console.log('='.repeat(60));

    if (errorCount === 0) {
      console.log('\n🎉 All migrations completed successfully!');
    } else {
      console.log('\n⚠️  Some migrations had errors. Check logs above.');
    }

  } catch (error) {
    console.error('❌ Fatal error running migrations:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

// Run migrations
runAllMigrations();
