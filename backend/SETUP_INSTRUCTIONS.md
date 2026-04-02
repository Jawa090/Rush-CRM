# CRM Database Setup Instructions

## Quick Setup for Team Members

Follow these simple steps to set up the complete CRM database with all tables and columns:

### Prerequisites
- PostgreSQL installed and running
- Node.js installed
- `.env` file configured with `DATABASE_URL`

### Setup Steps

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Run Complete Setup**
   ```bash
   node complete-setup-for-team.js
   ```

   This will automatically:
   - Create migrations tracking table
   - Run all 47 migration files in order
   - Create all 98 tables
   - Add all 1,370+ columns
   - Set up all relationships
   - Configure all indexes
   - Verify the setup

3. **Start the Server**
   ```bash
   npm start
   ```

### What Gets Created

#### CRM Module (6 tables)
- **contacts** (48 columns) - Customer contacts with full details
- **companies** (25 columns) - Company information
- **leads** (63 columns) - Lead management with tracking
- **deals** (65 columns) - Deal pipeline management
- **crm_activities** (10 columns) - Activity logging
- **deal_contacts** (8 columns) - Deal-contact relationships

#### HRMS Module (15 tables)
- employees, attendance, leave_requests, leave_types, payroll, etc.

#### Inventory Module (11 tables)
- products, warehouses, stock, vendors, purchase_orders, invoices, etc.

#### Marketing Module (19 tables)
- marketing_campaigns, marketing_lists, marketing_forms, etc.

#### Collaboration Module
- drive_folders, drive_files, calendar_events, workgroups, etc.

#### Projects Module
- projects, tasks, milestones, time_entries, etc.

### Verification

After running migrations, verify everything is set up:

```bash
# Check database connection
node src/database/setup.js

# Start server and test endpoints
npm start
```

### Common Endpoints to Test

- `GET /api/contacts` - List contacts
- `GET /api/companies` - List companies
- `GET /api/leads` - List leads
- `GET /api/deals` - List deals
- `GET /api/employees` - List employees
- `GET /api/products` - List products

### Troubleshooting

If you encounter any issues:

1. **Check database connection**
   - Verify `DATABASE_URL` in `.env`
   - Ensure PostgreSQL is running

2. **Reset migrations** (if needed)
   ```sql
   DROP TABLE IF EXISTS migrations CASCADE;
   ```
   Then run migrations again.

3. **Check logs**
   - Server logs will show any missing columns or tables
   - Migration script shows progress

### Database Statistics

- Total Tables: 98
- Total Columns: 1,370+
- All tables have: `org_id`, `created_at`, `updated_at`
- UUID primary keys throughout
- Full multi-tenancy support

### Migration Files

All migrations are in `src/migrations/` folder:
- `000_*.sql` - Core setup
- `001-029_*.sql` - Module-specific migrations
- `030_*.sql` - Complete CRM columns fix

Migrations run in order and track completion automatically.

---

**Ready to go!** Just run `node src/database/run-migrations.js` and everything will be set up automatically.
