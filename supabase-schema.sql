-- ================================================================
-- MentorTechz Internship Manager - Complete Database Schema
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql
-- ================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Applicants Table
CREATE TABLE IF NOT EXISTS public.applicants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  subject TEXT,
  gmail_message_id TEXT,
  cv_attachment_url TEXT,
  cv_filename TEXT,
  date_applied TIMESTAMPTZ DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'CONFIRMED', 'SHORTLISTED', 'REJECTED')),
  confirmation_sent_at TIMESTAMPTZ,
  rejection_sent_at TIMESTAMPTZ,
  notes TEXT DEFAULT '',
  internship_post TEXT DEFAULT 'Internship',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Email Logs Table
CREATE TABLE IF NOT EXISTS public.email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  applicant_id UUID REFERENCES public.applicants(id) ON DELETE SET NULL,
  applicant_email TEXT NOT NULL,
  applicant_name TEXT NOT NULL,
  email_type TEXT NOT NULL DEFAULT 'CONFIRMATION',
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  sent_by TEXT DEFAULT 'softwarehousementor@gmail.com',
  status TEXT DEFAULT 'SENT',
  gmail_thread_id TEXT
);

-- 3. Email Templates Table
CREATE TABLE IF NOT EXISTS public.email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  template_type TEXT NOT NULL CHECK (template_type IN ('CONFIRMATION', 'REJECTION', 'SHORTLIST', 'CUSTOM')),
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Settings Table (Stores Gmail refresh token, sync timestamps, daily counters)
CREATE TABLE IF NOT EXISTS public.settings (
  key TEXT PRIMARY KEY,
  value TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Insert Default Email Templates
INSERT INTO public.email_templates (name, subject, message, template_type, is_default)
VALUES 
  (
    'Internship Confirmation',
    'Application Received — MentorTechz Internship Program',
    'Dear {name},\n\nThank you for applying for the internship opportunity at MentorTechz! We have received your CV and application.\n\nPlease join our official WhatsApp group for all important updates and onboarding instructions:\nhttps://chat.whatsapp.com/HJzrefbXOVn3sAmfIsNhJp\n\nBest regards,\nMentorTechz Team',
    'CONFIRMATION',
    true
  ),
  (
    'Application Shortlisted',
    'Congratulations! Your Application is Shortlisted — MentorTechz',
    'Dear {name},\n\nWe are pleased to inform you that your profile has been shortlisted for the next stage of our internship selection process.\n\nOur technical team will reach out to you with next steps shortly. Please ensure you are in the WhatsApp group:\nhttps://chat.whatsapp.com/HJzrefbXOVn3sAmfIsNhJp\n\nBest regards,\nMentorTechz Team',
    'SHORTLIST',
    true
  ),
  (
    'Application Rejection',
    'Update regarding your application — MentorTechz',
    'Dear {name},\n\nThank you for taking the time to apply for an internship at MentorTechz. After careful review, we regret to inform you that we will not be moving forward with your application for this cohort.\n\nWe encourage you to apply again for future openings.\n\nBest regards,\nMentorTechz Team',
    'REJECTION',
    true
  )
ON CONFLICT DO NOTHING;

-- 6. Grant Permissions (Disable RLS for admin service role or allow all for service role)
ALTER TABLE public.applicants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Allow full access to service_role (used by backend)
CREATE POLICY "Full access to service_role" ON public.applicants FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Full access to service_role" ON public.email_logs FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Full access to service_role" ON public.email_templates FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Full access to service_role" ON public.settings FOR ALL TO service_role USING (true) WITH CHECK (true);
