# CRM Database Setup Instructions

## Quick Setup for Team Members

Follow these simple steps to set up the complete CRM database with all tables and columns:

### Prerequisites
- PostgreSQL installed and running
- Node.js installed
- Git repository cloned
- `.env` file configured with `DATABASE_URL`

### Setup Steps

1. **Pull Latest Code**
   ```bash
   git pull origin main
   ```
   
   Make sure you have all migration files (50+ files in `src/migrations/`)

2. **Check Setup Status**
   ```bash
   node check-setup-status.js
   ```
   
   This will verify:
   - Migration files are present
   - Database connection works
   - Current database status

3. **Install Dependencies**
   ```bash
   npm install
   ```

4. **Run Complete Setup**
   ```bash
   node complete-setup-for-team.js
   ```

   This will automatically:
   - Create migrations tracking table
   - Run all 50+ migration files in order
   - Create 104 tables
   - Add 1,575+ columns
   - Set up all relationships
   - Configure all indexes

5. **Start the Server**
   ```bash
   npm start
   ```

### Troubleshooting

#### Issue: "Found 2 migration files" (Expected 50+)

**Solution:**
```bash
# Pull latest code
git pull origin main

# Verify migrations folder
ls src/migrations/*.sql | wc -l
# Should show 50+

# Run setup again
node complete-setup-for-team.js
```

#### Issue: "Expected ~98 tables but found 74"

**Cause:** Some migrations failed or weren't executed

**Solution:**
```bash
# Check which migrations failed
node check-setup-status.js

# Run setup again
node complete-setup-for-team.js
```

#### Issue: Database connection failed

**Solution:**
1. Check `DATABASE_URL` in `.env` file
2. Verify PostgreSQL is running
3. Test connection:
   ```bash
   psql $DATABASE_URL -c "SELECT NOW();"
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
