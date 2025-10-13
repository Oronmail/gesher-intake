-- Add warm_home_destination column to referrals table
ALTER TABLE referrals
ADD COLUMN IF NOT EXISTS warm_home_destination TEXT;

-- Update the column to have a comment for documentation
COMMENT ON COLUMN referrals.warm_home_destination IS 'The designated warm home location for the referral';