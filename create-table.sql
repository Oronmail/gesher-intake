-- Create referrals table if it doesn't exist
CREATE TABLE IF NOT EXISTS referrals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  referral_number TEXT UNIQUE NOT NULL,
  school_id TEXT NOT NULL,
  school_name TEXT,
  warm_home_destination TEXT,
  counselor_name TEXT NOT NULL,
  counselor_email TEXT NOT NULL,
  counselor_mobile TEXT,
  parent_email TEXT,
  parent_phone TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending_consent',
  signature_image TEXT,
  signature_image2 TEXT,
  parent_names TEXT,
  consent_timestamp TIMESTAMP WITH TIME ZONE,
  salesforce_contact_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on referral_number for faster lookups
CREATE INDEX IF NOT EXISTS idx_referrals_referral_number ON referrals(referral_number);

-- Create index on salesforce_contact_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_referrals_salesforce_contact_id ON referrals(salesforce_contact_id);

-- Enable Row Level Security
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (you can restrict this later)
CREATE POLICY IF NOT EXISTS "Allow all operations on referrals" ON referrals
  FOR ALL
  USING (true)
  WITH CHECK (true);
