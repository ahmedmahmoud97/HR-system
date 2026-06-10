/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';

// Retrieve environment variables
const rawUrl = import.meta.env.VITE_SUPABASE_URL || 'https://uwomuhcwaooocnbdiyex.supabase.co/rest/v1/';
// Clean up url if trailing /rest/v1/ exists
const supabaseUrl = rawUrl.trim().replace(/\/rest\/v1\/?$/, '');

const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV3b211aGN3YW9vb2NuYmRpeWV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEwNDMxMzgsImV4cCI6MjA5NjYxOTEzOH0.PyB1LP6SbJizfWXF_5nkOBf4bdoWQebuMYXzrUAncF8').trim();

// Create Supabase Client (safe fallback if keys are missing)
export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
);

export const isSupabaseConfigured = (): boolean => {
  return !!supabaseUrl && !!supabaseAnonKey && supabaseUrl !== 'https://placeholder-url.supabase.co';
};

// SQL query script to help user initialize tables
export const SUPABASE_SQL_SETUP = `
-- 1. Create tables with camelCase double-quoted column names to match TypeScript interfaces exactly
CREATE TABLE IF NOT EXISTS departments (
  "id" text PRIMARY KEY,
  "name" text NOT NULL
);

CREATE TABLE IF NOT EXISTS sections (
  "id" text PRIMARY KEY,
  "name" text NOT NULL,
  "departmentId" text NOT NULL REFERENCES departments("id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS job_titles (
  "id" text PRIMARY KEY,
  "name" text NOT NULL
);

CREATE TABLE IF NOT EXISTS cost_centers (
  "id" text PRIMARY KEY,
  "code" text NOT NULL,
  "name" text NOT NULL
);

CREATE TABLE IF NOT EXISTS insurance_configs (
  "id" text PRIMARY KEY,
  "employeeRatio" numeric NOT NULL,
  "companyRatio" numeric NOT NULL,
  "maxLimit" numeric NOT NULL,
  "minLimit" numeric NOT NULL
);

CREATE TABLE IF NOT EXISTS insurance_offices (
  "id" text PRIMARY KEY,
  "code" text NOT NULL,
  "name" text NOT NULL
);

CREATE TABLE IF NOT EXISTS resignation_reasons (
  "id" text PRIMARY KEY,
  "reason" text NOT NULL
);

CREATE TABLE IF NOT EXISTS vacation_types (
  "id" text PRIMARY KEY,
  "name" text NOT NULL,
  "daysAllowed" integer NOT NULL
);

CREATE TABLE IF NOT EXISTS employees (
  "id" text PRIMARY KEY,
  "code" text NOT NULL,
  "name" text NOT NULL,
  "nationalId" text NOT NULL,
  "phone" text NOT NULL,
  "email" text NOT NULL,
  "departmentId" text REFERENCES departments("id") ON DELETE SET NULL,
  "sectionId" text REFERENCES sections("id") ON DELETE SET NULL,
  "jobId" text REFERENCES job_titles("id") ON DELETE SET NULL,
  "costCenterId" text REFERENCES cost_centers("id") ON DELETE SET NULL,
  "hireDate" text NOT NULL,
  "status" text NOT NULL CHECK ("status" IN ('active', 'terminated')),
  "terminationDate" text,
  "terminationReasonId" text REFERENCES resignation_reasons("id") ON DELETE SET NULL,
  "insuranceNumber" text,
  "insuranceOfficeId" text REFERENCES insurance_offices("id") ON DELETE SET NULL,
  "basicSalary" numeric NOT NULL,
  "insuranceSalary" numeric NOT NULL,
  "vacationBalance" numeric NOT NULL,
  "initialVacationBalance" numeric NOT NULL,
  "dateOfBirth" text,
  "contractExpiryDate" text,
  "militaryDefermentExpiryDate" text,
  "address" text,
  "socialStatus" text
);

CREATE TABLE IF NOT EXISTS vacation_requests (
  "id" text PRIMARY KEY,
  "employeeId" text REFERENCES employees("id") ON DELETE CASCADE,
  "vacationTypeId" text REFERENCES vacation_types("id") ON DELETE CASCADE,
  "startDate" text NOT NULL,
  "endDate" text NOT NULL,
  "days" integer NOT NULL,
  "status" text NOT NULL CHECK ("status" IN ('pending', 'approved', 'rejected')),
  "notes" text,
  "requestDate" text NOT NULL
);

CREATE TABLE IF NOT EXISTS attendance (
  "id" text PRIMARY KEY,
  "employeeId" text REFERENCES employees("id") ON DELETE CASCADE,
  "date" text NOT NULL,
  "clockIn" text NOT NULL,
  "clockOut" text NOT NULL,
  "status" text NOT NULL CHECK ("status" IN ('present', 'absent', 'late', 'excused')),
  "notes" text
);

CREATE TABLE IF NOT EXISTS system_month (
  "id" text PRIMARY KEY,
  "year" integer NOT NULL,
  "month" integer NOT NULL
);

CREATE TABLE IF NOT EXISTS user_permissions (
  "id" text PRIMARY KEY,
  "userCode" text NOT NULL,
  "userName" text NOT NULL,
  "role" text NOT NULL CHECK ("role" IN ('admin', 'manager', 'entry', 'reports')),
  "permissions" jsonb NOT NULL
);

CREATE TABLE IF NOT EXISTS system_alerts (
  "id" text PRIMARY KEY,
  "title" text NOT NULL,
  "description" text NOT NULL,
  "date" text NOT NULL,
  "type" text NOT NULL CHECK ("type" IN ('warning', 'info', 'success'))
);

-- 2. Turn on Realtime for all tables and ensure Row Level Security (RLS) handles anonymous access for demonstration.
-- (For development simplicity, you can disable RLS or create permissive policies)

ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_titles ENABLE ROW LEVEL SECURITY;
ALTER TABLE cost_centers ENABLE ROW LEVEL SECURITY;
ALTER TABLE insurance_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE insurance_offices ENABLE ROW LEVEL SECURITY;
ALTER TABLE resignation_reasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE vacation_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE vacation_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_month ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_alerts ENABLE ROW LEVEL SECURITY;

-- Permissive policies for quick prototyping (Anonymous read/write)
DROP POLICY IF EXISTS "Allow all anonymous departments" ON departments;
CREATE POLICY "Allow all anonymous departments" ON departments FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all anonymous sections" ON sections;
CREATE POLICY "Allow all anonymous sections" ON sections FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all anonymous job_titles" ON job_titles;
CREATE POLICY "Allow all anonymous job_titles" ON job_titles FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all anonymous cost_centers" ON cost_centers;
CREATE POLICY "Allow all anonymous cost_centers" ON cost_centers FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all anonymous insurance_configs" ON insurance_configs;
CREATE POLICY "Allow all anonymous insurance_configs" ON insurance_configs FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all anonymous insurance_offices" ON insurance_offices;
CREATE POLICY "Allow all anonymous insurance_offices" ON insurance_offices FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all anonymous resignation_reasons" ON resignation_reasons;
CREATE POLICY "Allow all anonymous resignation_reasons" ON resignation_reasons FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all anonymous vacation_types" ON vacation_types;
CREATE POLICY "Allow all anonymous vacation_types" ON vacation_types FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all anonymous employees" ON employees;
CREATE POLICY "Allow all anonymous employees" ON employees FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all anonymous vacation_requests" ON vacation_requests;
CREATE POLICY "Allow all anonymous vacation_requests" ON vacation_requests FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all anonymous attendance" ON attendance;
CREATE POLICY "Allow all anonymous attendance" ON attendance FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all anonymous system_month" ON system_month;
CREATE POLICY "Allow all anonymous system_month" ON system_month FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all anonymous user_permissions" ON user_permissions;
CREATE POLICY "Allow all anonymous user_permissions" ON user_permissions FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all anonymous system_alerts" ON system_alerts;
CREATE POLICY "Allow all anonymous system_alerts" ON system_alerts FOR ALL TO anon USING (true) WITH CHECK (true);

-- Enable Realtime PubSub safely if publication exists and relations are not already added
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_publication_rel pr JOIN pg_class c ON pr.prrelid = c.oid JOIN pg_publication p ON pr.prpubid = p.oid WHERE p.pubname = 'supabase_realtime' AND c.relname = 'departments') THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE departments;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_publication_rel pr JOIN pg_class c ON pr.prrelid = c.oid JOIN pg_publication p ON pr.prpubid = p.oid WHERE p.pubname = 'supabase_realtime' AND c.relname = 'sections') THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE sections;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_publication_rel pr JOIN pg_class c ON pr.prrelid = c.oid JOIN pg_publication p ON pr.prpubid = p.oid WHERE p.pubname = 'supabase_realtime' AND c.relname = 'job_titles') THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE job_titles;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_publication_rel pr JOIN pg_class c ON pr.prrelid = c.oid JOIN pg_publication p ON pr.prpubid = p.oid WHERE p.pubname = 'supabase_realtime' AND c.relname = 'cost_centers') THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE cost_centers;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_publication_rel pr JOIN pg_class c ON pr.prrelid = c.oid JOIN pg_publication p ON pr.prpubid = p.oid WHERE p.pubname = 'supabase_realtime' AND c.relname = 'insurance_configs') THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE insurance_configs;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_publication_rel pr JOIN pg_class c ON pr.prrelid = c.oid JOIN pg_publication p ON pr.prpubid = p.oid WHERE p.pubname = 'supabase_realtime' AND c.relname = 'insurance_offices') THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE insurance_offices;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_publication_rel pr JOIN pg_class c ON pr.prrelid = c.oid JOIN pg_publication p ON pr.prpubid = p.oid WHERE p.pubname = 'supabase_realtime' AND c.relname = 'resignation_reasons') THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE resignation_reasons;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_publication_rel pr JOIN pg_class c ON pr.prrelid = c.oid JOIN pg_publication p ON pr.prpubid = p.oid WHERE p.pubname = 'supabase_realtime' AND c.relname = 'vacation_types') THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE vacation_types;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_publication_rel pr JOIN pg_class c ON pr.prrelid = c.oid JOIN pg_publication p ON pr.prpubid = p.oid WHERE p.pubname = 'supabase_realtime' AND c.relname = 'employees') THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE employees;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_publication_rel pr JOIN pg_class c ON pr.prrelid = c.oid JOIN pg_publication p ON pr.prpubid = p.oid WHERE p.pubname = 'supabase_realtime' AND c.relname = 'vacation_requests') THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE vacation_requests;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_publication_rel pr JOIN pg_class c ON pr.prrelid = c.oid JOIN pg_publication p ON pr.prpubid = p.oid WHERE p.pubname = 'supabase_realtime' AND c.relname = 'attendance') THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE attendance;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_publication_rel pr JOIN pg_class c ON pr.prrelid = c.oid JOIN pg_publication p ON pr.prpubid = p.oid WHERE p.pubname = 'supabase_realtime' AND c.relname = 'system_month') THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE system_month;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_publication_rel pr JOIN pg_class c ON pr.prrelid = c.oid JOIN pg_publication p ON pr.prpubid = p.oid WHERE p.pubname = 'supabase_realtime' AND c.relname = 'user_permissions') THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE user_permissions;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_publication_rel pr JOIN pg_class c ON pr.prrelid = c.oid JOIN pg_publication p ON pr.prpubid = p.oid WHERE p.pubname = 'supabase_realtime' AND c.relname = 'system_alerts') THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE system_alerts;
    END IF;
  END IF;
END $$;

-- 3. Run migrations for existing users to add new columns if they do not exist
ALTER TABLE employees ADD COLUMN IF NOT EXISTS "address" text;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS "socialStatus" text;
`;
