import { createClient } from '@supabase/supabase-js'
import { supabaseMock } from './supabase-mock'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Use mock for local testing if Supabase is not configured
const isConfigured = supabaseUrl && 
                     supabaseAnonKey && 
                     supabaseUrl !== 'https://your-project.supabase.co' &&
                     supabaseAnonKey !== 'your-anon-key-here'

export const supabase = isConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : supabaseMock as any

export type ReferralStatus = 
  | 'pending_consent'
  | 'consent_sent' 
  | 'consent_signed'
  | 'data_collection'
  | 'completed'
  | 'cancelled'

export interface Referral {
  id: string
  referral_number: string
  school_id: string
  counselor_name: string
  counselor_email: string
  parent_email: string
  parent_phone: string
  status: ReferralStatus
  signature_image?: string
  signature_image2?: string
  parent_names?: string
  consent_timestamp?: string
  created_at: string
  updated_at: string
}