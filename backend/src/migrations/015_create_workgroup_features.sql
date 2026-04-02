-- Migration: Create workgroup features (files, wiki, notifications)
-- Created: 2024-03-30

-- Workgroup Files Table
CREATE TABLE IF NOT EXISTS workgroup_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workgroup_id UUID NOT NULL REFERENCES workgroups(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_size BIGINT NOT NULL,
    file_type VARCHAR(100),
    file_path TEXT NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Workgroup Wiki Pages Table
CREATE TABLE IF NOT EXISTS workgroup_wiki_pages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workgroup_id UUID NOT NULL REFERENCES workgroups(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    slug VARCHAR(255) NOT NULL,
    is_published BOOLEAN DEFAULT TRUE,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_by UUID NOT NULL REFERENCES users(id),
    last_modified_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(workgroup_id, slug)
);

-- Workgroup Notifications Table
CREATE TABLE IF NOT EXISTS workgroup_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workgroup_id UUID NOT NULL REFERENCES workgroups(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    notification_type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    data JSONB DEFAULT '{}',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_workgroup_files_workgroup_id ON workgroup_files(workgroup_id);
CREATE INDEX IF NOT EXISTS idx_workgroup_files_created_at ON workgroup_files(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_workgroup_wiki_pages_workgroup_id ON workgroup_wiki_pages(workgroup_id);
CREATE INDEX IF NOT EXISTS idx_workgroup_wiki_pages_slug ON workgroup_wiki_pages(workgroup_id, slug);

CREATE INDEX IF NOT EXISTS idx_workgroup_notifications_workgroup_id ON workgroup_notifications(workgroup_id);
CREATE INDEX IF NOT EXISTS idx_workgroup_notifications_user_id ON workgroup_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_workgroup_notifications_created_at ON workgroup_notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_workgroup_notifications_is_read ON workgroup_notifications(is_read);