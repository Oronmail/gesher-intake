-- Add counselor_mobile field to referrals table
ALTER TABLE referrals
ADD COLUMN IF NOT EXISTS counselor_mobile TEXT;

-- Add comment for documentation
COMMENT ON COLUMN referrals.counselor_mobile IS 'Counselor mobile phone number for SMS notifications';
