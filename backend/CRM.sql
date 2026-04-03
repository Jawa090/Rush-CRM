-- CRM Database Export
-- Generated: 2026-04-03T09:44:26.542Z
-- PostgreSQL Database Dump

SET statement_timeout = 0;
SET lock_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;


-- Table: activities
DROP TABLE IF EXISTS activities CASCADE;
CREATE TABLE activities (id uuid NOT NULL DEFAULT uuid_generate_v4(), organization_id uuid, type character varying(50) NOT NULL, subject character varying(255), description text, contact_id uuid, deal_id uuid, company_id uuid, assigned_to uuid, due_date timestamp without time zone, completed boolean DEFAULT false, completed_at timestamp without time zone, created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP, updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP, org_id uuid, owner_id uuid, lead_id uuid);

-- Table: attendance
DROP TABLE IF EXISTS attendance CASCADE;
CREATE TABLE attendance (id uuid NOT NULL DEFAULT uuid_generate_v4(), organization_id uuid, employee_id uuid, date date NOT NULL, check_in timestamp without time zone, check_out timestamp without time zone, status character varying(50) DEFAULT 'present'::character varying, hours_worked numeric, notes text, created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP, updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP, org_id uuid, total_hours numeric, clock_in timestamp without time zone, clock_out timestamp without time zone, late_minutes integer DEFAULT 0, overtime_hours numeric DEFAULT 0, location character varying(255), created_by uuid, updated_by uuid, break_duration integer DEFAULT 0, ip_address character varying(50), device_info text, user_id uuid, location_lat numeric, location_lng numeric);

-- Data for attendance
INSERT INTO attendance ("id", "organization_id", "employee_id", "date", "check_in", "check_out", "status", "hours_worked", "notes", "created_at", "updated_at", "org_id", "total_hours", "clock_in", "clock_out", "late_minutes", "overtime_hours", "location", "created_by", "updated_by", "break_duration", "ip_address", "device_info", "user_id", "location_lat", "location_lng") VALUES ('40ab8050-0dc3-4241-9181-86c8b03b6daf', NULL, 'dc790635-a29c-476c-a5db-cf37e8d795a0', '2026-04-02T19:00:00.000Z', NULL, NULL, 'late', NULL, '', '2026-04-03T09:02:52.719Z', '2026-04-03T09:02:52.719Z', 'adb32da4-2521-4484-8c05-31267bd4a9c2', NULL, '2026-04-03T09:02:52.715Z', NULL, 0, '0.00', NULL, NULL, NULL, 0, '::1', '{"userAgent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36"}', 'c0ca5c67-7dd5-4cde-8311-425d5e886dbf', '31.473219400773196', '74.25937713273196');

-- Table: calendar_event_attendees
DROP TABLE IF EXISTS calendar_event_attendees CASCADE;
CREATE TABLE calendar_event_attendees (id uuid NOT NULL DEFAULT uuid_generate_v4(), event_id uuid, user_id uuid, status character varying(50) DEFAULT 'pending'::character varying, created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP, updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP);

-- Table: calendar_events
DROP TABLE IF EXISTS calendar_events CASCADE;
CREATE TABLE calendar_events (id uuid NOT NULL DEFAULT uuid_generate_v4(), organization_id uuid, title character varying(255) NOT NULL, description text, start_time timestamp without time zone NOT NULL, end_time timestamp without time zone NOT NULL, location character varying(255), event_type character varying(50) DEFAULT 'meeting'::character varying, is_all_day boolean DEFAULT false, recurrence_rule character varying(255), reminder_minutes integer, created_by uuid, created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP, updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP, org_id uuid, color character varying(20), is_recurring boolean DEFAULT false, attendees jsonb DEFAULT '[]'::jsonb);

-- Table: call_logs
DROP TABLE IF EXISTS call_logs CASCADE;
CREATE TABLE call_logs (id uuid NOT NULL DEFAULT uuid_generate_v4(), organization_id uuid, contact_id uuid, user_id uuid, call_type character varying(50) NOT NULL, direction character varying(50) NOT NULL, phone_number character varying(50) NOT NULL, duration integer DEFAULT 0, status character varying(50), recording_url character varying(500), notes text, created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP, org_id uuid, updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP);

-- Table: companies
DROP TABLE IF EXISTS companies CASCADE;
CREATE TABLE companies (id uuid NOT NULL DEFAULT uuid_generate_v4(), organization_id uuid, name character varying(255) NOT NULL, industry character varying(100), website character varying(255), phone character varying(50), email character varying(255), address text, city character varying(100), state character varying(100), country character varying(100), postal_code character varying(20), employee_count integer, annual_revenue numeric, description text, logo_url character varying(500), status character varying(50) DEFAULT 'active'::character varying, created_by uuid, created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP, updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP, revenue numeric, notes text, org_id uuid, owner_id uuid, linkedin_url character varying(255));

-- Table: connected_drives
DROP TABLE IF EXISTS connected_drives CASCADE;
CREATE TABLE connected_drives (id uuid NOT NULL DEFAULT gen_random_uuid(), org_id uuid, ownership character varying(50) NOT NULL, drive_type character varying(50) NOT NULL, display_name character varying(255) NOT NULL, network_path text, network_protocol character varying(50), connected_by uuid, settings jsonb DEFAULT '{}'::jsonb, is_active boolean DEFAULT true, created_at timestamp with time zone DEFAULT now(), updated_at timestamp with time zone DEFAULT now());

-- Table: connected_mailboxes
DROP TABLE IF EXISTS connected_mailboxes CASCADE;
CREATE TABLE connected_mailboxes (id uuid NOT NULL DEFAULT uuid_generate_v4(), org_id uuid, user_id uuid, provider character varying(50) NOT NULL, email_address character varying(255) NOT NULL, display_name character varying(255), access_token text, refresh_token text, token_expires_at timestamp without time zone, is_active boolean DEFAULT true, sync_status character varying(50) DEFAULT 'pending'::character varying, last_sync_at timestamp without time zone, created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP, updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP);

-- Table: contacts
DROP TABLE IF EXISTS contacts CASCADE;
CREATE TABLE contacts (id uuid NOT NULL DEFAULT uuid_generate_v4(), organization_id uuid, first_name character varying(100), last_name character varying(100), email character varying(255), phone character varying(50), company character varying(255), job_title character varying(100), address text, city character varying(100), state character varying(100), country character varying(100), postal_code character varying(20), website character varying(255), source character varying(100), status character varying(50) DEFAULT 'active'::character varying, tags ARRAY, notes text, last_contacted timestamp without time zone, created_by uuid, created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP, updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP, company_name character varying(255), linkedin_url character varying(255), twitter_url character varying(255), score integer DEFAULT 0, "position" character varying(255), contact_type character varying(50) DEFAULT 'contact'::character varying, messenger character varying(255), available_to_everyone boolean DEFAULT true, included_in_export boolean DEFAULT true, second_name character varying(255), salutation character varying(50), dob date, photo_url text, website_type character varying(50), messenger_type character varying(50), source_info text, is_public boolean DEFAULT true, include_in_export boolean DEFAULT true, responsible_id uuid, observers ARRAY, org_id uuid, lifecycle_stage character varying(50), owner_id uuid, lead_source character varying(100), company_id uuid, user_id uuid);

-- Table: crm_activities
DROP TABLE IF EXISTS crm_activities CASCADE;
CREATE TABLE crm_activities (id uuid NOT NULL DEFAULT gen_random_uuid(), org_id uuid NOT NULL, user_id uuid, entity_type character varying(50), entity_id uuid, activity_type character varying(100), title character varying(255), description text, created_at timestamp with time zone DEFAULT now(), updated_at timestamp with time zone DEFAULT now());

-- Data for crm_activities
INSERT INTO crm_activities ("id", "org_id", "user_id", "entity_type", "entity_id", "activity_type", "title", "description", "created_at", "updated_at") VALUES ('264ee6db-4a6e-4143-a778-d687dbd739df', 'adb32da4-2521-4484-8c05-31267bd4a9c2', 'c0ca5c67-7dd5-4cde-8311-425d5e886dbf', 'deal', 'df77223f-ec07-4ef8-90a9-18840e0b6bdc', 'created', 'Deal Created', 'xzzzzzz', '2026-04-02T15:47:28.952Z', '2026-04-02T15:47:28.952Z');

-- Table: customers
DROP TABLE IF EXISTS customers CASCADE;
CREATE TABLE customers (id uuid NOT NULL DEFAULT uuid_generate_v4(), organization_id uuid, contact_id uuid, company_id uuid, customer_type character varying(50) DEFAULT 'individual'::character varying, status character varying(50) DEFAULT 'active'::character varying, lifetime_value numeric DEFAULT 0, total_purchases integer DEFAULT 0, first_purchase_date date, last_purchase_date date, notes text, created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP, updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP, industry character varying(100), converted_from_lead_id uuid, converted_from_deal_id uuid, org_id uuid);

-- Table: deal_contacts
DROP TABLE IF EXISTS deal_contacts CASCADE;
CREATE TABLE deal_contacts (id uuid NOT NULL DEFAULT gen_random_uuid(), org_id uuid NOT NULL, deal_id uuid NOT NULL, contact_id uuid NOT NULL, role character varying(100), primary_contact boolean DEFAULT false, created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP, updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP);

-- Table: deal_signing_parties
DROP TABLE IF EXISTS deal_signing_parties CASCADE;
CREATE TABLE deal_signing_parties (id uuid NOT NULL DEFAULT gen_random_uuid(), org_id uuid NOT NULL, deal_id uuid NOT NULL, contact_id uuid NOT NULL, role character varying(100), created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP, updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP);

-- Table: deals
DROP TABLE IF EXISTS deals CASCADE;
CREATE TABLE deals (id uuid NOT NULL DEFAULT uuid_generate_v4(), organization_id uuid, title character varying(255) NOT NULL, description text, value numeric, currency character varying(10) DEFAULT 'USD'::character varying, stage character varying(100) DEFAULT 'qualification'::character varying, probability integer DEFAULT 0, expected_close_date date, contact_id uuid, company_id uuid, assigned_to uuid, status character varying(50) DEFAULT 'open'::character varying, notes text, created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP, updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP, closed_at timestamp without time zone, source character varying(100), campaign_id uuid, utm_source character varying(100), utm_medium character varying(100), utm_campaign character varying(100), org_id uuid, converted_from_lead_id uuid, converted_to_customer_id uuid, contact_name text, company_name text, phone text, email text, priority text DEFAULT 'medium'::text, designation text, website text, address text, company_phone text, company_email text, company_size text, agent_name text, decision_maker text, service_interested text, interaction_notes text, first_message text, last_touch timestamp with time zone, external_source_id text, workspace_id uuid, source_info text, phone_type text DEFAULT 'work'::text, email_type text DEFAULT 'work'::text, website_type text DEFAULT 'corporate'::text, customer_type text, last_contacted_date date, next_follow_up_date date, responsible_person uuid, owner_id uuid, lost_reason text, won_at timestamp without time zone, lost_at timestamp without time zone, user_id uuid, linked_company_name character varying(255), linked_company_phone character varying(50), linked_company_email character varying(255), contact_first_name character varying(255), contact_last_name character varying(255), contact_email character varying(255), contact_phone character varying(50), tags ARRAY);

-- Data for deals
INSERT INTO deals ("id", "organization_id", "title", "description", "value", "currency", "stage", "probability", "expected_close_date", "contact_id", "company_id", "assigned_to", "status", "notes", "created_at", "updated_at", "closed_at", "source", "campaign_id", "utm_source", "utm_medium", "utm_campaign", "org_id", "converted_from_lead_id", "converted_to_customer_id", "contact_name", "company_name", "phone", "email", "priority", "designation", "website", "address", "company_phone", "company_email", "company_size", "agent_name", "decision_maker", "service_interested", "interaction_notes", "first_message", "last_touch", "external_source_id", "workspace_id", "source_info", "phone_type", "email_type", "website_type", "customer_type", "last_contacted_date", "next_follow_up_date", "responsible_person", "owner_id", "lost_reason", "won_at", "lost_at", "user_id", "linked_company_name", "linked_company_phone", "linked_company_email", "contact_first_name", "contact_last_name", "contact_email", "contact_phone", "tags") VALUES ('df77223f-ec07-4ef8-90a9-18840e0b6bdc', NULL, 'xzzzzzz', NULL, '23233.00', 'USD', 'qualification', 0, NULL, NULL, NULL, NULL, 'open', 'xzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz', '2026-04-02T15:47:28.929Z', '2026-04-02T15:47:28.929Z', NULL, 'linkedin', NULL, NULL, NULL, NULL, 'adb32da4-2521-4484-8c05-31267bd4a9c2', NULL, NULL, 'Jawad', 'zzzxz', '+13136955749', 'tanpaki72@gmail.com', 'medium', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'c0ca5c67-7dd5-4cde-8311-425d5e886dbf', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);

-- Table: drive_activities
DROP TABLE IF EXISTS drive_activities CASCADE;
CREATE TABLE drive_activities (id uuid NOT NULL DEFAULT uuid_generate_v4(), org_id uuid, user_id uuid, file_id uuid, folder_id uuid, activity_type character varying(50) NOT NULL, activity_data jsonb DEFAULT '{}'::jsonb, created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP);

-- Data for drive_activities
INSERT INTO drive_activities ("id", "org_id", "user_id", "file_id", "folder_id", "activity_type", "activity_data", "created_at") VALUES ('457c7000-5051-4dd9-a00b-36b4a936bc12', 'adb32da4-2521-4484-8c05-31267bd4a9c2', 'c0ca5c67-7dd5-4cde-8311-425d5e886dbf', NULL, NULL, 'deleted', [object Object], '2026-04-02T15:23:32.040Z');

-- Table: drive_file_versions
DROP TABLE IF EXISTS drive_file_versions CASCADE;
CREATE TABLE drive_file_versions (id uuid NOT NULL DEFAULT uuid_generate_v4(), file_id uuid, version_number integer NOT NULL, file_path character varying(1000), file_size bigint, created_by uuid, created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP);

-- Table: drive_files
DROP TABLE IF EXISTS drive_files CASCADE;
CREATE TABLE drive_files (id uuid NOT NULL DEFAULT uuid_generate_v4(), organization_id uuid, name character varying(255) NOT NULL, file_url character varying(500) NOT NULL, file_size integer, file_type character varying(100), folder_path character varying(500) DEFAULT '/'::character varying, is_public boolean DEFAULT false, shared_with ARRAY, uploaded_by uuid, uploaded_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP, updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP, org_id uuid, created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP, created_by uuid, folder_id uuid, size bigint DEFAULT 0, mime_type character varying(255), is_folder boolean DEFAULT false, parent_id uuid, path character varying(1000), original_name character varying(500), file_path character varying(1000), is_deleted boolean DEFAULT false, deleted_at timestamp without time zone, version integer DEFAULT 1, is_starred boolean DEFAULT false, permissions jsonb DEFAULT '{}'::jsonb);

-- Table: drive_folders
DROP TABLE IF EXISTS drive_folders CASCADE;
CREATE TABLE drive_folders (id uuid NOT NULL DEFAULT uuid_generate_v4(), org_id uuid, name character varying(255) NOT NULL, parent_id uuid, path character varying(1000), created_by uuid, created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP, updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP, parent_folder_id uuid, color character varying(50) DEFAULT 'folder-blue'::character varying, is_deleted boolean DEFAULT false, deleted_at timestamp without time zone);

-- Data for drive_folders
INSERT INTO drive_folders ("id", "org_id", "name", "parent_id", "path", "created_by", "created_at", "updated_at", "parent_folder_id", "color", "is_deleted", "deleted_at") VALUES ('762c825f-c966-487b-b346-3b9c053088d6', '00000000-0000-0000-0000-000000000001', 'Documents', NULL, 'Documents', '00000000-0000-0000-0000-000000000002', '2026-04-02T15:23:08.178Z', '2026-04-02T15:23:08.178Z', NULL, 'folder-blue', false, NULL);
INSERT INTO drive_folders ("id", "org_id", "name", "parent_id", "path", "created_by", "created_at", "updated_at", "parent_folder_id", "color", "is_deleted", "deleted_at") VALUES ('a904d9ac-b328-4aba-892d-bc618f5a1995', '00000000-0000-0000-0000-000000000001', 'Images', NULL, 'Images', '00000000-0000-0000-0000-000000000002', '2026-04-02T15:23:08.189Z', '2026-04-02T15:23:08.189Z', NULL, 'folder-green', false, NULL);
INSERT INTO drive_folders ("id", "org_id", "name", "parent_id", "path", "created_by", "created_at", "updated_at", "parent_folder_id", "color", "is_deleted", "deleted_at") VALUES ('8ec0697c-f7f7-42b8-bbcf-8a161588c59d', '00000000-0000-0000-0000-000000000001', 'Projects', NULL, 'Projects', '00000000-0000-0000-0000-000000000002', '2026-04-02T15:23:08.195Z', '2026-04-02T15:23:08.195Z', NULL, 'folder-orange', false, NULL);
INSERT INTO drive_folders ("id", "org_id", "name", "parent_id", "path", "created_by", "created_at", "updated_at", "parent_folder_id", "color", "is_deleted", "deleted_at") VALUES ('b9790dee-0ee0-46a2-96ba-fd968df8e6d8', '00000000-0000-0000-0000-000000000001', 'Shared', NULL, 'Shared', '00000000-0000-0000-0000-000000000002', '2026-04-02T15:23:08.199Z', '2026-04-02T15:23:08.199Z', NULL, 'folder-purple', false, NULL);
INSERT INTO drive_folders ("id", "org_id", "name", "parent_id", "path", "created_by", "created_at", "updated_at", "parent_folder_id", "color", "is_deleted", "deleted_at") VALUES ('b231b81d-f981-4c97-99a5-2f5a1a86d9d4', '00000000-0000-0000-0000-000000000001', 'Archive', NULL, 'Archive', '00000000-0000-0000-0000-000000000002', '2026-04-02T15:23:08.203Z', '2026-04-02T15:23:08.203Z', NULL, 'folder-gray', false, NULL);

-- Table: drive_permissions
DROP TABLE IF EXISTS drive_permissions CASCADE;
CREATE TABLE drive_permissions (id uuid NOT NULL DEFAULT gen_random_uuid(), drive_id uuid, org_id uuid, user_id uuid, role uuid, access_level character varying(50) NOT NULL, created_at timestamp with time zone DEFAULT now(), updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP);

-- Table: emails
DROP TABLE IF EXISTS emails CASCADE;
CREATE TABLE emails (id uuid NOT NULL DEFAULT uuid_generate_v4(), organization_id uuid, user_id uuid, from_email character varying(255) NOT NULL, to_email character varying(255) NOT NULL, cc_email text, bcc_email text, subject character varying(500), body text, html_body text, is_read boolean DEFAULT false, is_starred boolean DEFAULT false, folder character varying(50) DEFAULT 'inbox'::character varying, thread_id character varying(255), message_id character varying(255), in_reply_to character varying(255), attachments jsonb DEFAULT '[]'::jsonb, received_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP, created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP, org_id uuid, updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP, labels ARRAY, has_attachments boolean DEFAULT false);

-- Table: employee_documents
DROP TABLE IF EXISTS employee_documents CASCADE;
CREATE TABLE employee_documents (id uuid NOT NULL DEFAULT gen_random_uuid(), employee_id uuid NOT NULL, org_id uuid NOT NULL, document_type character varying(100) NOT NULL, document_name character varying(255) NOT NULL, file_path text NOT NULL, file_size integer, uploaded_by uuid NOT NULL, uploaded_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP, created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP, updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP, created_by uuid, updated_by uuid, is_verified boolean DEFAULT false, verified_by uuid, verified_at timestamp with time zone);

-- Table: employee_leave_balances
DROP TABLE IF EXISTS employee_leave_balances CASCADE;
CREATE TABLE employee_leave_balances (id uuid NOT NULL DEFAULT gen_random_uuid(), employee_id uuid NOT NULL, leave_type_id uuid NOT NULL, org_id uuid NOT NULL, year integer NOT NULL, total_allocated numeric NOT NULL DEFAULT 0, used numeric NOT NULL DEFAULT 0, pending numeric NOT NULL DEFAULT 0, available numeric, carried_forward numeric DEFAULT 0, expires_on date, created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP, updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP, remaining numeric DEFAULT 0);

-- Data for employee_leave_balances
INSERT INTO employee_leave_balances ("id", "employee_id", "leave_type_id", "org_id", "year", "total_allocated", "used", "pending", "available", "carried_forward", "expires_on", "created_at", "updated_at", "remaining") VALUES ('708d9e5e-1b6f-4835-8918-11ffcfed21ea', 'dc790635-a29c-476c-a5db-cf37e8d795a0', '82a3f77a-458f-4c7d-b96e-cc68c8f2677c', 'adb32da4-2521-4484-8c05-31267bd4a9c2', 2026, '20.00', '0.00', '0.00', '20.00', '0.00', NULL, '2026-04-03T09:12:09.393Z', '2026-04-03T09:12:09.393Z', '20.00');
INSERT INTO employee_leave_balances ("id", "employee_id", "leave_type_id", "org_id", "year", "total_allocated", "used", "pending", "available", "carried_forward", "expires_on", "created_at", "updated_at", "remaining") VALUES ('f5e7d727-6c38-4a7f-ac43-c2165536f667', 'dc790635-a29c-476c-a5db-cf37e8d795a0', '180ee06a-6aff-4e58-bb68-4d5d749a41e7', 'adb32da4-2521-4484-8c05-31267bd4a9c2', 2026, '10.00', '0.00', '0.00', '10.00', '0.00', NULL, '2026-04-03T09:12:09.394Z', '2026-04-03T09:12:09.394Z', '10.00');
INSERT INTO employee_leave_balances ("id", "employee_id", "leave_type_id", "org_id", "year", "total_allocated", "used", "pending", "available", "carried_forward", "expires_on", "created_at", "updated_at", "remaining") VALUES ('591812d4-8d6b-4d7b-a1ae-b8b2b2e60414', 'dc790635-a29c-476c-a5db-cf37e8d795a0', '652b9ebc-9805-4eaf-9f71-432f3fce4eac', 'adb32da4-2521-4484-8c05-31267bd4a9c2', 2026, '0.00', '0.00', '0.00', '0.00', '0.00', NULL, '2026-04-03T09:12:09.395Z', '2026-04-03T09:12:09.395Z', '0.00');
INSERT INTO employee_leave_balances ("id", "employee_id", "leave_type_id", "org_id", "year", "total_allocated", "used", "pending", "available", "carried_forward", "expires_on", "created_at", "updated_at", "remaining") VALUES ('8263f63b-f550-44c4-895b-8824c1148c0c', 'dc790635-a29c-476c-a5db-cf37e8d795a0', '62019624-d22b-4008-a0d8-2d5c1215cb32', 'adb32da4-2521-4484-8c05-31267bd4a9c2', 2026, '12.00', '2.00', '0.00', '10.00', '0.00', NULL, '2026-04-03T09:12:09.395Z', '2026-04-03T09:41:13.798Z', '12.00');

-- Table: employee_product_assignments
DROP TABLE IF EXISTS employee_product_assignments CASCADE;
CREATE TABLE employee_product_assignments (id uuid NOT NULL DEFAULT gen_random_uuid(), org_id uuid NOT NULL, employee_id uuid NOT NULL, product_id uuid NOT NULL, quantity integer NOT NULL DEFAULT 1, status character varying(50) DEFAULT 'assigned'::character varying, assigned_date date DEFAULT CURRENT_DATE, return_date date, condition_at_assignment character varying(100), condition_at_return character varying(100), notes text, assigned_by uuid, returned_by uuid, created_at timestamp with time zone DEFAULT now(), updated_at timestamp with time zone DEFAULT now());

-- Data for employee_product_assignments
INSERT INTO employee_product_assignments ("id", "org_id", "employee_id", "product_id", "quantity", "status", "assigned_date", "return_date", "condition_at_assignment", "condition_at_return", "notes", "assigned_by", "returned_by", "created_at", "updated_at") VALUES ('7b93b18c-4ee5-4d3b-983e-15670ebd773f', 'adb32da4-2521-4484-8c05-31267bd4a9c2', 'dc790635-a29c-476c-a5db-cf37e8d795a0', 'c0b199b4-4e12-4953-aa37-8c5e81d569de', 1, 'assigned', '2026-04-02T19:00:00.000Z', NULL, 'new', NULL, '', 'c0ca5c67-7dd5-4cde-8311-425d5e886dbf', NULL, '2026-04-03T09:22:06.058Z', '2026-04-03T09:22:06.058Z');
INSERT INTO employee_product_assignments ("id", "org_id", "employee_id", "product_id", "quantity", "status", "assigned_date", "return_date", "condition_at_assignment", "condition_at_return", "notes", "assigned_by", "returned_by", "created_at", "updated_at") VALUES ('f395392c-bed7-4a51-82b2-249d3f4c1731', 'adb32da4-2521-4484-8c05-31267bd4a9c2', 'dc790635-a29c-476c-a5db-cf37e8d795a0', 'c0b199b4-4e12-4953-aa37-8c5e81d569de', 1, 'assigned', '2026-04-02T19:00:00.000Z', NULL, 'new', NULL, '', 'c0ca5c67-7dd5-4cde-8311-425d5e886dbf', NULL, '2026-04-03T09:22:16.290Z', '2026-04-03T09:22:16.290Z');
INSERT INTO employee_product_assignments ("id", "org_id", "employee_id", "product_id", "quantity", "status", "assigned_date", "return_date", "condition_at_assignment", "condition_at_return", "notes", "assigned_by", "returned_by", "created_at", "updated_at") VALUES ('6e62429b-71a0-4939-9331-5698e6e74dbd', 'adb32da4-2521-4484-8c05-31267bd4a9c2', 'dc790635-a29c-476c-a5db-cf37e8d795a0', 'c0b199b4-4e12-4953-aa37-8c5e81d569de', 1, 'assigned', '2026-04-02T19:00:00.000Z', NULL, 'new', NULL, '', 'c0ca5c67-7dd5-4cde-8311-425d5e886dbf', NULL, '2026-04-03T09:22:31.166Z', '2026-04-03T09:22:31.166Z');
INSERT INTO employee_product_assignments ("id", "org_id", "employee_id", "product_id", "quantity", "status", "assigned_date", "return_date", "condition_at_assignment", "condition_at_return", "notes", "assigned_by", "returned_by", "created_at", "updated_at") VALUES ('2da54503-e440-491b-b308-8e764674d10e', 'adb32da4-2521-4484-8c05-31267bd4a9c2', 'dc790635-a29c-476c-a5db-cf37e8d795a0', 'c0b199b4-4e12-4953-aa37-8c5e81d569de', 1, 'assigned', '2026-04-02T19:00:00.000Z', NULL, 'new', NULL, '', 'c0ca5c67-7dd5-4cde-8311-425d5e886dbf', NULL, '2026-04-03T09:23:23.463Z', '2026-04-03T09:23:23.463Z');

-- Table: employee_salaries
DROP TABLE IF EXISTS employee_salaries CASCADE;
CREATE TABLE employee_salaries (id uuid NOT NULL DEFAULT gen_random_uuid(), org_id uuid NOT NULL, employee_id uuid NOT NULL, basic_salary numeric NOT NULL, effective_from date NOT NULL, effective_to date, is_active boolean DEFAULT true, created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP, updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP);

-- Table: employees
DROP TABLE IF EXISTS employees CASCADE;
CREATE TABLE employees (id uuid NOT NULL DEFAULT uuid_generate_v4(), organization_id uuid, user_id uuid, employee_code character varying(50), first_name character varying(100) NOT NULL, last_name character varying(100) NOT NULL, email character varying(255) NOT NULL, phone character varying(50), date_of_birth date, gender character varying(20), address text, city character varying(100), state character varying(100), country character varying(100), postal_code character varying(20), department character varying(100), "position" character varying(100), employment_type character varying(50) DEFAULT 'full-time'::character varying, join_date date, termination_date date, salary numeric, currency character varying(10) DEFAULT 'USD'::character varying, bank_account character varying(100), tax_id character varying(100), emergency_contact_name character varying(255), emergency_contact_phone character varying(50), status character varying(50) DEFAULT 'active'::character varying, profile_picture_url character varying(500), notes text, created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP, updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP, manager_id uuid, employee_id character varying(50), org_id uuid, name character varying(255), job_title character varying(255), hire_date date, created_by uuid, reporting_manager_id uuid, work_email character varying(255), probation_end_date date, contract_type character varying(50), blood_group character varying(10), marital_status character varying(20), nationality character varying(100), updated_by uuid, profile_picture character varying(500), emergency_contact_relationship character varying(100));

-- Data for employees
INSERT INTO employees ("id", "organization_id", "user_id", "employee_code", "first_name", "last_name", "email", "phone", "date_of_birth", "gender", "address", "city", "state", "country", "postal_code", "department", "position", "employment_type", "join_date", "termination_date", "salary", "currency", "bank_account", "tax_id", "emergency_contact_name", "emergency_contact_phone", "status", "profile_picture_url", "notes", "created_at", "updated_at", "manager_id", "employee_id", "org_id", "name", "job_title", "hire_date", "created_by", "reporting_manager_id", "work_email", "probation_end_date", "contract_type", "blood_group", "marital_status", "nationality", "updated_by", "profile_picture", "emergency_contact_relationship") VALUES ('dc790635-a29c-476c-a5db-cf37e8d795a0', NULL, 'c0ca5c67-7dd5-4cde-8311-425d5e886dbf', NULL, 'Jawad', 'Abbas', 'jawadabbas202020@gmail.com', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'full-time', NULL, NULL, NULL, 'USD', NULL, NULL, NULL, NULL, 'active', NULL, NULL, '2026-04-03T09:01:49.090Z', '2026-04-03T09:01:49.090Z', NULL, NULL, 'adb32da4-2521-4484-8c05-31267bd4a9c2', 'Jawad Abbas', NULL, '2026-04-02T19:00:00.000Z', 'c0ca5c67-7dd5-4cde-8311-425d5e886dbf', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);

-- Table: entity_drive_files
DROP TABLE IF EXISTS entity_drive_files CASCADE;
CREATE TABLE entity_drive_files (id uuid NOT NULL DEFAULT gen_random_uuid(), org_id uuid NOT NULL, entity_type character varying(50) NOT NULL, entity_id uuid NOT NULL, provider character varying(50) NOT NULL, drive_connection_id uuid, file_id character varying(255) NOT NULL, file_name character varying(255) NOT NULL, mime_type character varying(100), file_size bigint, web_view_link text, thumbnail_link text, folder_path text, linked_by uuid, created_at timestamp with time zone DEFAULT now(), updated_at timestamp with time zone DEFAULT now());

-- Table: hrms_notifications
DROP TABLE IF EXISTS hrms_notifications CASCADE;
CREATE TABLE hrms_notifications (id uuid NOT NULL DEFAULT uuid_generate_v4(), organization_id uuid, employee_id uuid, type character varying(50) NOT NULL, title character varying(255) NOT NULL, message text, is_read boolean DEFAULT false, created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP, org_id uuid, updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP, notification_type character varying(100), user_id uuid, created_by uuid, priority character varying(50) DEFAULT 'normal'::character varying, action_url text);

-- Table: invoice_items
DROP TABLE IF EXISTS invoice_items CASCADE;
CREATE TABLE invoice_items (id uuid NOT NULL DEFAULT uuid_generate_v4(), invoice_id uuid, product_id uuid, description text NOT NULL, quantity numeric NOT NULL, unit_price numeric NOT NULL, tax_rate numeric DEFAULT 0, discount_percent numeric DEFAULT 0, total_price numeric NOT NULL, created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP, updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP);

-- Table: invoices
DROP TABLE IF EXISTS invoices CASCADE;
CREATE TABLE invoices (id uuid NOT NULL DEFAULT uuid_generate_v4(), organization_id uuid, invoice_number character varying(100) NOT NULL, customer_id uuid, contact_id uuid, invoice_date date NOT NULL, due_date date, status character varying(50) DEFAULT 'draft'::character varying, subtotal numeric DEFAULT 0, tax_amount numeric DEFAULT 0, discount_amount numeric DEFAULT 0, total_amount numeric DEFAULT 0, paid_amount numeric DEFAULT 0, balance_due numeric DEFAULT 0, currency character varying(10) DEFAULT 'USD'::character varying, notes text, terms text, created_by uuid, created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP, updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP, org_id uuid, payment_terms character varying(100), payment_method character varying(50), shipping_address text, shipping_cost numeric DEFAULT 0, payment_status character varying(50), payment_date date);

-- Table: lead_external_sources
DROP TABLE IF EXISTS lead_external_sources CASCADE;
CREATE TABLE lead_external_sources (id uuid NOT NULL DEFAULT uuid_generate_v4(), organization_id uuid, name character varying(255) NOT NULL, source_type character varying(50), api_key text, webhook_url text, config jsonb DEFAULT '{}'::jsonb, is_active boolean DEFAULT true, created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP, org_id uuid, updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP, workspace_id uuid);

-- Table: lead_imports
DROP TABLE IF EXISTS lead_imports CASCADE;
CREATE TABLE lead_imports (id uuid NOT NULL DEFAULT gen_random_uuid(), org_id uuid NOT NULL, workspace_id uuid, imported_by uuid NOT NULL, source_type character varying(50), file_name character varying(255), file_path text, field_mapping jsonb, status character varying(50) DEFAULT 'processing'::character varying, total_rows integer DEFAULT 0, successful_imports integer DEFAULT 0, failed_imports integer DEFAULT 0, duplicate_skipped integer DEFAULT 0, error_log jsonb, completed_at timestamp with time zone, created_at timestamp with time zone DEFAULT now(), updated_at timestamp with time zone DEFAULT now());

-- Data for lead_imports
INSERT INTO lead_imports ("id", "org_id", "workspace_id", "imported_by", "source_type", "file_name", "file_path", "field_mapping", "status", "total_rows", "successful_imports", "failed_imports", "duplicate_skipped", "error_log", "completed_at", "created_at", "updated_at") VALUES ('96579d62-e1d2-4668-b6d8-e2a04ebe2825', 'adb32da4-2521-4484-8c05-31267bd4a9c2', NULL, 'c0ca5c67-7dd5-4cde-8311-425d5e886dbf', 'csv', '1775146650990-7o7eg.csv', '1775146650990-7o7eg.csv', [object Object], 'partial', 10, 0, 10, 0, ARRAY['[object Object]','[object Object]','[object Object]','[object Object]','[object Object]','[object Object]','[object Object]','[object Object]','[object Object]','[object Object]'], '2026-04-02T16:20:07.017Z', '2026-04-02T16:19:44.710Z', '2026-04-02T16:19:44.710Z');
INSERT INTO lead_imports ("id", "org_id", "workspace_id", "imported_by", "source_type", "file_name", "file_path", "field_mapping", "status", "total_rows", "successful_imports", "failed_imports", "duplicate_skipped", "error_log", "completed_at", "created_at", "updated_at") VALUES ('b1340d47-a9dd-4918-993f-1fd890d831af', 'adb32da4-2521-4484-8c05-31267bd4a9c2', NULL, 'c0ca5c67-7dd5-4cde-8311-425d5e886dbf', 'csv', '1775146824983-7vuk9a.csv', '1775146824983-7vuk9a.csv', [object Object], 'processing', 0, 0, 0, 0, NULL, NULL, '2026-04-02T16:20:26.628Z', '2026-04-02T16:20:26.628Z');
INSERT INTO lead_imports ("id", "org_id", "workspace_id", "imported_by", "source_type", "file_name", "file_path", "field_mapping", "status", "total_rows", "successful_imports", "failed_imports", "duplicate_skipped", "error_log", "completed_at", "created_at", "updated_at") VALUES ('79ab933d-872f-485b-ab62-b9765994af7a', 'adb32da4-2521-4484-8c05-31267bd4a9c2', NULL, 'c0ca5c67-7dd5-4cde-8311-425d5e886dbf', 'csv', '1775146824983-7vuk9a.csv', '1775146824983-7vuk9a.csv', [object Object], 'processing', 0, 0, 0, 0, NULL, NULL, '2026-04-02T16:20:44.168Z', '2026-04-02T16:20:44.168Z');
INSERT INTO lead_imports ("id", "org_id", "workspace_id", "imported_by", "source_type", "file_name", "file_path", "field_mapping", "status", "total_rows", "successful_imports", "failed_imports", "duplicate_skipped", "error_log", "completed_at", "created_at", "updated_at") VALUES ('a02ba98c-bc2b-4dac-8e11-2abab47cdf43', 'adb32da4-2521-4484-8c05-31267bd4a9c2', NULL, 'c0ca5c67-7dd5-4cde-8311-425d5e886dbf', 'csv', '1775146824983-7vuk9a.csv', '1775146824983-7vuk9a.csv', [object Object], 'processing', 0, 0, 0, 0, NULL, NULL, '2026-04-02T16:20:55.752Z', '2026-04-02T16:20:55.752Z');
INSERT INTO lead_imports ("id", "org_id", "workspace_id", "imported_by", "source_type", "file_name", "file_path", "field_mapping", "status", "total_rows", "successful_imports", "failed_imports", "duplicate_skipped", "error_log", "completed_at", "created_at", "updated_at") VALUES ('8bbb94e3-fa16-4284-bda3-58f1243ba423', 'adb32da4-2521-4484-8c05-31267bd4a9c2', NULL, 'c0ca5c67-7dd5-4cde-8311-425d5e886dbf', 'csv', '1775146824983-7vuk9a.csv', '1775146824983-7vuk9a.csv', [object Object], 'partial', 10, 0, 10, 0, ARRAY['[object Object]','[object Object]','[object Object]','[object Object]','[object Object]','[object Object]','[object Object]','[object Object]','[object Object]','[object Object]'], '2026-04-02T16:21:27.757Z', '2026-04-02T16:21:06.305Z', '2026-04-02T16:21:06.305Z');
INSERT INTO lead_imports ("id", "org_id", "workspace_id", "imported_by", "source_type", "file_name", "file_path", "field_mapping", "status", "total_rows", "successful_imports", "failed_imports", "duplicate_skipped", "error_log", "completed_at", "created_at", "updated_at") VALUES ('042a929d-f1bf-407e-8a0a-c89519defb7f', 'adb32da4-2521-4484-8c05-31267bd4a9c2', NULL, 'c0ca5c67-7dd5-4cde-8311-425d5e886dbf', 'csv', '1775146951359-4vzmi.csv', '1775146951359-4vzmi.csv', [object Object], 'completed', 10, 10, 0, 0, ARRAY[], '2026-04-02T16:22:32.846Z', '2026-04-02T16:22:32.791Z', '2026-04-02T16:22:32.791Z');
INSERT INTO lead_imports ("id", "org_id", "workspace_id", "imported_by", "source_type", "file_name", "file_path", "field_mapping", "status", "total_rows", "successful_imports", "failed_imports", "duplicate_skipped", "error_log", "completed_at", "created_at", "updated_at") VALUES ('85bf3c5c-6f76-4a4c-9ff3-eb8b7ae7b1ab', 'adb32da4-2521-4484-8c05-31267bd4a9c2', NULL, 'c0ca5c67-7dd5-4cde-8311-425d5e886dbf', 'csv', '1775208296039-qksl9.csv', '1775208296039-qksl9.csv', [object Object], 'completed', 10, 0, 0, 10, ARRAY[], '2026-04-03T09:24:57.147Z', '2026-04-03T09:24:57.128Z', '2026-04-03T09:24:57.128Z');

-- Table: lead_workspace_access
DROP TABLE IF EXISTS lead_workspace_access CASCADE;
CREATE TABLE lead_workspace_access (id uuid NOT NULL DEFAULT gen_random_uuid(), lead_id uuid NOT NULL, workspace_id uuid NOT NULL, granted_by uuid, expires_at timestamp with time zone, created_at timestamp with time zone DEFAULT now(), updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP);

-- Table: lead_workspaces
DROP TABLE IF EXISTS lead_workspaces CASCADE;
CREATE TABLE lead_workspaces (id uuid NOT NULL DEFAULT uuid_generate_v4(), organization_id uuid, name character varying(255) NOT NULL, description text, created_by uuid, created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP, org_id uuid, updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP);

-- Table: leads
DROP TABLE IF EXISTS leads CASCADE;
CREATE TABLE leads (id uuid NOT NULL DEFAULT uuid_generate_v4(), organization_id uuid, first_name character varying(100), last_name character varying(100), email character varying(255), phone character varying(50), company character varying(255), job_title character varying(100), source character varying(100), status character varying(50) DEFAULT 'new'::character varying, score integer DEFAULT 0, notes text, assigned_to uuid, converted_to_deal boolean DEFAULT false, created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP, updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP, workspace_id uuid, deal_id uuid, campaign_id uuid, utm_source character varying(100), utm_medium character varying(100), utm_campaign character varying(100), contact_id uuid, org_id uuid, converted_to_deal_id uuid, converted_at timestamp without time zone, external_source_id character varying(100), pipeline character varying(100), owner_id uuid, lead_source character varying(100), user_id uuid, company_id uuid, external_id character varying(255), name character varying(255), company_name character varying(255), company_email character varying(255), company_phone character varying(50), designation character varying(255), website character varying(255), address text, company_size character varying(50), agent_name character varying(255), decision_maker character varying(255), service_interested character varying(255), interaction_notes text, first_message text, last_touch timestamp with time zone, source_info jsonb, phone_type character varying(50), email_type character varying(50), website_type character varying(50), customer_type character varying(50), last_contacted_date timestamp with time zone, next_follow_up_date timestamp with time zone, responsible_person character varying(255), priority character varying(50), tags ARRAY, expected_close_date date, description text, title character varying(255), stage character varying(100) DEFAULT 'new'::character varying, value numeric DEFAULT 0, currency character varying(10) DEFAULT 'USD'::character varying, import_id uuid, created_by uuid, updated_by uuid, is_converted boolean DEFAULT false);

-- Data for leads
INSERT INTO leads ("id", "organization_id", "first_name", "last_name", "email", "phone", "company", "job_title", "source", "status", "score", "notes", "assigned_to", "converted_to_deal", "created_at", "updated_at", "workspace_id", "deal_id", "campaign_id", "utm_source", "utm_medium", "utm_campaign", "contact_id", "org_id", "converted_to_deal_id", "converted_at", "external_source_id", "pipeline", "owner_id", "lead_source", "user_id", "company_id", "external_id", "name", "company_name", "company_email", "company_phone", "designation", "website", "address", "company_size", "agent_name", "decision_maker", "service_interested", "interaction_notes", "first_message", "last_touch", "source_info", "phone_type", "email_type", "website_type", "customer_type", "last_contacted_date", "next_follow_up_date", "responsible_person", "priority", "tags", "expected_close_date", "description", "title", "stage", "value", "currency", "import_id", "created_by", "updated_by", "is_converted") VALUES ('cb887c0f-e6c6-46b0-b9dd-51fde1d138f8', NULL, NULL, NULL, 'kevint@iic.bz', '303-922-3500', NULL, NULL, 'Not interested', 'Not interested', 0, NULL, NULL, false, '2026-04-02T16:22:32.805Z', '2026-04-02T16:22:32.805Z', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'adb32da4-2521-4484-8c05-31267bd4a9c2', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Kevin Tighe', 'Innovative Interiors & Construction', NULL, NULL, 'N/A', 'http://iic.bz/', 'N/A', NULL, NULL, NULL, NULL, 'Please remove my email, as well as any other @iic.bz email from your contact list.', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Kevin Tighe', 'new', '0', 'USD', '042a929d-f1bf-407e-8a0a-c89519defb7f', 'c0ca5c67-7dd5-4cde-8311-425d5e886dbf', NULL, false);
INSERT INTO leads ("id", "organization_id", "first_name", "last_name", "email", "phone", "company", "job_title", "source", "status", "score", "notes", "assigned_to", "converted_to_deal", "created_at", "updated_at", "workspace_id", "deal_id", "campaign_id", "utm_source", "utm_medium", "utm_campaign", "contact_id", "org_id", "converted_to_deal_id", "converted_at", "external_source_id", "pipeline", "owner_id", "lead_source", "user_id", "company_id", "external_id", "name", "company_name", "company_email", "company_phone", "designation", "website", "address", "company_size", "agent_name", "decision_maker", "service_interested", "interaction_notes", "first_message", "last_touch", "source_info", "phone_type", "email_type", "website_type", "customer_type", "last_contacted_date", "next_follow_up_date", "responsible_person", "priority", "tags", "expected_close_date", "description", "title", "stage", "value", "currency", "import_id", "created_by", "updated_by", "is_converted") VALUES ('d1426ed0-ad51-404c-9c8c-c0a11ff1b078', NULL, NULL, NULL, 'ramil@mrengcon.com', '510-449-4862', NULL, NULL, 'Interested', 'Interested', 0, 'Client restricted scope to MEP engineering only; multiple follow-ups sent with no reply.', NULL, false, '2026-04-02T16:22:32.816Z', '2026-04-02T16:22:32.816Z', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'adb32da4-2521-4484-8c05-31267bd4a9c2', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Ramil Batiancila', 'MR Engineering Consultants', NULL, NULL, 'Senior Electrical Engineer', 'https://www.mrengcon.com/', 'N/A', NULL, 'Jesus Rogers', NULL, NULL, 'Thank you for reaching out to us!   We are only bidding on the MEP engineering part if it is required.', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Ramil Batiancila', 'new', '0', 'USD', '042a929d-f1bf-407e-8a0a-c89519defb7f', 'c0ca5c67-7dd5-4cde-8311-425d5e886dbf', NULL, false);
INSERT INTO leads ("id", "organization_id", "first_name", "last_name", "email", "phone", "company", "job_title", "source", "status", "score", "notes", "assigned_to", "converted_to_deal", "created_at", "updated_at", "workspace_id", "deal_id", "campaign_id", "utm_source", "utm_medium", "utm_campaign", "contact_id", "org_id", "converted_to_deal_id", "converted_at", "external_source_id", "pipeline", "owner_id", "lead_source", "user_id", "company_id", "external_id", "name", "company_name", "company_email", "company_phone", "designation", "website", "address", "company_size", "agent_name", "decision_maker", "service_interested", "interaction_notes", "first_message", "last_touch", "source_info", "phone_type", "email_type", "website_type", "customer_type", "last_contacted_date", "next_follow_up_date", "responsible_person", "priority", "tags", "expected_close_date", "description", "title", "stage", "value", "currency", "import_id", "created_by", "updated_by", "is_converted") VALUES ('a2ce2c17-e4f0-48f0-aa39-201f2423524e', NULL, NULL, NULL, 'gflores@tallerdosflores.com', '626-379-6952', NULL, NULL, 'Not Intrested', 'Not Intrested', 0, NULL, NULL, false, '2026-04-02T16:22:32.822Z', '2026-04-02T16:22:32.822Z', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'adb32da4-2521-4484-8c05-31267bd4a9c2', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Guadalupe Flores', 'Guadalupe Flores', NULL, NULL, 'N/A', 'https://www.tallerdosflores.com/', 'N/A', NULL, NULL, NULL, NULL, 'Thank you for your email. I am not interested.', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Guadalupe Flores', 'new', '0', 'USD', '042a929d-f1bf-407e-8a0a-c89519defb7f', 'c0ca5c67-7dd5-4cde-8311-425d5e886dbf', NULL, false);
INSERT INTO leads ("id", "organization_id", "first_name", "last_name", "email", "phone", "company", "job_title", "source", "status", "score", "notes", "assigned_to", "converted_to_deal", "created_at", "updated_at", "workspace_id", "deal_id", "campaign_id", "utm_source", "utm_medium", "utm_campaign", "contact_id", "org_id", "converted_to_deal_id", "converted_at", "external_source_id", "pipeline", "owner_id", "lead_source", "user_id", "company_id", "external_id", "name", "company_name", "company_email", "company_phone", "designation", "website", "address", "company_size", "agent_name", "decision_maker", "service_interested", "interaction_notes", "first_message", "last_touch", "source_info", "phone_type", "email_type", "website_type", "customer_type", "last_contacted_date", "next_follow_up_date", "responsible_person", "priority", "tags", "expected_close_date", "description", "title", "stage", "value", "currency", "import_id", "created_by", "updated_by", "is_converted") VALUES ('a55a53a7-33f8-456e-a1a5-7796cc51bbc9', NULL, NULL, NULL, 'yash@xlconstructionllc.com', '443-784-7683', NULL, NULL, 'Not interested', 'Not interested', 0, NULL, NULL, false, '2026-04-02T16:22:32.829Z', '2026-04-02T16:22:32.829Z', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'adb32da4-2521-4484-8c05-31267bd4a9c2', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Yash Domadia', 'XL Construction LLC', NULL, NULL, 'N/A', 'http://xlconstructionllc.com/', 'N/A', NULL, NULL, NULL, NULL, 'we are not interested.', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Yash Domadia', 'new', '0', 'USD', '042a929d-f1bf-407e-8a0a-c89519defb7f', 'c0ca5c67-7dd5-4cde-8311-425d5e886dbf', NULL, false);
INSERT INTO leads ("id", "organization_id", "first_name", "last_name", "email", "phone", "company", "job_title", "source", "status", "score", "notes", "assigned_to", "converted_to_deal", "created_at", "updated_at", "workspace_id", "deal_id", "campaign_id", "utm_source", "utm_medium", "utm_campaign", "contact_id", "org_id", "converted_to_deal_id", "converted_at", "external_source_id", "pipeline", "owner_id", "lead_source", "user_id", "company_id", "external_id", "name", "company_name", "company_email", "company_phone", "designation", "website", "address", "company_size", "agent_name", "decision_maker", "service_interested", "interaction_notes", "first_message", "last_touch", "source_info", "phone_type", "email_type", "website_type", "customer_type", "last_contacted_date", "next_follow_up_date", "responsible_person", "priority", "tags", "expected_close_date", "description", "title", "stage", "value", "currency", "import_id", "created_by", "updated_by", "is_converted") VALUES ('4fb0349f-d512-416e-80f4-20a573bba195', NULL, NULL, NULL, 'djames@ttgutilities.com', '254-248-1151', NULL, NULL, 'Not interested', 'Not interested', 0, NULL, NULL, false, '2026-04-02T16:22:32.832Z', '2026-04-02T16:22:32.832Z', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'adb32da4-2521-4484-8c05-31267bd4a9c2', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Dawna James', 'TTG Utilities, LP', NULL, NULL, 'Contract Specialist', 'https://www.ttgutilities.com/', 'McLennan County, TX', NULL, NULL, NULL, NULL, 'We have no need for these services.  Please remove me from your mailing list.', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Dawna James', 'new', '0', 'USD', '042a929d-f1bf-407e-8a0a-c89519defb7f', 'c0ca5c67-7dd5-4cde-8311-425d5e886dbf', NULL, false);
INSERT INTO leads ("id", "organization_id", "first_name", "last_name", "email", "phone", "company", "job_title", "source", "status", "score", "notes", "assigned_to", "converted_to_deal", "created_at", "updated_at", "workspace_id", "deal_id", "campaign_id", "utm_source", "utm_medium", "utm_campaign", "contact_id", "org_id", "converted_to_deal_id", "converted_at", "external_source_id", "pipeline", "owner_id", "lead_source", "user_id", "company_id", "external_id", "name", "company_name", "company_email", "company_phone", "designation", "website", "address", "company_size", "agent_name", "decision_maker", "service_interested", "interaction_notes", "first_message", "last_touch", "source_info", "phone_type", "email_type", "website_type", "customer_type", "last_contacted_date", "next_follow_up_date", "responsible_person", "priority", "tags", "expected_close_date", "description", "title", "stage", "value", "currency", "import_id", "created_by", "updated_by", "is_converted") VALUES ('de54ed89-87aa-4156-a0b4-d1bf218dabbc', NULL, NULL, NULL, 'hector@romoelectric.com', '2818029933', NULL, NULL, 'Interested', 'Interested', 0, 'Sent samples and pricing explanation; no reply to multiple follow-up attempts.', NULL, false, '2026-04-02T16:22:32.836Z', '2026-04-02T16:22:32.836Z', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'adb32da4-2521-4484-8c05-31267bd4a9c2', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Hector Romo', 'ROMO ELECTRIC INC', NULL, NULL, 'N/A', 'www.romoelectric.com', 'N/A', NULL, 'Dominic Leonard', NULL, NULL, 'Can you send me your prices chart and a sample of one of your estimates?', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Hector Romo', 'new', '0', 'USD', '042a929d-f1bf-407e-8a0a-c89519defb7f', 'c0ca5c67-7dd5-4cde-8311-425d5e886dbf', NULL, false);
INSERT INTO leads ("id", "organization_id", "first_name", "last_name", "email", "phone", "company", "job_title", "source", "status", "score", "notes", "assigned_to", "converted_to_deal", "created_at", "updated_at", "workspace_id", "deal_id", "campaign_id", "utm_source", "utm_medium", "utm_campaign", "contact_id", "org_id", "converted_to_deal_id", "converted_at", "external_source_id", "pipeline", "owner_id", "lead_source", "user_id", "company_id", "external_id", "name", "company_name", "company_email", "company_phone", "designation", "website", "address", "company_size", "agent_name", "decision_maker", "service_interested", "interaction_notes", "first_message", "last_touch", "source_info", "phone_type", "email_type", "website_type", "customer_type", "last_contacted_date", "next_follow_up_date", "responsible_person", "priority", "tags", "expected_close_date", "description", "title", "stage", "value", "currency", "import_id", "created_by", "updated_by", "is_converted") VALUES ('0f0d09fc-a06b-4ef4-8b68-54bcf090ca0c', NULL, NULL, NULL, 'kleensolution@yahoo.com', '707-293-0928', NULL, NULL, 'Not interested', 'Not interested', 0, NULL, NULL, false, '2026-04-02T16:22:32.839Z', '2026-04-02T16:22:32.839Z', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'adb32da4-2521-4484-8c05-31267bd4a9c2', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Brandon Wienholz', 'Kleen Solution Environmental', NULL, NULL, 'N/A', 'N/A', 'N/A', NULL, NULL, NULL, NULL, 'Please stop contacting me… There’s not a single thing you can do for me on this project', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Brandon Wienholz', 'new', '0', 'USD', '042a929d-f1bf-407e-8a0a-c89519defb7f', 'c0ca5c67-7dd5-4cde-8311-425d5e886dbf', NULL, false);
INSERT INTO leads ("id", "organization_id", "first_name", "last_name", "email", "phone", "company", "job_title", "source", "status", "score", "notes", "assigned_to", "converted_to_deal", "created_at", "updated_at", "workspace_id", "deal_id", "campaign_id", "utm_source", "utm_medium", "utm_campaign", "contact_id", "org_id", "converted_to_deal_id", "converted_at", "external_source_id", "pipeline", "owner_id", "lead_source", "user_id", "company_id", "external_id", "name", "company_name", "company_email", "company_phone", "designation", "website", "address", "company_size", "agent_name", "decision_maker", "service_interested", "interaction_notes", "first_message", "last_touch", "source_info", "phone_type", "email_type", "website_type", "customer_type", "last_contacted_date", "next_follow_up_date", "responsible_person", "priority", "tags", "expected_close_date", "description", "title", "stage", "value", "currency", "import_id", "created_by", "updated_by", "is_converted") VALUES ('81f1b513-8d65-4608-bc88-01eff48ea556', NULL, NULL, NULL, 'hunter@dutexas.com', '(469) 206-9500', NULL, NULL, 'Not interested', 'Not interested', 0, NULL, NULL, false, '2026-04-02T16:22:32.841Z', '2026-04-02T16:22:32.841Z', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'adb32da4-2521-4484-8c05-31267bd4a9c2', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Hunter Pruitt', 'Dallas Underground, LLC', NULL, NULL, 'Estimator', 'https://www.dutexas.com/', 'Dallas County, TX', NULL, NULL, NULL, NULL, 'Please remove myself, and Dallas Underground, from this sending list.', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Hunter Pruitt', 'new', '0', 'USD', '042a929d-f1bf-407e-8a0a-c89519defb7f', 'c0ca5c67-7dd5-4cde-8311-425d5e886dbf', NULL, false);
INSERT INTO leads ("id", "organization_id", "first_name", "last_name", "email", "phone", "company", "job_title", "source", "status", "score", "notes", "assigned_to", "converted_to_deal", "created_at", "updated_at", "workspace_id", "deal_id", "campaign_id", "utm_source", "utm_medium", "utm_campaign", "contact_id", "org_id", "converted_to_deal_id", "converted_at", "external_source_id", "pipeline", "owner_id", "lead_source", "user_id", "company_id", "external_id", "name", "company_name", "company_email", "company_phone", "designation", "website", "address", "company_size", "agent_name", "decision_maker", "service_interested", "interaction_notes", "first_message", "last_touch", "source_info", "phone_type", "email_type", "website_type", "customer_type", "last_contacted_date", "next_follow_up_date", "responsible_person", "priority", "tags", "expected_close_date", "description", "title", "stage", "value", "currency", "import_id", "created_by", "updated_by", "is_converted") VALUES ('2c3be1e5-c829-4254-bbd0-e43a9ecddc63', NULL, NULL, NULL, 'jlovell@dirtrockdallas.com', '469-314-1660', NULL, NULL, 'Neutral', 'qualified', 0, NULL, NULL, false, '2026-04-02T16:22:32.826Z', '2026-04-02T16:37:11.280Z', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'adb32da4-2521-4484-8c05-31267bd4a9c2', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Jerry Lovell', 'DirtRock Dallas', NULL, NULL, 'Operations Manager', 'https://dirtrockdallas.com/', 'Dallas County, TX', NULL, NULL, NULL, NULL, 'Thanks for reaching out.  We do not need estimating services at this time.', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Jerry Lovell', 'qualified', '0', 'USD', '042a929d-f1bf-407e-8a0a-c89519defb7f', 'c0ca5c67-7dd5-4cde-8311-425d5e886dbf', NULL, false);
INSERT INTO leads ("id", "organization_id", "first_name", "last_name", "email", "phone", "company", "job_title", "source", "status", "score", "notes", "assigned_to", "converted_to_deal", "created_at", "updated_at", "workspace_id", "deal_id", "campaign_id", "utm_source", "utm_medium", "utm_campaign", "contact_id", "org_id", "converted_to_deal_id", "converted_at", "external_source_id", "pipeline", "owner_id", "lead_source", "user_id", "company_id", "external_id", "name", "company_name", "company_email", "company_phone", "designation", "website", "address", "company_size", "agent_name", "decision_maker", "service_interested", "interaction_notes", "first_message", "last_touch", "source_info", "phone_type", "email_type", "website_type", "customer_type", "last_contacted_date", "next_follow_up_date", "responsible_person", "priority", "tags", "expected_close_date", "description", "title", "stage", "value", "currency", "import_id", "created_by", "updated_by", "is_converted") VALUES ('0752ab3f-69a1-4df9-90ac-2db498ea4f75', NULL, NULL, NULL, 'ebreedlove@millis.com', '12813893838', NULL, NULL, 'Neutral', 'proposal', 0, NULL, NULL, false, '2026-04-02T16:22:32.844Z', '2026-04-03T09:00:08.464Z', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'adb32da4-2521-4484-8c05-31267bd4a9c2', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Eddie Breedlove', 'MILLIS EQUIPMENT', NULL, NULL, 'Estimator', 'https://millis.com/', 'N/A', NULL, NULL, NULL, NULL, 'Thank you but we have our own estimating.Thanks', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Eddie Breedlove', 'proposal', '0', 'USD', '042a929d-f1bf-407e-8a0a-c89519defb7f', 'c0ca5c67-7dd5-4cde-8311-425d5e886dbf', NULL, false);

-- Table: leave_balances
DROP TABLE IF EXISTS leave_balances CASCADE;
CREATE TABLE leave_balances (id uuid NOT NULL DEFAULT uuid_generate_v4(), employee_id uuid, leave_type_id uuid, year integer NOT NULL, total_days numeric DEFAULT 0, used_days numeric DEFAULT 0, remaining_days numeric DEFAULT 0, created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP, updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP);

-- Table: leave_request_comments
DROP TABLE IF EXISTS leave_request_comments CASCADE;
CREATE TABLE leave_request_comments (id uuid NOT NULL DEFAULT gen_random_uuid(), leave_request_id uuid NOT NULL, user_id uuid NOT NULL, comment text NOT NULL, action character varying(50), created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP, updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP);

-- Data for leave_request_comments
INSERT INTO leave_request_comments ("id", "leave_request_id", "user_id", "comment", "action", "created_at", "updated_at") VALUES ('ecaa4b02-9c25-47f6-ab9b-9a501e34b337', '32a15f69-ef82-4ce2-a490-c5b2b38fa148', 'c0ca5c67-7dd5-4cde-8311-425d5e886dbf', 'Leave request submitted', 'submitted', '2026-04-03T09:26:05.233Z', '2026-04-03T09:26:05.233Z');
INSERT INTO leave_request_comments ("id", "leave_request_id", "user_id", "comment", "action", "created_at", "updated_at") VALUES ('443c288b-3f61-4a6e-ada0-2de6c46728d8', '32a15f69-ef82-4ce2-a490-c5b2b38fa148', 'c0ca5c67-7dd5-4cde-8311-425d5e886dbf', 'Leave request approved', 'approved', '2026-04-03T09:41:13.802Z', '2026-04-03T09:41:13.802Z');

-- Table: leave_requests
DROP TABLE IF EXISTS leave_requests CASCADE;
CREATE TABLE leave_requests (id uuid NOT NULL DEFAULT gen_random_uuid(), employee_id uuid NOT NULL, leave_type_id uuid NOT NULL, org_id uuid NOT NULL, start_date date NOT NULL, end_date date NOT NULL, days_requested numeric NOT NULL, half_day boolean DEFAULT false, reason text NOT NULL, attachment_path text, status character varying(20) DEFAULT 'pending'::character varying, approver_id uuid, approved_at timestamp with time zone, rejection_reason text, emergency boolean DEFAULT false, contact_during_leave character varying(255), created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP, updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP, organization_id uuid, approved_by uuid, attachments jsonb DEFAULT '[]'::jsonb, created_by uuid, updated_by uuid, half_day_period character varying(20));

-- Data for leave_requests
INSERT INTO leave_requests ("id", "employee_id", "leave_type_id", "org_id", "start_date", "end_date", "days_requested", "half_day", "reason", "attachment_path", "status", "approver_id", "approved_at", "rejection_reason", "emergency", "contact_during_leave", "created_at", "updated_at", "organization_id", "approved_by", "attachments", "created_by", "updated_by", "half_day_period") VALUES ('32a15f69-ef82-4ce2-a490-c5b2b38fa148', 'dc790635-a29c-476c-a5db-cf37e8d795a0', '62019624-d22b-4008-a0d8-2d5c1215cb32', 'adb32da4-2521-4484-8c05-31267bd4a9c2', '2026-04-03T19:00:00.000Z', '2026-04-04T19:00:00.000Z', '2.00', false, 'cvxxxxxxxxxxxxxxxxxx', NULL, 'approved', 'c0ca5c67-7dd5-4cde-8311-425d5e886dbf', '2026-04-03T09:41:13.790Z', NULL, true, '', '2026-04-03T09:26:05.220Z', '2026-04-03T09:41:13.790Z', NULL, NULL, ARRAY[], NULL, NULL, NULL);

-- Table: leave_types
DROP TABLE IF EXISTS leave_types CASCADE;
CREATE TABLE leave_types (id uuid NOT NULL DEFAULT gen_random_uuid(), name character varying(100) NOT NULL, code character varying(20) NOT NULL, description text, color character varying(20) DEFAULT '#3B82F6'::character varying, days_allowed integer NOT NULL DEFAULT 0, max_consecutive_days integer, min_days_notice integer DEFAULT 0, is_paid boolean DEFAULT true, requires_approval boolean DEFAULT true, can_carry_forward boolean DEFAULT false, max_carry_forward_days integer DEFAULT 0, expires_after_months integer, applicable_to character varying(20) DEFAULT 'all'::character varying, min_service_months integer DEFAULT 0, is_active boolean DEFAULT true, created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP, updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP, organization_id uuid, days_per_year integer DEFAULT 0, org_id uuid, carry_forward boolean DEFAULT false, max_carry_forward integer DEFAULT 0, notice_days integer DEFAULT 0, created_by uuid, updated_by uuid);

-- Data for leave_types
INSERT INTO leave_types ("id", "name", "code", "description", "color", "days_allowed", "max_consecutive_days", "min_days_notice", "is_paid", "requires_approval", "can_carry_forward", "max_carry_forward_days", "expires_after_months", "applicable_to", "min_service_months", "is_active", "created_at", "updated_at", "organization_id", "days_per_year", "org_id", "carry_forward", "max_carry_forward", "notice_days", "created_by", "updated_by") VALUES ('82a3f77a-458f-4c7d-b96e-cc68c8f2677c', 'Annual Leave', 'ANNUAL_LEAVE', NULL, '#3b82f6', 20, NULL, 0, true, true, false, 0, NULL, 'all', 0, true, '2026-04-03T09:12:09.387Z', '2026-04-03T09:12:09.387Z', NULL, 0, '00000000-0000-0000-0000-000000000001', false, 0, 0, NULL, NULL);
INSERT INTO leave_types ("id", "name", "code", "description", "color", "days_allowed", "max_consecutive_days", "min_days_notice", "is_paid", "requires_approval", "can_carry_forward", "max_carry_forward_days", "expires_after_months", "applicable_to", "min_service_months", "is_active", "created_at", "updated_at", "organization_id", "days_per_year", "org_id", "carry_forward", "max_carry_forward", "notice_days", "created_by", "updated_by") VALUES ('180ee06a-6aff-4e58-bb68-4d5d749a41e7', 'Sick Leave', 'SICK_LEAVE', NULL, '#ef4444', 10, NULL, 0, true, true, false, 0, NULL, 'all', 0, true, '2026-04-03T09:12:09.388Z', '2026-04-03T09:12:09.388Z', NULL, 0, '00000000-0000-0000-0000-000000000001', false, 0, 0, NULL, NULL);
INSERT INTO leave_types ("id", "name", "code", "description", "color", "days_allowed", "max_consecutive_days", "min_days_notice", "is_paid", "requires_approval", "can_carry_forward", "max_carry_forward_days", "expires_after_months", "applicable_to", "min_service_months", "is_active", "created_at", "updated_at", "organization_id", "days_per_year", "org_id", "carry_forward", "max_carry_forward", "notice_days", "created_by", "updated_by") VALUES ('62019624-d22b-4008-a0d8-2d5c1215cb32', 'Casual Leave', 'CASUAL_LEAVE', NULL, '#10b981', 12, NULL, 0, true, true, false, 0, NULL, 'all', 0, true, '2026-04-03T09:12:09.389Z', '2026-04-03T09:12:09.389Z', NULL, 0, '00000000-0000-0000-0000-000000000001', false, 0, 0, NULL, NULL);
INSERT INTO leave_types ("id", "name", "code", "description", "color", "days_allowed", "max_consecutive_days", "min_days_notice", "is_paid", "requires_approval", "can_carry_forward", "max_carry_forward_days", "expires_after_months", "applicable_to", "min_service_months", "is_active", "created_at", "updated_at", "organization_id", "days_per_year", "org_id", "carry_forward", "max_carry_forward", "notice_days", "created_by", "updated_by") VALUES ('652b9ebc-9805-4eaf-9f71-432f3fce4eac', 'Unpaid Leave', 'UNPAID_LEAVE', NULL, '#6b7280', 0, NULL, 0, false, true, false, 0, NULL, 'all', 0, true, '2026-04-03T09:12:09.390Z', '2026-04-03T09:12:09.390Z', NULL, 0, '00000000-0000-0000-0000-000000000001', false, 0, 0, NULL, NULL);

-- Table: marketing_ab_test_results
DROP TABLE IF EXISTS marketing_ab_test_results CASCADE;
CREATE TABLE marketing_ab_test_results (id uuid NOT NULL DEFAULT uuid_generate_v4(), test_id uuid, variant_id uuid, contact_id uuid, opened boolean DEFAULT false, clicked boolean DEFAULT false, converted boolean DEFAULT false, created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP, updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP);

-- Table: marketing_ab_test_variants
DROP TABLE IF EXISTS marketing_ab_test_variants CASCADE;
CREATE TABLE marketing_ab_test_variants (id uuid NOT NULL DEFAULT uuid_generate_v4(), test_id uuid, variant_name character varying(100) NOT NULL, subject character varying(500), content text, design jsonb, sent_count integer DEFAULT 0, opened_count integer DEFAULT 0, clicked_count integer DEFAULT 0, conversion_count integer DEFAULT 0, created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP, updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP);

-- Table: marketing_ab_tests
DROP TABLE IF EXISTS marketing_ab_tests CASCADE;
CREATE TABLE marketing_ab_tests (id uuid NOT NULL DEFAULT uuid_generate_v4(), organization_id uuid, name character varying(255) NOT NULL, description text, test_type character varying(50) DEFAULT 'subject_line'::character varying, status character varying(50) DEFAULT 'draft'::character varying, winner_criteria character varying(50) DEFAULT 'open_rate'::character varying, sample_size_percent integer DEFAULT 20, started_at timestamp without time zone, ended_at timestamp without time zone, winner_variant_id uuid, created_by uuid, created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP, org_id uuid, updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP);

-- Table: marketing_campaign_events
DROP TABLE IF EXISTS marketing_campaign_events CASCADE;
CREATE TABLE marketing_campaign_events (id uuid NOT NULL DEFAULT uuid_generate_v4(), campaign_id uuid, contact_id uuid, event_type character varying(50) NOT NULL, event_data jsonb, ip_address character varying(45), user_agent text, created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP, updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP, email character varying(255), opened_at timestamp without time zone, clicked_at timestamp without time zone);

-- Table: marketing_campaigns
DROP TABLE IF EXISTS marketing_campaigns CASCADE;
CREATE TABLE marketing_campaigns (id uuid NOT NULL DEFAULT uuid_generate_v4(), organization_id uuid, name character varying(255) NOT NULL, description text, type character varying(50) DEFAULT 'email'::character varying, subject character varying(500), content text, list_id uuid, status character varying(50) DEFAULT 'draft'::character varying, scheduled_at timestamp without time zone, sent_at timestamp without time zone, created_by uuid, created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP, updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP, campaign_type character varying(50) DEFAULT 'email'::character varying, channel character varying(50) DEFAULT 'email'::character varying, from_name character varying(255), from_email character varying(255), reply_to character varying(255), design jsonb, stats jsonb DEFAULT '{"sent": 0, "opened": 0, "bounced": 0, "clicked": 0, "delivered": 0, "unsubscribed": 0}'::jsonb, org_id uuid, segment_id uuid, sent_count integer DEFAULT 0, opened_count integer DEFAULT 0, clicked_count integer DEFAULT 0, bounced_count integer DEFAULT 0, unsubscribed_count integer DEFAULT 0, template_id uuid);

-- Data for marketing_campaigns
INSERT INTO marketing_campaigns ("id", "organization_id", "name", "description", "type", "subject", "content", "list_id", "status", "scheduled_at", "sent_at", "created_by", "created_at", "updated_at", "campaign_type", "channel", "from_name", "from_email", "reply_to", "design", "stats", "org_id", "segment_id", "sent_count", "opened_count", "clicked_count", "bounced_count", "unsubscribed_count", "template_id") VALUES ('bcf57224-943a-485f-8ae0-40b2c1c435f2', NULL, 'cxcxcx', 'cxcxcccx', 'email', 'sasassasasa', '<h1 class="ql-align-center">🎁 SPECIAL OFFER</h1><p class="ql-align-center">Exclusively for {{first_name}}</p><h2 class="ql-align-center">Limited Time Offer!</h2><p class="ql-align-center">We''re giving you an exclusive <strong>{{discount}}% discount</strong> on all products.</p><p class="ql-align-center"><br></p><p class="ql-align-center"><a href="{{shop_link}}" rel="noopener noreferrer" target="_blank" style="color: white; background-color: rgb(220, 38, 38);"> Shop Now </a></p>', NULL, 'active', NULL, NULL, 'c0ca5c67-7dd5-4cde-8311-425d5e886dbf', '2026-04-02T15:16:40.738Z', '2026-04-02T15:16:43.758Z', 'email', 'email', 'bitwords', 'jawadabbas202020@gmail.com', NULL, NULL, [object Object], 'adb32da4-2521-4484-8c05-31267bd4a9c2', NULL, 0, 0, 0, 0, 0, NULL);
INSERT INTO marketing_campaigns ("id", "organization_id", "name", "description", "type", "subject", "content", "list_id", "status", "scheduled_at", "sent_at", "created_by", "created_at", "updated_at", "campaign_type", "channel", "from_name", "from_email", "reply_to", "design", "stats", "org_id", "segment_id", "sent_count", "opened_count", "clicked_count", "bounced_count", "unsubscribed_count", "template_id") VALUES ('aa7954cd-bee5-4e7e-9c04-694dfaef8aab', NULL, 'zxc', 'cxzzzz', 'email', 'xccxcxcx', '<p class="ql-align-center">🚀</p><h1 class="ql-align-center">We''ve Launched Something New!</h1><p class="ql-align-center">Hi {{first_name}}, we''re excited to introduce <strong>{{product_name}}</strong></p><p class="ql-align-center"><br></p><p class="ql-align-center"><a href="{{cta_link}}" rel="noopener noreferrer" target="_blank" style="color: white; background-color: rgb(16, 185, 129);"> Try It Now </a></p>', NULL, 'scheduled', NULL, NULL, 'c0ca5c67-7dd5-4cde-8311-425d5e886dbf', '2026-04-03T09:13:43.758Z', '2026-04-03T09:13:43.758Z', 'email', 'email', 'zcxzzcx', 'jawadabbas202020@gmail.com', NULL, NULL, [object Object], 'adb32da4-2521-4484-8c05-31267bd4a9c2', NULL, 0, 0, 0, 0, 0, NULL);

-- Table: marketing_form_submissions
DROP TABLE IF EXISTS marketing_form_submissions CASCADE;
CREATE TABLE marketing_form_submissions (id uuid NOT NULL DEFAULT uuid_generate_v4(), form_id uuid, contact_id uuid, data jsonb NOT NULL, ip_address character varying(45), user_agent text, submitted_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP, created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP, updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP);

-- Table: marketing_forms
DROP TABLE IF EXISTS marketing_forms CASCADE;
CREATE TABLE marketing_forms (id uuid NOT NULL DEFAULT uuid_generate_v4(), organization_id uuid, name character varying(255) NOT NULL, description text, fields jsonb NOT NULL DEFAULT '[]'::jsonb, list_id uuid, is_active boolean DEFAULT true, created_by uuid, created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP, updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP, redirect_url character varying(500), thank_you_message text, submission_count integer DEFAULT 0, org_id uuid, success_message text, auto_add_to_list uuid);

-- Table: marketing_list_members
DROP TABLE IF EXISTS marketing_list_members CASCADE;
CREATE TABLE marketing_list_members (id uuid NOT NULL DEFAULT uuid_generate_v4(), list_id uuid, contact_id uuid, status character varying(50) DEFAULT 'subscribed'::character varying, subscribed_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP, unsubscribed_at timestamp without time zone, created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP, updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP, org_id uuid, added_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP);

-- Table: marketing_lists
DROP TABLE IF EXISTS marketing_lists CASCADE;
CREATE TABLE marketing_lists (id uuid NOT NULL DEFAULT uuid_generate_v4(), organization_id uuid, name character varying(255) NOT NULL, description text, type character varying(50) DEFAULT 'static'::character varying, member_count integer DEFAULT 0, created_by uuid, created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP, updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP, segment_rules jsonb, org_id uuid);

-- Data for marketing_lists
INSERT INTO marketing_lists ("id", "organization_id", "name", "description", "type", "member_count", "created_by", "created_at", "updated_at", "segment_rules", "org_id") VALUES ('dede2412-280a-47d8-b54b-9127884cdc6f', NULL, 'xcxc', 'xczzzzzzzz', 'static', 0, 'c0ca5c67-7dd5-4cde-8311-425d5e886dbf', '2026-04-03T09:14:10.991Z', '2026-04-03T09:14:10.991Z', NULL, 'adb32da4-2521-4484-8c05-31267bd4a9c2');

-- Table: marketing_scoring_history
DROP TABLE IF EXISTS marketing_scoring_history CASCADE;
CREATE TABLE marketing_scoring_history (id uuid NOT NULL DEFAULT uuid_generate_v4(), contact_id uuid, rule_id uuid, score_change integer NOT NULL, reason text, created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP, updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP);

-- Table: marketing_scoring_rules
DROP TABLE IF EXISTS marketing_scoring_rules CASCADE;
CREATE TABLE marketing_scoring_rules (id uuid NOT NULL DEFAULT uuid_generate_v4(), organization_id uuid, name character varying(255) NOT NULL, rule_type character varying(50) NOT NULL, conditions jsonb NOT NULL, score_value integer NOT NULL, is_active boolean DEFAULT true, created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP, org_id uuid, updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP);

-- Table: marketing_segments
DROP TABLE IF EXISTS marketing_segments CASCADE;
CREATE TABLE marketing_segments (id uuid NOT NULL DEFAULT uuid_generate_v4(), organization_id uuid, name character varying(255) NOT NULL, description text, rules jsonb NOT NULL, contact_count integer DEFAULT 0, created_by uuid, created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP, updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP, org_id uuid);

-- Table: marketing_sequence_enrollments
DROP TABLE IF EXISTS marketing_sequence_enrollments CASCADE;
CREATE TABLE marketing_sequence_enrollments (id uuid NOT NULL DEFAULT uuid_generate_v4(), sequence_id uuid, contact_id uuid, current_step integer DEFAULT 0, status character varying(50) DEFAULT 'active'::character varying, enrolled_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP, completed_at timestamp without time zone, created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP, updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP);

-- Table: marketing_sequence_steps
DROP TABLE IF EXISTS marketing_sequence_steps CASCADE;
CREATE TABLE marketing_sequence_steps (id uuid NOT NULL DEFAULT uuid_generate_v4(), sequence_id uuid, step_order integer NOT NULL, name character varying(255) NOT NULL, delay_days integer DEFAULT 0, delay_hours integer DEFAULT 0, email_subject character varying(500), email_content text, created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP, updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP);

-- Table: marketing_sequences
DROP TABLE IF EXISTS marketing_sequences CASCADE;
CREATE TABLE marketing_sequences (id uuid NOT NULL DEFAULT uuid_generate_v4(), organization_id uuid, name character varying(255) NOT NULL, description text, trigger_type character varying(50) DEFAULT 'manual'::character varying, is_active boolean DEFAULT true, created_by uuid, created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP, updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP, enrollment_count integer DEFAULT 0, org_id uuid, trigger_conditions jsonb DEFAULT '{}'::jsonb, steps jsonb DEFAULT '[]'::jsonb);

-- Data for marketing_sequences
INSERT INTO marketing_sequences ("id", "organization_id", "name", "description", "trigger_type", "is_active", "created_by", "created_at", "updated_at", "enrollment_count", "org_id", "trigger_conditions", "steps") VALUES ('4efb5abf-fbab-42a3-9db8-c6e6d13862d6', NULL, 'xcc', 'cxxxxxxxxxxxxxxxxxxxxxc', 'manual', true, 'c0ca5c67-7dd5-4cde-8311-425d5e886dbf', '2026-04-03T09:14:26.271Z', '2026-04-03T09:14:28.850Z', 0, 'adb32da4-2521-4484-8c05-31267bd4a9c2', NULL, ARRAY['[object Object]']);

-- Table: marketing_templates
DROP TABLE IF EXISTS marketing_templates CASCADE;
CREATE TABLE marketing_templates (id uuid NOT NULL DEFAULT uuid_generate_v4(), organization_id uuid, name character varying(255) NOT NULL, description text, category character varying(100), subject character varying(500), content text, design jsonb, thumbnail_url character varying(500), is_public boolean DEFAULT false, usage_count integer DEFAULT 0, created_by uuid, created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP, updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP, org_id uuid);

-- Table: marketing_webhook_logs
DROP TABLE IF EXISTS marketing_webhook_logs CASCADE;
CREATE TABLE marketing_webhook_logs (id uuid NOT NULL DEFAULT uuid_generate_v4(), webhook_id uuid, event_type character varying(50) NOT NULL, payload jsonb NOT NULL, response_status integer, response_body text, attempt_count integer DEFAULT 1, success boolean DEFAULT false, created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP, updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP);

-- Table: marketing_webhook_queue
DROP TABLE IF EXISTS marketing_webhook_queue CASCADE;
CREATE TABLE marketing_webhook_queue (id uuid NOT NULL DEFAULT uuid_generate_v4(), webhook_id uuid, event_type character varying(50) NOT NULL, payload jsonb NOT NULL, attempts integer DEFAULT 0, next_retry_at timestamp without time zone, status character varying(50) DEFAULT 'pending'::character varying, created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP, updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP);

-- Table: marketing_webhooks
DROP TABLE IF EXISTS marketing_webhooks CASCADE;
CREATE TABLE marketing_webhooks (id uuid NOT NULL DEFAULT uuid_generate_v4(), organization_id uuid, name character varying(255) NOT NULL, url character varying(500) NOT NULL, events ARRAY NOT NULL, secret_key character varying(255), is_active boolean DEFAULT true, retry_count integer DEFAULT 3, created_by uuid, created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP, org_id uuid, updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP);

-- Table: notification_templates
DROP TABLE IF EXISTS notification_templates CASCADE;
CREATE TABLE notification_templates (id uuid NOT NULL DEFAULT uuid_generate_v4(), organization_id uuid, name character varying(255) NOT NULL, type character varying(50) NOT NULL, subject character varying(500), body text, variables jsonb DEFAULT '[]'::jsonb, is_active boolean DEFAULT true, created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP, updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP, org_id uuid);

-- Table: notifications
DROP TABLE IF EXISTS notifications CASCADE;
CREATE TABLE notifications (id uuid NOT NULL DEFAULT uuid_generate_v4(), organization_id uuid, user_id uuid, type character varying(50) NOT NULL, title character varying(255) NOT NULL, message text, link character varying(500), is_read boolean DEFAULT false, created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP, org_id uuid, updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP);

-- Table: organizations
DROP TABLE IF EXISTS organizations CASCADE;
CREATE TABLE organizations (id uuid NOT NULL DEFAULT uuid_generate_v4(), name character varying(255) NOT NULL, domain character varying(255), settings jsonb DEFAULT '{}'::jsonb, created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP, updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP);

-- Data for organizations
INSERT INTO organizations ("id", "name", "domain", "settings", "created_at", "updated_at") VALUES ('00000000-0000-0000-0000-000000000001', 'Default Organization', 'default.local', [object Object], '2026-04-02T14:54:58.135Z', '2026-04-02T14:54:58.135Z');
INSERT INTO organizations ("id", "name", "domain", "settings", "created_at", "updated_at") VALUES ('adb32da4-2521-4484-8c05-31267bd4a9c2', 'Jawad Abbas''s Organization', NULL, [object Object], '2026-04-02T14:57:52.514Z', '2026-04-02T14:57:52.514Z');

-- Table: payroll
DROP TABLE IF EXISTS payroll CASCADE;
CREATE TABLE payroll (id uuid NOT NULL DEFAULT uuid_generate_v4(), organization_id uuid, employee_id uuid, period_start date NOT NULL, period_end date NOT NULL, basic_salary numeric NOT NULL, allowances jsonb DEFAULT '{}'::jsonb, deductions jsonb DEFAULT '{}'::jsonb, gross_salary numeric NOT NULL, net_salary numeric NOT NULL, tax_amount numeric DEFAULT 0, status character varying(50) DEFAULT 'draft'::character varying, paid_at timestamp without time zone, payment_method character varying(50), notes text, created_by uuid, created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP, updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP, org_id uuid, payment_date date, bank_reference character varying(100), updated_by uuid, approved_by uuid, approved_at timestamp with time zone);

-- Table: permissions
DROP TABLE IF EXISTS permissions CASCADE;
CREATE TABLE permissions (id uuid NOT NULL DEFAULT uuid_generate_v4(), name character varying(100) NOT NULL, resource character varying(100) NOT NULL, action character varying(50) NOT NULL, description text, created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP, updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP);

-- Table: pipeline_stages
DROP TABLE IF EXISTS pipeline_stages CASCADE;
CREATE TABLE pipeline_stages (id uuid NOT NULL DEFAULT gen_random_uuid(), org_id uuid NOT NULL, pipeline character varying(100) DEFAULT 'default'::character varying, stage_key character varying(100) NOT NULL, stage_label character varying(255) NOT NULL, sort_order integer DEFAULT 0, color character varying(50), is_active boolean DEFAULT true, created_at timestamp with time zone DEFAULT now(), updated_at timestamp with time zone DEFAULT now());

-- Table: product_batches
DROP TABLE IF EXISTS product_batches CASCADE;
CREATE TABLE product_batches (id uuid NOT NULL DEFAULT gen_random_uuid(), org_id uuid NOT NULL, product_id uuid NOT NULL, batch_number character varying(100) NOT NULL, expiration_date date, quantity integer DEFAULT 0, cost_per_unit numeric, created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP, updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP, manufacturing_date date, expiry_date date, supplier_id uuid);

-- Table: products
DROP TABLE IF EXISTS products CASCADE;
CREATE TABLE products (id uuid NOT NULL DEFAULT uuid_generate_v4(), organization_id uuid, name character varying(255) NOT NULL, sku character varying(100), description text, category character varying(100), unit character varying(50) DEFAULT 'piece'::character varying, price numeric DEFAULT 0, cost numeric DEFAULT 0, tax_rate numeric DEFAULT 0, barcode character varying(100), image_url character varying(500), is_active boolean DEFAULT true, min_stock_level integer DEFAULT 0, reorder_point integer, created_by uuid, created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP, updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP, max_stock_level integer, valuation_method character varying(20) DEFAULT 'FIFO'::character varying, unit_price numeric DEFAULT 0, cost_price numeric DEFAULT 0, reorder_level integer DEFAULT 10, reorder_quantity integer DEFAULT 50, org_id uuid, initial_stock integer DEFAULT 0, supplier_id uuid, brand character varying(100), weight numeric, dimensions character varying(100), warranty_period integer, warranty_type character varying(50), tags ARRAY, status character varying(50) DEFAULT 'active'::character varying);

-- Data for products
INSERT INTO products ("id", "organization_id", "name", "sku", "description", "category", "unit", "price", "cost", "tax_rate", "barcode", "image_url", "is_active", "min_stock_level", "reorder_point", "created_by", "created_at", "updated_at", "max_stock_level", "valuation_method", "unit_price", "cost_price", "reorder_level", "reorder_quantity", "org_id", "initial_stock", "supplier_id", "brand", "weight", "dimensions", "warranty_period", "warranty_type", "tags", "status") VALUES ('c0b199b4-4e12-4953-aa37-8c5e81d569de', NULL, 'USB TYPE c', 'SKU 01', 'ZXCCCCCCCCCCCCC', 'Hardware', 'piece', '100.00', '0.00', '0.00', NULL, NULL, true, 10, NULL, 'c0ca5c67-7dd5-4cde-8311-425d5e886dbf', '2026-04-03T09:17:05.631Z', '2026-04-03T09:17:05.631Z', NULL, 'FIFO', '0.00', '0.00', 10, 50, 'adb32da4-2521-4484-8c05-31267bd4a9c2', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active');

-- Table: profiles
DROP TABLE IF EXISTS profiles CASCADE;
CREATE TABLE profiles (id uuid NOT NULL DEFAULT uuid_generate_v4(), user_id uuid, org_id uuid, full_name character varying(255), email character varying(255), avatar_url character varying(500), phone character varying(50), "position" character varying(100), department character varying(100), bio text, created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP, updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP, job_title character varying(255), avatar character varying(500), location character varying(255), timezone character varying(100), language character varying(50));

-- Data for profiles
INSERT INTO profiles ("id", "user_id", "org_id", "full_name", "email", "avatar_url", "phone", "position", "department", "bio", "created_at", "updated_at", "job_title", "avatar", "location", "timezone", "language") VALUES ('76c526d5-0372-4016-a722-2cf43ad08fc0', '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'System Administrator', 'admin@crm.local', NULL, NULL, NULL, NULL, NULL, '2026-04-02T15:18:58.191Z', '2026-04-02T15:18:58.191Z', NULL, NULL, NULL, NULL, NULL);
INSERT INTO profiles ("id", "user_id", "org_id", "full_name", "email", "avatar_url", "phone", "position", "department", "bio", "created_at", "updated_at", "job_title", "avatar", "location", "timezone", "language") VALUES ('3d4ae204-968b-43de-8183-77cb824aa9c5', 'c0ca5c67-7dd5-4cde-8311-425d5e886dbf', 'adb32da4-2521-4484-8c05-31267bd4a9c2', 'Jawad Abbas', 'jawadabbas202020@gmail.com', NULL, NULL, NULL, NULL, NULL, '2026-04-02T15:18:58.191Z', '2026-04-02T15:18:58.191Z', NULL, NULL, NULL, NULL, NULL);

-- Table: project_activity_logs
DROP TABLE IF EXISTS project_activity_logs CASCADE;
CREATE TABLE project_activity_logs (id uuid NOT NULL DEFAULT gen_random_uuid(), org_id uuid NOT NULL, project_id uuid NOT NULL, user_id uuid NOT NULL, action character varying(100) NOT NULL, entity_type character varying(50), entity_id uuid, description text, metadata jsonb, created_at timestamp with time zone DEFAULT now());

-- Table: project_attachments
DROP TABLE IF EXISTS project_attachments CASCADE;
CREATE TABLE project_attachments (id uuid NOT NULL DEFAULT gen_random_uuid(), org_id uuid NOT NULL, project_id uuid, task_id uuid, entity_type character varying(50), entity_id uuid, file_name character varying(255) NOT NULL, file_path text NOT NULL, file_size bigint, file_type character varying(100), uploaded_by uuid, created_at timestamp with time zone DEFAULT now(), updated_at timestamp with time zone DEFAULT now());

-- Table: project_comments
DROP TABLE IF EXISTS project_comments CASCADE;
CREATE TABLE project_comments (id uuid NOT NULL DEFAULT gen_random_uuid(), org_id uuid NOT NULL, project_id uuid, task_id uuid, entity_type character varying(50), entity_id uuid, user_id uuid NOT NULL, comment text NOT NULL, attachments jsonb, created_at timestamp with time zone DEFAULT now(), updated_at timestamp with time zone DEFAULT now());

-- Table: project_documents
DROP TABLE IF EXISTS project_documents CASCADE;
CREATE TABLE project_documents (id uuid NOT NULL DEFAULT uuid_generate_v4(), project_id uuid, name character varying(255) NOT NULL, file_url character varying(500) NOT NULL, file_size integer, file_type character varying(100), uploaded_by uuid, uploaded_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP, created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP, updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP, org_id uuid, created_by uuid, updated_by uuid, version integer DEFAULT 1, is_archived boolean DEFAULT false);

-- Table: project_members
DROP TABLE IF EXISTS project_members CASCADE;
CREATE TABLE project_members (id uuid NOT NULL DEFAULT gen_random_uuid(), org_id uuid NOT NULL, project_id uuid NOT NULL, user_id uuid NOT NULL, role character varying(50) DEFAULT 'member'::character varying, permissions jsonb, created_at timestamp with time zone DEFAULT now(), updated_at timestamp with time zone DEFAULT now());

-- Table: project_milestones
DROP TABLE IF EXISTS project_milestones CASCADE;
CREATE TABLE project_milestones (id uuid NOT NULL DEFAULT uuid_generate_v4(), project_id uuid, name character varying(255) NOT NULL, description text, due_date date NOT NULL, status character varying(50) DEFAULT 'pending'::character varying, completed_at timestamp without time zone, created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP, updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP, org_id uuid, progress integer DEFAULT 0, budget numeric, actual_cost numeric, color character varying(50), is_completed boolean DEFAULT false, created_by uuid, updated_by uuid);

-- Table: project_risks
DROP TABLE IF EXISTS project_risks CASCADE;
CREATE TABLE project_risks (id uuid NOT NULL DEFAULT uuid_generate_v4(), project_id uuid, title character varying(255) NOT NULL, description text, probability character varying(50) DEFAULT 'medium'::character varying, impact character varying(50) DEFAULT 'medium'::character varying, mitigation_plan text, status character varying(50) DEFAULT 'identified'::character varying, owner_id uuid, created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP, updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP, severity character varying(50) DEFAULT 'medium'::character varying, category character varying(100), org_id uuid, created_by uuid, updated_by uuid, identified_date date, resolved_date date);

-- Data for project_risks
INSERT INTO project_risks ("id", "project_id", "title", "description", "probability", "impact", "mitigation_plan", "status", "owner_id", "created_at", "updated_at", "severity", "category", "org_id", "created_by", "updated_by", "identified_date", "resolved_date") VALUES ('bbe22a3e-5121-45fe-aa63-1637e5175b0d', 'beb98cda-dbe1-4095-9f2f-59dd0380ae06', 'sasa', 'saaaaaaaaa', 'medium', 'medium', 'saaaaaaaaaaa', 'mitigating', NULL, '2026-04-03T08:58:57.461Z', '2026-04-03T08:58:59.940Z', 'medium', 'risk', 'adb32da4-2521-4484-8c05-31267bd4a9c2', 'c0ca5c67-7dd5-4cde-8311-425d5e886dbf', NULL, NULL, NULL);

-- Table: project_tasks
DROP TABLE IF EXISTS project_tasks CASCADE;
CREATE TABLE project_tasks (id uuid NOT NULL DEFAULT uuid_generate_v4(), organization_id uuid, project_id uuid, title character varying(255) NOT NULL, description text, assigned_to uuid, status character varying(50) DEFAULT 'todo'::character varying, priority character varying(50) DEFAULT 'medium'::character varying, start_date date, due_date date, estimated_hours numeric, actual_hours numeric, progress integer DEFAULT 0, parent_task_id uuid, created_by uuid, created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP, updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP, org_id uuid, milestone_id uuid, tags ARRAY, watchers ARRAY, dependencies ARRAY, labels ARRAY, updated_by uuid);

-- Table: project_time_entries
DROP TABLE IF EXISTS project_time_entries CASCADE;
CREATE TABLE project_time_entries (id uuid NOT NULL DEFAULT uuid_generate_v4(), organization_id uuid, project_id uuid, task_id uuid, user_id uuid, description text, hours numeric NOT NULL, date date NOT NULL, billable boolean DEFAULT true, hourly_rate numeric, created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP, org_id uuid, updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP, is_billable boolean DEFAULT true, total_amount numeric, approved_by uuid, approved_at timestamp with time zone, created_by uuid, updated_by uuid);

-- Table: projects
DROP TABLE IF EXISTS projects CASCADE;
CREATE TABLE projects (id uuid NOT NULL DEFAULT uuid_generate_v4(), organization_id uuid, name character varying(255) NOT NULL, description text, client_id uuid, start_date date, end_date date, budget numeric, currency character varying(10) DEFAULT 'USD'::character varying, status character varying(50) DEFAULT 'planning'::character varying, priority character varying(50) DEFAULT 'medium'::character varying, progress integer DEFAULT 0, manager_id uuid, created_by uuid, created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP, updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP, org_id uuid, owner_id uuid, color character varying(20), client_name character varying(255), budget_spent numeric DEFAULT 0, tags ARRAY, attachments jsonb, team_members ARRAY, is_archived boolean DEFAULT false, archived_at timestamp with time zone, completed_at timestamp with time zone, estimated_hours numeric, actual_hours numeric, updated_by uuid);

-- Data for projects
INSERT INTO projects ("id", "organization_id", "name", "description", "client_id", "start_date", "end_date", "budget", "currency", "status", "priority", "progress", "manager_id", "created_by", "created_at", "updated_at", "org_id", "owner_id", "color", "client_name", "budget_spent", "tags", "attachments", "team_members", "is_archived", "archived_at", "completed_at", "estimated_hours", "actual_hours", "updated_by") VALUES ('beb98cda-dbe1-4095-9f2f-59dd0380ae06', NULL, 'zxzxxzxzx', 'xzzzzzzzzzzzz', NULL, NULL, NULL, NULL, 'USD', 'active', 'medium', 0, NULL, NULL, '2026-04-03T08:52:22.653Z', '2026-04-03T08:52:22.653Z', 'adb32da4-2521-4484-8c05-31267bd4a9c2', 'c0ca5c67-7dd5-4cde-8311-425d5e886dbf', 'bg-primary', NULL, '0.00', NULL, NULL, NULL, false, NULL, NULL, NULL, NULL, NULL);

-- Table: public_holidays
DROP TABLE IF EXISTS public_holidays CASCADE;
CREATE TABLE public_holidays (id uuid NOT NULL DEFAULT gen_random_uuid(), org_id uuid NOT NULL, name character varying(255) NOT NULL, date date NOT NULL, is_optional boolean DEFAULT false, description text, created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP, updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP);

-- Table: purchase_order_items
DROP TABLE IF EXISTS purchase_order_items CASCADE;
CREATE TABLE purchase_order_items (id uuid NOT NULL DEFAULT uuid_generate_v4(), purchase_order_id uuid, product_id uuid, quantity integer NOT NULL, unit_price numeric NOT NULL, tax_rate numeric DEFAULT 0, total_price numeric NOT NULL, received_quantity integer DEFAULT 0, created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP, updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP);

-- Table: purchase_orders
DROP TABLE IF EXISTS purchase_orders CASCADE;
CREATE TABLE purchase_orders (id uuid NOT NULL DEFAULT uuid_generate_v4(), organization_id uuid, po_number character varying(100) NOT NULL, vendor_id uuid, warehouse_id uuid, order_date date NOT NULL, expected_delivery_date date, status character varying(50) DEFAULT 'draft'::character varying, subtotal numeric DEFAULT 0, tax_amount numeric DEFAULT 0, total_amount numeric DEFAULT 0, notes text, created_by uuid, created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP, updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP, org_id uuid, expected_delivery date, order_status character varying(50) DEFAULT 'pending'::character varying, delivery_address text, shipping_cost numeric DEFAULT 0, discount_amount numeric DEFAULT 0);

-- Table: roles
DROP TABLE IF EXISTS roles CASCADE;
CREATE TABLE roles (id uuid NOT NULL DEFAULT uuid_generate_v4(), organization_id uuid, name character varying(100) NOT NULL, description text, permissions jsonb DEFAULT '[]'::jsonb, created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP, updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP, org_id uuid);

-- Table: salary_components
DROP TABLE IF EXISTS salary_components CASCADE;
CREATE TABLE salary_components (id uuid NOT NULL DEFAULT gen_random_uuid(), org_id uuid NOT NULL, name character varying(255) NOT NULL, type character varying(50) NOT NULL, is_percentage boolean DEFAULT false, amount numeric DEFAULT 0, percentage numeric DEFAULT 0, is_active boolean DEFAULT true, created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP, updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP);

-- Table: salary_slip_items
DROP TABLE IF EXISTS salary_slip_items CASCADE;
CREATE TABLE salary_slip_items (id uuid NOT NULL DEFAULT gen_random_uuid(), salary_slip_id uuid NOT NULL, component_name character varying(255) NOT NULL, component_type character varying(50) NOT NULL, amount numeric NOT NULL, created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP, updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP);

-- Data for salary_slip_items
INSERT INTO salary_slip_items ("id", "salary_slip_id", "component_name", "component_type", "amount", "created_at", "updated_at") VALUES ('2e550329-924d-48a2-a19b-692b5c208a01', 'fec4cd5e-41a6-4628-8b13-55340f522a3d', 'Basic Salary', 'earning', '700000.00', '2026-04-03T09:05:43.902Z', '2026-04-03T09:05:43.902Z');
INSERT INTO salary_slip_items ("id", "salary_slip_id", "component_name", "component_type", "amount", "created_at", "updated_at") VALUES ('2ccd3c11-2fcf-43e9-b512-2cc63fe5cc02', 'fec4cd5e-41a6-4628-8b13-55340f522a3d', 'Utility Allowances', 'earning', '70000.00', '2026-04-03T09:05:43.902Z', '2026-04-03T09:05:43.902Z');
INSERT INTO salary_slip_items ("id", "salary_slip_id", "component_name", "component_type", "amount", "created_at", "updated_at") VALUES ('9960bdd6-f1b1-4039-bac2-1e63cd7badae', 'fec4cd5e-41a6-4628-8b13-55340f522a3d', 'Medical Allowances', 'earning', '56000.00', '2026-04-03T09:05:43.902Z', '2026-04-03T09:05:43.902Z');

-- Table: salary_slips
DROP TABLE IF EXISTS salary_slips CASCADE;
CREATE TABLE salary_slips (id uuid NOT NULL DEFAULT gen_random_uuid(), org_id uuid NOT NULL, employee_id uuid NOT NULL, month integer NOT NULL, year integer NOT NULL, basic_salary numeric NOT NULL, total_earnings numeric DEFAULT 0, total_deductions numeric DEFAULT 0, net_salary numeric NOT NULL, status character varying(50) DEFAULT 'draft'::character varying, generated_by uuid, generated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP, paid_at timestamp without time zone, created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP, updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP, payment_date date, notes text, created_by uuid, sent_at timestamp with time zone);

-- Data for salary_slips
INSERT INTO salary_slips ("id", "org_id", "employee_id", "month", "year", "basic_salary", "total_earnings", "total_deductions", "net_salary", "status", "generated_by", "generated_at", "paid_at", "created_at", "updated_at", "payment_date", "notes", "created_by", "sent_at") VALUES ('fec4cd5e-41a6-4628-8b13-55340f522a3d', 'adb32da4-2521-4484-8c05-31267bd4a9c2', 'dc790635-a29c-476c-a5db-cf37e8d795a0', 4, 2026, '700000.00', '826000.00', '0.00', '826000.00', 'generated', 'c0ca5c67-7dd5-4cde-8311-425d5e886dbf', '2026-04-03T09:05:43.902Z', NULL, '2026-04-03T09:05:43.902Z', '2026-04-03T09:05:43.902Z', NULL, NULL, NULL, NULL);

-- Table: signing_parties
DROP TABLE IF EXISTS signing_parties CASCADE;
CREATE TABLE signing_parties (id uuid NOT NULL DEFAULT uuid_generate_v4(), organization_id uuid, name character varying(255) NOT NULL, email character varying(255), phone character varying(50), role character varying(100), company character varying(255), status character varying(50) DEFAULT 'pending'::character varying, created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP, org_id uuid, updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP);

-- Table: stock
DROP TABLE IF EXISTS stock CASCADE;
CREATE TABLE stock (id uuid NOT NULL DEFAULT uuid_generate_v4(), organization_id uuid, product_id uuid, warehouse_id uuid, quantity integer DEFAULT 0, reserved_quantity integer DEFAULT 0, available_quantity integer DEFAULT 0, last_updated timestamp without time zone DEFAULT CURRENT_TIMESTAMP, org_id uuid, created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP, updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP, created_by uuid, min_stock_alert boolean DEFAULT false, reorder_level integer);

-- Data for stock
INSERT INTO stock ("id", "organization_id", "product_id", "warehouse_id", "quantity", "reserved_quantity", "available_quantity", "last_updated", "org_id", "created_at", "updated_at", "created_by", "min_stock_alert", "reorder_level") VALUES ('06553c56-ddf4-467e-84f0-cc568d4a38dd', NULL, 'c0b199b4-4e12-4953-aa37-8c5e81d569de', '812ac034-e5e6-4ab4-acdd-6504d1d0e4a1', 99, 0, 99, '2026-04-03T09:20:49.609Z', 'adb32da4-2521-4484-8c05-31267bd4a9c2', '2026-04-03T09:20:49.609Z', '2026-04-03T09:20:49.609Z', NULL, false, NULL);

-- Table: stock_adjustments
DROP TABLE IF EXISTS stock_adjustments CASCADE;
CREATE TABLE stock_adjustments (id uuid NOT NULL DEFAULT gen_random_uuid(), org_id uuid NOT NULL, product_id uuid NOT NULL, warehouse_id uuid NOT NULL, adjustment_type character varying(50) NOT NULL, quantity_before integer NOT NULL, quantity_adjusted integer NOT NULL, quantity_after integer NOT NULL, reason text, notes text, adjusted_by uuid, adjustment_date date DEFAULT CURRENT_DATE, created_at timestamp with time zone DEFAULT now(), updated_at timestamp with time zone DEFAULT now());

-- Table: stock_movements
DROP TABLE IF EXISTS stock_movements CASCADE;
CREATE TABLE stock_movements (id uuid NOT NULL DEFAULT uuid_generate_v4(), organization_id uuid, product_id uuid, warehouse_id uuid, movement_type character varying(50) NOT NULL, quantity integer NOT NULL, reference_type character varying(50), reference_id uuid, notes text, created_by uuid, created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP, org_id uuid, updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP, type character varying(50), reason text, reference character varying(255), batch_number character varying(100), expiry_date date);

-- Data for stock_movements
INSERT INTO stock_movements ("id", "organization_id", "product_id", "warehouse_id", "movement_type", "quantity", "reference_type", "reference_id", "notes", "created_by", "created_at", "org_id", "updated_at", "type", "reason", "reference", "batch_number", "expiry_date") VALUES ('194db3f3-af0f-49dc-b6aa-67356ed8da0a', NULL, 'c0b199b4-4e12-4953-aa37-8c5e81d569de', '812ac034-e5e6-4ab4-acdd-6504d1d0e4a1', 'stock_in', 100, NULL, NULL, NULL, '00000000-0000-0000-0000-000000000002', '2026-04-03T09:22:03.009Z', 'adb32da4-2521-4484-8c05-31267bd4a9c2', '2026-04-03T09:22:03.009Z', NULL, 'Initial stock', NULL, NULL, NULL);
INSERT INTO stock_movements ("id", "organization_id", "product_id", "warehouse_id", "movement_type", "quantity", "reference_type", "reference_id", "notes", "created_by", "created_at", "org_id", "updated_at", "type", "reason", "reference", "batch_number", "expiry_date") VALUES ('1da93604-9504-476b-b038-9940a7009bb1', NULL, 'c0b199b4-4e12-4953-aa37-8c5e81d569de', '812ac034-e5e6-4ab4-acdd-6504d1d0e4a1', 'stock_out', 1, NULL, NULL, NULL, '00000000-0000-0000-0000-000000000002', '2026-04-03T09:23:23.468Z', 'adb32da4-2521-4484-8c05-31267bd4a9c2', '2026-04-03T09:23:23.468Z', NULL, 'Stock updated', NULL, NULL, NULL);

-- Table: tasks
DROP TABLE IF EXISTS tasks CASCADE;
CREATE TABLE tasks (id uuid NOT NULL DEFAULT gen_random_uuid(), org_id uuid NOT NULL, project_id uuid, title character varying(255) NOT NULL, description text, status character varying(50) DEFAULT 'pending'::character varying, priority character varying(50) DEFAULT 'medium'::character varying, assigned_to uuid, due_date date, sort_order integer DEFAULT 0, created_by uuid, created_at timestamp with time zone DEFAULT now(), updated_at timestamp with time zone DEFAULT now(), parent_task_id uuid, milestone_id uuid, start_date date, end_date date, estimated_hours numeric, actual_hours numeric, progress integer DEFAULT 0, tags ARRAY, attachments jsonb, dependencies ARRAY, watchers ARRAY, completed_at timestamp with time zone, is_recurring boolean DEFAULT false, recurrence_pattern character varying(100), labels ARRAY, updated_by uuid);

-- Data for tasks
INSERT INTO tasks ("id", "org_id", "project_id", "title", "description", "status", "priority", "assigned_to", "due_date", "sort_order", "created_by", "created_at", "updated_at", "parent_task_id", "milestone_id", "start_date", "end_date", "estimated_hours", "actual_hours", "progress", "tags", "attachments", "dependencies", "watchers", "completed_at", "is_recurring", "recurrence_pattern", "labels", "updated_by") VALUES ('b70b6af2-9e60-4991-8d97-1bb8b77c8263', 'adb32da4-2521-4484-8c05-31267bd4a9c2', 'beb98cda-dbe1-4095-9f2f-59dd0380ae06', 'dssssss', NULL, 'in_review', 'medium', NULL, NULL, 3, 'c0ca5c67-7dd5-4cde-8311-425d5e886dbf', '2026-04-03T08:54:17.631Z', '2026-04-03T08:54:17.631Z', NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, false, NULL, NULL, NULL);
INSERT INTO tasks ("id", "org_id", "project_id", "title", "description", "status", "priority", "assigned_to", "due_date", "sort_order", "created_by", "created_at", "updated_at", "parent_task_id", "milestone_id", "start_date", "end_date", "estimated_hours", "actual_hours", "progress", "tags", "attachments", "dependencies", "watchers", "completed_at", "is_recurring", "recurrence_pattern", "labels", "updated_by") VALUES ('1c258482-902f-417f-9b0b-70face76da5d', 'adb32da4-2521-4484-8c05-31267bd4a9c2', 'beb98cda-dbe1-4095-9f2f-59dd0380ae06', 'dsssssssss', NULL, 'done', 'medium', NULL, NULL, 4, 'c0ca5c67-7dd5-4cde-8311-425d5e886dbf', '2026-04-03T08:54:20.164Z', '2026-04-03T08:54:20.164Z', NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, false, NULL, NULL, NULL);
INSERT INTO tasks ("id", "org_id", "project_id", "title", "description", "status", "priority", "assigned_to", "due_date", "sort_order", "created_by", "created_at", "updated_at", "parent_task_id", "milestone_id", "start_date", "end_date", "estimated_hours", "actual_hours", "progress", "tags", "attachments", "dependencies", "watchers", "completed_at", "is_recurring", "recurrence_pattern", "labels", "updated_by") VALUES ('96e8d13b-8897-461b-bfac-3196464ecf56', 'adb32da4-2521-4484-8c05-31267bd4a9c2', 'beb98cda-dbe1-4095-9f2f-59dd0380ae06', 'dsssssssss', NULL, 'todo', 'medium', NULL, NULL, 2, 'c0ca5c67-7dd5-4cde-8311-425d5e886dbf', '2026-04-03T08:54:15.118Z', '2026-04-03T08:59:08.881Z', NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, false, NULL, NULL, NULL);

-- Table: unibox_emails
DROP TABLE IF EXISTS unibox_emails CASCADE;
CREATE TABLE unibox_emails (id uuid NOT NULL DEFAULT gen_random_uuid(), org_id uuid NOT NULL, external_id character varying(255), sender_email character varying(255) NOT NULL, sender_name character varying(255), recipient_email character varying(255), recipient_name character varying(255), subject text, body_text text, body_html text, status character varying(50) DEFAULT 'New'::character varying, priority character varying(50) DEFAULT 'Normal'::character varying, received_at timestamp with time zone, is_read boolean DEFAULT false, is_starred boolean DEFAULT false, is_archived boolean DEFAULT false, assigned_to uuid, converted_to_lead_id uuid, tags ARRAY, attachments jsonb, metadata jsonb, created_at timestamp with time zone DEFAULT now(), updated_at timestamp with time zone DEFAULT now(), body text);

-- Table: user_roles
DROP TABLE IF EXISTS user_roles CASCADE;
CREATE TABLE user_roles (user_id uuid NOT NULL, role_id uuid NOT NULL, id uuid DEFAULT uuid_generate_v4(), role character varying(50) DEFAULT 'user'::character varying, created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP, updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP, org_id uuid);

-- Table: users
DROP TABLE IF EXISTS users CASCADE;
CREATE TABLE users (id uuid NOT NULL DEFAULT uuid_generate_v4(), organization_id uuid, email character varying(255) NOT NULL, password_hash character varying(255) NOT NULL, full_name character varying(255) NOT NULL, role character varying(50) DEFAULT 'user'::character varying, is_active boolean DEFAULT true, last_login timestamp without time zone, created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP, updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP, avatar_url character varying(500), phone character varying(50), "position" character varying(100), org_id uuid, department character varying(100), bio text, timezone character varying(100), language character varying(10) DEFAULT 'en'::character varying);

-- Data for users
INSERT INTO users ("id", "organization_id", "email", "password_hash", "full_name", "role", "is_active", "last_login", "created_at", "updated_at", "avatar_url", "phone", "position", "org_id", "department", "bio", "timezone", "language") VALUES ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'admin@crm.local', '$2a$10$rZ5qH8qF8qF8qF8qF8qF8.qF8qF8qF8qF8qF8qF8qF8qF8qF8qF8q', 'System Administrator', 'admin', true, NULL, '2026-04-02T14:54:58.135Z', '2026-04-02T15:11:39.004Z', NULL, NULL, NULL, '00000000-0000-0000-0000-000000000001', NULL, NULL, NULL, 'en');
INSERT INTO users ("id", "organization_id", "email", "password_hash", "full_name", "role", "is_active", "last_login", "created_at", "updated_at", "avatar_url", "phone", "position", "org_id", "department", "bio", "timezone", "language") VALUES ('c0ca5c67-7dd5-4cde-8311-425d5e886dbf', 'adb32da4-2521-4484-8c05-31267bd4a9c2', 'jawadabbas202020@gmail.com', '$2a$10$4eOEtAfu2iqeGsfw8wmX7O0fFw9oi1pVYAl1IepTfr2Ur9zVZyxjS', 'Jawad Abbas', 'user', true, NULL, '2026-04-02T14:57:52.514Z', '2026-04-02T15:11:39.004Z', NULL, NULL, NULL, 'adb32da4-2521-4484-8c05-31267bd4a9c2', NULL, NULL, NULL, 'en');
INSERT INTO users ("id", "organization_id", "email", "password_hash", "full_name", "role", "is_active", "last_login", "created_at", "updated_at", "avatar_url", "phone", "position", "org_id", "department", "bio", "timezone", "language") VALUES ('7779049e-51c6-45e7-8141-a9ef6df613cc', '00000000-0000-0000-0000-000000000001', 'admin@example.com', '$2a$10$xK/XtlgV.IdukpPlXaf5yeA5zMcpjQGiKAeULBO2aX.yVtrXs6FkO', 'Admin User', 'user', true, NULL, '2026-04-03T08:47:48.733Z', '2026-04-03T08:49:07.192Z', NULL, NULL, NULL, '00000000-0000-0000-0000-000000000001', NULL, NULL, NULL, 'en');

-- Table: vendors
DROP TABLE IF EXISTS vendors CASCADE;
CREATE TABLE vendors (id uuid NOT NULL DEFAULT uuid_generate_v4(), organization_id uuid, name character varying(255) NOT NULL, contact_person character varying(255), email character varying(255), phone character varying(50), address text, city character varying(100), country character varying(100), payment_terms character varying(100), tax_id character varying(100), status character varying(50) DEFAULT 'active'::character varying, notes text, created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP, updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP, business_type character varying(100), rating numeric DEFAULT 4.0, created_by uuid, org_id uuid, website character varying(255), credit_limit numeric, credit_days integer, bank_name character varying(255), bank_account character varying(100));

-- Data for vendors
INSERT INTO vendors ("id", "organization_id", "name", "contact_person", "email", "phone", "address", "city", "country", "payment_terms", "tax_id", "status", "notes", "created_at", "updated_at", "business_type", "rating", "created_by", "org_id", "website", "credit_limit", "credit_days", "bank_name", "bank_account") VALUES ('7eb198ad-2284-40ae-bac1-e81bdd2002f0', NULL, 'sxzz\', 'Jawad Abbas', 'jawadabbas202020@gmail.com', '+923136955749', 'Modal town Lahore', NULL, NULL, NULL, NULL, 'active', NULL, '2026-04-03T09:15:12.371Z', '2026-04-03T09:15:16.152Z', 'electrican', '4.0', 'c0ca5c67-7dd5-4cde-8311-425d5e886dbf', 'adb32da4-2521-4484-8c05-31267bd4a9c2', NULL, NULL, NULL, NULL, NULL);

-- Table: warehouses
DROP TABLE IF EXISTS warehouses CASCADE;
CREATE TABLE warehouses (id uuid NOT NULL DEFAULT uuid_generate_v4(), organization_id uuid, name character varying(255) NOT NULL, code character varying(50), address text, city character varying(100), state character varying(100), country character varying(100), postal_code character varying(20), manager_id uuid, capacity integer, is_active boolean DEFAULT true, created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP, updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP, org_id uuid, manager_name character varying(255), phone character varying(50), email character varying(255), type character varying(50), operating_hours character varying(100));

-- Data for warehouses
INSERT INTO warehouses ("id", "organization_id", "name", "code", "address", "city", "state", "country", "postal_code", "manager_id", "capacity", "is_active", "created_at", "updated_at", "org_id", "manager_name", "phone", "email", "type", "operating_hours") VALUES ('81eebee3-0b64-4905-ba30-cc45a2503be0', NULL, 'Main Warehouse', 'WH-001', 'Main Location', NULL, NULL, NULL, NULL, NULL, NULL, true, '2026-04-03T09:19:38.637Z', '2026-04-03T09:19:38.637Z', '00000000-0000-0000-0000-000000000001', NULL, NULL, NULL, NULL, NULL);
INSERT INTO warehouses ("id", "organization_id", "name", "code", "address", "city", "state", "country", "postal_code", "manager_id", "capacity", "is_active", "created_at", "updated_at", "org_id", "manager_name", "phone", "email", "type", "operating_hours") VALUES ('812ac034-e5e6-4ab4-acdd-6504d1d0e4a1', NULL, 'Main Warehouse', 'WH-1775208049597', 'Main Location', NULL, NULL, NULL, NULL, NULL, NULL, true, '2026-04-03T09:20:49.598Z', '2026-04-03T09:20:49.598Z', 'adb32da4-2521-4484-8c05-31267bd4a9c2', NULL, NULL, NULL, NULL, NULL);

-- Table: workflow_actions
DROP TABLE IF EXISTS workflow_actions CASCADE;
CREATE TABLE workflow_actions (id uuid NOT NULL DEFAULT uuid_generate_v4(), workflow_id uuid, action_order integer NOT NULL, action_type character varying(100) NOT NULL, action_config jsonb DEFAULT '{}'::jsonb, created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP, condition_config jsonb, updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP);

-- Table: workflow_execution_steps
DROP TABLE IF EXISTS workflow_execution_steps CASCADE;
CREATE TABLE workflow_execution_steps (id uuid NOT NULL DEFAULT uuid_generate_v4(), execution_id uuid, action_id uuid, status character varying(50) DEFAULT 'running'::character varying, started_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP, completed_at timestamp with time zone, error_message text, created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP, updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP);

-- Table: workflow_executions
DROP TABLE IF EXISTS workflow_executions CASCADE;
CREATE TABLE workflow_executions (id uuid NOT NULL DEFAULT uuid_generate_v4(), workflow_id uuid, status character varying(50) DEFAULT 'running'::character varying, trigger_data jsonb, result jsonb, error_message text, started_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP, completed_at timestamp without time zone, created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP, updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP);

-- Table: workflows
DROP TABLE IF EXISTS workflows CASCADE;
CREATE TABLE workflows (id uuid NOT NULL DEFAULT uuid_generate_v4(), organization_id uuid, name character varying(255) NOT NULL, description text, trigger_type character varying(100) NOT NULL, trigger_config jsonb DEFAULT '{}'::jsonb, is_active boolean DEFAULT true, execution_count integer DEFAULT 0, last_executed_at timestamp without time zone, created_by uuid, created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP, updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP, org_id uuid, trigger_event character varying(100), conditions jsonb DEFAULT '{}'::jsonb);

-- Data for workflows
INSERT INTO workflows ("id", "organization_id", "name", "description", "trigger_type", "trigger_config", "is_active", "execution_count", "last_executed_at", "created_by", "created_at", "updated_at", "org_id", "trigger_event", "conditions") VALUES ('b0ad8dae-e297-4963-9df3-bd1b228fb2b5', NULL, 'cxv', 'cxvcxc', 'lead_created', [object Object], false, 0, NULL, 'c0ca5c67-7dd5-4cde-8311-425d5e886dbf', '2026-04-02T15:28:27.683Z', '2026-04-02T15:28:31.952Z', 'adb32da4-2521-4484-8c05-31267bd4a9c2', NULL, [object Object]);

-- Table: workgroup_activities
DROP TABLE IF EXISTS workgroup_activities CASCADE;
CREATE TABLE workgroup_activities (id uuid NOT NULL DEFAULT gen_random_uuid(), workgroup_id uuid NOT NULL, user_id uuid, activity_type character varying(100) NOT NULL, activity_data jsonb DEFAULT '{}'::jsonb, created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP, updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP);

-- Data for workgroup_activities
INSERT INTO workgroup_activities ("id", "workgroup_id", "user_id", "activity_type", "activity_data", "created_at", "updated_at") VALUES ('aaa42f64-7b7b-4205-a780-72978c833345', '3b3d0312-5880-4e35-a368-060b7101be05', 'c0ca5c67-7dd5-4cde-8311-425d5e886dbf', 'workgroup_created', [object Object], '2026-04-02T15:23:42.457Z', '2026-04-02T15:23:42.457Z');
INSERT INTO workgroup_activities ("id", "workgroup_id", "user_id", "activity_type", "activity_data", "created_at", "updated_at") VALUES ('bae2065d-a8d4-415d-9816-a786884296a0', '3b3d0312-5880-4e35-a368-060b7101be05', 'c0ca5c67-7dd5-4cde-8311-425d5e886dbf', 'message_posted', [object Object], '2026-04-02T15:23:46.969Z', '2026-04-02T15:23:46.969Z');

-- Table: workgroup_channels
DROP TABLE IF EXISTS workgroup_channels CASCADE;
CREATE TABLE workgroup_channels (id uuid NOT NULL DEFAULT gen_random_uuid(), workgroup_id uuid NOT NULL, name character varying(255) NOT NULL, description text, type character varying(50) DEFAULT 'standard'::character varying, created_by uuid NOT NULL, created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP, updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP, is_general boolean DEFAULT false, is_archived boolean DEFAULT false, member_count integer DEFAULT 0, message_count integer DEFAULT 0);

-- Data for workgroup_channels
INSERT INTO workgroup_channels ("id", "workgroup_id", "name", "description", "type", "created_by", "created_at", "updated_at", "is_general", "is_archived", "member_count", "message_count") VALUES ('85b03a5e-4759-4dfb-8ffd-a767cc4b1ae5', 'dd8438eb-fd97-45e5-b13c-59a287f34649', 'General', 'General discussion for the team', 'standard', '00000000-0000-0000-0000-000000000002', '2026-04-02T15:02:49.687Z', '2026-04-02T15:02:49.687Z', true, false, 0, 0);
INSERT INTO workgroup_channels ("id", "workgroup_id", "name", "description", "type", "created_by", "created_at", "updated_at", "is_general", "is_archived", "member_count", "message_count") VALUES ('7db325c6-3db5-4078-89ac-82884bcd6f73', '6df9f907-1f71-4702-ad91-4b09bd8aff1a', 'General', 'General discussion for the team', 'standard', '00000000-0000-0000-0000-000000000002', '2026-04-02T15:02:49.687Z', '2026-04-02T15:02:49.687Z', true, false, 0, 0);
INSERT INTO workgroup_channels ("id", "workgroup_id", "name", "description", "type", "created_by", "created_at", "updated_at", "is_general", "is_archived", "member_count", "message_count") VALUES ('ea181726-0aea-4f56-8c8f-ed56f2975540', '892c402a-1d70-428c-9a74-08dfd2447581', 'General', 'General discussion for the team', 'standard', '00000000-0000-0000-0000-000000000002', '2026-04-02T15:02:49.687Z', '2026-04-02T15:02:49.687Z', true, false, 0, 0);
INSERT INTO workgroup_channels ("id", "workgroup_id", "name", "description", "type", "created_by", "created_at", "updated_at", "is_general", "is_archived", "member_count", "message_count") VALUES ('55c090da-c171-4f8d-b358-3dfc9b66ec51', 'cd28d214-7f8b-4efd-bf4e-1f451c334c81', 'General', 'General discussion for the team', 'standard', '00000000-0000-0000-0000-000000000002', '2026-04-02T15:02:49.687Z', '2026-04-02T15:02:49.687Z', true, false, 0, 0);
INSERT INTO workgroup_channels ("id", "workgroup_id", "name", "description", "type", "created_by", "created_at", "updated_at", "is_general", "is_archived", "member_count", "message_count") VALUES ('2a228a04-db81-44bf-9bf8-ec0e9e0a9d25', '3b3d0312-5880-4e35-a368-060b7101be05', 'General', 'General discussion for the team', 'standard', 'c0ca5c67-7dd5-4cde-8311-425d5e886dbf', '2026-04-02T15:23:42.449Z', '2026-04-02T15:23:42.449Z', true, false, 0, 0);

-- Table: workgroup_files
DROP TABLE IF EXISTS workgroup_files CASCADE;
CREATE TABLE workgroup_files (id uuid NOT NULL DEFAULT gen_random_uuid(), workgroup_id uuid NOT NULL, channel_id uuid, post_id uuid, name character varying(255) NOT NULL, original_name character varying(255) NOT NULL, file_type character varying(100), file_size bigint, mime_type character varying(255), file_path text NOT NULL, file_url text, is_deleted boolean DEFAULT false, deleted_at timestamp with time zone, uploaded_by uuid NOT NULL, created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP, updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP);

-- Table: workgroup_meeting_participants
DROP TABLE IF EXISTS workgroup_meeting_participants CASCADE;
CREATE TABLE workgroup_meeting_participants (id uuid NOT NULL DEFAULT gen_random_uuid(), meeting_id uuid NOT NULL, user_id uuid NOT NULL, role character varying(50) DEFAULT 'attendee'::character varying, joined_at timestamp with time zone, left_at timestamp with time zone, is_muted boolean DEFAULT false, is_video_on boolean DEFAULT true, is_screen_sharing boolean DEFAULT false, created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP, updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP);

-- Table: workgroup_meetings
DROP TABLE IF EXISTS workgroup_meetings CASCADE;
CREATE TABLE workgroup_meetings (id uuid NOT NULL DEFAULT gen_random_uuid(), workgroup_id uuid NOT NULL, channel_id uuid, title character varying(255) NOT NULL, description text, meeting_type character varying(50) DEFAULT 'video'::character varying, status character varying(50) DEFAULT 'scheduled'::character varying, scheduled_start timestamp with time zone, scheduled_end timestamp with time zone, actual_start timestamp with time zone, actual_end timestamp with time zone, is_recurring boolean DEFAULT false, recurrence_pattern jsonb, max_participants integer DEFAULT 100, allow_recording boolean DEFAULT true, require_lobby boolean DEFAULT false, created_by uuid NOT NULL, created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP, updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP);

-- Table: workgroup_members
DROP TABLE IF EXISTS workgroup_members CASCADE;
CREATE TABLE workgroup_members (id uuid NOT NULL DEFAULT gen_random_uuid(), workgroup_id uuid NOT NULL, user_id uuid NOT NULL, role character varying(50) DEFAULT 'member'::character varying, joined_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP, invited_by uuid, is_favorite boolean DEFAULT false, notification_settings jsonb DEFAULT '{"meetings": true, "mentions": true, "messages": true}'::jsonb, last_read_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP, created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP, updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP);

-- Data for workgroup_members
INSERT INTO workgroup_members ("id", "workgroup_id", "user_id", "role", "joined_at", "invited_by", "is_favorite", "notification_settings", "last_read_at", "created_at", "updated_at") VALUES ('65c1d5ec-dc14-4f1a-9797-b49d53df7f12', 'dd8438eb-fd97-45e5-b13c-59a287f34649', '00000000-0000-0000-0000-000000000002', 'owner', '2026-04-02T15:02:49.687Z', NULL, false, [object Object], '2026-04-02T15:02:49.687Z', '2026-04-02T15:14:03.203Z', '2026-04-02T15:14:03.204Z');
INSERT INTO workgroup_members ("id", "workgroup_id", "user_id", "role", "joined_at", "invited_by", "is_favorite", "notification_settings", "last_read_at", "created_at", "updated_at") VALUES ('e1e51f85-e676-4801-8d57-b377218c8e21', '6df9f907-1f71-4702-ad91-4b09bd8aff1a', '00000000-0000-0000-0000-000000000002', 'owner', '2026-04-02T15:02:49.687Z', NULL, false, [object Object], '2026-04-02T15:02:49.687Z', '2026-04-02T15:14:03.203Z', '2026-04-02T15:14:03.204Z');
INSERT INTO workgroup_members ("id", "workgroup_id", "user_id", "role", "joined_at", "invited_by", "is_favorite", "notification_settings", "last_read_at", "created_at", "updated_at") VALUES ('1c9abaaf-4a90-446a-9402-c40eeb6e01d0', '892c402a-1d70-428c-9a74-08dfd2447581', '00000000-0000-0000-0000-000000000002', 'owner', '2026-04-02T15:02:49.687Z', NULL, false, [object Object], '2026-04-02T15:02:49.687Z', '2026-04-02T15:14:03.203Z', '2026-04-02T15:14:03.204Z');
INSERT INTO workgroup_members ("id", "workgroup_id", "user_id", "role", "joined_at", "invited_by", "is_favorite", "notification_settings", "last_read_at", "created_at", "updated_at") VALUES ('4575dddf-e81e-45e2-99a3-ae77ccab3b4a', 'cd28d214-7f8b-4efd-bf4e-1f451c334c81', '00000000-0000-0000-0000-000000000002', 'owner', '2026-04-02T15:02:49.687Z', NULL, false, [object Object], '2026-04-02T15:02:49.687Z', '2026-04-02T15:14:03.203Z', '2026-04-02T15:14:03.204Z');
INSERT INTO workgroup_members ("id", "workgroup_id", "user_id", "role", "joined_at", "invited_by", "is_favorite", "notification_settings", "last_read_at", "created_at", "updated_at") VALUES ('fcf8f6f8-2883-45fe-8355-b92f8dfc8bd9', '3b3d0312-5880-4e35-a368-060b7101be05', 'c0ca5c67-7dd5-4cde-8311-425d5e886dbf', 'owner', '2026-04-02T15:23:42.449Z', NULL, false, [object Object], '2026-04-02T15:23:42.449Z', '2026-04-02T15:23:42.449Z', '2026-04-02T15:23:42.449Z');

-- Table: workgroup_notifications
DROP TABLE IF EXISTS workgroup_notifications CASCADE;
CREATE TABLE workgroup_notifications (id uuid NOT NULL DEFAULT uuid_generate_v4(), workgroup_id uuid, user_id uuid, type character varying(50) NOT NULL, title character varying(255) NOT NULL, message text, is_read boolean DEFAULT false, created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP, updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP);

-- Table: workgroup_posts
DROP TABLE IF EXISTS workgroup_posts CASCADE;
CREATE TABLE workgroup_posts (id uuid NOT NULL DEFAULT gen_random_uuid(), workgroup_id uuid NOT NULL, channel_id uuid, user_id uuid NOT NULL, parent_id uuid, content text NOT NULL, content_type character varying(50) DEFAULT 'text'::character varying, is_pinned boolean DEFAULT false, is_edited boolean DEFAULT false, is_deleted boolean DEFAULT false, edited_at timestamp with time zone, deleted_at timestamp with time zone, reactions jsonb DEFAULT '{}'::jsonb, mention_users ARRAY DEFAULT '{}'::uuid[], created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP, updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP);

-- Data for workgroup_posts
INSERT INTO workgroup_posts ("id", "workgroup_id", "channel_id", "user_id", "parent_id", "content", "content_type", "is_pinned", "is_edited", "is_deleted", "edited_at", "deleted_at", "reactions", "mention_users", "created_at", "updated_at") VALUES ('b957616d-0b18-4f35-9e72-303d9823e50c', 'dd8438eb-fd97-45e5-b13c-59a287f34649', '85b03a5e-4759-4dfb-8ffd-a767cc4b1ae5', '00000000-0000-0000-0000-000000000002', NULL, 'Welcome to the Sales Team! Let''s crush our Q1 targets together! 🚀', 'text', false, false, false, NULL, NULL, [object Object], ARRAY[], '2026-04-02T15:02:49.687Z', '2026-04-02T15:02:49.687Z');
INSERT INTO workgroup_posts ("id", "workgroup_id", "channel_id", "user_id", "parent_id", "content", "content_type", "is_pinned", "is_edited", "is_deleted", "edited_at", "deleted_at", "reactions", "mention_users", "created_at", "updated_at") VALUES ('2958949b-7623-4ddb-b939-1141254bb994', '6df9f907-1f71-4702-ad91-4b09bd8aff1a', '7db325c6-3db5-4078-89ac-82884bcd6f73', '00000000-0000-0000-0000-000000000002', NULL, 'Marketing campaign kickoff meeting scheduled for tomorrow at 10 AM. Please review the brief I shared earlier.', 'text', false, false, false, NULL, NULL, [object Object], ARRAY[], '2026-04-02T15:02:49.687Z', '2026-04-02T15:02:49.687Z');
INSERT INTO workgroup_posts ("id", "workgroup_id", "channel_id", "user_id", "parent_id", "content", "content_type", "is_pinned", "is_edited", "is_deleted", "edited_at", "deleted_at", "reactions", "mention_users", "created_at", "updated_at") VALUES ('f77bc2fd-4e95-46ad-8eb1-75dde78df9e4', '3b3d0312-5880-4e35-a368-060b7101be05', NULL, 'c0ca5c67-7dd5-4cde-8311-425d5e886dbf', NULL, 'cvcvv', 'text', false, false, false, NULL, NULL, [object Object], ARRAY[], '2026-04-02T15:23:46.959Z', '2026-04-02T15:23:46.959Z');

-- Table: workgroup_wiki
DROP TABLE IF EXISTS workgroup_wiki CASCADE;
CREATE TABLE workgroup_wiki (id uuid NOT NULL DEFAULT uuid_generate_v4(), workgroup_id uuid, title character varying(255) NOT NULL, content text, parent_id uuid, created_by uuid, updated_by uuid, created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP, updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP);

-- Table: workgroup_wiki_pages
DROP TABLE IF EXISTS workgroup_wiki_pages CASCADE;
CREATE TABLE workgroup_wiki_pages (id uuid NOT NULL DEFAULT gen_random_uuid(), workgroup_id uuid NOT NULL, user_id uuid NOT NULL, org_id uuid NOT NULL, title character varying(255) NOT NULL, content text, slug character varying(255) NOT NULL, is_published boolean DEFAULT true, is_deleted boolean DEFAULT false, created_by uuid NOT NULL, last_modified_by uuid, created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP, updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP);

-- Table: workgroups
DROP TABLE IF EXISTS workgroups CASCADE;
CREATE TABLE workgroups (id uuid NOT NULL DEFAULT gen_random_uuid(), org_id uuid NOT NULL, name character varying(255) NOT NULL, description text, avatar_color character varying(50) DEFAULT 'bg-blue-500'::character varying, type character varying(50) DEFAULT 'team'::character varying, is_private boolean DEFAULT false, is_archived boolean DEFAULT false, created_by uuid NOT NULL, created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP, updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP, allow_guest_access boolean DEFAULT false, allow_member_add_remove boolean DEFAULT true, allow_member_create_channels boolean DEFAULT true, notification_settings jsonb DEFAULT '{"meetings": true, "mentions": true, "messages": true}'::jsonb, member_count integer DEFAULT 0, message_count integer DEFAULT 0, last_activity_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP, is_active boolean DEFAULT true, settings jsonb DEFAULT '{}'::jsonb, cover_image character varying(500));

-- Data for workgroups
INSERT INTO workgroups ("id", "org_id", "name", "description", "avatar_color", "type", "is_private", "is_archived", "created_by", "created_at", "updated_at", "allow_guest_access", "allow_member_add_remove", "allow_member_create_channels", "notification_settings", "member_count", "message_count", "last_activity_at", "is_active", "settings", "cover_image") VALUES ('892c402a-1d70-428c-9a74-08dfd2447581', '00000000-0000-0000-0000-000000000001', 'Development Squad', 'Core development team for product features', 'bg-green-500', 'team', false, false, '00000000-0000-0000-0000-000000000002', '2026-04-02T15:02:49.687Z', '2026-04-02T15:02:49.687Z', false, true, true, [object Object], 1, 0, '2026-04-02T15:02:49.687Z', true, [object Object], NULL);
INSERT INTO workgroups ("id", "org_id", "name", "description", "avatar_color", "type", "is_private", "is_archived", "created_by", "created_at", "updated_at", "allow_guest_access", "allow_member_add_remove", "allow_member_create_channels", "notification_settings", "member_count", "message_count", "last_activity_at", "is_active", "settings", "cover_image") VALUES ('cd28d214-7f8b-4efd-bf4e-1f451c334c81', '00000000-0000-0000-0000-000000000001', 'Executive Leadership', 'Private group for executive discussions and strategic planning', 'bg-red-500', 'private', true, false, '00000000-0000-0000-0000-000000000002', '2026-04-02T15:02:49.687Z', '2026-04-02T15:02:49.687Z', false, true, true, [object Object], 1, 0, '2026-04-02T15:02:49.687Z', true, [object Object], NULL);
INSERT INTO workgroups ("id", "org_id", "name", "description", "avatar_color", "type", "is_private", "is_archived", "created_by", "created_at", "updated_at", "allow_guest_access", "allow_member_add_remove", "allow_member_create_channels", "notification_settings", "member_count", "message_count", "last_activity_at", "is_active", "settings", "cover_image") VALUES ('dd8438eb-fd97-45e5-b13c-59a287f34649', '00000000-0000-0000-0000-000000000001', 'Sales Team', 'Our amazing sales team working together to close deals and grow revenue', 'bg-blue-500', 'team', false, false, '00000000-0000-0000-0000-000000000002', '2026-04-02T15:02:49.687Z', '2026-04-02T15:02:49.687Z', false, true, true, [object Object], 1, 1, '2026-04-02T15:02:49.687Z', true, [object Object], NULL);
INSERT INTO workgroups ("id", "org_id", "name", "description", "avatar_color", "type", "is_private", "is_archived", "created_by", "created_at", "updated_at", "allow_guest_access", "allow_member_add_remove", "allow_member_create_channels", "notification_settings", "member_count", "message_count", "last_activity_at", "is_active", "settings", "cover_image") VALUES ('6df9f907-1f71-4702-ad91-4b09bd8aff1a', '00000000-0000-0000-0000-000000000001', 'Marketing Project', 'Q1 2024 marketing campaign planning and execution', 'bg-purple-500', 'project', false, false, '00000000-0000-0000-0000-000000000002', '2026-04-02T15:02:49.687Z', '2026-04-02T15:02:49.687Z', false, true, true, [object Object], 1, 1, '2026-04-02T15:02:49.687Z', true, [object Object], NULL);
INSERT INTO workgroups ("id", "org_id", "name", "description", "avatar_color", "type", "is_private", "is_archived", "created_by", "created_at", "updated_at", "allow_guest_access", "allow_member_add_remove", "allow_member_create_channels", "notification_settings", "member_count", "message_count", "last_activity_at", "is_active", "settings", "cover_image") VALUES ('3b3d0312-5880-4e35-a368-060b7101be05', 'adb32da4-2521-4484-8c05-31267bd4a9c2', 'www', 'xcvcx', 'bg-blue-500', 'project', false, false, 'c0ca5c67-7dd5-4cde-8311-425d5e886dbf', '2026-04-02T15:23:42.449Z', '2026-04-02T15:23:46.959Z', false, true, true, [object Object], 1, 1, '2026-04-02T15:23:46.959Z', true, [object Object], NULL);

-- Indexes
CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);
CREATE UNIQUE INDEX marketing_list_members_list_id_contact_id_key ON public.marketing_list_members USING btree (list_id, contact_id);
CREATE UNIQUE INDEX marketing_sequence_enrollments_sequence_id_contact_id_key ON public.marketing_sequence_enrollments USING btree (sequence_id, contact_id);
CREATE UNIQUE INDEX employees_employee_code_key ON public.employees USING btree (employee_code);
CREATE UNIQUE INDEX employees_email_key ON public.employees USING btree (email);
CREATE UNIQUE INDEX attendance_employee_id_date_key ON public.attendance USING btree (employee_id, date);
CREATE UNIQUE INDEX leave_balances_employee_id_leave_type_id_year_key ON public.leave_balances USING btree (employee_id, leave_type_id, year);
CREATE UNIQUE INDEX products_sku_key ON public.products USING btree (sku);
CREATE UNIQUE INDEX warehouses_code_key ON public.warehouses USING btree (code);
CREATE UNIQUE INDEX stock_product_id_warehouse_id_key ON public.stock USING btree (product_id, warehouse_id);
CREATE UNIQUE INDEX purchase_orders_po_number_key ON public.purchase_orders USING btree (po_number);
CREATE UNIQUE INDEX invoices_invoice_number_key ON public.invoices USING btree (invoice_number);
CREATE UNIQUE INDEX calendar_event_attendees_event_id_user_id_key ON public.calendar_event_attendees USING btree (event_id, user_id);
CREATE INDEX idx_users_organization ON public.users USING btree (organization_id);
CREATE INDEX idx_users_email ON public.users USING btree (email);
CREATE INDEX idx_contacts_organization ON public.contacts USING btree (organization_id);
CREATE INDEX idx_contacts_email ON public.contacts USING btree (email);
CREATE INDEX idx_companies_organization ON public.companies USING btree (organization_id);
CREATE INDEX idx_leads_organization ON public.leads USING btree (organization_id);
CREATE INDEX idx_leads_workspace ON public.leads USING btree (workspace_id);
CREATE INDEX idx_deals_organization ON public.deals USING btree (organization_id);
CREATE INDEX idx_deals_contact ON public.deals USING btree (contact_id);
CREATE INDEX idx_activities_organization ON public.activities USING btree (organization_id);
CREATE INDEX idx_activities_contact ON public.activities USING btree (contact_id);
CREATE INDEX idx_employees_organization ON public.employees USING btree (organization_id);
CREATE INDEX idx_attendance_employee ON public.attendance USING btree (employee_id);
CREATE INDEX idx_products_organization ON public.products USING btree (organization_id);
CREATE INDEX idx_stock_product ON public.stock USING btree (product_id);
CREATE INDEX idx_projects_organization ON public.projects USING btree (organization_id);
CREATE INDEX idx_marketing_campaigns_org ON public.marketing_campaigns USING btree (organization_id);
CREATE INDEX idx_marketing_lists_org ON public.marketing_lists USING btree (organization_id);
CREATE INDEX idx_marketing_events_campaign ON public.marketing_campaign_events USING btree (campaign_id);
CREATE INDEX idx_marketing_events_contact ON public.marketing_campaign_events USING btree (contact_id);
CREATE UNIQUE INDEX deal_contacts_org_id_deal_id_contact_id_key ON public.deal_contacts USING btree (org_id, deal_id, contact_id);
CREATE INDEX idx_deal_contacts_org ON public.deal_contacts USING btree (org_id);
CREATE INDEX idx_deal_contacts_deal ON public.deal_contacts USING btree (deal_id);
CREATE INDEX idx_deal_contacts_contact ON public.deal_contacts USING btree (contact_id);
CREATE UNIQUE INDEX deal_signing_parties_org_id_deal_id_contact_id_key ON public.deal_signing_parties USING btree (org_id, deal_id, contact_id);
CREATE INDEX idx_deal_signing_parties_org ON public.deal_signing_parties USING btree (org_id);
CREATE INDEX idx_deal_signing_parties_deal ON public.deal_signing_parties USING btree (deal_id);
CREATE INDEX idx_deal_signing_parties_contact ON public.deal_signing_parties USING btree (contact_id);
CREATE INDEX idx_leads_converted_deal ON public.leads USING btree (converted_to_deal_id);
CREATE INDEX idx_deals_converted_lead ON public.deals USING btree (converted_from_lead_id);
CREATE INDEX idx_deals_converted_customer ON public.deals USING btree (converted_to_customer_id);
CREATE INDEX idx_customers_converted_lead ON public.customers USING btree (converted_from_lead_id);
CREATE INDEX idx_customers_converted_deal ON public.customers USING btree (converted_from_deal_id);
CREATE INDEX idx_product_batches_org ON public.product_batches USING btree (org_id);
CREATE INDEX idx_product_batches_product ON public.product_batches USING btree (product_id);
CREATE INDEX idx_deals_contact_name ON public.deals USING btree (contact_name);
CREATE INDEX idx_deals_company_name ON public.deals USING btree (company_name);
CREATE INDEX idx_deals_email ON public.deals USING btree (email);
CREATE INDEX idx_deals_priority ON public.deals USING btree (priority);
CREATE INDEX idx_deals_source ON public.deals USING btree (source);
CREATE UNIQUE INDEX workgroup_members_workgroup_id_user_id_key ON public.workgroup_members USING btree (workgroup_id, user_id);
CREATE UNIQUE INDEX workgroup_channels_workgroup_id_name_key ON public.workgroup_channels USING btree (workgroup_id, name);
CREATE UNIQUE INDEX workgroup_meeting_participants_meeting_id_user_id_key ON public.workgroup_meeting_participants USING btree (meeting_id, user_id);
CREATE INDEX idx_workgroups_org_id ON public.workgroups USING btree (org_id);
CREATE INDEX idx_workgroups_type ON public.workgroups USING btree (type);
CREATE INDEX idx_workgroups_created_at ON public.workgroups USING btree (created_at DESC);
CREATE INDEX idx_workgroup_members_workgroup_id ON public.workgroup_members USING btree (workgroup_id);
CREATE INDEX idx_workgroup_members_user_id ON public.workgroup_members USING btree (user_id);
CREATE INDEX idx_workgroup_members_role ON public.workgroup_members USING btree (role);
CREATE INDEX idx_workgroup_channels_workgroup_id ON public.workgroup_channels USING btree (workgroup_id);
CREATE INDEX idx_workgroup_channels_type ON public.workgroup_channels USING btree (type);
CREATE INDEX idx_workgroup_posts_workgroup_id ON public.workgroup_posts USING btree (workgroup_id);
CREATE INDEX idx_workgroup_posts_channel_id ON public.workgroup_posts USING btree (channel_id);
CREATE INDEX idx_workgroup_posts_parent_id ON public.workgroup_posts USING btree (parent_id);
CREATE INDEX idx_workgroup_posts_created_at ON public.workgroup_posts USING btree (created_at DESC);
CREATE INDEX idx_workgroup_meetings_workgroup_id ON public.workgroup_meetings USING btree (workgroup_id);
CREATE INDEX idx_workgroup_meetings_status ON public.workgroup_meetings USING btree (status);
CREATE INDEX idx_workgroup_meetings_scheduled_start ON public.workgroup_meetings USING btree (scheduled_start);
CREATE INDEX idx_workgroup_files_workgroup_id ON public.workgroup_files USING btree (workgroup_id);
CREATE INDEX idx_workgroup_files_channel_id ON public.workgroup_files USING btree (channel_id);
CREATE INDEX idx_workgroup_files_uploaded_by ON public.workgroup_files USING btree (uploaded_by);
CREATE INDEX idx_workgroup_activities_workgroup_created ON public.workgroup_activities USING btree (workgroup_id, created_at DESC);
CREATE UNIQUE INDEX workgroup_wiki_pages_workgroup_id_slug_key ON public.workgroup_wiki_pages USING btree (workgroup_id, slug);
CREATE INDEX idx_workgroup_files_created_at ON public.workgroup_files USING btree (created_at DESC);
CREATE INDEX idx_workgroup_wiki_pages_workgroup_id ON public.workgroup_wiki_pages USING btree (workgroup_id);
CREATE INDEX idx_workgroup_wiki_pages_slug ON public.workgroup_wiki_pages USING btree (workgroup_id, slug);
CREATE INDEX idx_workgroup_notifications_workgroup_id ON public.workgroup_notifications USING btree (workgroup_id);
CREATE INDEX idx_workgroup_notifications_user_id ON public.workgroup_notifications USING btree (user_id);
CREATE INDEX idx_workgroup_notifications_created_at ON public.workgroup_notifications USING btree (created_at DESC);
CREATE INDEX idx_workgroup_notifications_is_read ON public.workgroup_notifications USING btree (is_read);
CREATE INDEX idx_leads_workspace_id ON public.leads USING btree (workspace_id);
CREATE INDEX idx_entity_drive_files_entity ON public.entity_drive_files USING btree (entity_type, entity_id);
CREATE INDEX idx_connected_drives_org ON public.connected_drives USING btree (org_id);
CREATE INDEX idx_drive_permissions_drive ON public.drive_permissions USING btree (drive_id);
CREATE INDEX idx_employee_documents_employee ON public.employee_documents USING btree (employee_id);
CREATE INDEX idx_employee_documents_org ON public.employee_documents USING btree (org_id);
CREATE INDEX idx_employee_documents_type ON public.employee_documents USING btree (document_type);
CREATE INDEX idx_deals_workspace_id ON public.deals USING btree (workspace_id);
CREATE INDEX idx_deals_external_source ON public.deals USING btree (external_source_id);
CREATE INDEX idx_deals_service_interested ON public.deals USING btree (service_interested);
CREATE INDEX idx_deals_agent_name ON public.deals USING btree (agent_name);
CREATE UNIQUE INDEX employee_leave_balances_employee_id_leave_type_id_year_key ON public.employee_leave_balances USING btree (employee_id, leave_type_id, year);
CREATE UNIQUE INDEX public_holidays_org_id_date_key ON public.public_holidays USING btree (org_id, date);
CREATE INDEX idx_leave_balances_employee ON public.employee_leave_balances USING btree (employee_id);
CREATE INDEX idx_leave_balances_year ON public.employee_leave_balances USING btree (year);
CREATE INDEX idx_leave_balances_org ON public.employee_leave_balances USING btree (org_id);
CREATE INDEX idx_leave_requests_employee ON public.leave_requests USING btree (employee_id);
CREATE INDEX idx_leave_requests_status ON public.leave_requests USING btree (status);
CREATE INDEX idx_leave_requests_dates ON public.leave_requests USING btree (start_date, end_date);
CREATE INDEX idx_leave_requests_org ON public.leave_requests USING btree (org_id);
CREATE INDEX idx_leave_comments_request ON public.leave_request_comments USING btree (leave_request_id);
CREATE INDEX idx_holidays_org_date ON public.public_holidays USING btree (org_id, date);
CREATE INDEX idx_products_barcode ON public.products USING btree (barcode);
CREATE INDEX idx_products_reorder_level ON public.products USING btree (reorder_level);
CREATE INDEX idx_vendors_business_type ON public.vendors USING btree (business_type);
CREATE UNIQUE INDEX salary_slips_org_id_employee_id_month_year_key ON public.salary_slips USING btree (org_id, employee_id, month, year);
CREATE INDEX idx_salary_components_org ON public.salary_components USING btree (org_id);
CREATE INDEX idx_employee_salaries_employee ON public.employee_salaries USING btree (employee_id);
CREATE INDEX idx_salary_slips_employee ON public.salary_slips USING btree (employee_id);
CREATE INDEX idx_salary_slips_month_year ON public.salary_slips USING btree (month, year);
CREATE UNIQUE INDEX connected_mailboxes_org_id_user_id_email_address_key ON public.connected_mailboxes USING btree (org_id, user_id, email_address);
CREATE INDEX idx_epa_org_id ON public.employee_product_assignments USING btree (org_id);
CREATE INDEX idx_epa_employee_id ON public.employee_product_assignments USING btree (employee_id);
CREATE INDEX idx_epa_product_id ON public.employee_product_assignments USING btree (product_id);
CREATE INDEX idx_epa_status ON public.employee_product_assignments USING btree (status);
CREATE UNIQUE INDEX pipeline_stages_org_id_pipeline_stage_key_key ON public.pipeline_stages USING btree (org_id, pipeline, stage_key);
CREATE INDEX idx_pipeline_stages_org ON public.pipeline_stages USING btree (org_id);
CREATE INDEX idx_stock_adjustments_org ON public.stock_adjustments USING btree (org_id);
CREATE INDEX idx_stock_adjustments_product ON public.stock_adjustments USING btree (product_id);
CREATE INDEX idx_unibox_emails_org ON public.unibox_emails USING btree (org_id);
CREATE INDEX idx_unibox_emails_status ON public.unibox_emails USING btree (status);
CREATE INDEX idx_unibox_emails_sender ON public.unibox_emails USING btree (sender_email);
CREATE INDEX idx_lead_imports_org_id ON public.lead_imports USING btree (org_id);
CREATE INDEX idx_lead_imports_workspace_id ON public.lead_imports USING btree (workspace_id);
CREATE INDEX idx_lead_imports_status ON public.lead_imports USING btree (status);
CREATE INDEX idx_lead_imports_imported_by ON public.lead_imports USING btree (imported_by);
CREATE INDEX idx_leads_import_id ON public.leads USING btree (import_id);
CREATE INDEX idx_leads_created_by ON public.leads USING btree (created_by);
CREATE INDEX idx_leads_assigned_to ON public.leads USING btree (assigned_to);
CREATE INDEX idx_leads_converted_to_deal_id ON public.leads USING btree (converted_to_deal_id);
CREATE UNIQUE INDEX project_members_project_id_user_id_key ON public.project_members USING btree (project_id, user_id);
CREATE INDEX idx_project_members_project ON public.project_members USING btree (project_id);
CREATE INDEX idx_project_members_user ON public.project_members USING btree (user_id);
CREATE INDEX idx_project_comments_project ON public.project_comments USING btree (project_id);
CREATE INDEX idx_project_comments_task ON public.project_comments USING btree (task_id);
CREATE INDEX idx_project_attachments_project ON public.project_attachments USING btree (project_id);
CREATE INDEX idx_project_activity_logs_project ON public.project_activity_logs USING btree (project_id);
CREATE INDEX idx_tasks_parent ON public.tasks USING btree (parent_task_id);
CREATE INDEX idx_tasks_milestone ON public.tasks USING btree (milestone_id);
CREATE INDEX idx_project_tasks_parent ON public.project_tasks USING btree (parent_task_id);

-- Foreign Keys
ALTER TABLE users ADD CONSTRAINT users_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES organizations (id) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE roles ADD CONSTRAINT roles_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES organizations (id) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE user_roles ADD CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE user_roles ADD CONSTRAINT user_roles_role_id_fkey FOREIGN KEY (role_id) REFERENCES roles (id) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE contacts ADD CONSTRAINT contacts_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES organizations (id) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE contacts ADD CONSTRAINT contacts_created_by_fkey FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE companies ADD CONSTRAINT companies_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES organizations (id) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE companies ADD CONSTRAINT companies_created_by_fkey FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE leads ADD CONSTRAINT leads_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES organizations (id) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE leads ADD CONSTRAINT leads_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES users (id) ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE leads ADD CONSTRAINT leads_contact_id_fkey FOREIGN KEY (contact_id) REFERENCES contacts (id) ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE leads ADD CONSTRAINT leads_org_id_fkey FOREIGN KEY (org_id) REFERENCES organizations (id) ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE lead_workspaces ADD CONSTRAINT lead_workspaces_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES organizations (id) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE lead_workspaces ADD CONSTRAINT lead_workspaces_created_by_fkey FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE lead_external_sources ADD CONSTRAINT lead_external_sources_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES organizations (id) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE deals ADD CONSTRAINT deals_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES organizations (id) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE deals ADD CONSTRAINT deals_contact_id_fkey FOREIGN KEY (contact_id) REFERENCES contacts (id) ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE deals ADD CONSTRAINT deals_company_id_fkey FOREIGN KEY (company_id) REFERENCES companies (id) ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE deals ADD CONSTRAINT deals_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES users (id) ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE deals ADD CONSTRAINT deals_org_id_fkey FOREIGN KEY (org_id) REFERENCES organizations (id) ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE customers ADD CONSTRAINT customers_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES organizations (id) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE customers ADD CONSTRAINT customers_contact_id_fkey FOREIGN KEY (contact_id) REFERENCES contacts (id) ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE customers ADD CONSTRAINT customers_company_id_fkey FOREIGN KEY (company_id) REFERENCES companies (id) ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE activities ADD CONSTRAINT activities_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES organizations (id) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE activities ADD CONSTRAINT activities_contact_id_fkey FOREIGN KEY (contact_id) REFERENCES contacts (id) ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE activities ADD CONSTRAINT activities_deal_id_fkey FOREIGN KEY (deal_id) REFERENCES deals (id) ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE activities ADD CONSTRAINT activities_company_id_fkey FOREIGN KEY (company_id) REFERENCES companies (id) ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE activities ADD CONSTRAINT activities_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES users (id) ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE vendors ADD CONSTRAINT vendors_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES organizations (id) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE signing_parties ADD CONSTRAINT signing_parties_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES organizations (id) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE marketing_campaigns ADD CONSTRAINT marketing_campaigns_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES organizations (id) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE marketing_campaigns ADD CONSTRAINT marketing_campaigns_created_by_fkey FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE marketing_lists ADD CONSTRAINT marketing_lists_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES organizations (id) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE marketing_lists ADD CONSTRAINT marketing_lists_created_by_fkey FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE marketing_list_members ADD CONSTRAINT marketing_list_members_list_id_fkey FOREIGN KEY (list_id) REFERENCES marketing_lists (id) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE marketing_list_members ADD CONSTRAINT marketing_list_members_contact_id_fkey FOREIGN KEY (contact_id) REFERENCES contacts (id) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE marketing_forms ADD CONSTRAINT marketing_forms_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES organizations (id) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE marketing_forms ADD CONSTRAINT marketing_forms_list_id_fkey FOREIGN KEY (list_id) REFERENCES marketing_lists (id) ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE marketing_forms ADD CONSTRAINT marketing_forms_created_by_fkey FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE marketing_form_submissions ADD CONSTRAINT marketing_form_submissions_form_id_fkey FOREIGN KEY (form_id) REFERENCES marketing_forms (id) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE marketing_form_submissions ADD CONSTRAINT marketing_form_submissions_contact_id_fkey FOREIGN KEY (contact_id) REFERENCES contacts (id) ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE marketing_sequences ADD CONSTRAINT marketing_sequences_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES organizations (id) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE marketing_sequences ADD CONSTRAINT marketing_sequences_created_by_fkey FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE marketing_sequence_steps ADD CONSTRAINT marketing_sequence_steps_sequence_id_fkey FOREIGN KEY (sequence_id) REFERENCES marketing_sequences (id) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE marketing_sequence_enrollments ADD CONSTRAINT marketing_sequence_enrollments_sequence_id_fkey FOREIGN KEY (sequence_id) REFERENCES marketing_sequences (id) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE marketing_sequence_enrollments ADD CONSTRAINT marketing_sequence_enrollments_contact_id_fkey FOREIGN KEY (contact_id) REFERENCES contacts (id) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE marketing_segments ADD CONSTRAINT marketing_segments_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES organizations (id) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE marketing_segments ADD CONSTRAINT marketing_segments_created_by_fkey FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE marketing_templates ADD CONSTRAINT marketing_templates_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES organizations (id) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE marketing_templates ADD CONSTRAINT marketing_templates_created_by_fkey FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE marketing_campaign_events ADD CONSTRAINT marketing_campaign_events_campaign_id_fkey FOREIGN KEY (campaign_id) REFERENCES marketing_campaigns (id) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE marketing_campaign_events ADD CONSTRAINT marketing_campaign_events_contact_id_fkey FOREIGN KEY (contact_id) REFERENCES contacts (id) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE marketing_scoring_rules ADD CONSTRAINT marketing_scoring_rules_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES organizations (id) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE marketing_scoring_history ADD CONSTRAINT marketing_scoring_history_contact_id_fkey FOREIGN KEY (contact_id) REFERENCES contacts (id) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE marketing_scoring_history ADD CONSTRAINT marketing_scoring_history_rule_id_fkey FOREIGN KEY (rule_id) REFERENCES marketing_scoring_rules (id) ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE marketing_ab_tests ADD CONSTRAINT marketing_ab_tests_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES organizations (id) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE marketing_ab_tests ADD CONSTRAINT marketing_ab_tests_created_by_fkey FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE marketing_ab_test_variants ADD CONSTRAINT marketing_ab_test_variants_test_id_fkey FOREIGN KEY (test_id) REFERENCES marketing_ab_tests (id) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE marketing_ab_test_results ADD CONSTRAINT marketing_ab_test_results_test_id_fkey FOREIGN KEY (test_id) REFERENCES marketing_ab_tests (id) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE marketing_ab_test_results ADD CONSTRAINT marketing_ab_test_results_variant_id_fkey FOREIGN KEY (variant_id) REFERENCES marketing_ab_test_variants (id) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE marketing_ab_test_results ADD CONSTRAINT marketing_ab_test_results_contact_id_fkey FOREIGN KEY (contact_id) REFERENCES contacts (id) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE marketing_webhooks ADD CONSTRAINT marketing_webhooks_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES organizations (id) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE marketing_webhooks ADD CONSTRAINT marketing_webhooks_created_by_fkey FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE marketing_webhook_logs ADD CONSTRAINT marketing_webhook_logs_webhook_id_fkey FOREIGN KEY (webhook_id) REFERENCES marketing_webhooks (id) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE marketing_webhook_queue ADD CONSTRAINT marketing_webhook_queue_webhook_id_fkey FOREIGN KEY (webhook_id) REFERENCES marketing_webhooks (id) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE employees ADD CONSTRAINT employees_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES organizations (id) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE employees ADD CONSTRAINT employees_user_id_fkey FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE employees ADD CONSTRAINT employees_manager_id_fkey FOREIGN KEY (manager_id) REFERENCES employees (id) ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE employees ADD CONSTRAINT employees_org_id_fkey FOREIGN KEY (org_id) REFERENCES organizations (id) ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE attendance ADD CONSTRAINT attendance_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES organizations (id) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE attendance ADD CONSTRAINT attendance_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES employees (id) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE attendance ADD CONSTRAINT attendance_org_id_fkey FOREIGN KEY (org_id) REFERENCES organizations (id) ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE leave_balances ADD CONSTRAINT leave_balances_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES employees (id) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE hrms_notifications ADD CONSTRAINT hrms_notifications_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES organizations (id) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE hrms_notifications ADD CONSTRAINT hrms_notifications_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES employees (id) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE payroll ADD CONSTRAINT payroll_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES organizations (id) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE payroll ADD CONSTRAINT payroll_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES employees (id) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE payroll ADD CONSTRAINT payroll_created_by_fkey FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE products ADD CONSTRAINT products_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES organizations (id) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE products ADD CONSTRAINT products_created_by_fkey FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE warehouses ADD CONSTRAINT warehouses_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES organizations (id) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE warehouses ADD CONSTRAINT warehouses_manager_id_fkey FOREIGN KEY (manager_id) REFERENCES users (id) ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE stock ADD CONSTRAINT stock_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES organizations (id) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE stock ADD CONSTRAINT stock_product_id_fkey FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE stock ADD CONSTRAINT stock_warehouse_id_fkey FOREIGN KEY (warehouse_id) REFERENCES warehouses (id) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE stock_movements ADD CONSTRAINT stock_movements_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES organizations (id) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE stock_movements ADD CONSTRAINT stock_movements_product_id_fkey FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE stock_movements ADD CONSTRAINT stock_movements_warehouse_id_fkey FOREIGN KEY (warehouse_id) REFERENCES warehouses (id) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE stock_movements ADD CONSTRAINT stock_movements_created_by_fkey FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE purchase_orders ADD CONSTRAINT purchase_orders_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES organizations (id) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE purchase_orders ADD CONSTRAINT purchase_orders_vendor_id_fkey FOREIGN KEY (vendor_id) REFERENCES vendors (id) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE purchase_orders ADD CONSTRAINT purchase_orders_warehouse_id_fkey FOREIGN KEY (warehouse_id) REFERENCES warehouses (id) ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE purchase_orders ADD CONSTRAINT purchase_orders_created_by_fkey FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE purchase_order_items ADD CONSTRAINT purchase_order_items_purchase_order_id_fkey FOREIGN KEY (purchase_order_id) REFERENCES purchase_orders (id) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE purchase_order_items ADD CONSTRAINT purchase_order_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE invoices ADD CONSTRAINT invoices_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES organizations (id) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE invoices ADD CONSTRAINT invoices_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES customers (id) ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE invoices ADD CONSTRAINT invoices_contact_id_fkey FOREIGN KEY (contact_id) REFERENCES contacts (id) ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE invoices ADD CONSTRAINT invoices_created_by_fkey FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE invoice_items ADD CONSTRAINT invoice_items_invoice_id_fkey FOREIGN KEY (invoice_id) REFERENCES invoices (id) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE invoice_items ADD CONSTRAINT invoice_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE projects ADD CONSTRAINT projects_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES organizations (id) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE projects ADD CONSTRAINT projects_client_id_fkey FOREIGN KEY (client_id) REFERENCES customers (id) ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE projects ADD CONSTRAINT projects_manager_id_fkey FOREIGN KEY (manager_id) REFERENCES users (id) ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE projects ADD CONSTRAINT projects_created_by_fkey FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE project_tasks ADD CONSTRAINT project_tasks_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES organizations (id) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE project_tasks ADD CONSTRAINT project_tasks_project_id_fkey FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE project_tasks ADD CONSTRAINT project_tasks_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES users (id) ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE project_tasks ADD CONSTRAINT project_tasks_parent_task_id_fkey FOREIGN KEY (parent_task_id) REFERENCES project_tasks (id) ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE project_tasks ADD CONSTRAINT project_tasks_created_by_fkey FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE project_milestones ADD CONSTRAINT project_milestones_project_id_fkey FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE project_time_entries ADD CONSTRAINT project_time_entries_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES organizations (id) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE project_time_entries ADD CONSTRAINT project_time_entries_project_id_fkey FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE project_time_entries ADD CONSTRAINT project_time_entries_task_id_fkey FOREIGN KEY (task_id) REFERENCES project_tasks (id) ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE project_time_entries ADD CONSTRAINT project_time_entries_user_id_fkey FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE project_documents ADD CONSTRAINT project_documents_project_id_fkey FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE project_documents ADD CONSTRAINT project_documents_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES users (id) ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE project_risks ADD CONSTRAINT project_risks_project_id_fkey FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE project_risks ADD CONSTRAINT project_risks_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES users (id) ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE workgroup_wiki ADD CONSTRAINT workgroup_wiki_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES workgroup_wiki (id) ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE workgroup_wiki ADD CONSTRAINT workgroup_wiki_created_by_fkey FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE workgroup_wiki ADD CONSTRAINT workgroup_wiki_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES users (id) ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE workgroup_notifications ADD CONSTRAINT workgroup_notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE calendar_events ADD CONSTRAINT calendar_events_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES organizations (id) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE calendar_events ADD CONSTRAINT calendar_events_created_by_fkey FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE calendar_event_attendees ADD CONSTRAINT calendar_event_attendees_event_id_fkey FOREIGN KEY (event_id) REFERENCES calendar_events (id) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE calendar_event_attendees ADD CONSTRAINT calendar_event_attendees_user_id_fkey FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE drive_files ADD CONSTRAINT drive_files_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES organizations (id) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE drive_files ADD CONSTRAINT drive_files_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES users (id) ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE emails ADD CONSTRAINT emails_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES organizations (id) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE emails ADD CONSTRAINT emails_user_id_fkey FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE workflows ADD CONSTRAINT workflows_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES organizations (id) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE workflows ADD CONSTRAINT workflows_created_by_fkey FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE workflow_actions ADD CONSTRAINT workflow_actions_workflow_id_fkey FOREIGN KEY (workflow_id) REFERENCES workflows (id) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE workflow_executions ADD CONSTRAINT workflow_executions_workflow_id_fkey FOREIGN KEY (workflow_id) REFERENCES workflows (id) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE notification_templates ADD CONSTRAINT notification_templates_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES organizations (id) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE notifications ADD CONSTRAINT notifications_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES organizations (id) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE notifications ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE call_logs ADD CONSTRAINT call_logs_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES organizations (id) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE call_logs ADD CONSTRAINT call_logs_contact_id_fkey FOREIGN KEY (contact_id) REFERENCES contacts (id) ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE call_logs ADD CONSTRAINT call_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE deals ADD CONSTRAINT deals_converted_to_customer_id_fkey FOREIGN KEY (converted_to_customer_id) REFERENCES customers (id) ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE stock ADD CONSTRAINT fk_stock_product FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE deal_contacts ADD CONSTRAINT deal_contacts_org_id_fkey FOREIGN KEY (org_id) REFERENCES organizations (id) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE deal_contacts ADD CONSTRAINT deal_contacts_deal_id_fkey FOREIGN KEY (deal_id) REFERENCES deals (id) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE deal_contacts ADD CONSTRAINT deal_contacts_contact_id_fkey FOREIGN KEY (contact_id) REFERENCES contacts (id) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE deal_signing_parties ADD CONSTRAINT deal_signing_parties_org_id_fkey FOREIGN KEY (org_id) REFERENCES organizations (id) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE deal_signing_parties ADD CONSTRAINT deal_signing_parties_deal_id_fkey FOREIGN KEY (deal_id) REFERENCES deals (id) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE deal_signing_parties ADD CONSTRAINT deal_signing_parties_contact_id_fkey FOREIGN KEY (contact_id) REFERENCES contacts (id) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE customers ADD CONSTRAINT customers_converted_from_lead_id_fkey FOREIGN KEY (converted_from_lead_id) REFERENCES leads (id) ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE customers ADD CONSTRAINT customers_converted_from_deal_id_fkey FOREIGN KEY (converted_from_deal_id) REFERENCES deals (id) ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE leads ADD CONSTRAINT leads_converted_to_deal_id_fkey FOREIGN KEY (converted_to_deal_id) REFERENCES deals (id) ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE deals ADD CONSTRAINT deals_converted_from_lead_id_fkey FOREIGN KEY (converted_from_lead_id) REFERENCES leads (id) ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE stock ADD CONSTRAINT fk_stock_warehouse FOREIGN KEY (warehouse_id) REFERENCES warehouses (id) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE product_batches ADD CONSTRAINT product_batches_org_id_fkey FOREIGN KEY (org_id) REFERENCES organizations (id) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE product_batches ADD CONSTRAINT product_batches_product_id_fkey FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE workgroups ADD CONSTRAINT workgroups_org_id_fkey FOREIGN KEY (org_id) REFERENCES organizations (id) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE workgroups ADD CONSTRAINT workgroups_created_by_fkey FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE workgroup_members ADD CONSTRAINT workgroup_members_workgroup_id_fkey FOREIGN KEY (workgroup_id) REFERENCES workgroups (id) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE workgroup_members ADD CONSTRAINT workgroup_members_user_id_fkey FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE workgroup_members ADD CONSTRAINT workgroup_members_invited_by_fkey FOREIGN KEY (invited_by) REFERENCES users (id) ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE workgroup_channels ADD CONSTRAINT workgroup_channels_workgroup_id_fkey FOREIGN KEY (workgroup_id) REFERENCES workgroups (id) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE workgroup_channels ADD CONSTRAINT workgroup_channels_created_by_fkey FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE companies ADD CONSTRAINT companies_org_id_fkey FOREIGN KEY (org_id) REFERENCES organizations (id) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE customers ADD CONSTRAINT customers_org_id_fkey FOREIGN KEY (org_id) REFERENCES organizations (id) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE drive_files ADD CONSTRAINT drive_files_org_id_fkey FOREIGN KEY (org_id) REFERENCES organizations (id) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE emails ADD CONSTRAINT emails_org_id_fkey FOREIGN KEY (org_id) REFERENCES organizations (id) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE workgroup_posts ADD CONSTRAINT workgroup_posts_workgroup_id_fkey FOREIGN KEY (workgroup_id) REFERENCES workgroups (id) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE workgroup_posts ADD CONSTRAINT workgroup_posts_channel_id_fkey FOREIGN KEY (channel_id) REFERENCES workgroup_channels (id) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE workgroup_posts ADD CONSTRAINT workgroup_posts_user_id_fkey FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE workgroup_posts ADD CONSTRAINT workgroup_posts_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES workgroup_posts (id) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE workgroup_meetings ADD CONSTRAINT workgroup_meetings_workgroup_id_fkey FOREIGN KEY (workgroup_id) REFERENCES workgroups (id) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE workgroup_meetings ADD CONSTRAINT workgroup_meetings_channel_id_fkey FOREIGN KEY (channel_id) REFERENCES workgroup_channels (id) ON DELETE SET NULL ON UPDATE NO ACTION;
ALTER TABLE workgroup_meetings ADD CONSTRAINT workgroup_meetings_created_by_fkey FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE hrms_notifications ADD CONSTRAINT hrms_notifications_org_id_fkey FOREIGN KEY (org_id) REFERENCES organizations (id) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE invoices ADD CONSTRAINT invoices_org_id_fkey FOREIGN KEY (org_id) REFERENCES organizations (id) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE lead_external_sources ADD CONSTRAINT lead_external_sources_org_id_fkey FOREIGN KEY (org_id) REFERENCES organizations (id) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE lead_workspaces ADD CONSTRAINT lead_workspaces_org_id_fkey FOREIGN KEY (org_id) REFERENCES organizations (id) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE workgroup_meeting_participants ADD CONSTRAINT workgroup_meeting_participants_meeting_id_fkey FOREIGN KEY (meeting_id) REFERENCES workgroup_meetings (id) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE workgroup_meeting_participants ADD CONSTRAINT workgroup_meeting_participants_user_id_fkey FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE workgroup_files ADD CONSTRAINT workgroup_files_workgroup_id_fkey FOREIGN KEY (workgroup_id) REFERENCES workgroups (id) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE workgroup_files ADD CONSTRAINT workgroup_files_channel_id_fkey FOREIGN KEY (channel_id) REFERENCES workgroup_channels (id) ON DELETE SET NULL ON UPDATE NO ACTION;
ALTER TABLE workgroup_files ADD CONSTRAINT workgroup_files_post_id_fkey FOREIGN KEY (post_id) REFERENCES workgroup_posts (id) ON DELETE SET NULL ON UPDATE NO ACTION;
ALTER TABLE workgroup_files ADD CONSTRAINT workgroup_files_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES users (id) ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE workgroup_activities ADD CONSTRAINT workgroup_activities_workgroup_id_fkey FOREIGN KEY (workgroup_id) REFERENCES workgroups (id) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE workgroup_activities ADD CONSTRAINT workgroup_activities_user_id_fkey FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL ON UPDATE NO ACTION;
ALTER TABLE workgroup_wiki_pages ADD CONSTRAINT workgroup_wiki_pages_workgroup_id_fkey FOREIGN KEY (workgroup_id) REFERENCES workgroups (id) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE workgroup_wiki_pages ADD CONSTRAINT workgroup_wiki_pages_user_id_fkey FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE workgroup_wiki_pages ADD CONSTRAINT workgroup_wiki_pages_org_id_fkey FOREIGN KEY (org_id) REFERENCES organizations (id) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE workgroup_wiki_pages ADD CONSTRAINT workgroup_wiki_pages_created_by_fkey FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE workgroup_wiki_pages ADD CONSTRAINT workgroup_wiki_pages_last_modified_by_fkey FOREIGN KEY (last_modified_by) REFERENCES users (id) ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE employees ADD CONSTRAINT employees_created_by_fkey FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE entity_drive_files ADD CONSTRAINT entity_drive_files_org_id_fkey FOREIGN KEY (org_id) REFERENCES organizations (id) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE entity_drive_files ADD CONSTRAINT entity_drive_files_linked_by_fkey FOREIGN KEY (linked_by) REFERENCES users (id) ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE lead_workspace_access ADD CONSTRAINT lead_workspace_access_lead_id_fkey FOREIGN KEY (lead_id) REFERENCES leads (id) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE lead_workspace_access ADD CONSTRAINT lead_workspace_access_workspace_id_fkey FOREIGN KEY (workspace_id) REFERENCES workgroups (id) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE lead_workspace_access ADD CONSTRAINT lead_workspace_access_granted_by_fkey FOREIGN KEY (granted_by) REFERENCES users (id) ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE leave_types ADD CONSTRAINT leave_types_org_id_fkey FOREIGN KEY (org_id) REFERENCES organizations (id) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE marketing_ab_tests ADD CONSTRAINT marketing_ab_tests_org_id_fkey FOREIGN KEY (org_id) REFERENCES organizations (id) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE marketing_campaigns ADD CONSTRAINT marketing_campaigns_org_id_fkey FOREIGN KEY (org_id) REFERENCES organizations (id) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE marketing_forms ADD CONSTRAINT marketing_forms_org_id_fkey FOREIGN KEY (org_id) REFERENCES organizations (id) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE connected_drives ADD CONSTRAINT connected_drives_org_id_fkey FOREIGN KEY (org_id) REFERENCES organizations (id) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE connected_drives ADD CONSTRAINT connected_drives_connected_by_fkey FOREIGN KEY (connected_by) REFERENCES users (id) ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE drive_permissions ADD CONSTRAINT drive_permissions_drive_id_fkey FOREIGN KEY (drive_id) REFERENCES connected_drives (id) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE drive_permissions ADD CONSTRAINT drive_permissions_org_id_fkey FOREIGN KEY (org_id) REFERENCES organizations (id) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE drive_permissions ADD CONSTRAINT drive_permissions_user_id_fkey FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE drive_permissions ADD CONSTRAINT drive_permissions_role_fkey FOREIGN KEY (role) REFERENCES roles (id) ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE employee_documents ADD CONSTRAINT employee_documents_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES employees (id) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE employee_documents ADD CONSTRAINT employee_documents_org_id_fkey FOREIGN KEY (org_id) REFERENCES organizations (id) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE employee_documents ADD CONSTRAINT employee_documents_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES users (id) ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE deals ADD CONSTRAINT deals_workspace_id_fkey FOREIGN KEY (workspace_id) REFERENCES workgroups (id) ON DELETE SET NULL ON UPDATE NO ACTION;
ALTER TABLE employee_leave_balances ADD CONSTRAINT employee_leave_balances_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES employees (id) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE employee_leave_balances ADD CONSTRAINT employee_leave_balances_leave_type_id_fkey FOREIGN KEY (leave_type_id) REFERENCES leave_types (id) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE employee_leave_balances ADD CONSTRAINT employee_leave_balances_org_id_fkey FOREIGN KEY (org_id) REFERENCES organizations (id) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE leave_requests ADD CONSTRAINT leave_requests_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES employees (id) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE leave_requests ADD CONSTRAINT leave_requests_leave_type_id_fkey FOREIGN KEY (leave_type_id) REFERENCES leave_types (id) ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE leave_requests ADD CONSTRAINT leave_requests_org_id_fkey FOREIGN KEY (org_id) REFERENCES organizations (id) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE leave_requests ADD CONSTRAINT leave_requests_approver_id_fkey FOREIGN KEY (approver_id) REFERENCES users (id) ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE leave_request_comments ADD CONSTRAINT leave_request_comments_leave_request_id_fkey FOREIGN KEY (leave_request_id) REFERENCES leave_requests (id) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE leave_request_comments ADD CONSTRAINT leave_request_comments_user_id_fkey FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE public_holidays ADD CONSTRAINT public_holidays_org_id_fkey FOREIGN KEY (org_id) REFERENCES organizations (id) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE workflow_execution_steps ADD CONSTRAINT workflow_execution_steps_execution_id_fkey FOREIGN KEY (execution_id) REFERENCES workflow_executions (id) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE workflow_execution_steps ADD CONSTRAINT workflow_execution_steps_action_id_fkey FOREIGN KEY (action_id) REFERENCES workflow_actions (id) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE vendors ADD CONSTRAINT vendors_created_by_fkey FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE contacts ADD CONSTRAINT contacts_responsible_id_fkey FOREIGN KEY (responsible_id) REFERENCES users (id) ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE leave_types ADD CONSTRAINT leave_types_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES organizations (id) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE contacts ADD CONSTRAINT contacts_org_id_fkey FOREIGN KEY (org_id) REFERENCES organizations (id) ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE activities ADD CONSTRAINT activities_org_id_fkey FOREIGN KEY (org_id) REFERENCES organizations (id) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE calendar_events ADD CONSTRAINT calendar_events_org_id_fkey FOREIGN KEY (org_id) REFERENCES organizations (id) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE call_logs ADD CONSTRAINT call_logs_org_id_fkey FOREIGN KEY (org_id) REFERENCES organizations (id) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE marketing_lists ADD CONSTRAINT marketing_lists_org_id_fkey FOREIGN KEY (org_id) REFERENCES organizations (id) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE marketing_scoring_rules ADD CONSTRAINT marketing_scoring_rules_org_id_fkey FOREIGN KEY (org_id) REFERENCES organizations (id) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE marketing_segments ADD CONSTRAINT marketing_segments_org_id_fkey FOREIGN KEY (org_id) REFERENCES organizations (id) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE marketing_sequences ADD CONSTRAINT marketing_sequences_org_id_fkey FOREIGN KEY (org_id) REFERENCES organizations (id) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE marketing_templates ADD CONSTRAINT marketing_templates_org_id_fkey FOREIGN KEY (org_id) REFERENCES organizations (id) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE marketing_webhooks ADD CONSTRAINT marketing_webhooks_org_id_fkey FOREIGN KEY (org_id) REFERENCES organizations (id) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE notification_templates ADD CONSTRAINT notification_templates_org_id_fkey FOREIGN KEY (org_id) REFERENCES organizations (id) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE notifications ADD CONSTRAINT notifications_org_id_fkey FOREIGN KEY (org_id) REFERENCES organizations (id) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE payroll ADD CONSTRAINT payroll_org_id_fkey FOREIGN KEY (org_id) REFERENCES organizations (id) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE products ADD CONSTRAINT products_org_id_fkey FOREIGN KEY (org_id) REFERENCES organizations (id) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE project_tasks ADD CONSTRAINT project_tasks_org_id_fkey FOREIGN KEY (org_id) REFERENCES organizations (id) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE project_time_entries ADD CONSTRAINT project_time_entries_org_id_fkey FOREIGN KEY (org_id) REFERENCES organizations (id) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE projects ADD CONSTRAINT projects_org_id_fkey FOREIGN KEY (org_id) REFERENCES organizations (id) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE purchase_orders ADD CONSTRAINT purchase_orders_org_id_fkey FOREIGN KEY (org_id) REFERENCES organizations (id) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE roles ADD CONSTRAINT roles_org_id_fkey FOREIGN KEY (org_id) REFERENCES organizations (id) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE signing_parties ADD CONSTRAINT signing_parties_org_id_fkey FOREIGN KEY (org_id) REFERENCES organizations (id) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE stock ADD CONSTRAINT stock_org_id_fkey FOREIGN KEY (org_id) REFERENCES organizations (id) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE stock_movements ADD CONSTRAINT stock_movements_org_id_fkey FOREIGN KEY (org_id) REFERENCES organizations (id) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE users ADD CONSTRAINT users_org_id_fkey FOREIGN KEY (org_id) REFERENCES organizations (id) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE vendors ADD CONSTRAINT vendors_org_id_fkey FOREIGN KEY (org_id) REFERENCES organizations (id) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE warehouses ADD CONSTRAINT warehouses_org_id_fkey FOREIGN KEY (org_id) REFERENCES organizations (id) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE workflows ADD CONSTRAINT workflows_org_id_fkey FOREIGN KEY (org_id) REFERENCES organizations (id) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE project_milestones ADD CONSTRAINT project_milestones_org_id_fkey FOREIGN KEY (org_id) REFERENCES organizations (id) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE marketing_list_members ADD CONSTRAINT marketing_list_members_org_id_fkey FOREIGN KEY (org_id) REFERENCES organizations (id) ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE projects ADD CONSTRAINT projects_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES users (id) ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE drive_folders ADD CONSTRAINT drive_folders_org_id_fkey FOREIGN KEY (org_id) REFERENCES organizations (id) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE drive_folders ADD CONSTRAINT drive_folders_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES drive_folders (id) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE drive_folders ADD CONSTRAINT drive_folders_created_by_fkey FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE profiles ADD CONSTRAINT profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE profiles ADD CONSTRAINT profiles_org_id_fkey FOREIGN KEY (org_id) REFERENCES organizations (id) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE drive_files ADD CONSTRAINT drive_files_created_by_fkey FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE drive_files ADD CONSTRAINT drive_files_folder_id_fkey FOREIGN KEY (folder_id) REFERENCES drive_folders (id) ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE drive_files ADD CONSTRAINT drive_files_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES drive_files (id) ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE contacts ADD CONSTRAINT contacts_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES users (id) ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE companies ADD CONSTRAINT companies_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES users (id) ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE leads ADD CONSTRAINT leads_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES users (id) ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE deals ADD CONSTRAINT deals_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES users (id) ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE activities ADD CONSTRAINT activities_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES users (id) ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE activities ADD CONSTRAINT activities_lead_id_fkey FOREIGN KEY (lead_id) REFERENCES leads (id) ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE employees ADD CONSTRAINT employees_reporting_manager_id_fkey FOREIGN KEY (reporting_manager_id) REFERENCES employees (id) ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE products ADD CONSTRAINT products_supplier_id_fkey FOREIGN KEY (supplier_id) REFERENCES vendors (id) ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE drive_activities ADD CONSTRAINT drive_activities_org_id_fkey FOREIGN KEY (org_id) REFERENCES organizations (id) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE drive_activities ADD CONSTRAINT drive_activities_user_id_fkey FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE drive_activities ADD CONSTRAINT drive_activities_file_id_fkey FOREIGN KEY (file_id) REFERENCES drive_files (id) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE drive_activities ADD CONSTRAINT drive_activities_folder_id_fkey FOREIGN KEY (folder_id) REFERENCES drive_folders (id) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE drive_file_versions ADD CONSTRAINT drive_file_versions_file_id_fkey FOREIGN KEY (file_id) REFERENCES drive_files (id) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE drive_file_versions ADD CONSTRAINT drive_file_versions_created_by_fkey FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE connected_mailboxes ADD CONSTRAINT connected_mailboxes_org_id_fkey FOREIGN KEY (org_id) REFERENCES organizations (id) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE connected_mailboxes ADD CONSTRAINT connected_mailboxes_user_id_fkey FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE drive_folders ADD CONSTRAINT drive_folders_parent_folder_id_fkey FOREIGN KEY (parent_folder_id) REFERENCES drive_folders (id) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE leave_requests ADD CONSTRAINT leave_requests_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES organizations (id) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE leave_requests ADD CONSTRAINT leave_requests_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES users (id) ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE stock ADD CONSTRAINT stock_created_by_fkey FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE product_batches ADD CONSTRAINT product_batches_supplier_id_fkey FOREIGN KEY (supplier_id) REFERENCES vendors (id) ON DELETE NO ACTION ON UPDATE NO ACTION;
