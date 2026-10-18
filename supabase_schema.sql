-- ========================================================
-- ABENTRA INTERNATIONAL - SUPABASE DATABASE SCHEMA
-- Execute this script in your Supabase Project's SQL Editor
-- ========================================================

-- 1. Site Configuration Table (Theme, Brand, Hero, Ticker, Who, Purpose, Services, Contact, Footer, SMTP)
CREATE TABLE IF NOT EXISTS abentra_config (
  id TEXT PRIMARY KEY DEFAULT 'site_config',
  data JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Intermediate Dynamic Sections Table
CREATE TABLE IF NOT EXISTS abentra_sections (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  title TEXT NOT NULL,
  tag TEXT,
  tag_sub TEXT,
  subtitle TEXT,
  type TEXT DEFAULT 'cards',
  enabled BOOLEAN DEFAULT true,
  "order" INT DEFAULT 1,
  anchor TEXT,
  items JSONB DEFAULT '[]'::jsonb,
  custom_html TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Sector-Specific SVG Icon Library Table
CREATE TABLE IF NOT EXISTS abentra_icons (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  tags TEXT[] DEFAULT '{}',
  svg TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Visitor Sessions Log Table
CREATE TABLE IF NOT EXISTS abentra_visitors (
  id TEXT PRIMARY KEY,
  ip TEXT,
  country TEXT DEFAULT 'Liberia',
  city TEXT DEFAULT 'Monrovia',
  device TEXT DEFAULT 'Desktop',
  browser TEXT,
  os TEXT,
  referer TEXT,
  first_seen TIMESTAMPTZ DEFAULT NOW(),
  last_seen TIMESTAMPTZ DEFAULT NOW(),
  duration_seconds INT DEFAULT 0,
  sections_viewed JSONB DEFAULT '[]'::jsonb,
  visitor_type TEXT DEFAULT 'human',
  bot_score INT DEFAULT 0,
  verified BOOLEAN DEFAULT false
);

-- Migration helpers if abentra_visitors already exists
ALTER TABLE abentra_visitors ADD COLUMN IF NOT EXISTS visitor_type TEXT DEFAULT 'human';
ALTER TABLE abentra_visitors ADD COLUMN IF NOT EXISTS bot_score INT DEFAULT 0;
ALTER TABLE abentra_visitors ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT false;

-- 5. Section Telemetry & Dwell Time Aggregates Table
CREATE TABLE IF NOT EXISTS abentra_section_stats (
  section_id TEXT PRIMARY KEY,
  views_count INT DEFAULT 0,
  time_seconds INT DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Contact Inquiries (Inbox) Table
CREATE TABLE IF NOT EXISTS abentra_inquiries (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT,
  service TEXT,
  message TEXT NOT NULL,
  date TIMESTAMPTZ DEFAULT NOW(),
  read BOOLEAN DEFAULT false,
  replied BOOLEAN DEFAULT false
);

-- 7. Sent Emails History Table
CREATE TABLE IF NOT EXISTS abentra_sent_emails (
  id TEXT PRIMARY KEY,
  "to" TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  template TEXT,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'Delivered',
  error_details TEXT
);

-- 8. Email Templates Table
CREATE TABLE IF NOT EXISTS abentra_email_templates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Admin Users Table
CREATE TABLE IF NOT EXISTS abentra_users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  salt TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'Super Administrator',
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_login TIMESTAMPTZ
);

-- 10. Indexes for Fast Analytics & Log Querying
CREATE INDEX IF NOT EXISTS idx_visitors_last_seen ON abentra_visitors(last_seen DESC);
CREATE INDEX IF NOT EXISTS idx_inquiries_date ON abentra_inquiries(date DESC);
CREATE INDEX IF NOT EXISTS idx_sections_order ON abentra_sections("order" ASC);

-- 11. Storage Bucket for Media/Logos (Optional / If using Supabase Storage)
INSERT INTO storage.buckets (id, name, public)
VALUES ('abentra-uploads', 'abentra-uploads', true)
ON CONFLICT (id) DO NOTHING;

-- Grant public read access to uploads bucket
CREATE POLICY "Public Read Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'abentra-uploads');

CREATE POLICY "Authenticated/Service Upload Access"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'abentra-uploads');

-- ========================================================
-- 12. Row Level Security (RLS) Settings
-- Disable RLS on application tables to allow the publishable/anon key full read/write access
-- ========================================================
ALTER TABLE IF EXISTS abentra_config DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS abentra_sections DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS abentra_icons DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS abentra_visitors DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS abentra_section_stats DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS abentra_inquiries DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS abentra_sent_emails DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS abentra_email_templates DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS abentra_users DISABLE ROW LEVEL SECURITY;

