# 🚀 CRM System - Setup Guide for Team Members

## 📋 Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- Git

## 🔧 Quick Setup (Recommended)

### Step 1: Clone & Install Dependencies

```bash
# Clone the repository
git clone <repository-url>
cd CRM

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Step 2: Setup Database

```bash
# Create a new PostgreSQL database
createdb crm_database

# Or using psql
psql -U postgres
CREATE DATABASE crm_database;
\q
```

### Step 3: Import Database

```bash
cd backend

# Import the complete database dump
psql -U postgres -d crm_database -f database-dump.sql
```

### Step 4: Configure Environment

Create `backend/.env` file:

```env
# Database
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/crm_database

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Server
PORT=3000
NODE_ENV=development

# Email (Optional - for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

Create `frontend/.env` file:

```env
VITE_API_URL=http://localhost:3000/api
```

### Step 5: Start the Application

```bash
# Terminal 1 - Start Backend
cd backend
npm run dev

# Terminal 2 - Start Frontend
cd frontend
npm run dev
```

### Step 6: Login

Open browser: `http://localhost:5173`

**Admin Credentials:**
- Email: `admin@example.com`
- Password: `admin123`

---

## 📁 Project Structure

```
CRM/
├── backend/
│   ├── src/
│   │   ├── config/          # Database & app configuration
│   │   ├── controllers/     # Business logic
│   │   │   ├── auth/        # Authentication & authorization
│   │   │   ├── crm/         # CRM module (leads, deals, contacts)
│   │   │   ├── hrms/        # HR management
│   │   │   ├── inventory/   # Inventory & products
│   │   │   ├── projects/    # Project management
│   │   │   ├── collaboration/ # Workgroups, calendar, drive
│   │   │   ├── automation/  # Workflows & notifications
│   │   │   └── payroll/     # Payroll management
│   │   ├── middleware/      # Auth & error handling
│   │   ├── routes/          # API routes
│   │   ├── migrations/      # Database migrations (legacy)
│   │   ├── app.js           # Express app setup
│   │   └── server.js        # Server entry point
│   ├── database-dump.sql    # Complete database export
│   ├── .env                 # Environment variables
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/      # Reusable UI components
    │   ├── pages/           # Page components
    │   ├── services/        # API services
    │   ├── hooks/           # Custom React hooks
    │   ├── utils/           # Helper functions
    │   └── App.tsx          # Main app component
    ├── .env                 # Frontend environment
    └── package.json
```

---

## 🗄️ Database Schema

The system includes the following modules:

### Core Modules
- **Authentication**: Users, roles, permissions, organizations
- **CRM**: Leads, deals, contacts, companies, activities
- **HRMS**: Employees, attendance, leave management
- **Inventory**: Products, stock, warehouses, vendors
- **Projects**: Tasks, milestones, time tracking
- **Collaboration**: Workgroups, calendar, drive, unibox
- **Automation**: Workflows, notifications, templates
- **Payroll**: Salary management

### Key Tables
- 104 tables total
- 1,575+ columns
- Proper foreign key relationships
- Indexes for performance

---

## 🔄 Alternative Setup (Using Migrations - Not Recommended)

If you want to use migrations instead of the dump file:

```bash
cd backend
node src/database/run-migrations.js
```

**Note:** Using `database-dump.sql` is recommended as it includes all data and is tested.

---

## 🐛 Troubleshooting

### Database Connection Error
```bash
# Check if PostgreSQL is running
pg_isready

# Check connection
psql -U postgres -d crm_database
```

### Port Already in Use
```bash
# Kill process on port 3000 (backend)
npx kill-port 3000

# Kill process on port 5173 (frontend)
npx kill-port 5173
```

### Missing Tables
```bash
# Re-import database
psql -U postgres -d crm_database -f database-dump.sql
```

---

## 📚 API Documentation

Base URL: `http://localhost:3000/api`

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout

### CRM
- `GET /api/leads` - Get all leads
- `POST /api/leads` - Create lead
- `GET /api/deals` - Get all deals
- `GET /api/contacts` - Get all contacts

### HRMS
- `GET /api/hrms/employees` - Get employees
- `POST /api/hrms/attendance/clock-in` - Clock in
- `GET /api/hrms/leave-requests` - Get leave requests

### Inventory
- `GET /api/products` - Get products
- `GET /api/stock` - Get stock levels
- `GET /api/warehouses` - Get warehouses

---

## 🔐 Security Notes

1. Change `JWT_SECRET` in production
2. Use strong database passwords
3. Enable SSL for database connections in production
4. Set `NODE_ENV=production` in production
5. Configure CORS properly for production

---

## 📞 Support

For issues or questions, contact the development team.

---

## 📝 License

Proprietary - Internal Use Only
