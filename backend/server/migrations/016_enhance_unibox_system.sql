-- Migration: Enhance Unibox System
-- Created: 2024-03-30

-- Add missing columns to unibox_emails table
ALTER TABLE unibox_emails 
ADD COLUMN IF NOT EXISTS body_text TEXT,
ADD COLUMN IF NOT EXISTS body_html TEXT,
ADD COLUMN IF NOT EXISTS phone VARCHAR(50),
ADD COLUMN IF NOT EXISTS priority VARCHAR(20) DEFAULT 'normal',
ADD COLUMN IF NOT EXISTS tags TEXT[],
ADD COLUMN IF NOT EXISTS attachments JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS thread_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS message_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS in_reply_to VARCHAR(255),
ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_starred BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT false;

-- Update existing records to have body_text from body if body_text is null
UPDATE unibox_emails 
SET body_text = body 
WHERE body_text IS NULL AND body IS NOT NULL;

-- Set default status for records without status
UPDATE unibox_emails 
SET status = 'Lead' 
WHERE status IS NULL;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_unibox_emails_org_id ON unibox_emails(org_id);
CREATE INDEX IF NOT EXISTS idx_unibox_emails_status ON unibox_emails(status);
CREATE INDEX IF NOT EXISTS idx_unibox_emails_received_at ON unibox_emails(received_at DESC);
CREATE INDEX IF NOT EXISTS idx_unibox_emails_sender_email ON unibox_emails(sender_email);
CREATE INDEX IF NOT EXISTS idx_unibox_emails_is_read ON unibox_emails(is_read);
CREATE INDEX IF NOT EXISTS idx_unibox_emails_is_starred ON unibox_emails(is_starred);
CREATE INDEX IF NOT EXISTS idx_unibox_emails_thread_id ON unibox_emails(thread_id);

-- Create unibox_templates table for email templates
CREATE TABLE IF NOT EXISTS unibox_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    subject VARCHAR(500),
    body_text TEXT,
    body_html TEXT,
    template_type VARCHAR(50) DEFAULT 'reply' CHECK (template_type IN ('reply', 'follow_up', 'cold_outreach')),
    is_active BOOLEAN DEFAULT true,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create unibox_campaigns table for email campaigns
CREATE TABLE IF NOT EXISTS unibox_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    template_id UUID REFERENCES unibox_templates(id),
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed')),
    target_emails TEXT[],
    sent_count INTEGER DEFAULT 0,
    opened_count INTEGER DEFAULT 0,
    replied_count INTEGER DEFAULT 0,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create unibox_email_activities table for tracking email interactions
CREATE TABLE IF NOT EXISTS unibox_email_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email_id UUID NOT NULL REFERENCES unibox_emails(id) ON DELETE CASCADE,
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    activity_type VARCHAR(50) NOT NULL CHECK (activity_type IN ('opened', 'clicked', 'replied', 'bounced', 'marked_spam')),
    activity_data JSONB DEFAULT '{}',
    user_agent TEXT,
    ip_address INET,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for new tables
CREATE INDEX IF NOT EXISTS idx_unibox_templates_org_id ON unibox_templates(org_id);
CREATE INDEX IF NOT EXISTS idx_unibox_templates_type ON unibox_templates(template_type);
CREATE INDEX IF NOT EXISTS idx_unibox_campaigns_org_id ON unibox_campaigns(org_id);
CREATE INDEX IF NOT EXISTS idx_unibox_campaigns_status ON unibox_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_unibox_email_activities_email_id ON unibox_email_activities(email_id);
CREATE INDEX IF NOT EXISTS idx_unibox_email_activities_type ON unibox_email_activities(activity_type);

-- Insert sample email templates
INSERT INTO unibox_templates (org_id, name, subject, body_text, template_type, created_by) VALUES
(
    (SELECT id FROM organizations LIMIT 1),
    'Follow Up Template',
    'Following up on our conversation',
    'Hi {{name}},

I wanted to follow up on our previous conversation about {{topic}}. 

Are you still interested in learning more about how we can help with {{pain_point}}?

Best regards,
{{sender_name}}',
    'follow_up',
    (SELECT id FROM users LIMIT 1)
),
(
    (SELECT id FROM organizations LIMIT 1),
    'Meeting Request',
    'Quick 15-minute call?',
    'Hi {{name}},

I hope this email finds you well. I''d love to schedule a quick 15-minute call to discuss how {{company}} can benefit from our solution.

Would you be available for a brief call this week?

Best regards,
{{sender_name}}',
    'cold_outreach',
    (SELECT id FROM users LIMIT 1)
);

-- Insert sample emails for testing (only if no emails exist)
INSERT INTO unibox_emails (org_id, external_id, sender_email, sender_name, subject, body_text, status, received_at, is_read)
SELECT 
    org.id,
    'sample-' || gen_random_uuid(),
    'john.doe@example.com',
    'John Doe',
    'Interested in your services',
    'Hi there,

I came across your website and I''m very interested in learning more about your services. Could we schedule a call to discuss how you might be able to help our company?

Looking forward to hearing from you.

Best regards,
John Doe
CEO, Example Corp',
    'Lead',
    NOW() - INTERVAL '2 hours',
    false
FROM organizations org
WHERE NOT EXISTS (SELECT 1 FROM unibox_emails)
LIMIT 1;

INSERT INTO unibox_emails (org_id, external_id, sender_email, sender_name, subject, body_text, status, received_at, is_read)
SELECT 
    org.id,
    'sample-' || gen_random_uuid(),
    'sarah.smith@techcorp.com',
    'Sarah Smith',
    'Re: Partnership Opportunity',
    'Hello,

Thank you for reaching out about the partnership opportunity. I''ve reviewed your proposal and I''m definitely interested in moving forward.

When would be a good time for a call to discuss the next steps?

Best,
Sarah Smith
Director of Business Development
TechCorp Solutions',
    'Interested',
    NOW() - INTERVAL '1 day',
    false
FROM organizations org
WHERE (SELECT COUNT(*) FROM unibox_emails) < 2
LIMIT 1;

INSERT INTO unibox_emails (org_id, external_id, sender_email, sender_name, subject, body_text, status, received_at, is_read, is_starred)
SELECT 
    org.id,
    'sample-' || gen_random_uuid(),
    'mike.johnson@startup.io',
    'Mike Johnson',
    'Meeting scheduled for tomorrow',
    'Hi,

Just confirming our meeting scheduled for tomorrow at 2 PM EST. I''ll send you the Zoom link shortly.

Looking forward to our discussion!

Mike Johnson
Founder, Startup.io',
    'Meeting Booked',
    NOW() - INTERVAL '3 hours',
    true,
    true
FROM organizations org
WHERE (SELECT COUNT(*) FROM unibox_emails) < 3
LIMIT 1;