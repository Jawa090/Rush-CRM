require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/auth');
const leadRoutes = require('./routes/leads');
const leadImportRoutes = require('./routes/leadImport');
const leadExternalSourceRoutes = require('./routes/leadExternalSource');
const leadWorkspaceRoutes = require('./routes/leadWorkspace');
const dealRoutes = require('./routes/deals');
const contactRoutes = require('./routes/contacts');
const companyRoutes = require('./routes/companies');
const customerRoutes = require('./routes/customers');
const activityRoutes = require('./routes/activities');
const employeeRoutes = require('./routes/employees');
const attendanceRoutes = require('./routes/attendance');
const leaveRoutes = require('./routes/leave');
const productRoutes = require('./routes/products');
const stockRoutes = require('./routes/stock');
const vendorRoutes = require('./routes/vendors');
const documentsRoutes = require('./routes/documents');
const warehouseRoutes = require('./routes/warehouses');
const purchaseOrderRoutes = require('./routes/purchaseOrders');
const projectRoutes = require('./routes/projects');
const taskRoutes = require('./routes/tasks');
const workgroupRoutes = require('./routes/workgroups');
const workgroupFilesRoutes = require('./routes/workgroupFiles');
const workgroupWikiRoutes = require('./routes/workgroupWiki');
const workgroupNotificationsRoutes = require('./routes/workgroupNotifications');
const userRoutes = require('./routes/users');
const roleRoutes = require('./routes/roles');
const permissionRoutes = require('./routes/permissions');
const orgRoutes = require('./routes/organizations');
const calendarRoutes = require('./routes/calendar');
const workflowRoutes = require('./routes/workflows');
const marketingRoutes = require('./routes/marketing');
const driveRoutes = require('./routes/drive');
const driveIntegrationRoutes = require('./routes/driveIntegrations');
const emailSyncRoutes = require('./routes/emailSync');
const integrationRoutes = require('./routes/integrations');
const milestonesRoutes = require('./routes/milestones');
const timeEntriesRoutes = require('./routes/timeEntries');
const risksRoutes = require('./routes/risks');
const invoicesRoutes = require('./routes/invoices');
const notificationsRoutes = require('./routes/notifications');
const templatesRoutes = require('./routes/templates');
const uniboxRoutes = require('./routes/unibox');
const signingPartyRoutes = require('./routes/signingParties');
const hrmsRoutes = require('./routes/hrms');
const hrmsNotificationsRoutes = require('./routes/hrmsNotifications');
const inventoryRoutes = require('./routes/inventory');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(helmet());
app.use(cors({
  origin: true, // Allow all origins in development
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Increased from 100 to 1000 requests per window
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

app.use('/api/auth', authRoutes);
app.use('/api/lead-import', leadImportRoutes);
app.use('/api/lead-external-sources', leadExternalSourceRoutes);
app.use('/api/lead-workspace', leadWorkspaceRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/deals', dealRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/leave', leaveRoutes);
app.use('/api/payroll', require('./routes/payroll'));
app.use('/api/products', productRoutes);
app.use('/api/stock', stockRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/documents', documentsRoutes);
app.use('/api/warehouses', warehouseRoutes);
app.use('/api/purchase-orders', purchaseOrderRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/workgroups', workgroupRoutes);
app.use('/api/workgroups', workgroupFilesRoutes);
app.use('/api/workgroups', workgroupWikiRoutes);
app.use('/api/workgroups', workgroupNotificationsRoutes);
app.use('/api/users', userRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/permissions', permissionRoutes);
app.use('/api/organizations', orgRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/workflows', workflowRoutes);
app.use('/api/marketing', marketingRoutes);
app.use('/api/drive', driveRoutes);
app.use('/api/drives/integrations', driveIntegrationRoutes);
app.use('/api/email', emailSyncRoutes);
app.use('/api/integrations', integrationRoutes);
app.use('/api/milestones', milestonesRoutes);
app.use('/api/time-entries', timeEntriesRoutes);
app.use('/api/risks', risksRoutes);
app.use('/api/invoices', invoicesRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/templates', templatesRoutes);
app.use('/api/unibox', uniboxRoutes);
app.use('/api/signing-parties', signingPartyRoutes);
app.use('/api/hrms', hrmsRoutes);
app.use('/api/hrms/notifications', hrmsNotificationsRoutes);
app.use('/api/inventory', inventoryRoutes);

// Telephony providers
app.get('/api/telephony/providers', require('./middleware/auth').auth, require('./middleware/auth').requireOrg, async (req, res, next) => {
  try {
    const { rows } = await require('./config/database').query(
      'SELECT * FROM telephony_providers WHERE org_id = $1 ORDER BY provider_name',
      [req.user.orgId]
    );
    res.json(rows);
  } catch (err) { next(err); }
});
app.patch('/api/telephony/providers/:id', require('./middleware/auth').auth, require('./middleware/auth').requireOrg, async (req, res, next) => {
  try {
    const { is_enabled } = req.body;
    const { rows } = await require('./config/database').query(
      'UPDATE telephony_providers SET is_enabled = $1 WHERE id = $2 AND org_id = $3 RETURNING *',
      [is_enabled, req.params.id, req.user.orgId]
    );
    res.json(rows[0]);
  } catch (err) { next(err); }
});

// Project comments moved to projects router (routes/projects.js)
app.get('/api/projects/report/:token', require('./middleware/auth').auth, require('./middleware/auth').requireOrg, async (req, res, next) => {
  try {
    const projectId = req.params.token; // treating token as project id for now
    const db = require('./config/database');
    const { rows: projectRows } = await db.query('SELECT * FROM public.projects WHERE id = $1 AND org_id = $2', [projectId, req.user.orgId]);
    if (!projectRows.length) return res.status(404).json({ error: 'Project not found' });
    const project = projectRows[0];
    const { rows: taskRows } = await db.query('SELECT * FROM public.tasks WHERE project_id = $1 AND org_id = $2 ORDER BY sort_order ASC', [projectId, req.user.orgId]);
    res.json({ project, milestones: [], tasks: taskRows, permissions: { canEdit: true } });
  } catch (err) { next(err); }
});

// Instantly integration placeholder: return clear error instead of mock
app.post('/api/integrations/instantly', require('./middleware/auth').auth, require('./middleware/auth').requireOrg, async (req, res) => {
  res.status(501).json({ error: 'Instantly integration not implemented. Configure integration service or remove this call.' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use(errorHandler);

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`CRM Server running on port ${PORT}`);
});

module.exports = app;
