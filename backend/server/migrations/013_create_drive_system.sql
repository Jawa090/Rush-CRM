-- Create drive system tables

-- Drive folders table
CREATE TABLE IF NOT EXISTS drive_folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  created_by UUID REFERENCES users(id),
  name VARCHAR(255) NOT NULL,
  parent_folder_id UUID REFERENCES drive_folders(id) ON DELETE CASCADE,
  color VARCHAR(50) DEFAULT 'folder-blue',
  path TEXT NOT NULL, -- Full path for easy navigation
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Drive files table
CREATE TABLE IF NOT EXISTS drive_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  created_by UUID REFERENCES users(id),
  folder_id UUID REFERENCES drive_folders(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  file_type VARCHAR(100),
  file_size BIGINT DEFAULT 0,
  mime_type VARCHAR(255),
  file_path TEXT, -- Path to actual file on disk/cloud
  file_url TEXT, -- Public URL if available
  is_deleted BOOLEAN DEFAULT false,
  deleted_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Drive file versions table (for version control)
CREATE TABLE IF NOT EXISTS drive_file_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_id UUID REFERENCES drive_files(id) ON DELETE CASCADE,
  version_number INTEGER DEFAULT 1,
  file_path TEXT,
  file_size BIGINT DEFAULT 0,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Drive file shares table
CREATE TABLE IF NOT EXISTS drive_file_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_id UUID REFERENCES drive_files(id) ON DELETE CASCADE,
  folder_id UUID REFERENCES drive_folders(id) ON DELETE CASCADE,
  shared_by UUID REFERENCES users(id),
  shared_with UUID REFERENCES users(id),
  permission VARCHAR(50) DEFAULT 'view', -- 'view', 'edit', 'admin'
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Drive recent activity table
CREATE TABLE IF NOT EXISTS drive_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  file_id UUID REFERENCES drive_files(id) ON DELETE CASCADE,
  folder_id UUID REFERENCES drive_folders(id) ON DELETE CASCADE,
  activity_type VARCHAR(100) NOT NULL, -- 'created', 'updated', 'deleted', 'shared', 'downloaded'
  activity_data JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_drive_folders_org ON drive_folders(org_id);
CREATE INDEX IF NOT EXISTS idx_drive_folders_parent ON drive_folders(parent_folder_id);
CREATE INDEX IF NOT EXISTS idx_drive_folders_path ON drive_folders(path);
CREATE INDEX IF NOT EXISTS idx_drive_files_org ON drive_files(org_id);
CREATE INDEX IF NOT EXISTS idx_drive_files_folder ON drive_files(folder_id);
CREATE INDEX IF NOT EXISTS idx_drive_files_created_by ON drive_files(created_by);
CREATE INDEX IF NOT EXISTS idx_drive_files_deleted ON drive_files(is_deleted);
CREATE INDEX IF NOT EXISTS idx_drive_file_versions_file ON drive_file_versions(file_id);
CREATE INDEX IF NOT EXISTS idx_drive_file_shares_file ON drive_file_shares(file_id);
CREATE INDEX IF NOT EXISTS idx_drive_file_shares_user ON drive_file_shares(shared_with);
CREATE INDEX IF NOT EXISTS idx_drive_activities_org ON drive_activities(org_id);
CREATE INDEX IF NOT EXISTS idx_drive_activities_user ON drive_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_drive_activities_created_at ON drive_activities(created_at);