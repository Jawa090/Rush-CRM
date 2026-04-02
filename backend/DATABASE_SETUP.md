# 🗄️ Database Setup Guide

Complete guide to setup your CRM database with all tables and data.

## 📋 Prerequisites

1. PostgreSQL installed and running
2. Database created: `CRM`
3. Database credentials in `.env` file:
   ```
   DATABASE_URL=postgres://postgres:ali980@localhost:5432/CRM
   ```

## 🚀 Quick Setup (Recommended)

Run this single command to setup everything:

```bash
npm run setup:db
```

This will:
- ✅ Run all 50+ migrations in correct order
- ✅ Create all tables (users, employees, leads, deals, inventory, etc.)
- ✅ Seed leave types (Annual, Sick, Casual, etc.)
- ✅ Initialize employee leave balances

## 📝 Manual Setup (Alternative)

If you want to run migrations separately:

### Step 1: Run All Migrations
```bash
npm run migrate:all
```

### Step 2: Seed Leave Types
```bash
node src/seed-leave-types.js
```

### Step 3: Initialize Employee Balances
```bash
node src/initialize-employee-balances.js
```

## 🔍 What Gets Created?

### Core Tables
- `users` - User authentication
- `organizations` - Multi-tenant organizations
- `roles` & `permissions` - RBAC system

### CRM Tables
- `leads` - Lead management
- `deals` - Deal pipeline
- `contacts` - Customer contacts
- `companies` - Company records
- `activities` - Activity tracking

### HRMS Tables
- `employees` - Employee records
- `attendance` - Attendance tracking
- `leave_types` - Leave categories
- `leave_requests` - Leave applications
- `employee_leave_balances` - Leave balance tracking
- `salary_slips` - Payroll records

### Inventory Tables
- `products` - Product catalog
- `stock` - Stock levels
- `warehouses` - Warehouse management
- `vendors` - Vendor records
- `purchase_orders` - PO management
- `employee_product_assignments` - Asset tracking

### Marketing Tables
- `marketing_campaigns` - Email campaigns
- `marketing_lists` - Contact lists
- `marketing_segments` - Dynamic segments
- `marketing_forms` - Lead capture forms
- `marketing_sequences` - Email automation

### Collaboration Tables
- `calendar_events` - Calendar system
- `drive_files` - File storage
- `workgroups` - Team collaboration
- `unibox_messages` - Unified inbox

## ⚠️ Troubleshooting

### Error: "relation already exists"
This is normal! The script skips already created tables.

### Error: "password authentication failed"
Check your `.env` file and ensure database password is correct.

### Error: "database does not exist"
Create the database first:
```sql
CREATE DATABASE "CRM";
```

## 🔄 Reset Database (Careful!)

To start fresh (WARNING: Deletes all data):

```sql
DROP DATABASE "CRM";
CREATE DATABASE "CRM";
```

Then run:
```bash
npm run setup:db
```

## 📊 Verify Setup

Check if tables were created:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

You should see 50+ tables!

## 🎉 Done!

Your database is ready. Start the server:
```bash
npm run dev
```

Server will run on: http://localhost:3000
