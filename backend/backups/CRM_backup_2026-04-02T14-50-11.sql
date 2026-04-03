--
-- PostgreSQL database dump
--

-- Dumped from database version 17.5
-- Dumped by pg_dump version 17.5

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: update_leave_remaining_days(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_leave_remaining_days() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.remaining_days = NEW.total_days - NEW.used_days;
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_leave_remaining_days() OWNER TO postgres;

--
-- Name: update_stock_available_quantity(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_stock_available_quantity() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.available_quantity = NEW.quantity - NEW.reserved_quantity;
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_stock_available_quantity() OWNER TO postgres;

--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_updated_at_column() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: activities; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.activities (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    organization_id uuid,
    type character varying(50) NOT NULL,
    subject character varying(255),
    description text,
    contact_id uuid,
    deal_id uuid,
    company_id uuid,
    assigned_to uuid,
    due_date timestamp without time zone,
    completed boolean DEFAULT false,
    completed_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.activities OWNER TO postgres;

--
-- Name: attendance; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.attendance (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    organization_id uuid,
    employee_id uuid,
    date date NOT NULL,
    check_in timestamp without time zone,
    check_out timestamp without time zone,
    status character varying(50) DEFAULT 'present'::character varying,
    hours_worked numeric(5,2),
    notes text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    org_id uuid,
    total_hours numeric(5,2)
);


ALTER TABLE public.attendance OWNER TO postgres;

--
-- Name: calendar_event_attendees; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.calendar_event_attendees (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    event_id uuid,
    user_id uuid,
    status character varying(50) DEFAULT 'pending'::character varying
);


ALTER TABLE public.calendar_event_attendees OWNER TO postgres;

--
-- Name: calendar_events; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.calendar_events (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    organization_id uuid,
    title character varying(255) NOT NULL,
    description text,
    start_time timestamp without time zone NOT NULL,
    end_time timestamp without time zone NOT NULL,
    location character varying(255),
    event_type character varying(50) DEFAULT 'meeting'::character varying,
    is_all_day boolean DEFAULT false,
    recurrence_rule character varying(255),
    reminder_minutes integer,
    created_by uuid,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.calendar_events OWNER TO postgres;

--
-- Name: call_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.call_logs (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    organization_id uuid,
    contact_id uuid,
    user_id uuid,
    call_type character varying(50) NOT NULL,
    direction character varying(50) NOT NULL,
    phone_number character varying(50) NOT NULL,
    duration integer DEFAULT 0,
    status character varying(50),
    recording_url character varying(500),
    notes text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.call_logs OWNER TO postgres;

--
-- Name: companies; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.companies (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    organization_id uuid,
    name character varying(255) NOT NULL,
    industry character varying(100),
    website character varying(255),
    phone character varying(50),
    email character varying(255),
    address text,
    city character varying(100),
    state character varying(100),
    country character varying(100),
    postal_code character varying(20),
    employee_count integer,
    annual_revenue numeric(15,2),
    description text,
    logo_url character varying(500),
    status character varying(50) DEFAULT 'active'::character varying,
    created_by uuid,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.companies OWNER TO postgres;

--
-- Name: contacts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.contacts (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    organization_id uuid,
    first_name character varying(100),
    last_name character varying(100),
    email character varying(255),
    phone character varying(50),
    company character varying(255),
    job_title character varying(100),
    address text,
    city character varying(100),
    state character varying(100),
    country character varying(100),
    postal_code character varying(20),
    website character varying(255),
    source character varying(100),
    status character varying(50) DEFAULT 'active'::character varying,
    tags text[],
    notes text,
    last_contacted timestamp without time zone,
    created_by uuid,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    company_name character varying(255),
    linkedin_url character varying(255),
    twitter_url character varying(255),
    score integer DEFAULT 0
);


ALTER TABLE public.contacts OWNER TO postgres;

--
-- Name: customers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.customers (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    organization_id uuid,
    contact_id uuid,
    company_id uuid,
    customer_type character varying(50) DEFAULT 'individual'::character varying,
    status character varying(50) DEFAULT 'active'::character varying,
    lifetime_value numeric(15,2) DEFAULT 0,
    total_purchases integer DEFAULT 0,
    first_purchase_date date,
    last_purchase_date date,
    notes text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    industry character varying(100)
);


ALTER TABLE public.customers OWNER TO postgres;

--
-- Name: deals; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.deals (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    organization_id uuid,
    title character varying(255) NOT NULL,
    description text,
    value numeric(15,2),
    currency character varying(10) DEFAULT 'USD'::character varying,
    stage character varying(100) DEFAULT 'qualification'::character varying,
    probability integer DEFAULT 0,
    expected_close_date date,
    contact_id uuid,
    company_id uuid,
    assigned_to uuid,
    status character varying(50) DEFAULT 'open'::character varying,
    notes text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    closed_at timestamp without time zone,
    source character varying(100),
    campaign_id uuid,
    utm_source character varying(100),
    utm_medium character varying(100),
    utm_campaign character varying(100),
    org_id uuid
);


ALTER TABLE public.deals OWNER TO postgres;

--
-- Name: drive_files; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.drive_files (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    organization_id uuid,
    name character varying(255) NOT NULL,
    file_url character varying(500) NOT NULL,
    file_size integer,
    file_type character varying(100),
    folder_path character varying(500) DEFAULT '/'::character varying,
    is_public boolean DEFAULT false,
    shared_with uuid[],
    uploaded_by uuid,
    uploaded_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.drive_files OWNER TO postgres;

--
-- Name: emails; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.emails (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    organization_id uuid,
    user_id uuid,
    from_email character varying(255) NOT NULL,
    to_email character varying(255) NOT NULL,
    cc_email text,
    bcc_email text,
    subject character varying(500),
    body text,
    html_body text,
    is_read boolean DEFAULT false,
    is_starred boolean DEFAULT false,
    folder character varying(50) DEFAULT 'inbox'::character varying,
    thread_id character varying(255),
    message_id character varying(255),
    in_reply_to character varying(255),
    attachments jsonb DEFAULT '[]'::jsonb,
    received_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.emails OWNER TO postgres;

--
-- Name: employee_documents; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.employee_documents (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    employee_id uuid,
    document_type character varying(100) NOT NULL,
    document_name character varying(255) NOT NULL,
    file_url character varying(500) NOT NULL,
    file_size integer,
    uploaded_by uuid,
    uploaded_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.employee_documents OWNER TO postgres;

--
-- Name: employees; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.employees (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    organization_id uuid,
    user_id uuid,
    employee_code character varying(50),
    first_name character varying(100) NOT NULL,
    last_name character varying(100) NOT NULL,
    email character varying(255) NOT NULL,
    phone character varying(50),
    date_of_birth date,
    gender character varying(20),
    address text,
    city character varying(100),
    state character varying(100),
    country character varying(100),
    postal_code character varying(20),
    department character varying(100),
    "position" character varying(100),
    employment_type character varying(50) DEFAULT 'full-time'::character varying,
    join_date date NOT NULL,
    termination_date date,
    salary numeric(15,2),
    currency character varying(10) DEFAULT 'USD'::character varying,
    bank_account character varying(100),
    tax_id character varying(100),
    emergency_contact_name character varying(255),
    emergency_contact_phone character varying(50),
    status character varying(50) DEFAULT 'active'::character varying,
    profile_picture_url character varying(500),
    notes text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    manager_id uuid,
    employee_id character varying(50),
    org_id uuid,
    name character varying(255)
);


ALTER TABLE public.employees OWNER TO postgres;

--
-- Name: hrms_notifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.hrms_notifications (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    organization_id uuid,
    employee_id uuid,
    type character varying(50) NOT NULL,
    title character varying(255) NOT NULL,
    message text,
    is_read boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.hrms_notifications OWNER TO postgres;

--
-- Name: invoice_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.invoice_items (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    invoice_id uuid,
    product_id uuid,
    description text NOT NULL,
    quantity numeric(10,2) NOT NULL,
    unit_price numeric(15,2) NOT NULL,
    tax_rate numeric(5,2) DEFAULT 0,
    discount_percent numeric(5,2) DEFAULT 0,
    total_price numeric(15,2) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.invoice_items OWNER TO postgres;

--
-- Name: invoices; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.invoices (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    organization_id uuid,
    invoice_number character varying(100) NOT NULL,
    customer_id uuid,
    contact_id uuid,
    invoice_date date NOT NULL,
    due_date date,
    status character varying(50) DEFAULT 'draft'::character varying,
    subtotal numeric(15,2) DEFAULT 0,
    tax_amount numeric(15,2) DEFAULT 0,
    discount_amount numeric(15,2) DEFAULT 0,
    total_amount numeric(15,2) DEFAULT 0,
    paid_amount numeric(15,2) DEFAULT 0,
    balance_due numeric(15,2) DEFAULT 0,
    currency character varying(10) DEFAULT 'USD'::character varying,
    notes text,
    terms text,
    created_by uuid,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.invoices OWNER TO postgres;

--
-- Name: lead_external_sources; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.lead_external_sources (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    organization_id uuid,
    name character varying(255) NOT NULL,
    source_type character varying(50),
    api_key text,
    webhook_url text,
    config jsonb DEFAULT '{}'::jsonb,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.lead_external_sources OWNER TO postgres;

--
-- Name: lead_workspaces; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.lead_workspaces (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    organization_id uuid,
    name character varying(255) NOT NULL,
    description text,
    created_by uuid,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.lead_workspaces OWNER TO postgres;

--
-- Name: leads; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.leads (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    organization_id uuid,
    first_name character varying(100),
    last_name character varying(100),
    email character varying(255),
    phone character varying(50),
    company character varying(255),
    job_title character varying(100),
    source character varying(100),
    status character varying(50) DEFAULT 'new'::character varying,
    score integer DEFAULT 0,
    notes text,
    assigned_to uuid,
    converted_to_deal boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    workspace_id uuid,
    deal_id uuid,
    campaign_id uuid,
    utm_source character varying(100),
    utm_medium character varying(100),
    utm_campaign character varying(100),
    contact_id uuid,
    org_id uuid
);


ALTER TABLE public.leads OWNER TO postgres;

--
-- Name: leave_balances; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.leave_balances (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    employee_id uuid,
    leave_type_id uuid,
    year integer NOT NULL,
    total_days numeric(5,2) DEFAULT 0,
    used_days numeric(5,2) DEFAULT 0,
    remaining_days numeric(5,2) DEFAULT 0
);


ALTER TABLE public.leave_balances OWNER TO postgres;

--
-- Name: leave_requests; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.leave_requests (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    organization_id uuid,
    employee_id uuid,
    leave_type_id uuid,
    start_date date NOT NULL,
    end_date date NOT NULL,
    days_requested numeric(5,2) NOT NULL,
    reason text,
    status character varying(50) DEFAULT 'pending'::character varying,
    approved_by uuid,
    approved_at timestamp without time zone,
    rejection_reason text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    org_id uuid
);


ALTER TABLE public.leave_requests OWNER TO postgres;

--
-- Name: leave_types; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.leave_types (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    organization_id uuid,
    name character varying(100) NOT NULL,
    description text,
    days_per_year integer DEFAULT 0,
    is_paid boolean DEFAULT true,
    requires_approval boolean DEFAULT true,
    color character varying(20),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    org_id uuid
);


ALTER TABLE public.leave_types OWNER TO postgres;

--
-- Name: marketing_ab_test_results; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.marketing_ab_test_results (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    test_id uuid,
    variant_id uuid,
    contact_id uuid,
    opened boolean DEFAULT false,
    clicked boolean DEFAULT false,
    converted boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.marketing_ab_test_results OWNER TO postgres;

--
-- Name: marketing_ab_test_variants; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.marketing_ab_test_variants (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    test_id uuid,
    variant_name character varying(100) NOT NULL,
    subject character varying(500),
    content text,
    design jsonb,
    sent_count integer DEFAULT 0,
    opened_count integer DEFAULT 0,
    clicked_count integer DEFAULT 0,
    conversion_count integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.marketing_ab_test_variants OWNER TO postgres;

--
-- Name: marketing_ab_tests; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.marketing_ab_tests (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    organization_id uuid,
    name character varying(255) NOT NULL,
    description text,
    test_type character varying(50) DEFAULT 'subject_line'::character varying,
    status character varying(50) DEFAULT 'draft'::character varying,
    winner_criteria character varying(50) DEFAULT 'open_rate'::character varying,
    sample_size_percent integer DEFAULT 20,
    started_at timestamp without time zone,
    ended_at timestamp without time zone,
    winner_variant_id uuid,
    created_by uuid,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.marketing_ab_tests OWNER TO postgres;

--
-- Name: marketing_campaign_events; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.marketing_campaign_events (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    campaign_id uuid,
    contact_id uuid,
    event_type character varying(50) NOT NULL,
    event_data jsonb,
    ip_address character varying(45),
    user_agent text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.marketing_campaign_events OWNER TO postgres;

--
-- Name: marketing_campaigns; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.marketing_campaigns (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    organization_id uuid,
    name character varying(255) NOT NULL,
    description text,
    type character varying(50) DEFAULT 'email'::character varying,
    subject character varying(500),
    content text,
    list_id uuid,
    status character varying(50) DEFAULT 'draft'::character varying,
    scheduled_at timestamp without time zone,
    sent_at timestamp without time zone,
    created_by uuid,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    campaign_type character varying(50) DEFAULT 'email'::character varying,
    channel character varying(50) DEFAULT 'email'::character varying,
    from_name character varying(255),
    from_email character varying(255),
    reply_to character varying(255),
    design jsonb,
    stats jsonb DEFAULT '{"sent": 0, "opened": 0, "bounced": 0, "clicked": 0, "delivered": 0, "unsubscribed": 0}'::jsonb
);


ALTER TABLE public.marketing_campaigns OWNER TO postgres;

--
-- Name: marketing_form_submissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.marketing_form_submissions (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    form_id uuid,
    contact_id uuid,
    data jsonb NOT NULL,
    ip_address character varying(45),
    user_agent text,
    submitted_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.marketing_form_submissions OWNER TO postgres;

--
-- Name: marketing_forms; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.marketing_forms (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    organization_id uuid,
    name character varying(255) NOT NULL,
    description text,
    fields jsonb DEFAULT '[]'::jsonb NOT NULL,
    list_id uuid,
    is_active boolean DEFAULT true,
    created_by uuid,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    redirect_url character varying(500),
    thank_you_message text,
    submission_count integer DEFAULT 0
);


ALTER TABLE public.marketing_forms OWNER TO postgres;

--
-- Name: marketing_list_members; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.marketing_list_members (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    list_id uuid,
    contact_id uuid,
    status character varying(50) DEFAULT 'subscribed'::character varying,
    subscribed_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    unsubscribed_at timestamp without time zone
);


ALTER TABLE public.marketing_list_members OWNER TO postgres;

--
-- Name: marketing_lists; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.marketing_lists (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    organization_id uuid,
    name character varying(255) NOT NULL,
    description text,
    type character varying(50) DEFAULT 'static'::character varying,
    member_count integer DEFAULT 0,
    created_by uuid,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    segment_rules jsonb
);


ALTER TABLE public.marketing_lists OWNER TO postgres;

--
-- Name: marketing_scoring_history; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.marketing_scoring_history (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    contact_id uuid,
    rule_id uuid,
    score_change integer NOT NULL,
    reason text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.marketing_scoring_history OWNER TO postgres;

--
-- Name: marketing_scoring_rules; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.marketing_scoring_rules (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    organization_id uuid,
    name character varying(255) NOT NULL,
    rule_type character varying(50) NOT NULL,
    conditions jsonb NOT NULL,
    score_value integer NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.marketing_scoring_rules OWNER TO postgres;

--
-- Name: marketing_segments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.marketing_segments (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    organization_id uuid,
    name character varying(255) NOT NULL,
    description text,
    rules jsonb NOT NULL,
    contact_count integer DEFAULT 0,
    created_by uuid,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.marketing_segments OWNER TO postgres;

--
-- Name: marketing_sequence_enrollments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.marketing_sequence_enrollments (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    sequence_id uuid,
    contact_id uuid,
    current_step integer DEFAULT 0,
    status character varying(50) DEFAULT 'active'::character varying,
    enrolled_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    completed_at timestamp without time zone
);


ALTER TABLE public.marketing_sequence_enrollments OWNER TO postgres;

--
-- Name: marketing_sequence_steps; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.marketing_sequence_steps (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    sequence_id uuid,
    step_order integer NOT NULL,
    name character varying(255) NOT NULL,
    delay_days integer DEFAULT 0,
    delay_hours integer DEFAULT 0,
    email_subject character varying(500),
    email_content text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.marketing_sequence_steps OWNER TO postgres;

--
-- Name: marketing_sequences; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.marketing_sequences (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    organization_id uuid,
    name character varying(255) NOT NULL,
    description text,
    trigger_type character varying(50) DEFAULT 'manual'::character varying,
    is_active boolean DEFAULT true,
    created_by uuid,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    enrollment_count integer DEFAULT 0
);


ALTER TABLE public.marketing_sequences OWNER TO postgres;

--
-- Name: marketing_templates; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.marketing_templates (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    organization_id uuid,
    name character varying(255) NOT NULL,
    description text,
    category character varying(100),
    subject character varying(500),
    content text,
    design jsonb,
    thumbnail_url character varying(500),
    is_public boolean DEFAULT false,
    usage_count integer DEFAULT 0,
    created_by uuid,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.marketing_templates OWNER TO postgres;

--
-- Name: marketing_webhook_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.marketing_webhook_logs (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    webhook_id uuid,
    event_type character varying(50) NOT NULL,
    payload jsonb NOT NULL,
    response_status integer,
    response_body text,
    attempt_count integer DEFAULT 1,
    success boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.marketing_webhook_logs OWNER TO postgres;

--
-- Name: marketing_webhook_queue; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.marketing_webhook_queue (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    webhook_id uuid,
    event_type character varying(50) NOT NULL,
    payload jsonb NOT NULL,
    attempts integer DEFAULT 0,
    next_retry_at timestamp without time zone,
    status character varying(50) DEFAULT 'pending'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.marketing_webhook_queue OWNER TO postgres;

--
-- Name: marketing_webhooks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.marketing_webhooks (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    organization_id uuid,
    name character varying(255) NOT NULL,
    url character varying(500) NOT NULL,
    events text[] NOT NULL,
    secret_key character varying(255),
    is_active boolean DEFAULT true,
    retry_count integer DEFAULT 3,
    created_by uuid,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.marketing_webhooks OWNER TO postgres;

--
-- Name: notification_templates; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notification_templates (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    organization_id uuid,
    name character varying(255) NOT NULL,
    type character varying(50) NOT NULL,
    subject character varying(500),
    body text,
    variables jsonb DEFAULT '[]'::jsonb,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.notification_templates OWNER TO postgres;

--
-- Name: notifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notifications (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    organization_id uuid,
    user_id uuid,
    type character varying(50) NOT NULL,
    title character varying(255) NOT NULL,
    message text,
    link character varying(500),
    is_read boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.notifications OWNER TO postgres;

--
-- Name: organizations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.organizations (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying(255) NOT NULL,
    domain character varying(255),
    settings jsonb DEFAULT '{}'::jsonb,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.organizations OWNER TO postgres;

--
-- Name: payroll; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payroll (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    organization_id uuid,
    employee_id uuid,
    period_start date NOT NULL,
    period_end date NOT NULL,
    basic_salary numeric(15,2) NOT NULL,
    allowances jsonb DEFAULT '{}'::jsonb,
    deductions jsonb DEFAULT '{}'::jsonb,
    gross_salary numeric(15,2) NOT NULL,
    net_salary numeric(15,2) NOT NULL,
    tax_amount numeric(15,2) DEFAULT 0,
    status character varying(50) DEFAULT 'draft'::character varying,
    paid_at timestamp without time zone,
    payment_method character varying(50),
    notes text,
    created_by uuid,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.payroll OWNER TO postgres;

--
-- Name: permissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.permissions (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying(100) NOT NULL,
    resource character varying(100) NOT NULL,
    action character varying(50) NOT NULL,
    description text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.permissions OWNER TO postgres;

--
-- Name: products; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.products (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    organization_id uuid,
    name character varying(255) NOT NULL,
    sku character varying(100),
    description text,
    category character varying(100),
    unit character varying(50) DEFAULT 'piece'::character varying,
    price numeric(15,2) DEFAULT 0,
    cost numeric(15,2) DEFAULT 0,
    tax_rate numeric(5,2) DEFAULT 0,
    barcode character varying(100),
    image_url character varying(500),
    is_active boolean DEFAULT true,
    min_stock_level integer DEFAULT 0,
    reorder_point integer,
    created_by uuid,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    max_stock_level integer
);


ALTER TABLE public.products OWNER TO postgres;

--
-- Name: project_documents; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.project_documents (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    project_id uuid,
    name character varying(255) NOT NULL,
    file_url character varying(500) NOT NULL,
    file_size integer,
    file_type character varying(100),
    uploaded_by uuid,
    uploaded_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.project_documents OWNER TO postgres;

--
-- Name: project_milestones; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.project_milestones (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    project_id uuid,
    name character varying(255) NOT NULL,
    description text,
    due_date date NOT NULL,
    status character varying(50) DEFAULT 'pending'::character varying,
    completed_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.project_milestones OWNER TO postgres;

--
-- Name: project_risks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.project_risks (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    project_id uuid,
    title character varying(255) NOT NULL,
    description text,
    probability character varying(50) DEFAULT 'medium'::character varying,
    impact character varying(50) DEFAULT 'medium'::character varying,
    mitigation_plan text,
    status character varying(50) DEFAULT 'identified'::character varying,
    owner_id uuid,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.project_risks OWNER TO postgres;

--
-- Name: project_tasks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.project_tasks (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    organization_id uuid,
    project_id uuid,
    title character varying(255) NOT NULL,
    description text,
    assigned_to uuid,
    status character varying(50) DEFAULT 'todo'::character varying,
    priority character varying(50) DEFAULT 'medium'::character varying,
    start_date date,
    due_date date,
    estimated_hours numeric(8,2),
    actual_hours numeric(8,2),
    progress integer DEFAULT 0,
    parent_task_id uuid,
    created_by uuid,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.project_tasks OWNER TO postgres;

--
-- Name: project_time_entries; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.project_time_entries (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    organization_id uuid,
    project_id uuid,
    task_id uuid,
    user_id uuid,
    description text,
    hours numeric(8,2) NOT NULL,
    date date NOT NULL,
    billable boolean DEFAULT true,
    hourly_rate numeric(10,2),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.project_time_entries OWNER TO postgres;

--
-- Name: projects; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.projects (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    organization_id uuid,
    name character varying(255) NOT NULL,
    description text,
    client_id uuid,
    start_date date,
    end_date date,
    budget numeric(15,2),
    currency character varying(10) DEFAULT 'USD'::character varying,
    status character varying(50) DEFAULT 'planning'::character varying,
    priority character varying(50) DEFAULT 'medium'::character varying,
    progress integer DEFAULT 0,
    manager_id uuid,
    created_by uuid,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.projects OWNER TO postgres;

--
-- Name: purchase_order_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.purchase_order_items (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    purchase_order_id uuid,
    product_id uuid,
    quantity integer NOT NULL,
    unit_price numeric(15,2) NOT NULL,
    tax_rate numeric(5,2) DEFAULT 0,
    total_price numeric(15,2) NOT NULL,
    received_quantity integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.purchase_order_items OWNER TO postgres;

--
-- Name: purchase_orders; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.purchase_orders (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    organization_id uuid,
    po_number character varying(100) NOT NULL,
    vendor_id uuid,
    warehouse_id uuid,
    order_date date NOT NULL,
    expected_delivery_date date,
    status character varying(50) DEFAULT 'draft'::character varying,
    subtotal numeric(15,2) DEFAULT 0,
    tax_amount numeric(15,2) DEFAULT 0,
    total_amount numeric(15,2) DEFAULT 0,
    notes text,
    created_by uuid,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.purchase_orders OWNER TO postgres;

--
-- Name: roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.roles (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    organization_id uuid,
    name character varying(100) NOT NULL,
    description text,
    permissions jsonb DEFAULT '[]'::jsonb,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.roles OWNER TO postgres;

--
-- Name: signing_parties; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.signing_parties (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    organization_id uuid,
    name character varying(255) NOT NULL,
    email character varying(255),
    phone character varying(50),
    role character varying(100),
    company character varying(255),
    status character varying(50) DEFAULT 'pending'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.signing_parties OWNER TO postgres;

--
-- Name: stock; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.stock (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    organization_id uuid,
    product_id uuid,
    warehouse_id uuid,
    quantity integer DEFAULT 0,
    reserved_quantity integer DEFAULT 0,
    available_quantity integer DEFAULT 0,
    last_updated timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.stock OWNER TO postgres;

--
-- Name: stock_movements; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.stock_movements (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    organization_id uuid,
    product_id uuid,
    warehouse_id uuid,
    movement_type character varying(50) NOT NULL,
    quantity integer NOT NULL,
    reference_type character varying(50),
    reference_id uuid,
    notes text,
    created_by uuid,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.stock_movements OWNER TO postgres;

--
-- Name: user_roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_roles (
    user_id uuid NOT NULL,
    role_id uuid NOT NULL,
    id uuid DEFAULT public.uuid_generate_v4(),
    role character varying(50) DEFAULT 'user'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.user_roles OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    organization_id uuid,
    email character varying(255) NOT NULL,
    password_hash character varying(255) NOT NULL,
    full_name character varying(255) NOT NULL,
    role character varying(50) DEFAULT 'user'::character varying,
    is_active boolean DEFAULT true,
    last_login timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    avatar_url character varying(500),
    phone character varying(50),
    "position" character varying(100)
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: vendors; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.vendors (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    organization_id uuid,
    name character varying(255) NOT NULL,
    contact_person character varying(255),
    email character varying(255),
    phone character varying(50),
    address text,
    city character varying(100),
    country character varying(100),
    payment_terms character varying(100),
    tax_id character varying(100),
    status character varying(50) DEFAULT 'active'::character varying,
    notes text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    business_type character varying(100)
);


ALTER TABLE public.vendors OWNER TO postgres;

--
-- Name: warehouses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.warehouses (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    organization_id uuid,
    name character varying(255) NOT NULL,
    code character varying(50),
    address text,
    city character varying(100),
    state character varying(100),
    country character varying(100),
    postal_code character varying(20),
    manager_id uuid,
    capacity integer,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.warehouses OWNER TO postgres;

--
-- Name: workflow_actions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.workflow_actions (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    workflow_id uuid,
    action_order integer NOT NULL,
    action_type character varying(100) NOT NULL,
    action_config jsonb DEFAULT '{}'::jsonb,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.workflow_actions OWNER TO postgres;

--
-- Name: workflow_executions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.workflow_executions (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    workflow_id uuid,
    status character varying(50) DEFAULT 'running'::character varying,
    trigger_data jsonb,
    result jsonb,
    error_message text,
    started_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    completed_at timestamp without time zone
);


ALTER TABLE public.workflow_executions OWNER TO postgres;

--
-- Name: workflows; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.workflows (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    organization_id uuid,
    name character varying(255) NOT NULL,
    description text,
    trigger_type character varying(100) NOT NULL,
    trigger_config jsonb DEFAULT '{}'::jsonb,
    is_active boolean DEFAULT true,
    execution_count integer DEFAULT 0,
    last_executed_at timestamp without time zone,
    created_by uuid,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.workflows OWNER TO postgres;

--
-- Name: workgroup_files; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.workgroup_files (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    workgroup_id uuid,
    name character varying(255) NOT NULL,
    file_url character varying(500) NOT NULL,
    file_size integer,
    file_type character varying(100),
    folder_path character varying(500) DEFAULT '/'::character varying,
    uploaded_by uuid,
    uploaded_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.workgroup_files OWNER TO postgres;

--
-- Name: workgroup_members; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.workgroup_members (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    workgroup_id uuid,
    user_id uuid,
    role character varying(50) DEFAULT 'member'::character varying,
    joined_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.workgroup_members OWNER TO postgres;

--
-- Name: workgroup_notifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.workgroup_notifications (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    workgroup_id uuid,
    user_id uuid,
    type character varying(50) NOT NULL,
    title character varying(255) NOT NULL,
    message text,
    is_read boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.workgroup_notifications OWNER TO postgres;

--
-- Name: workgroup_wiki; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.workgroup_wiki (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    workgroup_id uuid,
    title character varying(255) NOT NULL,
    content text,
    parent_id uuid,
    created_by uuid,
    updated_by uuid,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.workgroup_wiki OWNER TO postgres;

--
-- Name: workgroups; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.workgroups (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    organization_id uuid,
    name character varying(255) NOT NULL,
    description text,
    type character varying(50) DEFAULT 'team'::character varying,
    privacy character varying(50) DEFAULT 'private'::character varying,
    avatar_url character varying(500),
    created_by uuid,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.workgroups OWNER TO postgres;

--
-- Data for Name: activities; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.activities (id, organization_id, type, subject, description, contact_id, deal_id, company_id, assigned_to, due_date, completed, completed_at, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: attendance; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.attendance (id, organization_id, employee_id, date, check_in, check_out, status, hours_worked, notes, created_at, updated_at, org_id, total_hours) FROM stdin;
\.


--
-- Data for Name: calendar_event_attendees; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.calendar_event_attendees (id, event_id, user_id, status) FROM stdin;
\.


--
-- Data for Name: calendar_events; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.calendar_events (id, organization_id, title, description, start_time, end_time, location, event_type, is_all_day, recurrence_rule, reminder_minutes, created_by, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: call_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.call_logs (id, organization_id, contact_id, user_id, call_type, direction, phone_number, duration, status, recording_url, notes, created_at) FROM stdin;
\.


--
-- Data for Name: companies; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.companies (id, organization_id, name, industry, website, phone, email, address, city, state, country, postal_code, employee_count, annual_revenue, description, logo_url, status, created_by, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: contacts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.contacts (id, organization_id, first_name, last_name, email, phone, company, job_title, address, city, state, country, postal_code, website, source, status, tags, notes, last_contacted, created_by, created_at, updated_at, company_name, linkedin_url, twitter_url, score) FROM stdin;
\.


--
-- Data for Name: customers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.customers (id, organization_id, contact_id, company_id, customer_type, status, lifetime_value, total_purchases, first_purchase_date, last_purchase_date, notes, created_at, updated_at, industry) FROM stdin;
\.


--
-- Data for Name: deals; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.deals (id, organization_id, title, description, value, currency, stage, probability, expected_close_date, contact_id, company_id, assigned_to, status, notes, created_at, updated_at, closed_at, source, campaign_id, utm_source, utm_medium, utm_campaign, org_id) FROM stdin;
\.


--
-- Data for Name: drive_files; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.drive_files (id, organization_id, name, file_url, file_size, file_type, folder_path, is_public, shared_with, uploaded_by, uploaded_at, updated_at) FROM stdin;
\.


--
-- Data for Name: emails; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.emails (id, organization_id, user_id, from_email, to_email, cc_email, bcc_email, subject, body, html_body, is_read, is_starred, folder, thread_id, message_id, in_reply_to, attachments, received_at, created_at) FROM stdin;
\.


--
-- Data for Name: employee_documents; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.employee_documents (id, employee_id, document_type, document_name, file_url, file_size, uploaded_by, uploaded_at) FROM stdin;
\.


--
-- Data for Name: employees; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.employees (id, organization_id, user_id, employee_code, first_name, last_name, email, phone, date_of_birth, gender, address, city, state, country, postal_code, department, "position", employment_type, join_date, termination_date, salary, currency, bank_account, tax_id, emergency_contact_name, emergency_contact_phone, status, profile_picture_url, notes, created_at, updated_at, manager_id, employee_id, org_id, name) FROM stdin;
\.


--
-- Data for Name: hrms_notifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.hrms_notifications (id, organization_id, employee_id, type, title, message, is_read, created_at) FROM stdin;
\.


--
-- Data for Name: invoice_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.invoice_items (id, invoice_id, product_id, description, quantity, unit_price, tax_rate, discount_percent, total_price, created_at) FROM stdin;
\.


--
-- Data for Name: invoices; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.invoices (id, organization_id, invoice_number, customer_id, contact_id, invoice_date, due_date, status, subtotal, tax_amount, discount_amount, total_amount, paid_amount, balance_due, currency, notes, terms, created_by, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: lead_external_sources; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.lead_external_sources (id, organization_id, name, source_type, api_key, webhook_url, config, is_active, created_at) FROM stdin;
\.


--
-- Data for Name: lead_workspaces; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.lead_workspaces (id, organization_id, name, description, created_by, created_at) FROM stdin;
\.


--
-- Data for Name: leads; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.leads (id, organization_id, first_name, last_name, email, phone, company, job_title, source, status, score, notes, assigned_to, converted_to_deal, created_at, updated_at, workspace_id, deal_id, campaign_id, utm_source, utm_medium, utm_campaign, contact_id, org_id) FROM stdin;
\.


--
-- Data for Name: leave_balances; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.leave_balances (id, employee_id, leave_type_id, year, total_days, used_days, remaining_days) FROM stdin;
\.


--
-- Data for Name: leave_requests; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.leave_requests (id, organization_id, employee_id, leave_type_id, start_date, end_date, days_requested, reason, status, approved_by, approved_at, rejection_reason, created_at, updated_at, org_id) FROM stdin;
\.


--
-- Data for Name: leave_types; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.leave_types (id, organization_id, name, description, days_per_year, is_paid, requires_approval, color, created_at, org_id) FROM stdin;
4d9bf89b-61b5-4f83-83da-1079ef36c846	00000000-0000-0000-0000-000000000001	Annual Leave	Paid annual vacation leave	20	t	t	#3b82f6	2026-04-02 19:34:14.257612	\N
c8aa8ecf-977e-4bd6-9e1c-252a0bf3bf69	00000000-0000-0000-0000-000000000001	Sick Leave	Paid sick leave	10	t	t	#ef4444	2026-04-02 19:34:14.257612	\N
54a3db61-a5b1-481a-9860-c11d0a168a53	00000000-0000-0000-0000-000000000001	Casual Leave	Short notice casual leave	5	t	t	#10b981	2026-04-02 19:34:14.257612	\N
ab7631e4-1c9d-49f3-a32a-d728fc3b5ea4	00000000-0000-0000-0000-000000000001	Unpaid Leave	Leave without pay	0	f	t	#6b7280	2026-04-02 19:34:14.257612	\N
7dbba5e6-44e5-4777-a415-963ecf68f759	00000000-0000-0000-0000-000000000001	Annual Leave	Paid annual vacation leave	20	t	t	#3b82f6	2026-04-02 19:41:14.329078	\N
0d5df5e3-aefe-40e5-bcdf-d253515ffe1e	00000000-0000-0000-0000-000000000001	Sick Leave	Paid sick leave	10	t	t	#ef4444	2026-04-02 19:41:14.329078	\N
f6f12a43-54b9-460d-9c77-22620b4a680c	00000000-0000-0000-0000-000000000001	Casual Leave	Short notice casual leave	5	t	t	#10b981	2026-04-02 19:41:14.329078	\N
8629f1b8-6f3d-4996-b1cf-4beca951c01b	00000000-0000-0000-0000-000000000001	Unpaid Leave	Leave without pay	0	f	t	#6b7280	2026-04-02 19:41:14.329078	\N
3bcbce76-e3f4-49bc-8a27-8bb4ef12fa2f	00000000-0000-0000-0000-000000000001	Annual Leave	Paid annual vacation leave	20	t	t	#3b82f6	2026-04-02 19:41:55.361585	\N
da898714-efe4-42a0-809b-8e57575e9a15	00000000-0000-0000-0000-000000000001	Sick Leave	Paid sick leave	10	t	t	#ef4444	2026-04-02 19:41:55.361585	\N
80d321b7-5a21-41b1-bdde-341d42a785fe	00000000-0000-0000-0000-000000000001	Casual Leave	Short notice casual leave	5	t	t	#10b981	2026-04-02 19:41:55.361585	\N
c83428bb-fa15-476c-ae22-3694240e7a38	00000000-0000-0000-0000-000000000001	Unpaid Leave	Leave without pay	0	f	t	#6b7280	2026-04-02 19:41:55.361585	\N
78c7beef-e020-4c95-b4ca-86778ffc9ba4	00000000-0000-0000-0000-000000000001	Annual Leave	Paid annual vacation leave	20	t	t	#3b82f6	2026-04-02 19:43:58.522304	\N
ed7999f0-8aa4-4997-aa81-cf6301738f03	00000000-0000-0000-0000-000000000001	Sick Leave	Paid sick leave	10	t	t	#ef4444	2026-04-02 19:43:58.522304	\N
a49680f8-4a33-4f00-8a71-3afac19b6d04	00000000-0000-0000-0000-000000000001	Casual Leave	Short notice casual leave	5	t	t	#10b981	2026-04-02 19:43:58.522304	\N
e6131835-0eaf-4e55-be1c-f9d0f1e78121	00000000-0000-0000-0000-000000000001	Unpaid Leave	Leave without pay	0	f	t	#6b7280	2026-04-02 19:43:58.522304	\N
dbfe6eb5-3300-4120-899e-68c0fe1e8f3b	00000000-0000-0000-0000-000000000001	Annual Leave	Paid annual vacation leave	20	t	t	#3b82f6	2026-04-02 19:47:04.229075	\N
ae2f3210-b8ae-42aa-8780-5d1fe531e514	00000000-0000-0000-0000-000000000001	Sick Leave	Paid sick leave	10	t	t	#ef4444	2026-04-02 19:47:04.229075	\N
b2d499e3-86a5-4cd1-a386-fc86a3e96abd	00000000-0000-0000-0000-000000000001	Casual Leave	Short notice casual leave	5	t	t	#10b981	2026-04-02 19:47:04.229075	\N
70e3acd5-2cee-484e-bfec-6b2c968819f2	00000000-0000-0000-0000-000000000001	Unpaid Leave	Leave without pay	0	f	t	#6b7280	2026-04-02 19:47:04.229075	\N
\.


--
-- Data for Name: marketing_ab_test_results; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.marketing_ab_test_results (id, test_id, variant_id, contact_id, opened, clicked, converted, created_at) FROM stdin;
\.


--
-- Data for Name: marketing_ab_test_variants; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.marketing_ab_test_variants (id, test_id, variant_name, subject, content, design, sent_count, opened_count, clicked_count, conversion_count, created_at) FROM stdin;
\.


--
-- Data for Name: marketing_ab_tests; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.marketing_ab_tests (id, organization_id, name, description, test_type, status, winner_criteria, sample_size_percent, started_at, ended_at, winner_variant_id, created_by, created_at) FROM stdin;
\.


--
-- Data for Name: marketing_campaign_events; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.marketing_campaign_events (id, campaign_id, contact_id, event_type, event_data, ip_address, user_agent, created_at) FROM stdin;
\.


--
-- Data for Name: marketing_campaigns; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.marketing_campaigns (id, organization_id, name, description, type, subject, content, list_id, status, scheduled_at, sent_at, created_by, created_at, updated_at, campaign_type, channel, from_name, from_email, reply_to, design, stats) FROM stdin;
\.


--
-- Data for Name: marketing_form_submissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.marketing_form_submissions (id, form_id, contact_id, data, ip_address, user_agent, submitted_at) FROM stdin;
\.


--
-- Data for Name: marketing_forms; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.marketing_forms (id, organization_id, name, description, fields, list_id, is_active, created_by, created_at, updated_at, redirect_url, thank_you_message, submission_count) FROM stdin;
\.


--
-- Data for Name: marketing_list_members; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.marketing_list_members (id, list_id, contact_id, status, subscribed_at, unsubscribed_at) FROM stdin;
\.


--
-- Data for Name: marketing_lists; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.marketing_lists (id, organization_id, name, description, type, member_count, created_by, created_at, updated_at, segment_rules) FROM stdin;
\.


--
-- Data for Name: marketing_scoring_history; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.marketing_scoring_history (id, contact_id, rule_id, score_change, reason, created_at) FROM stdin;
\.


--
-- Data for Name: marketing_scoring_rules; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.marketing_scoring_rules (id, organization_id, name, rule_type, conditions, score_value, is_active, created_at) FROM stdin;
\.


--
-- Data for Name: marketing_segments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.marketing_segments (id, organization_id, name, description, rules, contact_count, created_by, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: marketing_sequence_enrollments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.marketing_sequence_enrollments (id, sequence_id, contact_id, current_step, status, enrolled_at, completed_at) FROM stdin;
\.


--
-- Data for Name: marketing_sequence_steps; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.marketing_sequence_steps (id, sequence_id, step_order, name, delay_days, delay_hours, email_subject, email_content, created_at) FROM stdin;
\.


--
-- Data for Name: marketing_sequences; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.marketing_sequences (id, organization_id, name, description, trigger_type, is_active, created_by, created_at, updated_at, enrollment_count) FROM stdin;
\.


--
-- Data for Name: marketing_templates; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.marketing_templates (id, organization_id, name, description, category, subject, content, design, thumbnail_url, is_public, usage_count, created_by, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: marketing_webhook_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.marketing_webhook_logs (id, webhook_id, event_type, payload, response_status, response_body, attempt_count, success, created_at) FROM stdin;
\.


--
-- Data for Name: marketing_webhook_queue; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.marketing_webhook_queue (id, webhook_id, event_type, payload, attempts, next_retry_at, status, created_at) FROM stdin;
\.


--
-- Data for Name: marketing_webhooks; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.marketing_webhooks (id, organization_id, name, url, events, secret_key, is_active, retry_count, created_by, created_at) FROM stdin;
\.


--
-- Data for Name: notification_templates; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notification_templates (id, organization_id, name, type, subject, body, variables, is_active, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notifications (id, organization_id, user_id, type, title, message, link, is_read, created_at) FROM stdin;
\.


--
-- Data for Name: organizations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.organizations (id, name, domain, settings, created_at, updated_at) FROM stdin;
00000000-0000-0000-0000-000000000001	Default Organization	default.local	{}	2026-04-02 19:34:14.257612	2026-04-02 19:34:14.257612
e4c67702-5754-40bf-abd6-9ef41767ca01	Jawad Abbas's Organization	\N	{}	2026-04-02 19:40:26.606447	2026-04-02 19:40:26.606447
\.


--
-- Data for Name: payroll; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.payroll (id, organization_id, employee_id, period_start, period_end, basic_salary, allowances, deductions, gross_salary, net_salary, tax_amount, status, paid_at, payment_method, notes, created_by, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: permissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.permissions (id, name, resource, action, description, created_at) FROM stdin;
\.


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.products (id, organization_id, name, sku, description, category, unit, price, cost, tax_rate, barcode, image_url, is_active, min_stock_level, reorder_point, created_by, created_at, updated_at, max_stock_level) FROM stdin;
\.


--
-- Data for Name: project_documents; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.project_documents (id, project_id, name, file_url, file_size, file_type, uploaded_by, uploaded_at) FROM stdin;
\.


--
-- Data for Name: project_milestones; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.project_milestones (id, project_id, name, description, due_date, status, completed_at, created_at) FROM stdin;
\.


--
-- Data for Name: project_risks; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.project_risks (id, project_id, title, description, probability, impact, mitigation_plan, status, owner_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: project_tasks; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.project_tasks (id, organization_id, project_id, title, description, assigned_to, status, priority, start_date, due_date, estimated_hours, actual_hours, progress, parent_task_id, created_by, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: project_time_entries; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.project_time_entries (id, organization_id, project_id, task_id, user_id, description, hours, date, billable, hourly_rate, created_at) FROM stdin;
\.


--
-- Data for Name: projects; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.projects (id, organization_id, name, description, client_id, start_date, end_date, budget, currency, status, priority, progress, manager_id, created_by, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: purchase_order_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.purchase_order_items (id, purchase_order_id, product_id, quantity, unit_price, tax_rate, total_price, received_quantity, created_at) FROM stdin;
\.


--
-- Data for Name: purchase_orders; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.purchase_orders (id, organization_id, po_number, vendor_id, warehouse_id, order_date, expected_delivery_date, status, subtotal, tax_amount, total_amount, notes, created_by, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.roles (id, organization_id, name, description, permissions, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: signing_parties; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.signing_parties (id, organization_id, name, email, phone, role, company, status, created_at) FROM stdin;
\.


--
-- Data for Name: stock; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.stock (id, organization_id, product_id, warehouse_id, quantity, reserved_quantity, available_quantity, last_updated) FROM stdin;
\.


--
-- Data for Name: stock_movements; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.stock_movements (id, organization_id, product_id, warehouse_id, movement_type, quantity, reference_type, reference_id, notes, created_by, created_at) FROM stdin;
\.


--
-- Data for Name: user_roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_roles (user_id, role_id, id, role, created_at) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, organization_id, email, password_hash, full_name, role, is_active, last_login, created_at, updated_at, avatar_url, phone, "position") FROM stdin;
00000000-0000-0000-0000-000000000002	00000000-0000-0000-0000-000000000001	admin@crm.local	$2a$10$rZ5qH8qF8qF8qF8qF8qF8.qF8qF8qF8qF8qF8qF8qF8qF8qF8qF8q	System Administrator	admin	t	\N	2026-04-02 19:34:14.257612	2026-04-02 19:34:14.257612	\N	\N	\N
344be656-9ca2-4368-aa63-981136c134b0	e4c67702-5754-40bf-abd6-9ef41767ca01	jawadabbas202020@gmail.com	$2a$10$Vgt8wvABNaTH5G7nOyC68eUxvue7X0zRdSah9aYaQCoF26OpOvgMi	Jawad Abbas	user	t	\N	2026-04-02 19:40:26.606447	2026-04-02 19:40:26.606447	\N	\N	\N
\.


--
-- Data for Name: vendors; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.vendors (id, organization_id, name, contact_person, email, phone, address, city, country, payment_terms, tax_id, status, notes, created_at, updated_at, business_type) FROM stdin;
\.


--
-- Data for Name: warehouses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.warehouses (id, organization_id, name, code, address, city, state, country, postal_code, manager_id, capacity, is_active, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: workflow_actions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.workflow_actions (id, workflow_id, action_order, action_type, action_config, created_at) FROM stdin;
\.


--
-- Data for Name: workflow_executions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.workflow_executions (id, workflow_id, status, trigger_data, result, error_message, started_at, completed_at) FROM stdin;
\.


--
-- Data for Name: workflows; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.workflows (id, organization_id, name, description, trigger_type, trigger_config, is_active, execution_count, last_executed_at, created_by, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: workgroup_files; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.workgroup_files (id, workgroup_id, name, file_url, file_size, file_type, folder_path, uploaded_by, uploaded_at) FROM stdin;
\.


--
-- Data for Name: workgroup_members; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.workgroup_members (id, workgroup_id, user_id, role, joined_at) FROM stdin;
\.


--
-- Data for Name: workgroup_notifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.workgroup_notifications (id, workgroup_id, user_id, type, title, message, is_read, created_at) FROM stdin;
\.


--
-- Data for Name: workgroup_wiki; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.workgroup_wiki (id, workgroup_id, title, content, parent_id, created_by, updated_by, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: workgroups; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.workgroups (id, organization_id, name, description, type, privacy, avatar_url, created_by, created_at, updated_at) FROM stdin;
\.


--
-- Name: activities activities_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.activities
    ADD CONSTRAINT activities_pkey PRIMARY KEY (id);


--
-- Name: attendance attendance_employee_id_date_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attendance
    ADD CONSTRAINT attendance_employee_id_date_key UNIQUE (employee_id, date);


--
-- Name: attendance attendance_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attendance
    ADD CONSTRAINT attendance_pkey PRIMARY KEY (id);


--
-- Name: calendar_event_attendees calendar_event_attendees_event_id_user_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.calendar_event_attendees
    ADD CONSTRAINT calendar_event_attendees_event_id_user_id_key UNIQUE (event_id, user_id);


--
-- Name: calendar_event_attendees calendar_event_attendees_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.calendar_event_attendees
    ADD CONSTRAINT calendar_event_attendees_pkey PRIMARY KEY (id);


--
-- Name: calendar_events calendar_events_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.calendar_events
    ADD CONSTRAINT calendar_events_pkey PRIMARY KEY (id);


--
-- Name: call_logs call_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.call_logs
    ADD CONSTRAINT call_logs_pkey PRIMARY KEY (id);


--
-- Name: companies companies_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.companies
    ADD CONSTRAINT companies_pkey PRIMARY KEY (id);


--
-- Name: contacts contacts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contacts
    ADD CONSTRAINT contacts_pkey PRIMARY KEY (id);


--
-- Name: customers customers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_pkey PRIMARY KEY (id);


--
-- Name: deals deals_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.deals
    ADD CONSTRAINT deals_pkey PRIMARY KEY (id);


--
-- Name: drive_files drive_files_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.drive_files
    ADD CONSTRAINT drive_files_pkey PRIMARY KEY (id);


--
-- Name: emails emails_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.emails
    ADD CONSTRAINT emails_pkey PRIMARY KEY (id);


--
-- Name: employee_documents employee_documents_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employee_documents
    ADD CONSTRAINT employee_documents_pkey PRIMARY KEY (id);


--
-- Name: employees employees_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_email_key UNIQUE (email);


--
-- Name: employees employees_employee_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_employee_code_key UNIQUE (employee_code);


--
-- Name: employees employees_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_pkey PRIMARY KEY (id);


--
-- Name: hrms_notifications hrms_notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hrms_notifications
    ADD CONSTRAINT hrms_notifications_pkey PRIMARY KEY (id);


--
-- Name: invoice_items invoice_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoice_items
    ADD CONSTRAINT invoice_items_pkey PRIMARY KEY (id);


--
-- Name: invoices invoices_invoice_number_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_invoice_number_key UNIQUE (invoice_number);


--
-- Name: invoices invoices_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_pkey PRIMARY KEY (id);


--
-- Name: lead_external_sources lead_external_sources_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lead_external_sources
    ADD CONSTRAINT lead_external_sources_pkey PRIMARY KEY (id);


--
-- Name: lead_workspaces lead_workspaces_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lead_workspaces
    ADD CONSTRAINT lead_workspaces_pkey PRIMARY KEY (id);


--
-- Name: leads leads_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.leads
    ADD CONSTRAINT leads_pkey PRIMARY KEY (id);


--
-- Name: leave_balances leave_balances_employee_id_leave_type_id_year_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.leave_balances
    ADD CONSTRAINT leave_balances_employee_id_leave_type_id_year_key UNIQUE (employee_id, leave_type_id, year);


--
-- Name: leave_balances leave_balances_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.leave_balances
    ADD CONSTRAINT leave_balances_pkey PRIMARY KEY (id);


--
-- Name: leave_requests leave_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.leave_requests
    ADD CONSTRAINT leave_requests_pkey PRIMARY KEY (id);


--
-- Name: leave_types leave_types_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.leave_types
    ADD CONSTRAINT leave_types_pkey PRIMARY KEY (id);


--
-- Name: marketing_ab_test_results marketing_ab_test_results_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.marketing_ab_test_results
    ADD CONSTRAINT marketing_ab_test_results_pkey PRIMARY KEY (id);


--
-- Name: marketing_ab_test_variants marketing_ab_test_variants_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.marketing_ab_test_variants
    ADD CONSTRAINT marketing_ab_test_variants_pkey PRIMARY KEY (id);


--
-- Name: marketing_ab_tests marketing_ab_tests_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.marketing_ab_tests
    ADD CONSTRAINT marketing_ab_tests_pkey PRIMARY KEY (id);


--
-- Name: marketing_campaign_events marketing_campaign_events_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.marketing_campaign_events
    ADD CONSTRAINT marketing_campaign_events_pkey PRIMARY KEY (id);


--
-- Name: marketing_campaigns marketing_campaigns_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.marketing_campaigns
    ADD CONSTRAINT marketing_campaigns_pkey PRIMARY KEY (id);


--
-- Name: marketing_form_submissions marketing_form_submissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.marketing_form_submissions
    ADD CONSTRAINT marketing_form_submissions_pkey PRIMARY KEY (id);


--
-- Name: marketing_forms marketing_forms_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.marketing_forms
    ADD CONSTRAINT marketing_forms_pkey PRIMARY KEY (id);


--
-- Name: marketing_list_members marketing_list_members_list_id_contact_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.marketing_list_members
    ADD CONSTRAINT marketing_list_members_list_id_contact_id_key UNIQUE (list_id, contact_id);


--
-- Name: marketing_list_members marketing_list_members_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.marketing_list_members
    ADD CONSTRAINT marketing_list_members_pkey PRIMARY KEY (id);


--
-- Name: marketing_lists marketing_lists_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.marketing_lists
    ADD CONSTRAINT marketing_lists_pkey PRIMARY KEY (id);


--
-- Name: marketing_scoring_history marketing_scoring_history_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.marketing_scoring_history
    ADD CONSTRAINT marketing_scoring_history_pkey PRIMARY KEY (id);


--
-- Name: marketing_scoring_rules marketing_scoring_rules_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.marketing_scoring_rules
    ADD CONSTRAINT marketing_scoring_rules_pkey PRIMARY KEY (id);


--
-- Name: marketing_segments marketing_segments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.marketing_segments
    ADD CONSTRAINT marketing_segments_pkey PRIMARY KEY (id);


--
-- Name: marketing_sequence_enrollments marketing_sequence_enrollments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.marketing_sequence_enrollments
    ADD CONSTRAINT marketing_sequence_enrollments_pkey PRIMARY KEY (id);


--
-- Name: marketing_sequence_enrollments marketing_sequence_enrollments_sequence_id_contact_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.marketing_sequence_enrollments
    ADD CONSTRAINT marketing_sequence_enrollments_sequence_id_contact_id_key UNIQUE (sequence_id, contact_id);


--
-- Name: marketing_sequence_steps marketing_sequence_steps_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.marketing_sequence_steps
    ADD CONSTRAINT marketing_sequence_steps_pkey PRIMARY KEY (id);


--
-- Name: marketing_sequences marketing_sequences_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.marketing_sequences
    ADD CONSTRAINT marketing_sequences_pkey PRIMARY KEY (id);


--
-- Name: marketing_templates marketing_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.marketing_templates
    ADD CONSTRAINT marketing_templates_pkey PRIMARY KEY (id);


--
-- Name: marketing_webhook_logs marketing_webhook_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.marketing_webhook_logs
    ADD CONSTRAINT marketing_webhook_logs_pkey PRIMARY KEY (id);


--
-- Name: marketing_webhook_queue marketing_webhook_queue_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.marketing_webhook_queue
    ADD CONSTRAINT marketing_webhook_queue_pkey PRIMARY KEY (id);


--
-- Name: marketing_webhooks marketing_webhooks_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.marketing_webhooks
    ADD CONSTRAINT marketing_webhooks_pkey PRIMARY KEY (id);


--
-- Name: notification_templates notification_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notification_templates
    ADD CONSTRAINT notification_templates_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: organizations organizations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.organizations
    ADD CONSTRAINT organizations_pkey PRIMARY KEY (id);


--
-- Name: payroll payroll_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payroll
    ADD CONSTRAINT payroll_pkey PRIMARY KEY (id);


--
-- Name: permissions permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_pkey PRIMARY KEY (id);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: products products_sku_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_sku_key UNIQUE (sku);


--
-- Name: project_documents project_documents_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_documents
    ADD CONSTRAINT project_documents_pkey PRIMARY KEY (id);


--
-- Name: project_milestones project_milestones_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_milestones
    ADD CONSTRAINT project_milestones_pkey PRIMARY KEY (id);


--
-- Name: project_risks project_risks_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_risks
    ADD CONSTRAINT project_risks_pkey PRIMARY KEY (id);


--
-- Name: project_tasks project_tasks_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_tasks
    ADD CONSTRAINT project_tasks_pkey PRIMARY KEY (id);


--
-- Name: project_time_entries project_time_entries_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_time_entries
    ADD CONSTRAINT project_time_entries_pkey PRIMARY KEY (id);


--
-- Name: projects projects_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_pkey PRIMARY KEY (id);


--
-- Name: purchase_order_items purchase_order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_order_items
    ADD CONSTRAINT purchase_order_items_pkey PRIMARY KEY (id);


--
-- Name: purchase_orders purchase_orders_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_orders
    ADD CONSTRAINT purchase_orders_pkey PRIMARY KEY (id);


--
-- Name: purchase_orders purchase_orders_po_number_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_orders
    ADD CONSTRAINT purchase_orders_po_number_key UNIQUE (po_number);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- Name: signing_parties signing_parties_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.signing_parties
    ADD CONSTRAINT signing_parties_pkey PRIMARY KEY (id);


--
-- Name: stock_movements stock_movements_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_movements
    ADD CONSTRAINT stock_movements_pkey PRIMARY KEY (id);


--
-- Name: stock stock_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock
    ADD CONSTRAINT stock_pkey PRIMARY KEY (id);


--
-- Name: stock stock_product_id_warehouse_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock
    ADD CONSTRAINT stock_product_id_warehouse_id_key UNIQUE (product_id, warehouse_id);


--
-- Name: user_roles user_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (user_id, role_id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: vendors vendors_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vendors
    ADD CONSTRAINT vendors_pkey PRIMARY KEY (id);


--
-- Name: warehouses warehouses_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.warehouses
    ADD CONSTRAINT warehouses_code_key UNIQUE (code);


--
-- Name: warehouses warehouses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.warehouses
    ADD CONSTRAINT warehouses_pkey PRIMARY KEY (id);


--
-- Name: workflow_actions workflow_actions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.workflow_actions
    ADD CONSTRAINT workflow_actions_pkey PRIMARY KEY (id);


--
-- Name: workflow_executions workflow_executions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.workflow_executions
    ADD CONSTRAINT workflow_executions_pkey PRIMARY KEY (id);


--
-- Name: workflows workflows_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.workflows
    ADD CONSTRAINT workflows_pkey PRIMARY KEY (id);


--
-- Name: workgroup_files workgroup_files_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.workgroup_files
    ADD CONSTRAINT workgroup_files_pkey PRIMARY KEY (id);


--
-- Name: workgroup_members workgroup_members_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.workgroup_members
    ADD CONSTRAINT workgroup_members_pkey PRIMARY KEY (id);


--
-- Name: workgroup_members workgroup_members_workgroup_id_user_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.workgroup_members
    ADD CONSTRAINT workgroup_members_workgroup_id_user_id_key UNIQUE (workgroup_id, user_id);


--
-- Name: workgroup_notifications workgroup_notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.workgroup_notifications
    ADD CONSTRAINT workgroup_notifications_pkey PRIMARY KEY (id);


--
-- Name: workgroup_wiki workgroup_wiki_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.workgroup_wiki
    ADD CONSTRAINT workgroup_wiki_pkey PRIMARY KEY (id);


--
-- Name: workgroups workgroups_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.workgroups
    ADD CONSTRAINT workgroups_pkey PRIMARY KEY (id);


--
-- Name: idx_activities_contact; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_activities_contact ON public.activities USING btree (contact_id);


--
-- Name: idx_activities_organization; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_activities_organization ON public.activities USING btree (organization_id);


--
-- Name: idx_attendance_employee; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_attendance_employee ON public.attendance USING btree (employee_id);


--
-- Name: idx_companies_organization; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_companies_organization ON public.companies USING btree (organization_id);


--
-- Name: idx_contacts_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_contacts_email ON public.contacts USING btree (email);


--
-- Name: idx_contacts_organization; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_contacts_organization ON public.contacts USING btree (organization_id);


--
-- Name: idx_deals_contact; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_deals_contact ON public.deals USING btree (contact_id);


--
-- Name: idx_deals_organization; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_deals_organization ON public.deals USING btree (organization_id);


--
-- Name: idx_employees_organization; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_employees_organization ON public.employees USING btree (organization_id);


--
-- Name: idx_leads_organization; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_leads_organization ON public.leads USING btree (organization_id);


--
-- Name: idx_leads_workspace; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_leads_workspace ON public.leads USING btree (workspace_id);


--
-- Name: idx_marketing_campaigns_org; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_marketing_campaigns_org ON public.marketing_campaigns USING btree (organization_id);


--
-- Name: idx_marketing_events_campaign; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_marketing_events_campaign ON public.marketing_campaign_events USING btree (campaign_id);


--
-- Name: idx_marketing_events_contact; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_marketing_events_contact ON public.marketing_campaign_events USING btree (contact_id);


--
-- Name: idx_marketing_lists_org; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_marketing_lists_org ON public.marketing_lists USING btree (organization_id);


--
-- Name: idx_products_organization; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_products_organization ON public.products USING btree (organization_id);


--
-- Name: idx_projects_organization; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_projects_organization ON public.projects USING btree (organization_id);


--
-- Name: idx_stock_product; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_stock_product ON public.stock USING btree (product_id);


--
-- Name: idx_users_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_email ON public.users USING btree (email);


--
-- Name: idx_users_organization; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_organization ON public.users USING btree (organization_id);


--
-- Name: leave_balances trigger_update_leave_balance; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_update_leave_balance BEFORE INSERT OR UPDATE ON public.leave_balances FOR EACH ROW EXECUTE FUNCTION public.update_leave_remaining_days();


--
-- Name: stock trigger_update_stock_available; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_update_stock_available BEFORE INSERT OR UPDATE ON public.stock FOR EACH ROW EXECUTE FUNCTION public.update_stock_available_quantity();


--
-- Name: activities update_activities_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_activities_updated_at BEFORE UPDATE ON public.activities FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: attendance update_attendance_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_attendance_updated_at BEFORE UPDATE ON public.attendance FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: calendar_events update_calendar_events_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_calendar_events_updated_at BEFORE UPDATE ON public.calendar_events FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: companies update_companies_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON public.companies FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: contacts update_contacts_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_contacts_updated_at BEFORE UPDATE ON public.contacts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: customers update_customers_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON public.customers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: deals update_deals_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_deals_updated_at BEFORE UPDATE ON public.deals FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: drive_files update_drive_files_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_drive_files_updated_at BEFORE UPDATE ON public.drive_files FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: employees update_employees_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON public.employees FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: invoices update_invoices_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON public.invoices FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: leads update_leads_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON public.leads FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: leave_requests update_leave_requests_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_leave_requests_updated_at BEFORE UPDATE ON public.leave_requests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: marketing_campaigns update_marketing_campaigns_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_marketing_campaigns_updated_at BEFORE UPDATE ON public.marketing_campaigns FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: marketing_forms update_marketing_forms_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_marketing_forms_updated_at BEFORE UPDATE ON public.marketing_forms FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: marketing_lists update_marketing_lists_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_marketing_lists_updated_at BEFORE UPDATE ON public.marketing_lists FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: marketing_segments update_marketing_segments_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_marketing_segments_updated_at BEFORE UPDATE ON public.marketing_segments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: marketing_sequences update_marketing_sequences_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_marketing_sequences_updated_at BEFORE UPDATE ON public.marketing_sequences FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: marketing_templates update_marketing_templates_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_marketing_templates_updated_at BEFORE UPDATE ON public.marketing_templates FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: notification_templates update_notification_templates_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_notification_templates_updated_at BEFORE UPDATE ON public.notification_templates FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: organizations update_organizations_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON public.organizations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: payroll update_payroll_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_payroll_updated_at BEFORE UPDATE ON public.payroll FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: products update_products_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: project_risks update_project_risks_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_project_risks_updated_at BEFORE UPDATE ON public.project_risks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: project_tasks update_project_tasks_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_project_tasks_updated_at BEFORE UPDATE ON public.project_tasks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: projects update_projects_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: purchase_orders update_purchase_orders_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_purchase_orders_updated_at BEFORE UPDATE ON public.purchase_orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: roles update_roles_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_roles_updated_at BEFORE UPDATE ON public.roles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: users update_users_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: vendors update_vendors_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_vendors_updated_at BEFORE UPDATE ON public.vendors FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: warehouses update_warehouses_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_warehouses_updated_at BEFORE UPDATE ON public.warehouses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: workflows update_workflows_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_workflows_updated_at BEFORE UPDATE ON public.workflows FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: workgroup_wiki update_workgroup_wiki_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_workgroup_wiki_updated_at BEFORE UPDATE ON public.workgroup_wiki FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: workgroups update_workgroups_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_workgroups_updated_at BEFORE UPDATE ON public.workgroups FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: activities activities_assigned_to_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.activities
    ADD CONSTRAINT activities_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES public.users(id);


--
-- Name: activities activities_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.activities
    ADD CONSTRAINT activities_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: activities activities_contact_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.activities
    ADD CONSTRAINT activities_contact_id_fkey FOREIGN KEY (contact_id) REFERENCES public.contacts(id);


--
-- Name: activities activities_deal_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.activities
    ADD CONSTRAINT activities_deal_id_fkey FOREIGN KEY (deal_id) REFERENCES public.deals(id);


--
-- Name: activities activities_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.activities
    ADD CONSTRAINT activities_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- Name: attendance attendance_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attendance
    ADD CONSTRAINT attendance_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE CASCADE;


--
-- Name: attendance attendance_org_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attendance
    ADD CONSTRAINT attendance_org_id_fkey FOREIGN KEY (org_id) REFERENCES public.organizations(id);


--
-- Name: attendance attendance_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attendance
    ADD CONSTRAINT attendance_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- Name: calendar_event_attendees calendar_event_attendees_event_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.calendar_event_attendees
    ADD CONSTRAINT calendar_event_attendees_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.calendar_events(id) ON DELETE CASCADE;


--
-- Name: calendar_event_attendees calendar_event_attendees_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.calendar_event_attendees
    ADD CONSTRAINT calendar_event_attendees_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: calendar_events calendar_events_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.calendar_events
    ADD CONSTRAINT calendar_events_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: calendar_events calendar_events_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.calendar_events
    ADD CONSTRAINT calendar_events_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- Name: call_logs call_logs_contact_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.call_logs
    ADD CONSTRAINT call_logs_contact_id_fkey FOREIGN KEY (contact_id) REFERENCES public.contacts(id);


--
-- Name: call_logs call_logs_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.call_logs
    ADD CONSTRAINT call_logs_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- Name: call_logs call_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.call_logs
    ADD CONSTRAINT call_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: companies companies_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.companies
    ADD CONSTRAINT companies_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: companies companies_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.companies
    ADD CONSTRAINT companies_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- Name: contacts contacts_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contacts
    ADD CONSTRAINT contacts_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: contacts contacts_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contacts
    ADD CONSTRAINT contacts_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- Name: customers customers_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: customers customers_contact_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_contact_id_fkey FOREIGN KEY (contact_id) REFERENCES public.contacts(id);


--
-- Name: customers customers_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- Name: deals deals_assigned_to_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.deals
    ADD CONSTRAINT deals_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES public.users(id);


--
-- Name: deals deals_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.deals
    ADD CONSTRAINT deals_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: deals deals_contact_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.deals
    ADD CONSTRAINT deals_contact_id_fkey FOREIGN KEY (contact_id) REFERENCES public.contacts(id);


--
-- Name: deals deals_org_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.deals
    ADD CONSTRAINT deals_org_id_fkey FOREIGN KEY (org_id) REFERENCES public.organizations(id);


--
-- Name: deals deals_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.deals
    ADD CONSTRAINT deals_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- Name: drive_files drive_files_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.drive_files
    ADD CONSTRAINT drive_files_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- Name: drive_files drive_files_uploaded_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.drive_files
    ADD CONSTRAINT drive_files_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES public.users(id);


--
-- Name: emails emails_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.emails
    ADD CONSTRAINT emails_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- Name: emails emails_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.emails
    ADD CONSTRAINT emails_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: employee_documents employee_documents_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employee_documents
    ADD CONSTRAINT employee_documents_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE CASCADE;


--
-- Name: employee_documents employee_documents_uploaded_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employee_documents
    ADD CONSTRAINT employee_documents_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES public.users(id);


--
-- Name: employees employees_manager_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_manager_id_fkey FOREIGN KEY (manager_id) REFERENCES public.employees(id);


--
-- Name: employees employees_org_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_org_id_fkey FOREIGN KEY (org_id) REFERENCES public.organizations(id);


--
-- Name: employees employees_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- Name: employees employees_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: hrms_notifications hrms_notifications_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hrms_notifications
    ADD CONSTRAINT hrms_notifications_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE CASCADE;


--
-- Name: hrms_notifications hrms_notifications_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hrms_notifications
    ADD CONSTRAINT hrms_notifications_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- Name: invoice_items invoice_items_invoice_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoice_items
    ADD CONSTRAINT invoice_items_invoice_id_fkey FOREIGN KEY (invoice_id) REFERENCES public.invoices(id) ON DELETE CASCADE;


--
-- Name: invoice_items invoice_items_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoice_items
    ADD CONSTRAINT invoice_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- Name: invoices invoices_contact_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_contact_id_fkey FOREIGN KEY (contact_id) REFERENCES public.contacts(id);


--
-- Name: invoices invoices_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: invoices invoices_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id);


--
-- Name: invoices invoices_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- Name: lead_external_sources lead_external_sources_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lead_external_sources
    ADD CONSTRAINT lead_external_sources_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- Name: lead_workspaces lead_workspaces_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lead_workspaces
    ADD CONSTRAINT lead_workspaces_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: lead_workspaces lead_workspaces_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lead_workspaces
    ADD CONSTRAINT lead_workspaces_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- Name: leads leads_assigned_to_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.leads
    ADD CONSTRAINT leads_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES public.users(id);


--
-- Name: leads leads_contact_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.leads
    ADD CONSTRAINT leads_contact_id_fkey FOREIGN KEY (contact_id) REFERENCES public.contacts(id);


--
-- Name: leads leads_org_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.leads
    ADD CONSTRAINT leads_org_id_fkey FOREIGN KEY (org_id) REFERENCES public.organizations(id);


--
-- Name: leads leads_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.leads
    ADD CONSTRAINT leads_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- Name: leave_balances leave_balances_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.leave_balances
    ADD CONSTRAINT leave_balances_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE CASCADE;


--
-- Name: leave_balances leave_balances_leave_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.leave_balances
    ADD CONSTRAINT leave_balances_leave_type_id_fkey FOREIGN KEY (leave_type_id) REFERENCES public.leave_types(id) ON DELETE CASCADE;


--
-- Name: leave_requests leave_requests_approved_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.leave_requests
    ADD CONSTRAINT leave_requests_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES public.users(id);


--
-- Name: leave_requests leave_requests_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.leave_requests
    ADD CONSTRAINT leave_requests_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE CASCADE;


--
-- Name: leave_requests leave_requests_leave_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.leave_requests
    ADD CONSTRAINT leave_requests_leave_type_id_fkey FOREIGN KEY (leave_type_id) REFERENCES public.leave_types(id) ON DELETE CASCADE;


--
-- Name: leave_requests leave_requests_org_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.leave_requests
    ADD CONSTRAINT leave_requests_org_id_fkey FOREIGN KEY (org_id) REFERENCES public.organizations(id);


--
-- Name: leave_requests leave_requests_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.leave_requests
    ADD CONSTRAINT leave_requests_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- Name: leave_types leave_types_org_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.leave_types
    ADD CONSTRAINT leave_types_org_id_fkey FOREIGN KEY (org_id) REFERENCES public.organizations(id);


--
-- Name: leave_types leave_types_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.leave_types
    ADD CONSTRAINT leave_types_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- Name: marketing_ab_test_results marketing_ab_test_results_contact_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.marketing_ab_test_results
    ADD CONSTRAINT marketing_ab_test_results_contact_id_fkey FOREIGN KEY (contact_id) REFERENCES public.contacts(id) ON DELETE CASCADE;


--
-- Name: marketing_ab_test_results marketing_ab_test_results_test_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.marketing_ab_test_results
    ADD CONSTRAINT marketing_ab_test_results_test_id_fkey FOREIGN KEY (test_id) REFERENCES public.marketing_ab_tests(id) ON DELETE CASCADE;


--
-- Name: marketing_ab_test_results marketing_ab_test_results_variant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.marketing_ab_test_results
    ADD CONSTRAINT marketing_ab_test_results_variant_id_fkey FOREIGN KEY (variant_id) REFERENCES public.marketing_ab_test_variants(id) ON DELETE CASCADE;


--
-- Name: marketing_ab_test_variants marketing_ab_test_variants_test_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.marketing_ab_test_variants
    ADD CONSTRAINT marketing_ab_test_variants_test_id_fkey FOREIGN KEY (test_id) REFERENCES public.marketing_ab_tests(id) ON DELETE CASCADE;


--
-- Name: marketing_ab_tests marketing_ab_tests_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.marketing_ab_tests
    ADD CONSTRAINT marketing_ab_tests_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: marketing_ab_tests marketing_ab_tests_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.marketing_ab_tests
    ADD CONSTRAINT marketing_ab_tests_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- Name: marketing_campaign_events marketing_campaign_events_campaign_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.marketing_campaign_events
    ADD CONSTRAINT marketing_campaign_events_campaign_id_fkey FOREIGN KEY (campaign_id) REFERENCES public.marketing_campaigns(id) ON DELETE CASCADE;


--
-- Name: marketing_campaign_events marketing_campaign_events_contact_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.marketing_campaign_events
    ADD CONSTRAINT marketing_campaign_events_contact_id_fkey FOREIGN KEY (contact_id) REFERENCES public.contacts(id) ON DELETE CASCADE;


--
-- Name: marketing_campaigns marketing_campaigns_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.marketing_campaigns
    ADD CONSTRAINT marketing_campaigns_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: marketing_campaigns marketing_campaigns_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.marketing_campaigns
    ADD CONSTRAINT marketing_campaigns_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- Name: marketing_form_submissions marketing_form_submissions_contact_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.marketing_form_submissions
    ADD CONSTRAINT marketing_form_submissions_contact_id_fkey FOREIGN KEY (contact_id) REFERENCES public.contacts(id);


--
-- Name: marketing_form_submissions marketing_form_submissions_form_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.marketing_form_submissions
    ADD CONSTRAINT marketing_form_submissions_form_id_fkey FOREIGN KEY (form_id) REFERENCES public.marketing_forms(id) ON DELETE CASCADE;


--
-- Name: marketing_forms marketing_forms_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.marketing_forms
    ADD CONSTRAINT marketing_forms_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: marketing_forms marketing_forms_list_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.marketing_forms
    ADD CONSTRAINT marketing_forms_list_id_fkey FOREIGN KEY (list_id) REFERENCES public.marketing_lists(id);


--
-- Name: marketing_forms marketing_forms_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.marketing_forms
    ADD CONSTRAINT marketing_forms_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- Name: marketing_list_members marketing_list_members_contact_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.marketing_list_members
    ADD CONSTRAINT marketing_list_members_contact_id_fkey FOREIGN KEY (contact_id) REFERENCES public.contacts(id) ON DELETE CASCADE;


--
-- Name: marketing_list_members marketing_list_members_list_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.marketing_list_members
    ADD CONSTRAINT marketing_list_members_list_id_fkey FOREIGN KEY (list_id) REFERENCES public.marketing_lists(id) ON DELETE CASCADE;


--
-- Name: marketing_lists marketing_lists_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.marketing_lists
    ADD CONSTRAINT marketing_lists_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: marketing_lists marketing_lists_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.marketing_lists
    ADD CONSTRAINT marketing_lists_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- Name: marketing_scoring_history marketing_scoring_history_contact_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.marketing_scoring_history
    ADD CONSTRAINT marketing_scoring_history_contact_id_fkey FOREIGN KEY (contact_id) REFERENCES public.contacts(id) ON DELETE CASCADE;


--
-- Name: marketing_scoring_history marketing_scoring_history_rule_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.marketing_scoring_history
    ADD CONSTRAINT marketing_scoring_history_rule_id_fkey FOREIGN KEY (rule_id) REFERENCES public.marketing_scoring_rules(id);


--
-- Name: marketing_scoring_rules marketing_scoring_rules_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.marketing_scoring_rules
    ADD CONSTRAINT marketing_scoring_rules_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- Name: marketing_segments marketing_segments_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.marketing_segments
    ADD CONSTRAINT marketing_segments_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: marketing_segments marketing_segments_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.marketing_segments
    ADD CONSTRAINT marketing_segments_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- Name: marketing_sequence_enrollments marketing_sequence_enrollments_contact_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.marketing_sequence_enrollments
    ADD CONSTRAINT marketing_sequence_enrollments_contact_id_fkey FOREIGN KEY (contact_id) REFERENCES public.contacts(id) ON DELETE CASCADE;


--
-- Name: marketing_sequence_enrollments marketing_sequence_enrollments_sequence_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.marketing_sequence_enrollments
    ADD CONSTRAINT marketing_sequence_enrollments_sequence_id_fkey FOREIGN KEY (sequence_id) REFERENCES public.marketing_sequences(id) ON DELETE CASCADE;


--
-- Name: marketing_sequence_steps marketing_sequence_steps_sequence_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.marketing_sequence_steps
    ADD CONSTRAINT marketing_sequence_steps_sequence_id_fkey FOREIGN KEY (sequence_id) REFERENCES public.marketing_sequences(id) ON DELETE CASCADE;


--
-- Name: marketing_sequences marketing_sequences_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.marketing_sequences
    ADD CONSTRAINT marketing_sequences_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: marketing_sequences marketing_sequences_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.marketing_sequences
    ADD CONSTRAINT marketing_sequences_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- Name: marketing_templates marketing_templates_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.marketing_templates
    ADD CONSTRAINT marketing_templates_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: marketing_templates marketing_templates_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.marketing_templates
    ADD CONSTRAINT marketing_templates_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- Name: marketing_webhook_logs marketing_webhook_logs_webhook_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.marketing_webhook_logs
    ADD CONSTRAINT marketing_webhook_logs_webhook_id_fkey FOREIGN KEY (webhook_id) REFERENCES public.marketing_webhooks(id) ON DELETE CASCADE;


--
-- Name: marketing_webhook_queue marketing_webhook_queue_webhook_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.marketing_webhook_queue
    ADD CONSTRAINT marketing_webhook_queue_webhook_id_fkey FOREIGN KEY (webhook_id) REFERENCES public.marketing_webhooks(id) ON DELETE CASCADE;


--
-- Name: marketing_webhooks marketing_webhooks_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.marketing_webhooks
    ADD CONSTRAINT marketing_webhooks_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: marketing_webhooks marketing_webhooks_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.marketing_webhooks
    ADD CONSTRAINT marketing_webhooks_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- Name: notification_templates notification_templates_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notification_templates
    ADD CONSTRAINT notification_templates_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- Name: notifications notifications_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- Name: notifications notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: payroll payroll_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payroll
    ADD CONSTRAINT payroll_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: payroll payroll_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payroll
    ADD CONSTRAINT payroll_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE CASCADE;


--
-- Name: payroll payroll_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payroll
    ADD CONSTRAINT payroll_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- Name: products products_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: products products_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- Name: project_documents project_documents_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_documents
    ADD CONSTRAINT project_documents_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: project_documents project_documents_uploaded_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_documents
    ADD CONSTRAINT project_documents_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES public.users(id);


--
-- Name: project_milestones project_milestones_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_milestones
    ADD CONSTRAINT project_milestones_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: project_risks project_risks_owner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_risks
    ADD CONSTRAINT project_risks_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.users(id);


--
-- Name: project_risks project_risks_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_risks
    ADD CONSTRAINT project_risks_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: project_tasks project_tasks_assigned_to_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_tasks
    ADD CONSTRAINT project_tasks_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES public.users(id);


--
-- Name: project_tasks project_tasks_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_tasks
    ADD CONSTRAINT project_tasks_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: project_tasks project_tasks_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_tasks
    ADD CONSTRAINT project_tasks_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- Name: project_tasks project_tasks_parent_task_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_tasks
    ADD CONSTRAINT project_tasks_parent_task_id_fkey FOREIGN KEY (parent_task_id) REFERENCES public.project_tasks(id);


--
-- Name: project_tasks project_tasks_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_tasks
    ADD CONSTRAINT project_tasks_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: project_time_entries project_time_entries_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_time_entries
    ADD CONSTRAINT project_time_entries_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- Name: project_time_entries project_time_entries_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_time_entries
    ADD CONSTRAINT project_time_entries_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: project_time_entries project_time_entries_task_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_time_entries
    ADD CONSTRAINT project_time_entries_task_id_fkey FOREIGN KEY (task_id) REFERENCES public.project_tasks(id);


--
-- Name: project_time_entries project_time_entries_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_time_entries
    ADD CONSTRAINT project_time_entries_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: projects projects_client_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.customers(id);


--
-- Name: projects projects_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: projects projects_manager_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_manager_id_fkey FOREIGN KEY (manager_id) REFERENCES public.users(id);


--
-- Name: projects projects_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- Name: purchase_order_items purchase_order_items_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_order_items
    ADD CONSTRAINT purchase_order_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: purchase_order_items purchase_order_items_purchase_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_order_items
    ADD CONSTRAINT purchase_order_items_purchase_order_id_fkey FOREIGN KEY (purchase_order_id) REFERENCES public.purchase_orders(id) ON DELETE CASCADE;


--
-- Name: purchase_orders purchase_orders_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_orders
    ADD CONSTRAINT purchase_orders_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: purchase_orders purchase_orders_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_orders
    ADD CONSTRAINT purchase_orders_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- Name: purchase_orders purchase_orders_vendor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_orders
    ADD CONSTRAINT purchase_orders_vendor_id_fkey FOREIGN KEY (vendor_id) REFERENCES public.vendors(id) ON DELETE CASCADE;


--
-- Name: purchase_orders purchase_orders_warehouse_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_orders
    ADD CONSTRAINT purchase_orders_warehouse_id_fkey FOREIGN KEY (warehouse_id) REFERENCES public.warehouses(id);


--
-- Name: roles roles_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- Name: signing_parties signing_parties_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.signing_parties
    ADD CONSTRAINT signing_parties_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- Name: stock_movements stock_movements_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_movements
    ADD CONSTRAINT stock_movements_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: stock_movements stock_movements_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_movements
    ADD CONSTRAINT stock_movements_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- Name: stock_movements stock_movements_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_movements
    ADD CONSTRAINT stock_movements_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: stock_movements stock_movements_warehouse_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_movements
    ADD CONSTRAINT stock_movements_warehouse_id_fkey FOREIGN KEY (warehouse_id) REFERENCES public.warehouses(id) ON DELETE CASCADE;


--
-- Name: stock stock_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock
    ADD CONSTRAINT stock_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- Name: stock stock_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock
    ADD CONSTRAINT stock_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: stock stock_warehouse_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock
    ADD CONSTRAINT stock_warehouse_id_fkey FOREIGN KEY (warehouse_id) REFERENCES public.warehouses(id) ON DELETE CASCADE;


--
-- Name: user_roles user_roles_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id) ON DELETE CASCADE;


--
-- Name: user_roles user_roles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: users users_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- Name: vendors vendors_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vendors
    ADD CONSTRAINT vendors_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- Name: warehouses warehouses_manager_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.warehouses
    ADD CONSTRAINT warehouses_manager_id_fkey FOREIGN KEY (manager_id) REFERENCES public.users(id);


--
-- Name: warehouses warehouses_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.warehouses
    ADD CONSTRAINT warehouses_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- Name: workflow_actions workflow_actions_workflow_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.workflow_actions
    ADD CONSTRAINT workflow_actions_workflow_id_fkey FOREIGN KEY (workflow_id) REFERENCES public.workflows(id) ON DELETE CASCADE;


--
-- Name: workflow_executions workflow_executions_workflow_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.workflow_executions
    ADD CONSTRAINT workflow_executions_workflow_id_fkey FOREIGN KEY (workflow_id) REFERENCES public.workflows(id) ON DELETE CASCADE;


--
-- Name: workflows workflows_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.workflows
    ADD CONSTRAINT workflows_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: workflows workflows_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.workflows
    ADD CONSTRAINT workflows_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- Name: workgroup_files workgroup_files_uploaded_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.workgroup_files
    ADD CONSTRAINT workgroup_files_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES public.users(id);


--
-- Name: workgroup_files workgroup_files_workgroup_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.workgroup_files
    ADD CONSTRAINT workgroup_files_workgroup_id_fkey FOREIGN KEY (workgroup_id) REFERENCES public.workgroups(id) ON DELETE CASCADE;


--
-- Name: workgroup_members workgroup_members_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.workgroup_members
    ADD CONSTRAINT workgroup_members_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: workgroup_members workgroup_members_workgroup_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.workgroup_members
    ADD CONSTRAINT workgroup_members_workgroup_id_fkey FOREIGN KEY (workgroup_id) REFERENCES public.workgroups(id) ON DELETE CASCADE;


--
-- Name: workgroup_notifications workgroup_notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.workgroup_notifications
    ADD CONSTRAINT workgroup_notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: workgroup_notifications workgroup_notifications_workgroup_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.workgroup_notifications
    ADD CONSTRAINT workgroup_notifications_workgroup_id_fkey FOREIGN KEY (workgroup_id) REFERENCES public.workgroups(id) ON DELETE CASCADE;


--
-- Name: workgroup_wiki workgroup_wiki_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.workgroup_wiki
    ADD CONSTRAINT workgroup_wiki_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: workgroup_wiki workgroup_wiki_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.workgroup_wiki
    ADD CONSTRAINT workgroup_wiki_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.workgroup_wiki(id);


--
-- Name: workgroup_wiki workgroup_wiki_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.workgroup_wiki
    ADD CONSTRAINT workgroup_wiki_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.users(id);


--
-- Name: workgroup_wiki workgroup_wiki_workgroup_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.workgroup_wiki
    ADD CONSTRAINT workgroup_wiki_workgroup_id_fkey FOREIGN KEY (workgroup_id) REFERENCES public.workgroups(id) ON DELETE CASCADE;


--
-- Name: workgroups workgroups_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.workgroups
    ADD CONSTRAINT workgroups_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: workgroups workgroups_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.workgroups
    ADD CONSTRAINT workgroups_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

