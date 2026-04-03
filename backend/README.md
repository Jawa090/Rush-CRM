# 🏢 CRM System - Backend

Professional enterprise CRM system with HRMS, Inventory, Project Management, and Collaboration features.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your database credentials

# Import database
psql -U postgres -d your_database -f database-dump.sql

# Start development server
npm run dev
```

## 📋 Available Scripts

```bash
npm run dev          # Start development server with nodemon
npm start            # Start production server
npm run export-db    # Export database to SQL file
```

## 🗄️ Database Setup

### Option 1: Import Complete Database (Recommended)
```bash
psql -U postgres -d crm_database -f database-dump.sql
```

### Option 2: Run Migrations (Legacy)
```bash
node src/database/run-migrations.js
```

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/              # Configuration files
│   │   ├── database.js      # Database connection
│   │   └── mockDatabase.js  # Mock DB for testing
│   │
│   ├── controllers/         # Business logic
│   │   ├── auth/           # Authentication & authorization
│   │   ├── crm/            # CRM (leads, deals, contacts)
│   │   ├── hrms/           # HR management
│   │   ├── inventory/      # Inventory & products
│   │   ├── projects/       # Project management
│   │   ├── collaboration/  # Workgroups, calendar, drive
│   │   ├── automation/     # Workflows & notifications
│   │   └── payroll/        # Payroll management
│   │
│   ├── middleware/         # Express middleware
│   │   ├── auth.js        # Authentication middleware
│   │   └── errorHandler.js # Error handling
│   │
│   ├── routes/            # API routes
│   │   ├── auth/
│   │   ├── crm/
│   │   ├── hrms/
│   │   ├── inventory/
│   │   ├── projects/
│   │   ├── collaboration/
│   │   ├── automation/
│   │   └── payroll/
│   │
│   ├── migrations/        # Database migrations (legacy)
│   ├── database/          # Database utilities
│   ├── app.js            # Express app setup
│   └── server.js         # Server entry point
│
├── database-dump.sql     # Complete database export
├── .env                  # Environment variables
├── .env.example          # Environment template
├── package.json
└── README.md
```

## 🔧 Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/database

# JWT
JWT_SECRET=your-secret-key

# Server
PORT=3000
NODE_ENV=development

# Email (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

## 🗃️ Database Modules

### Core System
- **Organizations**: Multi-tenant support
- **Users**: User management with roles
- **Roles & Permissions**: RBAC system

### CRM Module
- Leads management with pipeline stages
- Deals & opportunities tracking
- Contacts & companies
- Activities & notes
- Marketing campaigns
- Lead imports & external sources

### HRMS Module
- Employee management
- Attendance tracking
- Leave management (4 types: Annual, Sick, Casual, Unpaid)
- Employee documents
- Salary slips
- Notifications

### Inventory Module
- Products & SKU management
- Stock tracking across warehouses
- Vendors management
- Purchase orders
- Stock movements & adjustments
- Employee product assignments
- Invoices

### Project Management
- Projects & milestones
- Tasks with assignments
- Time tracking
- Documents & attachments
- Risk management
- Activity logs

### Collaboration
- Workgroups & teams
- Shared calendar
- Drive & file management
- Unibox (unified inbox)
- Wiki & knowledge base
- Notifications

### Automation
- Workflow automation
- Email templates
- Notification system

### Payroll
- Salary management
- Payroll processing

## 🔐 Authentication

The system uses JWT-based authentication with the following endpoints:

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

All protected routes require `Authorization: Bearer <token>` header.

## 📊 API Endpoints

### CRM
- `/api/leads` - Lead management
- `/api/deals` - Deal management
- `/api/contacts` - Contact management
- `/api/companies` - Company management
- `/api/activities` - Activity tracking
- `/api/marketing/*` - Marketing campaigns

### HRMS
- `/api/hrms/employees` - Employee management
- `/api/hrms/attendance/*` - Attendance tracking
- `/api/hrms/leave-requests` - Leave management
- `/api/hrms/leave-types` - Leave types
- `/api/hrms/notifications` - HR notifications

### Inventory
- `/api/products` - Product management
- `/api/stock` - Stock management
- `/api/warehouses` - Warehouse management
- `/api/vendors` - Vendor management
- `/api/purchase-orders` - Purchase orders
- `/api/inventory/*` - Inventory operations

### Projects
- `/api/projects` - Project management
- `/api/tasks` - Task management
- `/api/projects/milestones` - Milestones
- `/api/projects/time-entries` - Time tracking
- `/api/projects/documents` - Documents
- `/api/projects/risks` - Risk management

### Collaboration
- `/api/workgroups` - Workgroup management
- `/api/calendar` - Calendar events
- `/api/drive` - File management
- `/api/unibox` - Unified inbox

## 🛠️ Development

### Adding New Features

1. Create controller in `src/controllers/`
2. Create routes in `src/routes/`
3. Register routes in `src/app.js`
4. Add database tables if needed

### Database Changes

For production, always use migrations or update the `database-dump.sql` file.

## 🐛 Debugging

Enable debug logs:
```bash
DEBUG=* npm run dev
```

## 📦 Dependencies

- **express** - Web framework
- **pg** - PostgreSQL client
- **jsonwebtoken** - JWT authentication
- **bcryptjs** - Password hashing
- **joi** - Input validation
- **dotenv** - Environment variables
- **nodemailer** - Email sending
- **socket.io** - Real-time features

## 🔒 Security

- Passwords hashed with bcrypt
- JWT tokens for authentication
- Input validation with Joi
- SQL injection protection with parameterized queries
- CORS configured
- Rate limiting (recommended for production)

## 📈 Performance

- Database indexes on frequently queried columns
- Connection pooling
- Efficient queries with proper JOINs
- Pagination on list endpoints

## 🚀 Deployment

1. Set `NODE_ENV=production`
2. Use strong `JWT_SECRET`
3. Enable SSL for database
4. Configure proper CORS origins
5. Use process manager (PM2)
6. Setup reverse proxy (Nginx)
7. Enable database backups

## 📝 License

Proprietary - Internal Use Only
