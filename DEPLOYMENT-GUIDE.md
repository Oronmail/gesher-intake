# Deployment Guide - Gesher Intake System

## 📋 Prerequisites

Before deploying, ensure you have:
1. GitHub account
2. Vercel account (free tier works)
3. Supabase account (free tier works)
4. Resend account for email service (free tier works)

## 🚀 Quick Deployment Steps

### Step 1: Fork/Clone Repository

```bash
git clone https://github.com/Oronmail/gesher-intake.git
cd gesher-intake
```

### Step 2: Set up Supabase Database

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run the schema:

```sql
CREATE TABLE referrals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  referral_number TEXT UNIQUE NOT NULL,
  school_id TEXT,
  school_name TEXT,
  counselor_name TEXT,
  counselor_email TEXT,
  parent_email TEXT,
  parent_phone TEXT,
  signature_image TEXT,
  signature_image2 TEXT,
  parent_names TEXT,
  consent_timestamp TIMESTAMPTZ,
  status TEXT DEFAULT 'pending_consent',
  salesforce_contact_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '72 hours'
);

-- Enable Row Level Security
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

-- Create policy for anonymous access (adjust as needed)
CREATE POLICY "Allow anonymous access" ON referrals
  FOR ALL USING (true);

-- Create index for faster lookups
CREATE INDEX idx_referral_number ON referrals(referral_number);
CREATE INDEX idx_status ON referrals(status);
```

3. Get your credentials from Project Settings → API:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_KEY` (from Service Role key)

### Step 3: Set up Resend Email Service

1. Sign up at [resend.com](https://resend.com)
2. Get your API key from the dashboard
3. Note: Use `onboarding@resend.dev` as sender for testing
4. For production: Verify your domain and use custom sender

### Step 3.5: Set up ActiveTrail SMS Service (Optional)

1. Get ActiveTrail API key from your account
2. Configure SMS settings in environment variables
3. Test SMS with: `node test-sms.js 0501234567`
4. SMS will automatically send when parent phone is provided

### Step 4: Deploy to Vercel

#### Option A: One-Click Deploy
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Oronmail/gesher-intake)

#### Option B: Manual Deploy

1. Push code to your GitHub repository
2. Go to [vercel.com](https://vercel.com)
3. Import your GitHub repository
4. Configure environment variables (see below)
5. Deploy

### Step 5: Configure Environment Variables in Vercel

Add these environment variables in Vercel dashboard:

```env
# Supabase Configuration (Required)
NEXT_PUBLIC_SUPABASE_URL=https://[your-project].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[your-anon-key]
SUPABASE_SERVICE_KEY=[your-service-key]

# Email Service (Required)
RESEND_API_KEY=[your-resend-api-key]

# SMS Service (Optional but Recommended)
ACTIVETRAIL_API_KEY=[your-activetrail-api-key]
ACTIVETRAIL_BASE_URL=https://webapi.mymarketing.co.il
ACTIVETRAIL_SENDER_ID=GesherYouth

# Application URL (Required)
NEXT_PUBLIC_APP_URL=https://[your-app].vercel.app

# Salesforce (Optional - for future integration)
SALESFORCE_USERNAME=[optional]
SALESFORCE_PASSWORD=[optional]
SALESFORCE_SECURITY_TOKEN=[optional]
```

## 🔧 Configuration Details

### Email Templates

The system uses Hebrew email templates located in `/src/lib/email.ts`:

1. **Parent Consent Email**
   - Subject: "טופס ויתור סודיות - גשר אל הנוער"
   - Sent to parent when counselor initiates referral
   - Contains consent form link

2. **Counselor Notification**
   - Subject: "הסכמת הורים התקבלה - [Student Name]"
   - Sent to counselor after parent signs
   - Contains student data form link

### Custom Domain (Optional)

1. Add custom domain in Vercel dashboard
2. Update DNS records as instructed
3. Update `NEXT_PUBLIC_APP_URL` environment variable

### SSL/Security

- Vercel provides automatic SSL certificates
- All forms use HTTPS in production
- Signatures encrypted in transit

## 📊 Database Management

### Automatic Cleanup
Referrals expire after 72 hours. To set up automatic cleanup:

```sql
-- Optional: Create function to delete expired records
CREATE OR REPLACE FUNCTION delete_expired_referrals()
RETURNS void AS $$
BEGIN
  DELETE FROM referrals WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Optional: Schedule cleanup (requires pg_cron extension)
SELECT cron.schedule('cleanup-expired-referrals', '0 2 * * *', 
  'SELECT delete_expired_referrals();');
```

### Backup Strategy
- Supabase provides automatic daily backups (paid plans)
- Export data regularly via Supabase dashboard
- Consider implementing Salesforce sync for permanent storage

## 🧪 Testing Production

1. **Test Counselor Form**:
   - Go to https://[your-app].vercel.app
   - Fill counselor form with test email
   - Check for referral number

2. **Test Parent Consent**:
   - Check email for consent link
   - Complete digital signature
   - Verify consent recorded

3. **Test Student Form**:
   - Check counselor email for student form link
   - Complete 7-step form
   - Verify data in Supabase dashboard

## 🐛 Troubleshooting

### Common Issues

1. **Emails not sending**:
   - Verify RESEND_API_KEY is correct
   - Check Resend dashboard for errors
   - Ensure sender email is verified

2. **Database connection failed**:
   - Verify Supabase credentials
   - Check Row Level Security policies
   - Ensure tables are created

3. **Forms not submitting**:
   - Check browser console for errors
   - Verify API routes are accessible
   - Check Vercel function logs

### Monitoring

- **Vercel Dashboard**: View deployments, errors, and analytics
- **Supabase Dashboard**: Monitor database usage and queries
- **Resend Dashboard**: Track email delivery status

## 📱 Mobile Testing

Test on various devices:
- iOS Safari
- Android Chrome
- Tablet browsers
- Desktop browsers

Key areas to test:
- Signature pad touch responsiveness
- Form navigation
- RTL text display
- Hebrew input fields

## 🔄 Updates and Maintenance

### Deploying Updates

```bash
# Make changes locally
git add .
git commit -m "Update description"
git push origin main

# Vercel auto-deploys from main branch
```

### Rolling Back

1. Go to Vercel dashboard
2. View deployments history
3. Promote previous deployment to production

## 📞 Support Resources

- **Vercel Docs**: https://vercel.com/docs
- **Supabase Docs**: https://supabase.com/docs
- **Resend Docs**: https://resend.com/docs
- **Project Docs**: See CLAUDE.md for technical details

## ✅ Production Checklist

Before going live:

- [ ] Test complete workflow end-to-end
- [ ] Verify Hebrew text displays correctly
- [ ] Test on mobile devices
- [ ] Confirm email delivery
- [ ] Check database connections
- [ ] Review security settings
- [ ] Test signature capture
- [ ] Verify form validations
- [ ] Check error handling
- [ ] Document admin procedures

## 🎉 Launch!

Once everything is tested and working:

1. Share the production URL with the organization
2. Provide training materials for counselors
3. Monitor initial usage for issues
4. Gather feedback for improvements

---

*For technical implementation details, see [CLAUDE.md](./CLAUDE.md)*
*For general information, see [README.md](./README.md)*