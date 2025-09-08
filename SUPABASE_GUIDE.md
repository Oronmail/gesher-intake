# Supabase Database Guide - Gesher Intake System

## 1. Accessing Supabase Dashboard

1. Navigate to: https://fftnsfaakvahqyfwhtku.supabase.co
2. Sign in to your Supabase account
3. Select the Gesher intake project

## 2. Viewing Referrals Table

1. In the left sidebar, click **"Table Editor"**
2. Select the **"referrals"** table
3. View all records with their current status and details

## 3. Running SQL Queries

1. In the left sidebar, click **"SQL Editor"**
2. Click **"New query"** to create a new SQL query
3. Write your query and click **"Run"** to execute

## 4. Filtering and Searching Records

### Using Table Editor:
- Use the **search bar** at the top to search across all columns
- Click column headers to **sort** by that field
- Use the **filter icon** next to column headers for specific filters

### Using SQL WHERE clauses:
```sql
-- Filter by status
SELECT * FROM referrals WHERE status = 'pending_consent';

-- Search by school name
SELECT * FROM referrals WHERE school_name ILIKE '%school_name%';

-- Filter by date range
SELECT * FROM referrals WHERE created_at >= '2024-01-01';
```

## 5. Useful SQL Queries for Referral Status

### View all referrals by status:
```sql
SELECT 
  referral_number,
  school_name,
  counselor_name,
  status,
  created_at,
  expires_at
FROM referrals 
ORDER BY created_at DESC;
```

### Count referrals by status:
```sql
SELECT status, COUNT(*) as count 
FROM referrals 
GROUP BY status 
ORDER BY count DESC;
```

### Check pending consents (may expire soon):
```sql
SELECT 
  referral_number,
  school_name,
  parent_phone,
  created_at,
  expires_at,
  (expires_at - NOW()) as time_remaining
FROM referrals 
WHERE status = 'pending_consent'
ORDER BY expires_at ASC;
```

### View recent completed referrals:
```sql
SELECT 
  referral_number,
  school_name,
  counselor_name,
  parent_names,
  salesforce_contact_id,
  consent_timestamp,
  updated_at
FROM referrals 
WHERE status = 'completed'
ORDER BY updated_at DESC
LIMIT 20;
```

### Find referrals by counselor:
```sql
SELECT 
  referral_number,
  school_name,
  status,
  created_at,
  parent_phone
FROM referrals 
WHERE counselor_email = 'counselor@example.com'
ORDER BY created_at DESC;
```

### Check expired referrals:
```sql
SELECT 
  referral_number,
  school_name,
  status,
  expires_at,
  (NOW() - expires_at) as expired_by
FROM referrals 
WHERE expires_at < NOW() 
AND status NOT IN ('completed', 'cancelled')
ORDER BY expires_at DESC;
```

## Referral Status Values

- **`pending_consent`**: Waiting for parent to sign consent form
- **`consent_signed`**: Parent signed, ready for student data collection  
- **`completed`**: Referral fully processed and sent to Salesforce
- **`cancelled`**: Referral was cancelled

## Important Notes

- Referrals auto-expire after **72 hours** if not completed
- Expired referrals are automatically cleaned up (unless completed/cancelled)
- All referrals have a unique `referral_number` for tracking
- Salesforce integration stores the contact ID after completion