import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Client for browser-side (anon key)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Server-side admin client (bypasses RLS)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

export type Applicant = {
  id: string
  name: string
  email: string
  subject: string | null
  gmail_message_id: string | null
  cv_attachment_url: string | null
  cv_filename: string | null
  date_applied: string
  status: 'PENDING' | 'CONFIRMED' | 'SHORTLISTED' | 'REJECTED'
  confirmation_sent_at: string | null
  rejection_sent_at: string | null
  notes: string
  internship_post: string
  created_at: string
  updated_at: string
}

export type EmailLog = {
  id: string
  applicant_id: string
  applicant_email: string
  applicant_name: string
  email_type: 'CONFIRMATION' | 'REJECTION' | 'SHORTLIST' | 'BULK' | 'CUSTOM'
  subject: string
  message: string
  sent_at: string
  sent_by: string
  status: string
  gmail_thread_id: string | null
}

export type EmailTemplate = {
  id: string
  name: string
  subject: string
  message: string
  template_type: 'CONFIRMATION' | 'REJECTION' | 'SHORTLIST' | 'CUSTOM'
  is_default: boolean
  created_at: string
}
