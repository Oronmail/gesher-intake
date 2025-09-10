# Gesher Al HaNoar - Digital Intake System

🔗 **Live Production**: https://gesher-intake.vercel.app  
📅 **Last Updated**: January 10, 2025  
✅ **Status**: Fully Operational  
📧 **Email Service**: Gmail SMTP (gesheryouth@gmail.com)

A privacy-compliant digital intake system for Gesher Al HaNoar (גשר אל הנוער), a non-profit organization providing free tutoring and family support to at-risk youth in Israel.

## 🎯 Overview

This system digitizes the student referral process, replacing paper forms with a secure, efficient digital workflow that ensures parental consent before any student data is collected.

## 🚀 Features

- **Privacy-First Design**: No student data collected before parental consent
- **Auto Data Cleanup**: Personal data deleted from Supabase after Salesforce submission
- **Digital Signatures**: Secure electronic signature capture for parents
- **Hebrew Interface**: Full RTL support with Hebrew UI
- **Gmail SMTP Integration**: Reliable email delivery via dedicated Gmail account
- **Mobile Responsive**: Works on all devices with optimized mobile navigation
- **Multi-Step Forms**: Comprehensive data collection with validation
- **Production Ready**: Deployed on Vercel with Supabase database
- **Mock Database**: Built-in testing mode for development
- **Salesforce Integration**: Direct sync with Registration_Request__c object
- **JWT Authentication**: Fully automated server-to-server authentication
- **Page Layouts**: Custom Salesforce layouts for data visualization
- **SMS Support**: Automatic Israeli phone number formatting and Hebrew SMS (Inwise)
- **Modern UI/UX**: Beautiful gradient designs with smooth transitions
- **Progress Indicators**: Mobile-optimized progress bar, desktop circular navigation
- **Security Hardened**: Rate limiting, CORS protection, input sanitization

## 🔄 Workflow

1. **Counselor Initiation**: School counselor enters parent contact info
2. **Parent Consent**: Parents digitally sign privacy waiver
3. **Data Collection**: Counselor fills comprehensive student form
4. **Processing**: Data sent to organization's Salesforce CRM

## 🛠️ Technology Stack

- **Framework**: Next.js 15.5 with TypeScript
- **Styling**: Tailwind CSS
- **Forms**: React Hook Form + Zod validation
- **Signatures**: React Signature Canvas
- **Database**: Supabase (production) or built-in mock
- **Email Service**: Gmail SMTP (primary) via nodemailer
- **SMS Service**: Inwise (Israeli SMS provider)
- **CRM**: Salesforce with JWT Bearer authentication
- **Hosting**: Vercel
- **Repository**: GitHub (Oronmail/gesher-intake)

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/Oronmail/gesher-intake.git

# Install dependencies
npm install

# Set up environment variables (optional for local testing)
cp .env.local.example .env.local

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 🔧 Configuration

The system works out-of-the-box with a mock database for testing. For production:

### Environment Variables

Create a `.env.local` file:

```env
# Supabase (Required for production)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_key

# Email Service - Gmail SMTP (Required for notifications)
GMAIL_USER=gesheryouth@gmail.com
GMAIL_APP_PASSWORD=your_16_char_app_password

# Salesforce JWT Authentication (Automated)
SALESFORCE_CLIENT_ID=your_connected_app_consumer_key
SALESFORCE_USERNAME=your_salesforce_username
SALESFORCE_LOGIN_URL=https://test.salesforce.com

# Certificate files (in certs/ directory)
# - server.key (private key for JWT signing)
# - server.crt (upload to Salesforce Connected App)

# Application URL
NEXT_PUBLIC_APP_URL=https://gesher-intake.vercel.app
```

## 🧪 Testing

The application includes a mock database for local testing. No external services required!

1. Start the development server
2. Fill out the counselor form
3. Check console for parent consent URL
4. Complete parent signature
5. Check console for student form URL
6. Fill student data form

## 📝 Forms

### Counselor Initial Form
- Counselor details
- School information
- Parent contact (phone/email)

### Parent Consent Form
- Student name
- Parent details and ID
- Digital signatures (up to 2 parents)
- Privacy waiver agreement

### Student Data Form (7 Steps)
1. Personal Information
2. Family Background
3. School Details
4. Intake Assessment
5. Learning Evaluation
6. Risk Assessment
7. Final Recommendation

## 🚀 Deployment

### Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Oronmail/gesher-intake)

1. Click the deploy button above
2. Connect your GitHub account
3. Configure environment variables (optional)
4. Deploy!

## 📱 Mobile Support

All forms are fully responsive and optimized for mobile devices:

- **Student Form Navigation**: 
  - Mobile: Compact progress bar showing "Step X/7" with current step title
  - Desktop: Full circular navigation with all 7 steps visible
  - Tablet: Optimized circle sizes for medium screens
- **Touch-Friendly**: Large buttons and signature pads
- **Field Work Ready**: Enables data collection on-site

## 🔒 Privacy & Security

- **No student data collected without consent**
- **Automatic data cleanup**: Personal data removed from Supabase after completion
- **Minimal data retention**: Only referral ID and status kept for link validation
- **Input validation**: Comprehensive sanitization and Israeli ID validation
- **Rate limiting**: 100 requests per minute per IP
- **Security headers**: HSTS, CSP, X-Frame-Options
- **Signatures stored securely**
- **Data encrypted in transit**
- **Temporary storage auto-expires**
- **GDPR/Privacy compliant workflow**

## 📧 Email Notifications

The system uses Gmail SMTP for reliable email delivery:

### Configuration
1. **Gmail Account**: gesheryouth@gmail.com (dedicated account)
2. **Authentication**: App Password (2-factor authentication required)
3. **Sender Name**: "גשר אל הנוער" (configured in Gmail settings)
4. **Daily Limit**: 500 emails (sufficient for intake system)

### Automated Emails
1. **Parent Consent Request**: Sent when counselor initiates referral
   - Subject: "טופס ויתור סודיות - גשר אל הנוער"
   - Contains consent form link
   - No external images (uses gradient header for better deliverability)

2. **Counselor Notification**: Sent when parent signs consent
   - Subject: "הסכמת הורים התקבלה - [Student Name]"
   - Contains student data form link
   - Plain text + HTML versions for compatibility

## 🤝 Contributing

This is a pro bono project. Contributions are welcome to help improve the system for the organization.

## 📄 License

MIT License - Free to use and modify

## 🙏 Acknowledgments

Developed pro bono for Gesher Al HaNoar (גשר אל הנוער) to support their mission of helping at-risk youth in Israel.

## 🆕 Recent Updates (January 2025)

### Gmail SMTP Migration
- Switched from Resend to Gmail SMTP for email delivery
- Dedicated account: gesheryouth@gmail.com
- Improved email deliverability without domain verification
- App Password authentication for security

### Privacy Enhancements
- Automatic deletion of personal data from Supabase after Salesforce submission
- Only minimal record (referral ID, status) retained
- Prevents link reuse while maximizing privacy

### Mobile Navigation Improvements
- Student form: New compact progress bar for mobile devices
- Shows "Step X/7" with current step title
- Horizontal progress indicator below
- Desktop view unchanged with circular navigation

### Security Hardening
- Rate limiting implementation
- CORS protection
- Input validation and sanitization
- Security headers added

---

**For technical documentation and development details, see:**
- [CLAUDE.md](./CLAUDE.md) - Comprehensive project documentation
- [JWT_AUTHENTICATION.md](./JWT_AUTHENTICATION.md) - JWT Bearer setup guide
- [SF_INTEGRATION.md](./SF_INTEGRATION.md) - Salesforce integration details
- [SECURITY.md](./SECURITY.md) - Security implementation details
- [SMS-INTEGRATION.md](./SMS-INTEGRATION.md) - SMS service setup
