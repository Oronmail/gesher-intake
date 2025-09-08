-- Create referrals table for workflow tracking
CREATE TABLE referrals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  referral_number TEXT UNIQUE NOT NULL,
  
  -- Initial data (from counselor)
  school_id TEXT NOT NULL,
  school_name TEXT NOT NULL,
  counselor_name TEXT NOT NULL,
  counselor_email TEXT NOT NULL,
  
  -- Parent contact (only data before consent)
  parent_email TEXT,
  parent_phone TEXT NOT NULL,
  
  -- Consent data (after parent signs)
  signature_image TEXT,
  signature_image2 TEXT,
  parent_names TEXT,
  consent_timestamp TIMESTAMPTZ,
  
  -- Workflow status
  status TEXT NOT NULL DEFAULT 'pending_consent',
  
  -- Salesforce integration
  salesforce_contact_id TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Auto-delete after 72 hours if not completed
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '72 hours'
);

-- Create index for status queries
CREATE INDEX idx_referrals_status ON referrals(status);

-- Create index for expiration cleanup
CREATE INDEX idx_referrals_expires_at ON referrals(expires_at);

-- Row Level Security
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

-- Policy to allow insert from authenticated app
CREATE POLICY "Allow insert for authenticated" ON referrals
  FOR INSERT WITH CHECK (true);

-- Policy to allow select based on referral_number
CREATE POLICY "Allow select by referral number" ON referrals
  FOR SELECT USING (true);

-- Policy to allow update based on referral_number
CREATE POLICY "Allow update by referral number" ON referrals
  FOR UPDATE USING (true);

-- Function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-update updated_at
CREATE TRIGGER update_referrals_updated_at 
  BEFORE UPDATE ON referrals
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Function to clean up expired referrals
CREATE OR REPLACE FUNCTION cleanup_expired_referrals()
RETURNS void AS $$
BEGIN
  DELETE FROM referrals 
  WHERE expires_at < NOW() 
  AND status NOT IN ('completed', 'cancelled');
END;
$$ language 'plpgsql';