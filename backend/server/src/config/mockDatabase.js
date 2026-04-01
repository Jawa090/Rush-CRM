const { v4: uuidv4 } = require('uuid');

// In-memory mock database
const db = {
  users: [
    { id: '1', email: 'admin@example.com', password: bcrypt.hashSync('admin123', 10), full_name: 'Admin User', org_id: 'org-1' },
  ],
  orgs: [
    { id: 'org-1', name: 'Default Organization', created_at: new Date().toISOString() },
  ],
  leads: [],
  deals: [],
  contacts: [],
  companies: [],
  activities: [],
  employees: [],
  attendance: [],
  leave: [],
  products: [],
  projects: [],
  tasks: [],
  workflows: [],
  marketing: { campaigns: [], lists: [], forms: [] },
};

// Mock query function
const query = async (text, params = []) => {
  // Parse basic SQL for demo purposes
  if (text.includes('SELECT') && text.includes('auth.users')) {
    const email = params[0];
    const user = db.users.find(u => u.email === email);
    return { rows: user ? [user] : [] };
  }
  
  if (text.includes('INSERT') && text.includes('auth.users')) {
    const [email, password, full_name, org_id] = params;
    const newUser = { id: uuidv4(), email, password, full_name, org_id };
    db.users.push(newUser);
    return { rows: [newUser] };
  }
  
  if (text.includes('SELECT') && text.includes('users')) {
    return { rows: db.users };
  }
  
  return { rows: [] };
};

module.exports = { query };
