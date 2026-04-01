-- Performance optimization indexes for CRM system

-- Leads table indexes
CREATE INDEX IF NOT EXISTS idx_leads_org_id ON leads(org_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_company_name ON leads(company_name);

-- Deals table indexes
CREATE INDEX IF NOT EXISTS idx_deals_org_id ON deals(org_id);
CREATE INDEX IF NOT EXISTS idx_deals_stage ON deals(stage);
CREATE INDEX IF NOT EXISTS idx_deals_status ON deals(status);
CREATE INDEX IF NOT EXISTS idx_deals_created_at ON deals(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_deals_value ON deals(value DESC);
CREATE INDEX IF NOT EXISTS idx_deals_contact_id ON deals(contact_id);
CREATE INDEX IF NOT EXISTS idx_deals_company_id ON deals(company_id);

-- Contacts table indexes
CREATE INDEX IF NOT EXISTS idx_contacts_org_id ON contacts(org_id);
CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email);
CREATE INDEX IF NOT EXISTS idx_contacts_company_id ON contacts(company_id);
CREATE INDEX IF NOT EXISTS idx_contacts_created_at ON contacts(created_at DESC);

-- Companies table indexes
CREATE INDEX IF NOT EXISTS idx_companies_org_id ON companies(org_id);
CREATE INDEX IF NOT EXISTS idx_companies_name ON companies(name);
CREATE INDEX IF NOT EXISTS idx_companies_industry ON companies(industry);
CREATE INDEX IF NOT EXISTS idx_companies_created_at ON companies(created_at DESC);

-- Activities table indexes
CREATE INDEX IF NOT EXISTS idx_activities_org_id ON activities(org_id);
CREATE INDEX IF NOT EXISTS idx_activities_entity_type ON activities(entity_type);
CREATE INDEX IF NOT EXISTS idx_activities_entity_id ON activities(entity_id);
CREATE INDEX IF NOT EXISTS idx_activities_created_at ON activities(created_at DESC);

-- Users table indexes
CREATE INDEX IF NOT EXISTS idx_users_org_id ON users(org_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_leads_org_status_created ON leads(org_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_deals_org_stage_value ON deals(org_id, stage, value DESC);
CREATE INDEX IF NOT EXISTS idx_contacts_org_company ON contacts(org_id, company_id);

-- Update table statistics for better query planning
ANALYZE leads;
ANALYZE deals;
ANALYZE contacts;
ANALYZE companies;
ANALYZE activities;
ANALYZE users;