-- Enhanced Workgroups System Migration
-- Microsoft Teams-style collaboration platform

-- Drop existing tables if they exist (for clean setup)
DROP TABLE IF EXISTS workgroup_activities CASCADE;
DROP TABLE IF EXISTS workgroup_channels CASCADE;
DROP TABLE IF EXISTS workgroup_meetings CASCADE;
DROP TABLE IF EXISTS workgroup_files CASCADE;
DROP TABLE IF EXISTS workgroup_posts CASCADE;
DROP TABLE IF EXISTS workgroup_members CASCADE;
DROP TABLE IF EXISTS workgroups CASCADE;

-- Create enhanced workgroups table
CREATE TABLE workgroups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    avatar_color VARCHAR(50) DEFAULT 'bg-blue-500',
    type VARCHAR(50) DEFAULT 'team' CHECK (type IN ('team', 'project', 'private')),
    is_private BOOLEAN DEFAULT false,
    is_archived BOOLEAN DEFAULT false,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Microsoft Teams-like settings
    allow_guest_access BOOLEAN DEFAULT false,
    allow_member_add_remove BOOLEAN DEFAULT true,
    allow_member_create_channels BOOLEAN DEFAULT true,
    notification_settings JSONB DEFAULT '{"mentions": true, "messages": true, "meetings": true}',
    
    -- Metadata
    member_count INTEGER DEFAULT 0,
    message_count INTEGER DEFAULT 0,
    last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create workgroup members table with enhanced roles
CREATE TABLE workgroup_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workgroup_id UUID NOT NULL REFERENCES workgroups(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member', 'guest')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    invited_by UUID REFERENCES users(id),
    is_favorite BOOLEAN DEFAULT false,
    notification_settings JSONB DEFAULT '{"mentions": true, "messages": true, "meetings": true}',
    last_read_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(workgroup_id, user_id)
);

-- Create channels table (like Teams channels)
CREATE TABLE workgroup_channels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workgroup_id UUID NOT NULL REFERENCES workgroups(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50) DEFAULT 'standard' CHECK (type IN ('standard', 'private', 'shared')),
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Channel settings
    is_general BOOLEAN DEFAULT false,
    is_archived BOOLEAN DEFAULT false,
    member_count INTEGER DEFAULT 0,
    message_count INTEGER DEFAULT 0,
    
    UNIQUE(workgroup_id, name)
);

-- Create posts/messages table with threading support
CREATE TABLE workgroup_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workgroup_id UUID NOT NULL REFERENCES workgroups(id) ON DELETE CASCADE,
    channel_id UUID REFERENCES workgroup_channels(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES workgroup_posts(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    content_type VARCHAR(50) DEFAULT 'text' CHECK (content_type IN ('text', 'file', 'image', 'link', 'code')),
    
    -- Message metadata
    is_pinned BOOLEAN DEFAULT false,
    is_edited BOOLEAN DEFAULT false,
    is_deleted BOOLEAN DEFAULT false,
    edited_at TIMESTAMP WITH TIME ZONE,
    deleted_at TIMESTAMP WITH TIME ZONE,
    
    -- Reactions and interactions
    reactions JSONB DEFAULT '{}',
    mention_users UUID[] DEFAULT '{}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create meetings table
CREATE TABLE workgroup_meetings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workgroup_id UUID NOT NULL REFERENCES workgroups(id) ON DELETE CASCADE,
    channel_id UUID REFERENCES workgroup_channels(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Meeting details
    meeting_type VARCHAR(50) DEFAULT 'video' CHECK (meeting_type IN ('video', 'audio', 'screen_share')),
    status VARCHAR(50) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'active', 'ended', 'cancelled')),
    
    -- Timing
    scheduled_start TIMESTAMP WITH TIME ZONE,
    scheduled_end TIMESTAMP WITH TIME ZONE,
    actual_start TIMESTAMP WITH TIME ZONE,
    actual_end TIMESTAMP WITH TIME ZONE,
    
    -- Meeting settings
    is_recurring BOOLEAN DEFAULT false,
    recurrence_pattern JSONB,
    max_participants INTEGER DEFAULT 100,
    allow_recording BOOLEAN DEFAULT true,
    require_lobby BOOLEAN DEFAULT false,
    
    -- Organizer
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create meeting participants table
CREATE TABLE workgroup_meeting_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meeting_id UUID NOT NULL REFERENCES workgroup_meetings(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'attendee' CHECK (role IN ('organizer', 'presenter', 'attendee')),
    
    -- Participation details
    joined_at TIMESTAMP WITH TIME ZONE,
    left_at TIMESTAMP WITH TIME ZONE,
    is_muted BOOLEAN DEFAULT false,
    is_video_on BOOLEAN DEFAULT true,
    is_screen_sharing BOOLEAN DEFAULT false,
    
    UNIQUE(meeting_id, user_id)
);

-- Create files table for workgroup file sharing
CREATE TABLE workgroup_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workgroup_id UUID NOT NULL REFERENCES workgroups(id) ON DELETE CASCADE,
    channel_id UUID REFERENCES workgroup_channels(id) ON DELETE SET NULL,
    post_id UUID REFERENCES workgroup_posts(id) ON DELETE SET NULL,
    
    -- File details
    name VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(100),
    file_size BIGINT,
    mime_type VARCHAR(255),
    file_path TEXT NOT NULL,
    file_url TEXT,
    
    -- File metadata
    is_deleted BOOLEAN DEFAULT false,
    deleted_at TIMESTAMP WITH TIME ZONE,
    
    -- Upload details
    uploaded_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create activities table for audit trail
CREATE TABLE workgroup_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workgroup_id UUID NOT NULL REFERENCES workgroups(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    activity_type VARCHAR(100) NOT NULL,
    activity_data JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_workgroups_org_id ON workgroups(org_id);
CREATE INDEX idx_workgroups_type ON workgroups(type);
CREATE INDEX idx_workgroups_created_at ON workgroups(created_at DESC);

CREATE INDEX idx_workgroup_members_workgroup_id ON workgroup_members(workgroup_id);
CREATE INDEX idx_workgroup_members_user_id ON workgroup_members(user_id);
CREATE INDEX idx_workgroup_members_role ON workgroup_members(role);

CREATE INDEX idx_workgroup_channels_workgroup_id ON workgroup_channels(workgroup_id);
CREATE INDEX idx_workgroup_channels_type ON workgroup_channels(type);

CREATE INDEX idx_workgroup_posts_workgroup_id ON workgroup_posts(workgroup_id);
CREATE INDEX idx_workgroup_posts_channel_id ON workgroup_posts(channel_id);
CREATE INDEX idx_workgroup_posts_parent_id ON workgroup_posts(parent_id);
CREATE INDEX idx_workgroup_posts_created_at ON workgroup_posts(created_at DESC);

CREATE INDEX idx_workgroup_meetings_workgroup_id ON workgroup_meetings(workgroup_id);
CREATE INDEX idx_workgroup_meetings_status ON workgroup_meetings(status);
CREATE INDEX idx_workgroup_meetings_scheduled_start ON workgroup_meetings(scheduled_start);

CREATE INDEX idx_workgroup_files_workgroup_id ON workgroup_files(workgroup_id);
CREATE INDEX idx_workgroup_files_channel_id ON workgroup_files(channel_id);
CREATE INDEX idx_workgroup_files_uploaded_by ON workgroup_files(uploaded_by);

CREATE INDEX idx_workgroup_activities_workgroup_created ON workgroup_activities(workgroup_id, created_at DESC);

-- Create triggers for updating counts and timestamps
CREATE OR REPLACE FUNCTION update_workgroup_member_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE workgroups 
        SET member_count = member_count + 1,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = NEW.workgroup_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE workgroups 
        SET member_count = member_count - 1,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = OLD.workgroup_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_workgroup_member_count
    AFTER INSERT OR DELETE ON workgroup_members
    FOR EACH ROW EXECUTE FUNCTION update_workgroup_member_count();

CREATE OR REPLACE FUNCTION update_workgroup_message_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE workgroups 
        SET message_count = message_count + 1,
            last_activity_at = CURRENT_TIMESTAMP,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = NEW.workgroup_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE workgroups 
        SET message_count = message_count - 1,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = OLD.workgroup_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_workgroup_message_count
    AFTER INSERT OR DELETE ON workgroup_posts
    FOR EACH ROW EXECUTE FUNCTION update_workgroup_message_count();

-- Create function to automatically create General channel
CREATE OR REPLACE FUNCTION create_default_channel()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO workgroup_channels (workgroup_id, name, description, type, is_general, created_by)
    VALUES (NEW.id, 'General', 'General discussion for the team', 'standard', true, NEW.created_by);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_create_default_channel
    AFTER INSERT ON workgroups
    FOR EACH ROW EXECUTE FUNCTION create_default_channel();

-- Create function to add creator as owner
CREATE OR REPLACE FUNCTION add_creator_as_owner()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO workgroup_members (workgroup_id, user_id, role, joined_at)
    VALUES (NEW.id, NEW.created_by, 'owner', CURRENT_TIMESTAMP);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_add_creator_as_owner
    AFTER INSERT ON workgroups
    FOR EACH ROW EXECUTE FUNCTION add_creator_as_owner();

-- Insert sample data for testing
INSERT INTO workgroups (org_id, name, description, avatar_color, type, is_private, created_by) VALUES
(
    (SELECT id FROM organizations LIMIT 1),
    'Sales Team',
    'Our amazing sales team working together to close deals and grow revenue',
    'bg-blue-500',
    'team',
    false,
    (SELECT id FROM users LIMIT 1)
),
(
    (SELECT id FROM organizations LIMIT 1),
    'Marketing Project',
    'Q1 2024 marketing campaign planning and execution',
    'bg-purple-500',
    'project',
    false,
    (SELECT id FROM users LIMIT 1)
),
(
    (SELECT id FROM organizations LIMIT 1),
    'Development Squad',
    'Core development team for product features',
    'bg-green-500',
    'team',
    false,
    (SELECT id FROM users LIMIT 1)
),
(
    (SELECT id FROM organizations LIMIT 1),
    'Executive Leadership',
    'Private group for executive discussions and strategic planning',
    'bg-red-500',
    'private',
    true,
    (SELECT id FROM users LIMIT 1)
);

-- Add some sample posts (will be added after channels are created by triggers)
INSERT INTO workgroup_posts (workgroup_id, channel_id, user_id, content) VALUES
(
    (SELECT id FROM workgroups WHERE name = 'Sales Team' LIMIT 1),
    (SELECT id FROM workgroup_channels WHERE workgroup_id = (SELECT id FROM workgroups WHERE name = 'Sales Team' LIMIT 1) AND is_general = true LIMIT 1),
    (SELECT id FROM users LIMIT 1),
    'Welcome to the Sales Team! Let''s crush our Q1 targets together! 🚀'
),
(
    (SELECT id FROM workgroups WHERE name = 'Marketing Project' LIMIT 1),
    (SELECT id FROM workgroup_channels WHERE workgroup_id = (SELECT id FROM workgroups WHERE name = 'Marketing Project' LIMIT 1) AND is_general = true LIMIT 1),
    (SELECT id FROM users LIMIT 1),
    'Marketing campaign kickoff meeting scheduled for tomorrow at 10 AM. Please review the brief I shared earlier.'
);

-- Create views for easier querying
CREATE VIEW workgroup_stats AS
SELECT 
    w.id,
    w.name,
    w.type,
    w.is_private,
    w.member_count,
    w.message_count,
    w.last_activity_at,
    COUNT(DISTINCT wm.user_id) as actual_member_count,
    COUNT(DISTINCT wp.id) as actual_message_count,
    MAX(wp.created_at) as last_message_at
FROM workgroups w
LEFT JOIN workgroup_members wm ON w.id = wm.workgroup_id
LEFT JOIN workgroup_posts wp ON w.id = wp.workgroup_id
GROUP BY w.id, w.name, w.type, w.is_private, w.member_count, w.message_count, w.last_activity_at;

-- Add comments for documentation
COMMENT ON TABLE workgroups IS 'Microsoft Teams-style workgroups/teams for collaboration';
COMMENT ON TABLE workgroup_members IS 'Members of workgroups with roles and permissions';
COMMENT ON TABLE workgroup_channels IS 'Channels within workgroups for organized discussions';
COMMENT ON TABLE workgroup_posts IS 'Messages/posts within workgroups and channels';
COMMENT ON TABLE workgroup_meetings IS 'Scheduled and active meetings within workgroups';
COMMENT ON TABLE workgroup_files IS 'Files shared within workgroups and channels';
COMMENT ON TABLE workgroup_activities IS 'Activity log for workgroups for audit and notifications';