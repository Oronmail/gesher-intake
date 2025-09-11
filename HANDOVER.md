# 📋 Gesher Intake System - Handover Documentation
## For: גשר אל הנוער (Gesher Al HaNoar)

---

## 🌐 Production Access

### Live Application
- **URL**: https://gesher-intake.vercel.app
- **Status**: ✅ Fully operational and ready for use
- **Platform**: Hosted on Vercel (automatic deployments from GitHub)

### GitHub Repository
- **URL**: https://github.com/Oronmail/gesher-intake
- **Access**: Private repository (contact maintainer for access)

---

## 🔑 Required Environment Variables

Configure these in Vercel Dashboard → Settings → Environment Variables:

```env
# Database (Supabase)
NEXT_PUBLIC_SUPABASE_URL=        # Your Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=   # Supabase anonymous key
SUPABASE_SERVICE_KEY=             # Supabase service key

# Email Service (Gmail)
GMAIL_USER=                       # Gmail address (e.g., gesheryouth@gmail.com)
GMAIL_APP_PASSWORD=               # Gmail app-specific password

# SMS Service (Inwise)
INWISE_API_KEY=                   # Inwise API key
INWISE_BASE_URL=https://webapi.mymarketing.co.il
INWISE_SENDER_ID=GesherYouth

# Salesforce Integration
SALESFORCE_CLIENT_ID=             # Connected App Consumer Key
SALESFORCE_USERNAME=              # Salesforce username
SALESFORCE_LOGIN_URL=https://test.salesforce.com
SALESFORCE_INSTANCE_URL=          # Your Salesforce instance URL
SALESFORCE_PRIVATE_KEY=           # JWT certificate private key (single line with \n)

# Application
NEXT_PUBLIC_APP_URL=https://gesher-intake.vercel.app
```

---

## 👨‍💻 Maintenance Support

### Developer Contact
- **Name**: Oron Mizrachi
- **Company**: D2R Internet Holdings, LLC
- **Support Period**: 12 months from delivery
- **Response Time**: Within 48 hours for critical issues

### Support Includes
- Bug fixes and critical updates
- Security patches
- Technical consultation
- Minor feature adjustments

---

## 📅 Monthly Maintenance Checklist

### Every Month
1. **Check System Health**
   - Visit https://gesher-intake.vercel.app
   - Test form submission workflow
   - Verify email notifications are working

2. **Database Maintenance**
   - Login to Supabase dashboard
   - Check referrals table for old records (auto-deleted after 72 hours)
   - Monitor database usage (free tier: 500MB)

3. **Email Service**
   - Check Gmail account for any bounce-backs
   - Verify app password is still valid

4. **Salesforce Sync**
   - Verify Registration_Request__c records are being created
   - Check for any sync errors in Vercel logs

---

## 🚨 Emergency Procedures

### If Forms Stop Working
1. Check Vercel dashboard for deployment status
2. Verify environment variables are set correctly
3. Check Supabase dashboard for database status
4. Contact developer if issue persists

### If Emails Not Sending
1. Verify Gmail app password is valid
2. Check Gmail account isn't blocked/suspended
3. Regenerate app password if needed:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate new password for "Mail"
   - Update GMAIL_APP_PASSWORD in Vercel

### If Database Full (500MB limit)
1. Login to Supabase dashboard
2. Check referrals table size
3. Manually delete old records if needed
4. Consider upgrading to paid plan if recurring issue

---

## 🔄 Backup & Recovery

### Data Backup
- **Automatic**: Supabase keeps 7 days of backups (paid plans only)
- **Manual**: Export data from Supabase dashboard → Table Editor → Export

### Code Backup
- **GitHub**: All code automatically backed up
- **Local**: Keep copy of `.env.local` file with credentials

### Recovery Process
1. **Database**: Restore from Supabase backup or re-run schema
2. **Application**: Redeploy from GitHub via Vercel
3. **Credentials**: Re-enter environment variables in Vercel

---

## 📊 Usage Monitoring

### Vercel Dashboard
- **URL**: https://vercel.com (login required)
- **Metrics**: Page views, function invocations, errors
- **Logs**: Real-time application logs

### Supabase Dashboard
- **URL**: https://supabase.com (login required)
- **Metrics**: Database usage, API requests
- **Data**: View and manage referrals table

### Salesforce Reports
- Create reports on Registration_Request__c object
- Track conversion rates and processing times

---

## 🛠️ Common Tasks

### Update Organization Logo
1. Replace `/public/logo.png` with new image
2. Keep dimensions around 200x100px
3. Push to GitHub - auto-deploys to production

### Change Email Templates
1. Edit `/src/lib/email.ts`
2. Modify HTML templates in functions
3. Test locally first
4. Push to GitHub when ready

### Adjust Form Fields
1. Locate form component in `/src/components/`
2. Update field definitions
3. Update validation schema if needed
4. Test thoroughly before deploying

---

## 📚 Technical Documentation

### For Developers
- **CLAUDE.md**: Complete technical documentation
- **DEPLOYMENT-GUIDE.md**: Deployment instructions
- **TROUBLESHOOTING.md**: Common issues and solutions
- **IMAGE-CONSENT-SYSTEM.md**: Consent image generation details

### Technology Stack
- Frontend: Next.js 15.5 with TypeScript
- Database: Supabase (PostgreSQL)
- Email: Gmail SMTP via Nodemailer
- SMS: Inwise API
- CRM: Salesforce with JWT authentication
- Hosting: Vercel

---

## ✅ Production Readiness Checklist

Before going live, verify:
- [ ] All environment variables configured in Vercel
- [ ] Gmail app password generated and tested
- [ ] Supabase database tables created
- [ ] Salesforce Registration_Request__c object deployed
- [ ] JWT certificate uploaded to Salesforce Connected App
- [ ] Test full workflow (counselor → parent → student → Salesforce)
- [ ] Hebrew text displays correctly
- [ ] Signatures capture properly on mobile
- [ ] Emails and SMS sending successfully

---

## 📞 Quick Support Contacts

### Technical Emergency
- **Developer**: Oron Mizrachi
- **Response**: Within 48 hours

### Service Providers
- **Vercel Support**: https://vercel.com/support
- **Supabase Support**: https://supabase.com/support
- **Gmail Issues**: Google Workspace support

---

## 🎉 Thank You

This system was developed pro bono for גשר אל הנוער to help streamline the student intake process and better serve at-risk youth in Israel.

We're honored to support your important mission of providing free tutoring and family support services.

---

*Last Updated: January 2025*
*Version: 1.0.0 Production Release*