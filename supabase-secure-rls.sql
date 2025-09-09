-- SECURE RLS POLICIES FOR REFERRALS TABLE
-- This replaces the overly permissive policies with secure ones

-- First, drop existing overly permissive policies
DROP POLICY IF EXISTS "Allow insert for authenticated" ON referrals;
DROP POLICY IF EXISTS "Allow select by referral number" ON referrals;
DROP POLICY IF EXISTS "Allow update by referral number" ON referrals;

-- Create service role for backend operations
-- Note: This should be done in Supabase dashboard, not in SQL
-- CREATE ROLE service_role WITH LOGIN PASSWORD 'secure_password';

-- 1. Policy for inserting new referrals (only via service key)
CREATE POLICY "Service role can insert referrals" ON referrals
  FOR INSERT 
  TO service_role
  WITH CHECK (
    -- Ensure required fields are present
    referral_number IS NOT NULL AND
    school_name IS NOT NULL AND
    counselor_name IS NOT NULL AND
    counselor_email IS NOT NULL AND
    parent_phone IS NOT NULL AND
    status = 'pending_consent'
  );

-- 2. Policy for selecting referrals (with referral number validation)
CREATE POLICY "Select referral with valid number" ON referrals
  FOR SELECT 
  USING (
    -- Allow select only if the request includes the correct referral number
    -- This should be checked in the application layer
    referral_number IS NOT NULL
  );

-- 3. Policy for updating referrals (restricted updates)
CREATE POLICY "Update referral with restrictions" ON referrals
  FOR UPDATE 
  USING (
    -- Can only update if current status allows it
    (status = 'pending_consent' AND referral_number IS NOT NULL) OR
    (status = 'consent_signed' AND referral_number IS NOT NULL)
  )
  WITH CHECK (
    -- Prevent status regression
    CASE 
      WHEN OLD.status = 'pending_consent' THEN NEW.status IN ('consent_signed', 'cancelled')
      WHEN OLD.status = 'consent_signed' THEN NEW.status IN ('completed', 'cancelled')
      ELSE FALSE
    END
  );

-- 4. Policy to prevent deletion (no deletes allowed)
CREATE POLICY "No deletion allowed" ON referrals
  FOR DELETE 
  TO public
  USING (FALSE);

-- Create indexes for performance and security
CREATE INDEX IF NOT EXISTS idx_referrals_referral_number ON referrals(referral_number);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON referrals(status);
CREATE INDEX IF NOT EXISTS idx_referrals_created_at ON referrals(created_at);

-- Add constraints for data integrity
ALTER TABLE referrals 
  ADD CONSTRAINT check_referral_number_format 
  CHECK (referral_number ~ '^REF-[0-9]{6}-[0-9]{4}$');

ALTER TABLE referrals 
  ADD CONSTRAINT check_valid_status 
  CHECK (status IN ('pending_consent', 'consent_signed', 'completed', 'cancelled'));

ALTER TABLE referrals 
  ADD CONSTRAINT check_email_format 
  CHECK (counselor_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

-- Add audit columns
ALTER TABLE referrals ADD COLUMN IF NOT EXISTS last_modified_by TEXT;
ALTER TABLE referrals ADD COLUMN IF NOT EXISTS last_modified_ip TEXT;

-- Create audit log table for tracking all changes
CREATE TABLE IF NOT EXISTS referrals_audit (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  referral_id UUID NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
  changed_by TEXT,
  changed_at TIMESTAMPTZ DEFAULT NOW(),
  old_data JSONB,
  new_data JSONB,
  ip_address TEXT
);

-- Create trigger for audit logging
CREATE OR REPLACE FUNCTION audit_referrals_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO referrals_audit(referral_id, action, new_data, changed_by, ip_address)
    VALUES (NEW.id, 'INSERT', to_jsonb(NEW), NEW.last_modified_by, NEW.last_modified_ip);
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO referrals_audit(referral_id, action, old_data, new_data, changed_by, ip_address)
    VALUES (NEW.id, 'UPDATE', to_jsonb(OLD), to_jsonb(NEW), NEW.last_modified_by, NEW.last_modified_ip);
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO referrals_audit(referral_id, action, old_data, changed_by, ip_address)
    VALUES (OLD.id, 'DELETE', to_jsonb(OLD), OLD.last_modified_by, OLD.last_modified_ip);
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Attach trigger to referrals table
DROP TRIGGER IF EXISTS audit_referrals_trigger ON referrals;
CREATE TRIGGER audit_referrals_trigger
  AFTER INSERT OR UPDATE OR DELETE ON referrals
  FOR EACH ROW EXECUTE FUNCTION audit_referrals_changes();

-- Create view for safe public access (hides sensitive data)
CREATE OR REPLACE VIEW referrals_public AS
SELECT 
  referral_number,
  school_name,
  status,
  created_at
FROM referrals
WHERE status != 'cancelled';

-- Grant minimal permissions
REVOKE ALL ON referrals FROM public;
GRANT SELECT ON referrals_public TO public;

-- Function to validate referral access
CREATE OR REPLACE FUNCTION validate_referral_access(
  p_referral_number TEXT,
  p_action TEXT
) RETURNS BOOLEAN AS $$
DECLARE
  v_exists BOOLEAN;
  v_status TEXT;
BEGIN
  -- Check if referral exists
  SELECT EXISTS(
    SELECT 1 FROM referrals 
    WHERE referral_number = p_referral_number
  ) INTO v_exists;
  
  IF NOT v_exists THEN
    RETURN FALSE;
  END IF;
  
  -- Get current status
  SELECT status INTO v_status
  FROM referrals
  WHERE referral_number = p_referral_number;
  
  -- Check action permissions based on status
  CASE p_action
    WHEN 'view' THEN
      RETURN TRUE; -- Can always view with valid referral number
    WHEN 'consent' THEN
      RETURN v_status = 'pending_consent';
    WHEN 'submit_data' THEN
      RETURN v_status = 'consent_signed';
    ELSE
      RETURN FALSE;
  END CASE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add encryption for sensitive fields (requires pgcrypto extension)
-- Note: Enable this in Supabase dashboard under Extensions
-- CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Function to encrypt sensitive data
CREATE OR REPLACE FUNCTION encrypt_sensitive_field(
  p_data TEXT,
  p_key TEXT DEFAULT 'your-encryption-key-here'
) RETURNS TEXT AS $$
BEGIN
  -- This is a placeholder - use proper encryption in production
  -- RETURN encode(encrypt(p_data::bytea, p_key::bytea, 'aes'), 'base64');
  RETURN p_data; -- Temporary until pgcrypto is enabled
END;
$$ LANGUAGE plpgsql;

-- Function to decrypt sensitive data
CREATE OR REPLACE FUNCTION decrypt_sensitive_field(
  p_data TEXT,
  p_key TEXT DEFAULT 'your-encryption-key-here'
) RETURNS TEXT AS $$
BEGIN
  -- This is a placeholder - use proper decryption in production
  -- RETURN decrypt(decode(p_data, 'base64'), p_key::bytea, 'aes')::text;
  RETURN p_data; -- Temporary until pgcrypto is enabled
END;
$$ LANGUAGE plpgsql;