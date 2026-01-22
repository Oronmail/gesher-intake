# Gesher Al HaNoar - Digital Intake System
## Comprehensive Project Documentation for Claude

---

## 🚀 CRITICAL: CLI CONTROL & AUTOMATION REQUIREMENTS

### ALWAYS Maintain Active CLI Connections
**IMPORTANT**: Claude must maintain and verify CLI connections at session start and prefer automated CLI actions over manual instructions.

### Quick Status Check
```bash
# Run this at session start
./verify-connections.sh
```

#### Required CLI Authentication Status:
1. **Salesforce (SF CLI)**: 
   - Check: `sf org list`
   - Default org: `gesher-sandbox` (oronmail@geh.com.partialsb)
   - If disconnected: `sf auth:web:login -a gesher-sandbox`

2. **Vercel CLI**:
   - Check: `vercel whoami`
   - Expected: `oronmail`
   - If disconnected: `vercel login` (select GitHub)

3. **GitHub**:
   - Repository: `https://github.com/Oronmail/gesher-intake`
   - Check: `git remote -v`
   - Auto-push allowed: YES

4. **Supabase Database**:
   - Use: `node supabase-query.js` for queries
   - Connection via API (no CLI needed)
   - Service key in `.env.local`

5. **Production Monitoring**:
   - Live URL: `https://gesher-intake.vercel.app`
   - Check: `curl -s https://gesher-intake.vercel.app | grep -o '<title>.*</title>'`

### Automation Preferences
**ALWAYS prefer automated CLI actions:**
- ✅ Deploy via `vercel --prod` instead of "go to dashboard"
- ✅ Query DB via `node supabase-query.js` instead of "check Supabase dashboard"
- ✅ Create SF records via `node test-jwt.js` instead of manual creation
- ✅ Push to GitHub via `git push` instead of manual upload
- ✅ Test locally via `npm run dev` instead of production testing

### Session Start Checklist
Run these commands at the beginning of each session:
```bash
# 1. Verify all connections
sf org list | grep gesher-sandbox
vercel whoami
git status
node test-jwt.js | grep "JWT Bearer Authentication is working"

# 2. Check production status
curl -s https://gesher-intake.vercel.app | grep -o '<title>.*</title>'

# 3. Database status
node supabase-query.js | grep "Total Records"
```

### Connection Maintenance Scripts
Use `verify-connections.sh` to check all services:
```bash
./verify-connections.sh
```

### Automated Actions Reference

#### Instead of Manual Dashboard Actions, Use:

| Manual Action | ❌ AVOID | ✅ USE INSTEAD |
|--------------|----------|----------------|
| "Check Vercel dashboard" | Dashboard UI | `vercel list --yes` |
| "Deploy to production" | Vercel UI | `vercel --prod` |
| "Check Supabase data" | Supabase dashboard | `node supabase-query.js` |
| "Create test record in SF" | Salesforce UI | `node test-jwt.js` |
| "Push code to GitHub" | GitHub web upload | `git add . && git commit -m "msg" && git push` |
| "Check deployment status" | Vercel dashboard | `vercel list --yes \| head -5` |
| "View error logs" | Vercel Functions tab | `vercel logs --yes` |
| "Test locally" | Production testing | `npm run dev` |
| "Query specific records" | SQL Editor | `node query-supabase.js "SELECT..."` |
| "Check build status" | GitHub Actions | `git log --oneline -5` |

#### Quick Action Commands

```bash
# Deploy immediately
vercel --prod --yes

# Query database
node supabase-query.js

# Test full workflow
npm run dev
# Then test at http://localhost:3000

# Check all connections
./verify-connections.sh

# View recent deployments
vercel list --yes | head -10

# Salesforce operations
node test-jwt.js              # Test connection
sf data query --query "SELECT Id, Name, Status__c FROM Registration_Request__c LIMIT 5" -o gesher-sandbox

# Git operations (auto-allowed)
git add .
git commit -m "Update: [description]"
git push origin main
```

---

## 🎯 Project Overview

### Client
- **Organization**: גשר אל הנוער (Gesher Al HaNoar) - "Bridge to Youth"
- **Type**: Non-profit organization in Israel
- **Service**: Provides free tutoring and family support to at-risk youth
- **Pro Bono Project**: Developed free of charge for the organization

### Problem Statement
The organization currently uses a paper-based referral system where:
1. Schools/counselors fill hardcopy request forms
2. Forms are physically passed to parents for signature
3. House managers manually process and enter data
4. No digital tracking or pipeline visibility
5. Slow, inefficient process taking days

### Solution
A privacy-compliant digital workflow system that:
1. Digitizes the entire referral process
2. Ensures parental consent before data collection
3. Integrates with Salesforce CRM
4. Provides real-time pipeline tracking
5. Reduces processing time from days to hours

---

## 🏗️ Architecture & Technical Stack

### Technology Choices
- **Frontend**: Next.js 15.5.2 with TypeScript
- **Styling**: Tailwind CSS
- **Forms**: React Hook Form + Zod validation
- **Signatures**: React Signature Canvas
- **Image Generation**: html2canvas (PNG from HTML)
- **Database**: Supabase (Project: fftnsfaakvahqyfwhtku.supabase.co)
- **Email Service**: Gmail SMTP (gesheryouth@gmail.com)
- **SMS Service**: Inwise (Optional - when parent phone provided)
- **SMS API**: https://webapi.mymarketing.co.il
- **Final Storage**: Salesforce with ContentDocument API
- **Hosting**: Vercel (https://gesher-intake.vercel.app)
- **Repository**: GitHub (Oronmail/gesher-intake)
- **Cost**: $0 (completely free solution)

### Project Structure
```
gesher-intake/
├── src/
│   ├── app/                        # Next.js app router
│   │   ├── api/                    # API endpoints
│   │   │   └── referrals/          # Referral management APIs
│   │   │       ├── initiate/       # Start new referral
│   │   │       ├── consent/        # Handle consent submission
│   │   │       └── student-data/   # Process student data
│   │   ├── consent/[referralNumber]/  # Parent consent page
│   │   ├── student-form/[referralNumber]/ # Student data form
│   │   └── page.tsx                # Home page (counselor form)
│   ├── components/                 # React components
│   │   ├── CounselorInitialForm.tsx
│   │   ├── ParentConsentForm.tsx
│   │   ├── StudentDataForm.tsx
│   │   ├── SignaturePad.tsx
│   │   └── Logo.tsx
│   ├── lib/                        # Utilities
│   │   ├── supabase.ts            # Supabase client
│   │   └── supabase-mock.ts       # Mock for local testing
│   └── types/                      # TypeScript definitions
│       └── forms.ts                # Form interfaces
├── public/
│   └── logo.png                    # Organization logo
└── supabase-schema.sql            # Database schema
```

---

## 🔐 Security Architecture

### Security Layers Implemented
The system now includes enterprise-grade security measures to protect sensitive student and family data:

#### 1. Network Security
- **Rate Limiting**: 100 requests per minute per IP address
- **CORS Protection**: Strict origin validation, only allowing configured domains
- **Security Headers**: 
  - HSTS (Strict-Transport-Security) for HTTPS enforcement
  - CSP (Content-Security-Policy) to prevent XSS attacks
  - X-Frame-Options to prevent clickjacking
  - X-Content-Type-Options to prevent MIME sniffing
  - Referrer-Policy for privacy protection

#### 2. Input Validation & Sanitization
- **Comprehensive validation**: All user inputs validated and sanitized
- **Israeli ID validation**: Algorithm to verify valid Israeli identity numbers
- **SQL injection prevention**: Parameterized queries and input escaping
- **XSS protection**: HTML entity encoding and content sanitization
- **Type checking**: Strict TypeScript types with runtime validation

#### 3. Data Protection
- **Encryption at rest**: AES-256-GCM encryption for sensitive data
- **Encryption in transit**: HTTPS enforced for all communications
- **Secure key management**: Separate encryption keys rotated regularly
- **Session security**: Secure session tokens with expiration

#### 4. Database Security (Supabase)
- **Row Level Security (RLS)**: Strict access policies per table
- **Audit logging**: All data modifications logged with timestamps
- **Data retention policies**: Automatic deletion after 72 hours
- **Secure connection strings**: Environment variables for credentials

#### 5. Credential Management
- **Zero hardcoded credentials**: All secrets in environment variables
- **Regular rotation**: Documented process for credential rotation
- **JWT certificates**: RSA-256 signed tokens for Salesforce
- **API key security**: Separate keys for different services

### Security Files Created
- `src/middleware.ts` - Security middleware implementation
- `src/lib/security.ts` - Validation and encryption utilities
- `supabase-secure-rls.sql` - Database security policies
- `SECURITY.md` - Security documentation and checklist
- `ROTATION_STATUS.md` - Credential rotation tracking

### Compliance & Standards
- **GDPR-ready**: Privacy-by-design architecture
- **Israeli Privacy Law**: Compliant with local regulations
- **OWASP Top 10**: Protection against common vulnerabilities
- **Zero Trust**: No implicit trust, verify everything

---

## 🔄 Workflow Implementation

### Privacy-Compliant Data Flow

#### Stage 1: Initiation (Counselor)
- **URL**: `/` (main page)
- **Data Collected**: Parent contact ONLY (no student data) - unless manual consent selected
- **Consent Method Selection**:
  - **Digital (default)**: Sends consent form to parents via email/SMS
  - **Manual**: Counselor confirms they have paper consent, skips to student form
- **Storage**: Creates record in temp DB with status `pending_consent` (digital) or `consent_signed` (manual)
- **Output**: Generates unique referral number (e.g., REF-202412-1234)

#### Stage 1B: Manual Consent Flow (Alternative)
- **When**: Counselor selects "יש בידי טופס הסכמה חתום" (I have signed consent)
- **Confirmation**: Checkbox required: "אני מאשר/ת שיש בידי טופס הסכמה חתום על ידי ההורים"
- **Result**: Skips Stage 2, goes directly to Stage 3 (student form)
- **Tracking**: `Consent_Method__c` field in Salesforce tracks "Digital" vs "Manual (Paper)"

#### Stage 2: Parent Consent (Digital Flow Only)
- **URL**: `/consent/[referralNumber]`
- **Data Collected**: Parent names, IDs, digital signatures
- **Storage**: Updates temp DB with signatures, status `consent_signed`
- **Critical**: No student data visible or collected yet

#### Stage 3: Student Data Collection
- **URL**: `/student-form/[referralNumber]`
- **Access**: Only after parent consent confirmed (digital or manual)
- **Data Collected**: Comprehensive 6-step form with all student details
- **Storage**: Direct to Salesforce, temp DB marked `completed`

#### Stage 4: House Manager Review
- **Location**: Salesforce dashboard
- **Process**: Reviews referral, schedules home visit
- **Mobile**: Form accessible on phone for field data entry

---

## 📝 Forms & Fields

### 1. Counselor Initial Form (CounselorInitialForm.tsx)
```typescript
- counselor_name: string
- counselor_email: string
- counselor_mobile: string
- school_name: string
- warm_home_destination: string ('בן יהודה' | 'כפר שלם' | 'נוה שרת')
- consent_method: 'digital' | 'manual'
- parent_email?: string (optional - required for digital consent)
- parent_phone?: string (optional - required for digital consent)
- manual_consent_confirmed?: boolean (required when consent_method is 'manual')
```

**Consent Method Validation**:
- **Digital**: At least one contact method (email OR phone) is required
- **Manual**: Confirmation checkbox must be checked

**Success Messages**:
- **Digital**: "בקשה לחתימה על טופס ויתור סודיות נשלחה להורים. לאחר חתימתם תישלח התראה ל-[counselor_email] להמשך מילוי נתוני התלמיד"
- **Manual**: "הבקשה נוצרה בהצלחה! כעת ניתן למלא את נתוני התלמיד/ה" + button to student form

### 2. Parent Consent Form (ParentConsentForm.tsx)
```typescript
- student_name: string
- parent1_name: string
- parent1_id: string
- parent1_address?: string
- parent1_phone?: string
- parent1_signature: base64 image
- parent2_name?: string (optional second parent)
- parent2_id?: string
- parent2_address?: string
- parent2_phone?: string
- parent2_signature?: base64 image
```
**Consent Status Check**: The form automatically checks if consent was already signed. If already signed, displays a confirmation page with signature details instead of the form.

### 3. Student Data Form (StudentDataForm.tsx)
**6-Step Wizard Form** (consolidated from 7 steps):

#### Step 1: Personal Information (פרטים אישיים)
- Name, ID, DOB, birthplace, immigration year
- Gender, address, phone numbers
- School system password
- **All fields mandatory**

#### Step 2: Family Information (מידע משפחתי)
- Father details (name*, phone*, occupation*, income) - **All mandatory**
- Mother/Parent 2 details - **Conditional: when name is filled, phone/occupation/profession become mandatory**
- Debts/loans*, parent involvement*, economic status*, economic details*, family background*
- **All marked fields mandatory**

#### Step 3: School Information (פרטי בית ספר)
- School name*, grade*, homeroom teacher*, teacher phone*
- Counselor name*, counselor phone*
- Known to welfare* (כן/לא/לא ידוע) - **Mandatory dropdown**
- Youth promotion* (כן/לא/לא ידוע) - **Mandatory dropdown**

#### Step 4: Intake Assessment + Learning (נתוני קליטה + אבחונים)
- Behavioral issues* (כן/לא/לא ידוע) - **Mandatory dropdown**
- Potential* (כן/לא/לא ידוע) - **Mandatory dropdown**
- Motivation level* (text description)
- Social status*
- Afternoon activities (optional)
- Learning disability* (כן/לא/לא ידוע) - **Mandatory dropdown**
- ADHD* (כן/לא/לא ידוע) - **Mandatory dropdown**
- Assessment done* (כן/לא/לא ידוע) - **Mandatory dropdown**
- Assessment needed* (כן/לא/לא ידוע) - **Mandatory dropdown**

#### Step 5: Risk Assessment (הערכת סיכון)
- Criminal record* (כן/לא/לא ידוע) - **Mandatory dropdown**
- Drug use* (כן/לא/לא ידוע) - **Mandatory dropdown**
- Smoking* (כן/לא/לא ידוע) - **Mandatory dropdown**
- Psychological treatment* (כן/לא/לא ידוע) - **Mandatory dropdown**
- Psychiatric treatment* (כן/לא/לא ידוע) - **Mandatory dropdown**
- Takes medication* (כן/לא/לא ידוע) - **Mandatory dropdown**

#### Step 6: Final Assessment (חוות דעת אישית)
- Military service potential, program suitability (optional dropdowns)
- Risk level* (1-10 radio buttons, no default value - must select)
- Risk factors* (text)
- Personal opinion* (text)
- Grade sheet upload
- Failing grades count + details (subject*, grade*, reason* - **mandatory when count > 0**)

**Note**: Step 6 validates on submit button click (not "Next" like other steps)

---

## 🗄️ Database Schema

### Supabase Temporary Storage
```sql
CREATE TABLE referrals (
  id UUID PRIMARY KEY,
  referral_number TEXT UNIQUE,
  school_id TEXT,
  school_name TEXT,
  counselor_name TEXT,
  counselor_email TEXT,
  parent_email TEXT,
  parent_phone TEXT,
  signature_image TEXT,      -- Parent 1 signature
  signature_image2 TEXT,     -- Parent 2 signature
  parent_names TEXT,
  consent_timestamp TIMESTAMPTZ,
  status TEXT,               -- pending_consent | consent_signed | completed
  salesforce_contact_id TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ     -- Auto-delete after 72 hours
);
```

---

## 📧 Email & SMS Notification System (FULLY OPERATIONAL)

### Email Implementation (Gmail SMTP)
- **Service**: Gmail SMTP (Primary email service)
- **Account**: gesheryouth@gmail.com
- **Authentication**: App Password (16 characters)
- **Templates**: HTML emails with Hebrew RTL support
- **Automation**: Fully automated and tested

### SMS Implementation (Inwise)
- **Service**: Inwise Transactional SMS API
- **API Endpoint**: https://api.inwise.com/rest/v1/transactional/sms/send
- **Authentication**: API Key (Bearer token or X-API-Key header)
- **Hebrew Support**: Unicode charset for Hebrew text
- **Phone Format**: Israeli format (972-XX-XXXXXXX)
- **Status**: ✅ Implemented and ready for testing

### Email Flow
1. **Parent Consent Email**
   - Subject: "טופס ויתור סודיות - גשר אל הנוער"
   - Title: "מועמדות במסגרת עמותת גשר אל הנוער"
   - Says "יועץ משפחה" instead of counselor name
   - Button text: "מילוי טופס"

2. **Counselor Notification**
   - Subject: "הסכמת הורים התקבלה - [Student Name]"
   - Shows "שם התלמיד/ה" instead of reference number
   - Contains student data form link
   - Includes confirmation that consent image was generated

### Configuration
```typescript
// src/lib/email.ts
- sendConsentEmail() - Sends consent link to parent
- sendCounselorNotification() - Notifies counselor of signed consent
```

### Email Setup Requirements
1. Create free account at [Resend.com](https://resend.com)
2. Get API key from dashboard
3. Add to environment variables:
   ```
   RESEND_API_KEY=re_YOUR_API_KEY
   ```
4. For production: Verify domain or use resend.dev sender

### SMS Setup Requirements (Inwise)
1. **Create Inwise Account**: Sign up at [Inwise.com](https://www.inwise.com)
2. **Get API Key**: Find your API key in account settings
3. **Add to Environment Variables**:
   ```env
   INWISE_API_KEY=your_api_token_here
   INWISE_BASE_URL=https://api.inwise.com/rest/v1
   INWISE_SENDER_ID=GesherYouth
   ```
4. **Test SMS Functionality**:
   ```bash
   # Test with Israeli phone number (any format)
   node test-sms.js 0501234567
   node test-sms.js 972501234567

   # The script will:
   # - Format phone number to Inwise format (972-50-1234567)
   # - Test both authentication methods (Bearer and X-API-Key)
   # - Send Hebrew test message
   # - Display detailed API request/response
   ```
5. **Verify in Production**:
   - Add environment variables to Vercel dashboard
   - Deploy updated code
   - Test full workflow: counselor form → parent SMS → consent → counselor SMS

### Notification Flow
- **When parent phone + email provided**: Both SMS and email sent
- **When only email provided**: Email sent only
- **When only phone provided**: SMS sent only
- **Automatic fallback**: If one service fails, other continues

---

## 🌐 Hebrew/RTL Support

### Implementation
- HTML dir="rtl" on root element
- All UI text in Hebrew
- Placeholders and labels translated
- Right-to-left layout throughout
- Logo replaces redundant Hebrew text

### Key Hebrew Terms Used
- טופס הפניית תלמיד/ה - Student Referral Form
- ויתור סודיות - Confidentiality Waiver
- חתימה דיגיטלית - Digital Signature
- פרטים אישיים - Personal Information
- הערכת סיכון - Risk Assessment

---

## 🧪 Testing Setup

### Local Testing (No Database Required)
The system includes a mock database for local testing:

1. **Mock Implementation**: `src/lib/supabase-mock.ts`
2. **Auto-Detection**: Uses mock when Supabase not configured
3. **In-Memory Storage**: Data persists during session only
4. **Console Logging**: All operations logged for debugging

### Test Flow
1. Start dev server: `npm run dev`
2. Open http://localhost:3000
3. Submit counselor form → Get referral number
4. Check console for consent URL
5. Open consent URL → Sign digitally
6. Check console for student form URL
7. Complete 7-step student form

---

## 🚀 Deployment Instructions

### Prerequisites
1. Supabase account (free tier)
2. Salesforce account with API access
3. Vercel account (free tier)

### Environment Variables (SECURED & ROTATED - January 2025)
```env
# .env.local
# ⚠️ ALL CREDENTIALS HAVE BEEN ROTATED FOR SECURITY

# Supabase (ROTATED)
NEXT_PUBLIC_SUPABASE_URL=https://fftnsfaakvahqyfwhtku.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[ROTATED - Store in Vercel Dashboard]
SUPABASE_SERVICE_KEY=[ROTATED - Store in Vercel Dashboard]

# Email Service (ROTATED)
RESEND_API_KEY=[ROTATED - Store in Vercel Dashboard]

# Salesforce Integration (JWT Bearer Authentication)
SALESFORCE_INSTANCE_URL=https://geh--partialsb.sandbox.my.salesforce.com
SALESFORCE_LOGIN_URL=https://test.salesforce.com
SALESFORCE_CLIENT_ID=[Store in Vercel Dashboard]
SALESFORCE_CLIENT_SECRET=[Store in Vercel Dashboard]
SALESFORCE_USERNAME=oronmail@geh.com.partialsb
SALESFORCE_PRIVATE_KEY=[NEW CERTIFICATE - Store in Vercel Dashboard]

# Application
NEXT_PUBLIC_APP_URL=https://gesher-intake.vercel.app

# Security Keys (NEW - Generated January 2025)
JWT_SECRET=[32-byte hex string - Store in Vercel Dashboard]
ENCRYPTION_KEY=[32-byte hex string - Store in Vercel Dashboard]
API_SECRET_KEY=[32-byte hex string - Store in Vercel Dashboard]

# Rate Limiting Configuration
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW_MS=60000

# Environment
NODE_ENV=production
```

### Deployment Steps
1. Set up Supabase database with schema
2. Configure Salesforce Connected App
3. Push to GitHub
4. Import to Vercel
5. Add environment variables
6. Deploy

---

## 🌐 Multi-Environment Architecture (January 2025)

### Environment Overview

| Environment | Vercel URL | Salesforce Org | Git Branch |
|-------------|------------|----------------|------------|
| **Production** | `gesher-intake.vercel.app` | `geh.my.salesforce.com` | `main` |
| **Preview/Staging** | `gesher-intake-preview.vercel.app` | `geh--partialsb.sandbox.my.salesforce.com` | `staging` |
| **Local Development** | `localhost:3000` | Sandbox (or mock) | Any branch |

### Certificate Organization
```
certs/
├── production/
│   ├── server.crt  (CN=gesher-intake-production, valid until Jan 2028)
│   └── server.key  (Private key for Production Salesforce JWT)
└── sandbox/
    ├── server.crt  (CN=gesher-intake, valid until Sep 2027)
    ├── server.csr
    └── server.key  (Private key for Sandbox Salesforce JWT)
```

### Vercel Environment Variables - Per Environment

#### Production Environment Variables (→ Production Salesforce)
```env
SALESFORCE_INSTANCE_URL=https://geh.my.salesforce.com
SALESFORCE_LOGIN_URL=https://login.salesforce.com
SALESFORCE_USERNAME=oronmail@geh.com
SALESFORCE_CLIENT_ID=(Production Connected App Consumer Key)
SALESFORCE_CLIENT_SECRET=(Production Connected App Consumer Secret)
SALESFORCE_PRIVATE_KEY=(Contents of certs/production/server.key)
```

#### Preview Environment Variables (→ Sandbox Salesforce)
```env
SALESFORCE_INSTANCE_URL=https://geh--partialsb.sandbox.my.salesforce.com
SALESFORCE_LOGIN_URL=https://test.salesforce.com
SALESFORCE_USERNAME=oronmail@geh.com.partialsb
SALESFORCE_CLIENT_ID=(Sandbox Connected App Consumer Key)
SALESFORCE_CLIENT_SECRET=(Sandbox Connected App Consumer Secret)
SALESFORCE_PRIVATE_KEY=(Contents of certs/sandbox/server.key)
```

#### Shared Environment Variables (Both Production & Preview)
```env
NEXT_PUBLIC_SUPABASE_URL=https://fftnsfaakvahqyfwhtku.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=(Supabase anon key)
SUPABASE_SERVICE_KEY=(Supabase service key)
GMAIL_USER=gesheryouth@gmail.com
GMAIL_APP_PASSWORD=(Gmail app password)
JWT_SECRET=(32-byte hex string)
ENCRYPTION_KEY=(32-byte hex string)
API_SECRET_KEY=(32-byte hex string)
```

### Deployment Workflows

#### Deploy to Production
```bash
# 1. Ensure you're on main branch
git checkout main

# 2. Merge changes from staging (if applicable)
git merge staging

# 3. Push to trigger Vercel Production deployment
git push origin main

# Deploys to: gesher-intake.vercel.app → geh.my.salesforce.com
```

#### Deploy to Preview/Staging
```bash
# 1. Checkout staging branch
git checkout staging

# 2. Merge your feature branch
git merge feature/your-feature

# 3. Push to trigger Vercel Preview deployment
git push origin staging

# Deploys to: gesher-intake-preview.vercel.app → Sandbox Salesforce
```

#### Local Development
```bash
# 1. Start development server
npm run dev

# 2. Access at http://localhost:3000
# Uses .env.local configuration (typically points to Sandbox)
```

### Salesforce CLI Aliases
```bash
# List configured orgs
sf org list

# Deploy to Sandbox
sf project deploy start -d force-app -o gesher-sandbox

# Deploy to Production
sf project deploy start -d force-app -o gesher-production

# Query Sandbox records
sf data query --query "SELECT Id, Name, Status__c FROM Registration_Request__c LIMIT 5" -o gesher-sandbox

# Query Production records
sf data query --query "SELECT Id, Name, Status__c FROM Registration_Request__c LIMIT 5" -o gesher-production
```

### Generate New Certificate
```bash
# Generate certificate for Production
cd certs/production
openssl req -x509 -nodes -days 730 -newkey rsa:2048 \
  -keyout server.key -out server.crt \
  -subj "/CN=gesher-intake-production/O=GesherAlHaNoar/L=TelAviv/ST=Israel/C=IL"

# Generate certificate for Sandbox
cd certs/sandbox
openssl req -x509 -nodes -days 730 -newkey rsa:2048 \
  -keyout server.key -out server.crt \
  -subj "/CN=gesher-intake-sandbox/O=GesherAlHaNoar/L=TelAviv/ST=Israel/C=IL"
```

---

## 📋 Recent Salesforce Updates (January 2025)

### New Fields Added

#### Consentform_signed__c (Checkbox)
- **Type**: Checkbox
- **Label**: טופס הסכמה התקבל
- **Description**: Indicates whether the consent form has been received (digitally signed or uploaded)
- **Default**: false

#### Rep_Position__c (Text)
- **Type**: Text(100)
- **Label**: תפקיד נציג
- **Description**: The position/role of the school representative (e.g., counselor, teacher)

#### Status__c - New Value
- Added picklist value: **"ויתור סודיות אצל הנציג"**
- Used for checkbox-only consent (no file uploaded)

### Upload Consent Flow
A Screen Flow for uploading consent images directly from Salesforce:
- **Flow Name**: `Upload_Consent_Image`
- **Quick Action**: "העלאת טופס הסכמה" button on Registration Request records
- **Functionality**:
  - Accepts file upload from user
  - Attaches file to the record
  - Updates `Submission_Date__c` with current timestamp
  - Sets `Consentform_signed__c` to true

### Field Permissions Update
- All 106 Registration_Request__c fields are now editable for all profiles
- Implemented via Apex script (`scripts/update-field-permissions.apex`)
- Successfully created 3,549 field permission records in Production

---

## 🔧 Current Implementation Status

### ✅ Completed Features (Updated: January 2025)
- [x] Privacy-compliant workflow (consent before data)
- [x] Counselor initial form with title "הגשת מועמדות" (centered)
- [x] Parent digital consent with dual signatures
- [x] Comprehensive 7-step student data form
- [x] Hebrew UI throughout
- [x] Organization logo integration
- [x] Mock database for testing
- [x] API endpoints structure
- [x] Mobile-responsive design
- [x] Form validation with Zod
- [x] RTL layout support
- [x] Supabase integration (fftnsfaakvahqyfwhtku.supabase.co)
- [x] Resend email service configured and working
- [x] Parent email: "טופס ויתור סודיות - גשר אל הנוער"
- [x] Counselor email shows student name (not ref number)
- [x] Deployed to Vercel (https://gesher-intake.vercel.app)
- [x] GitHub repository (Oronmail/gesher-intake)
- [x] Removed consent disclaimer from counselor form
- [x] Removed redundant title from main page
- [x] Salesforce integration - Registration_Request__c queue object deployed
- [x] JWT Bearer authentication for autonomous server-to-server operation
- [x] Automatic token refresh and session management
- [x] Salesforce Page Layouts and Lightning Record Pages deployed
- [x] Certificate-based authentication configured
- [x] Parent phone made optional (at least one contact method required)
- [x] Consent re-signing prevention (checks if already signed)
- [x] Environment variable support for Vercel deployment
- [x] Private key configuration for JWT in Vercel
- [x] Signature display fields for Lightning pages (Rich Text with HTML img tags)
- [x] Automatic signature image rendering without triggers or flows
- [x] Student form title updated to "טופס רישום מועמדות לתלמיד/ה"
- [x] Data prepopulation in student form from Supabase
- [x] **SECURITY HARDENING - January 2025**
  - [x] Comprehensive security middleware implementation
  - [x] Rate limiting (100 requests/minute per IP)
  - [x] CORS configuration with strict origins
  - [x] Security headers (HSTS, CSP, X-Frame-Options, etc.)
  - [x] Input validation and sanitization utilities
  - [x] Israeli ID validation algorithm
  - [x] Data encryption utilities (AES-256-GCM)
  - [x] Secure Row Level Security (RLS) policies in Supabase
  - [x] Audit logging implementation
  - [x] SQL injection prevention
  - [x] XSS protection
  - [x] Complete credential rotation (JWT certificates, security keys)
  - [x] Removed all exposed credentials from codebase
  - [x] Environment variable security
  - [x] Secure session management
- [x] **PRODUCTION DEPLOYMENT FIXES - January 2025**
  - [x] Fixed API key validation for same-origin requests
  - [x] Middleware now allows frontend forms without API key
  - [x] Maintains API key requirement for external access
  - [x] Resolved Salesforce field mapping (using Name field)
  - [x] Verified field existence with Salesforce CLI
  - [x] Full end-to-end workflow tested and working
  - [x] Successfully creating records in Salesforce
  - [x] Email notifications functioning properly
- [x] **SMS INTEGRATION - October 2025 (Updated)**
  - [x] Inwise SMS service integration with official API format
  - [x] Dual notification system (Email + SMS) for both parents and counselors
  - [x] Automatic Israeli phone number formatting (972-XX-XXXXXXX format)
  - [x] SMS templates in Hebrew with unicode charset
  - [x] Parent consent SMS with link to consent form
  - [x] Counselor notification SMS after parent signs consent
  - [x] Fallback handling if one notification fails
  - [x] Request format matches Inwise transactional SMS API spec
  - [x] Multiple authentication header support (Bearer + X-API-Key)
  - [x] Comprehensive test script (test-sms.js) with detailed debugging
  - [x] Enhanced logging with [SMS] prefixes for easy debugging
  - [x] API response parsing for status codes (queued, sent, rejected, invalid)
  - [x] Environment variables documented in .env.example
  - [x] Ready for production deployment after API token configuration
- [x] **UI/UX FIXES - January 2025**
  - [x] Fixed student form success message premature display
  - [x] Success screen shows only after submission
  - [x] Form hidden on successful submission
  - [x] Error messages display inline
  - [x] Beautiful success confirmation screen
- [x] **UI/UX REDESIGN - January 2025**
  - [x] Complete redesign of all 3 forms with modern UI/UX
  - [x] Added gradient backgrounds and card-based layouts
  - [x] Implemented purple gradient headers across all forms
  - [x] Added non-profit logo above forms (not in headers)
  - [x] Fixed RTL alignment issues (changed pr-12 to pl-12)
  - [x] Removed redundant section headers from StudentDataForm
  - [x] Enhanced progress indicators with step circles
  - [x] Added hover effects and smooth transitions
  - [x] Improved mobile responsiveness with Tailwind classes
  - [x] Fixed second parent signature field visibility
  - [x] Created backup files for rollback capability
  - [x] Fixed progress bar display issues
  - [x] Enhanced form cards with shadows and rounded corners
- [x] **IMAGE-BASED CONSENT SYSTEM - November 2025**
  - [x] Replaced PDF generation with PNG image generation
  - [x] Implemented html2canvas for Hebrew and signature support
  - [x] Added visual timestamp badge with date/time/referral number
  - [x] Triple storage strategy: PNG image + HTML backup + structured fields
  - [x] Correct legal consent text: "אני מאפשר להנהלת "גשר אל הנוער" לקבל מביה"ס/ רווחה/ גורם מטפל אחר כל מידע לימודי/פסיכולוגי/רפואי על בני/ביתי. אנו מוותרים בזאת על סודיות לגבי המידע הרלוונטי."
  - [x] ContentDocument API integration for Salesforce attachments
  - [x] Image compression to avoid payload size limits
  - [x] CSP headers updated for Google Fonts and Vercel scripts
  - [x] Test files created for verification (test-consent-image.html, test-workflow.js)
- [x] **FILE UPLOAD SYSTEM - December 2025**
  - [x] Student form file uploads for assessment files (קובץ אבחון) and grade sheets (גליון ציונים)
  - [x] FormData handling for multipart/form-data requests when files present
  - [x] File validation: 10MB size limit, PDF/JPG/PNG types only
  - [x] Generic uploadFile method in Salesforce integration
  - [x] Files attached to Registration_Request__c records via ContentVersion API
  - [x] Files appear in Notes & Attachments section in Salesforce
  - [x] Client-side validation with Hebrew error messages
  - [x] Automatic file type detection and proper MIME type handling
- [x] **GENDER-INCLUSIVE LANGUAGE - December 2025**
  - [x] Updated consent form text from "אני מאפשר" to "אני מאפשר/ת"
  - [x] Applied to all consent form locations (ParentConsentForm, consent-image-generator, backup files)
- [x] **FIELD-LEVEL SECURITY UPDATE - December 2025**
  - [x] All Registration_Request__c fields made visible to all profiles
  - [x] 3,361 field permissions successfully updated
  - [x] Custom Apex script for bulk field permission updates
- [x] **FIELD COMPLETION TRACKING - January 2025**
  - [x] Visual green checkmark indicators for completed fields
  - [x] FieldWrapper component wraps all 77+ form fields
  - [x] Real-time completion status tracking
  - [x] Helps counselors identify which fields are filled vs empty
  - [x] Fixed 30+ FieldWrapper structure issues from automated script
  - [x] Removed 25+ duplicate closing tags
  - [x] Fixed missing closing divs in 3 major sections
  - [x] All JSX parsing errors resolved
  - [x] Build progresses successfully past component compilation
  - [x] **SMART VALIDATION** - Completed fields skip validation
  - [x] Only validates incomplete fields (without green checkmarks)
  - [x] Allows counselors to save progress and return later
  - [x] Navigation through completed steps without re-entering data
- [x] **MANUAL CONSENT FLOW - January 2025**
  - [x] Counselors can select "יש בידי טופס הסכמה חתום" to skip digital consent
  - [x] Consent method radio buttons in counselor form (Digital/Manual)
  - [x] Parent contact fields hidden when manual consent selected
  - [x] Confirmation checkbox required: "אני מאשר/ת שיש בידי טופס הסכמה חתום על ידי ההורים"
  - [x] Direct redirect to student form (skips email/SMS to parents)
  - [x] Supabase `consent_method` column added (digital/manual)
  - [x] Salesforce `Consent_Method__c` picklist field (Digital/Manual Paper)
  - [x] Status set to `consent_signed` immediately for manual flow
  - [x] Success screen shows button to continue to student form
  - [x] Different process explanation text based on consent method

- [x] **FIELD TYPE CONVERSION & BUG FIXES - December 2025**
  - [x] Converted 16 Checkbox fields to Picklist type with כן/לא/לא ידוע options
  - [x] Fields converted: Known_to_Welfare__c, Youth_Promotion__c, Behavioral_Issues__c, Learning_Disability__c, Requires_Remedial_Teaching__c, ADHD__c, Assessment_Done__c, Assessment_Needed__c, Criminal_Record__c, Drug_Use__c, Smoking__c, Psychological_Treatment__c, Psychiatric_Treatment__c, Takes_Medication__c, Military_Service_Potential__c, Can_Handle_Program__c
  - [x] Removed unused Motivation_Type__c field from all code
  - [x] Added missing Criminal_Record_Details__c field to salesforce-jwt.ts (createStudentData, SOQL query, updateStudentData)
  - [x] Added Criminal_Record_Details__c to API routes (get-progress, save-progress, student-data)
  - [x] All 83 Salesforce fields now properly mapped from form submissions
  - [x] Deployed field changes to Salesforce sandbox

- [x] **VALIDATION & CLEANUP FIXES - December 2025**
  - [x] Removed unused Priority__c field from salesforce.ts, salesforce-jwt.ts, and layout XML
  - [x] Removed unused External_Motivators__c field from all code
  - [x] Fixed risk_level validation: added .refine() to require non-null value on Step 6
  - [x] Fixed failing_subjects validation: added .min(1) to subject, grade, reason fields
  - [x] Fixed grade_sheet validation: added to getFieldsForStep(6) and Zod validation
  - [x] Fixed picklist field overwrite: added isValidPicklist() helper to prevent empty values overwriting
  - [x] Fixed conditional field validation: added completedFields check to behavioral_issues_details, learning_disability_explanation, adhd_treatment, criminal_record_details
  - [x] Synced 10 field metadata files from Salesforce (Afternoon_Activities, Assessment_File_Uploaded, Behavioral_Issues_Details, Failing_Subjects, Grade_Sheet_Uploaded, Learning_Disability_Explanation, Potential_Explanation, School_Info_Password, School_Info_Username, Social_Status)

- [x] **FORM PROTECTION & DATA FIXES - December 2025**
  - [x] Added "Already Submitted" blocking screen to student form (matches consent form design)
  - [x] Student form now checks Supabase status='completed' and shows blocking message
  - [x] Removed unused Failing_Subjects__c legacy field (data goes to Failing_Subjects_Details__c)
  - [x] Changed Failing_Subjects_Details__c format from JSON array to comma-separated with "ציון" prefix
  - [x] Example format: "חשבון, ציון 40, חוסר בתרגול" (multiple subjects on separate lines)
  - [x] Fixed siblings_count default value bug: removed || 0 that was incorrectly saving 0 to SF
  - [x] Added siblings_count Zod .refine() validation to reject null (mandatory field)
  - [x] Added siblings_count to getFieldsForStep(2) for proper Step 2 validation
  - [x] Added error message display and red asterisk for siblings_count field

### 🚧 Pending Features
- [ ] Authentication for counselors
- [ ] Admin dashboard
- [ ] Data export functionality
- [ ] Domain verification for custom email sender
- [ ] Bulk upload for multiple files
- [ ] File preview before upload
- [ ] Progress indicator for file uploads

---

## 📋 Important Implementation Details

### Privacy Compliance
- **Critical Rule**: No student data before parent consent
- **Implementation**: Counselor can only enter parent contact initially
- **Verification**: Parent must digitally sign before any student data entry
- **Data Flow**: Parent contact → Consent → Student data → Salesforce

### Form Validation
- All forms use React Hook Form with Zod schemas
- Hebrew error messages throughout
- Real-time validation feedback
- Required fields clearly marked

### Signature Handling
- Digital signatures captured as base64 images
- Separate signature pads for each parent
- Signatures stored in database
- Can be retrieved for verification

### Mobile Responsiveness
- All forms work on mobile devices
- Signature pad touch-compatible
- Responsive grid layouts
- Optimized for field use by House Managers

### Field Completion Tracking System
- **Visual Indicators**: Green checkmark icons appear next to completed fields
- **FieldWrapper Component**: Custom wrapper around all 77+ form fields
- **Real-time Tracking**: Automatically detects when fields are filled
- **Smart Validation**: Completed fields skip validation on step navigation
- **Progress Persistence**: Saves field completion status to database
- **Implementation**:
  - `FieldWrapper.tsx` wraps each form field
  - `completedFields` Set tracks which fields are done
  - Green checkmark appears when field has non-empty value
  - Validation only runs on incomplete fields
- **Benefits**:
  - Counselors can see at a glance which fields need attention
  - Save progress and return later without re-entering data
  - Navigate through completed steps without validation errors
  - Improved UX for long multi-step forms

### File Upload System
- **Supported Files**: Assessment documents (קובץ אבחון) and grade sheets (גליון ציונים)
- **File Types**: PDF, JPG, PNG
- **Size Limit**: 10MB per file
- **Implementation**:
  - Client detects files and switches from JSON to FormData submission
  - API endpoint handles both content types seamlessly
  - Files uploaded to Salesforce using ContentVersion API
  - Attached to Registration_Request__c record via FirstPublishLocationId
- **Validation**:
  - Client-side file size and type checking
  - Hebrew error messages for validation failures
  - Prevents submission if files don't meet requirements
- **Storage**: Files stored in Salesforce as ContentDocuments, visible in Notes & Attachments

---

## 🔐 Salesforce JWT Bearer Authentication (Server-to-Server)

### Overview
The system now uses JWT Bearer Token flow for fully automated server-to-server authentication with Salesforce. This eliminates the need for manual token refresh or user intervention - the system operates completely autonomously.

### How It Works
1. **Certificate-Based Authentication**: Uses RSA-256 signed JWT tokens
2. **Automatic Token Generation**: Creates new access tokens as needed
3. **No User Interaction**: Completely automated, no login required
4. **Self-Healing**: Automatically handles expired sessions
5. **Multiple Fallbacks**: Falls back to direct token if JWT not configured

### Implementation Files
- `src/lib/salesforce-jwt.ts` - JWT Bearer authentication service
- `test-jwt.js` - Test script to verify JWT authentication
- `generate-jwt-cert.sh` - Certificate generation script
- `certs/server.key` - Private key for JWT signing (DO NOT SHARE)
- `certs/server.crt` - Public certificate for Salesforce

### Setup Process (One-Time)

#### 1. Generate Certificate and Private Key
```bash
./generate-jwt-cert.sh
# This creates:
# - certs/server.key (private key - keep secure)
# - certs/server.crt (certificate - upload to Salesforce)
```

#### 2. Configure Connected App in Salesforce
1. Go to Setup → App Manager → Find your Connected App
2. Click "Edit" on the Connected App
3. In OAuth Settings:
   - Enable "Use digital signatures"
   - Upload `certs/server.crt` as the certificate
   - Add OAuth Scope: "Perform requests at any time (refresh_token, offline_access)"
   - Add OAuth Scope: "Access the identity URL service (id, profile, email, address, phone)"
   - Add OAuth Scope: "Access unique user identifiers (openid)"
   - Add OAuth Scope: "Manage user data via APIs (api)"
4. Save the Connected App

#### 3. Pre-Authorize User
1. Go to Setup → Connected Apps → Manage Connected Apps
2. Find your app and click "Manage"
3. Click "Edit Policies"
4. Set "Permitted Users" to "Admin approved users are pre-authorized"
5. Save
6. Go to "Manage Profiles" or "Manage Permission Sets"
7. Add the integration user's profile/permission set

#### 4. Test Authentication
```bash
node test-jwt.js
# Should show:
# ✅ JWT authentication successful
# ✅ Connected as: [User Name]
# ✅ Test record created
```

### Authentication Flow
```javascript
// Automatic authentication happens internally:
1. Generate JWT with claims (iss, sub, aud, exp)
2. Sign JWT with private key (RSA-256)
3. Exchange JWT for access token via OAuth endpoint
4. Use access token for API calls
5. Automatically refresh before expiry (50 minutes)
```

### Environment Variables Required
```env
# JWT Bearer Authentication (Fully Automated)
SALESFORCE_CLIENT_ID=your_connected_app_consumer_key
SALESFORCE_USERNAME=oronmail@geh.com.partialsb
SALESFORCE_LOGIN_URL=https://test.salesforce.com
SALESFORCE_INSTANCE_URL=https://geh--partialsb.sandbox.my.salesforce.com
SALESFORCE_PRIVATE_KEY=-----BEGIN RSA PRIVATE KEY-----\nMIIE...(single line format with \n for newlines)...\n-----END RSA PRIVATE KEY-----

# Optional Fallback (if JWT not configured)
SALESFORCE_ACCESS_TOKEN=temporary_access_token
```

### Key Features
- **Zero Manual Intervention**: Once configured, runs indefinitely without user input
- **Automatic Token Refresh**: Refreshes tokens before they expire
- **Session Recovery**: Automatically re-authenticates on session errors
- **Multiple Auth Methods**: Falls back to direct token if JWT fails
- **Secure**: Private key never leaves server, only JWT sent to Salesforce

### Troubleshooting

#### "invalid_grant: invalid assertion" Error
- Certificate not uploaded to Connected App
- Username doesn't match exactly (check sandbox suffix)
- User not pre-authorized for the Connected App
- JWT Bearer flow not enabled

#### Certificate Issues
- Ensure `certs/server.crt` is uploaded to Salesforce
- Verify private key exists at `certs/server.key`
- Check certificate hasn't expired (valid for 2 years)

#### Testing Connection
```bash
# Test JWT authentication
node test-jwt.js

# If JWT fails, test with direct token
SALESFORCE_ACCESS_TOKEN=your_token node test-connection.js
```

---

## 🔌 Salesforce Integration

### Queue Object: Registration_Request__c
**Purpose**: Temporary queue for registration requests pending approval by non-profit staff

### Object Configuration
- **API Name**: Registration_Request__c
- **Label**: Registration Request
- **Auto-Number Field**: REG-{0000}
- **Deployment Status**: Deployed to sandbox
- **SFDX Project**: Configured with force-app structure

### Field Mappings (89 Custom Fields)

#### Metadata Fields
- `Name` - Text(80) - Unique referral ID (standard field, stores REF-YYYYMM-XXXX)
- `Status__c` - Picklist - ['Pending Consent', 'Consent Signed', 'Data Submitted', 'Pending Review', 'In Review', 'Approved', 'Rejected']
- `Submission_Date__c` - DateTime
- `Consent_Date__c` - DateTime

#### Counselor & School
- `Counselor_Name__c` - Text(100)
- `Counselor_Email__c` - Email
- `School_Name__c` - Text(200)

#### Student Personal Information
- `Student_First_Name__c` - Text(100)
- `Student_Last_Name__c` - Text(100)
- `Student_ID__c` - Text(20)
- `Date_of_Birth__c` - Date
- `Gender__c` - Picklist - ['Male', 'Female']
- `Country_of_Birth__c` - Text(100)
- `Immigration_Year__c` - Text(4)
- `Student_Address__c` - Text(255)
- `Student_Floor__c` - Text(10)
- `Student_Apartment__c` - Text(10)
- `Student_Phone__c` - Phone
- `Student_Mobile__c` - Phone
- `School_System_Password__c` - Text(50)

#### Parent/Guardian Information
- `Parent1_Name__c` - Text(100)
- `Parent1_ID__c` - Text(20)
- `Parent1_Address__c` - Text(255)
- `Parent1_Phone__c` - Phone
- `Parent1_Signature__c` - LongTextArea(32768) - Base64 signature
- `Parent1_Signature_Display__c` - Rich Text Area(32768) - HTML formatted signature image
- `Parent2_Name__c` - Text(100)
- `Parent2_ID__c` - Text(20)
- `Parent2_Address__c` - Text(255)
- `Parent2_Phone__c` - Phone
- `Parent2_Signature__c` - LongTextArea(32768) - Base64 signature
- `Parent2_Signature_Display__c` - Rich Text Area(32768) - HTML formatted signature image
- `Parent_Email__c` - Email

#### Family Information
- `Siblings_Count__c` - Number(2,0)
- `Father_Name__c` - Text(100)
- `Father_Mobile__c` - Phone
- `Father_Occupation__c` - Text(100)
- `Father_Profession__c` - Text(100)
- `Father_Income__c` - Text(50)
- `Mother_Name__c` - Text(100)
- `Mother_Mobile__c` - Phone
- `Mother_Occupation__c` - Text(100)
- `Mother_Profession__c` - Text(100)
- `Mother_Income__c` - Text(50)
- `Debts_Loans__c` - Text(255)
- `Parent_Involvement__c` - Picklist - ['Inhibiting', 'Promoting', 'No Involvement']
- `Economic_Status__c` - Picklist - ['Low', 'Medium', 'High']
- `Economic_Details__c` - LongTextArea(4000)
- `Family_Background__c` - LongTextArea(4000)

#### School & Academic
- `Grade__c` - Text(20)
- `Homeroom_Teacher__c` - Text(100)
- `Teacher_Phone__c` - Phone
- `School_Counselor_Name__c` - Text(100)
- `School_Counselor_Phone__c` - Phone
- `Failing_Grades_Count__c` - Number(2,0)
- `Failing_Subjects_Details__c` - LongTextArea(131000) - Comma-separated format: "מקצוע, ציון XX, סיבה"

#### Welfare & Social Services
- `Known_to_Welfare__c` - Picklist - ['כן', 'לא', 'לא ידוע']
- `Social_Worker_Name__c` - Text(100)
- `Social_Worker_Phone__c` - Phone
- `Youth_Promotion__c` - Picklist - ['כן', 'לא', 'לא ידוע']
- `Youth_Worker_Name__c` - Text(100)
- `Youth_Worker_Phone__c` - Phone

#### Assessment
- `Behavioral_Issues__c` - Picklist - ['כן', 'לא', 'לא ידוע']
- `Behavioral_Issues_Details__c` - LongTextArea(4000)
- `Potential_Explanation__c` - LongTextArea(4000)
- `Motivation_Level__c` - LongTextArea(131000)
- `Social_Status__c` - Text(255)
- `Afternoon_Activities__c` - Text(255)

#### Learning & Health
- `Learning_Disability__c` - Picklist - ['כן', 'לא', 'לא ידוע']
- `Learning_Disability_Explanation__c` - LongTextArea(4000)
- `Requires_Remedial_Teaching__c` - Picklist - ['כן', 'לא', 'לא ידוע']
- `ADHD__c` - Picklist - ['כן', 'לא', 'לא ידוע']
- `ADHD_Treatment__c` - Text(255)
- `Assessment_Done__c` - Picklist - ['כן', 'לא', 'לא ידוע']
- `Assessment_Needed__c` - Picklist - ['כן', 'לא', 'לא ידוע']
- `Assessment_Details__c` - LongTextArea(4000)

#### Risk Assessment
- `Criminal_Record__c` - Picklist - ['כן', 'לא', 'לא ידוע']
- `Criminal_Record_Details__c` - LongTextArea(4000)
- `Drug_Use__c` - Picklist - ['כן', 'לא', 'לא ידוע']
- `Smoking__c` - Picklist - ['כן', 'לא', 'לא ידוע']
- `Probation_Officer__c` - Text(100)
- `Youth_Probation_Officer__c` - Text(100)
- `Psychological_Treatment__c` - Picklist - ['כן', 'לא', 'לא ידוע']
- `Psychiatric_Treatment__c` - Picklist - ['כן', 'לא', 'לא ידוע']
- `Takes_Medication__c` - Picklist - ['כן', 'לא', 'לא ידוע']
- `Medication_Description__c` - Text(255)
- `Risk_Level__c` - Number(2,0)
- `Risk_Factors__c` - LongTextArea(4000)

#### Final Assessment
- `Military_Service_Potential__c` - Picklist - ['כן', 'לא', 'לא ידוע']
- `Can_Handle_Program__c` - Picklist - ['כן', 'לא', 'לא ידוע']
- `Personal_Opinion__c` - LongTextArea(4000)

### Deployment Commands
```bash
# Deploy to Salesforce sandbox
sf project deploy start -d force-app -o gesher-sandbox

# Test the deployment
node test-sf-queue.js

# Generate field metadata
node create-sf-fields.js
```

### Integration Flow - Complete Pipeline Tracking
1. **Counselor Submission** → Creates Registration_Request__c with 'Pending Consent'
2. **Parent Consent** → Updates to 'Consent Signed' with signatures
3. **Student Data** → Updates to 'Data Submitted' with full information
4. **Staff Review** → Moves through 'Pending Review' → 'In Review'
5. **Decision** → Final status: 'Approved' or 'Rejected'
6. **House Visit** → After approval, conduct home visit
7. **Contact Creation** → Convert approved request to Contact record

**Key Implementation Details**:
- Record created immediately upon counselor submission (not after all data collected)
- Each stage updates the same Registration_Request__c record
- Full visibility from initial request through completion
- SF record ID stored in Supabase for tracking

---

## 📸 Image-Based Consent System

### Overview
The system uses html2canvas to generate PNG images of consent forms instead of PDFs. This approach solves critical issues with Hebrew text rendering and digital signature display that were present in the PDF solution.

### Why Images Instead of PDFs?
1. **Hebrew Text Support**: jsPDF doesn't properly support Hebrew fonts or RTL text
2. **Signature Preservation**: Base64 signatures render perfectly in HTML/images
3. **Visual Timestamp**: Easy to overlay timestamp badges on images
4. **Smaller File Sizes**: Compressed PNGs are smaller than PDFs with embedded images
5. **Universal Compatibility**: PNG images display correctly everywhere

### Implementation Architecture

#### Triple Storage Strategy
1. **PNG Image**: Primary visual record with timestamp badge
2. **HTML Backup**: Complete HTML stored in Consent_HTML__c field
3. **Structured Fields**: Individual signature fields for queries

#### Key Components
- `src/lib/consent-image-generator.ts` - Core image generation logic
- `generateConsentImage()` - Converts HTML form to PNG with timestamp
- `generateConsentHTMLForStorage()` - Creates HTML for backup storage
- `compressImage()` - Optimizes image size for API limits

### Visual Timestamp Badge
Every consent image includes a timestamp badge in the top-left corner showing:
- "נחתם דיגיטלית" (Digitally Signed)
- Date and time of signature
- Unique referral number
- Blue gradient background for authenticity

### Technical Implementation
```typescript
// Generate consent image with timestamp
const imageBase64 = await generateConsentImage({
  referralNumber,
  studentName,
  parent1Name,
  parent1Id,
  parent1Signature,
  consentDate: new Date()
})

// Upload to Salesforce as ContentDocument
await uploadConsentImage(registrationId, imageBase64, filename)
```

### Consent Declaration Text
The system displays the legally required consent text:
```
אני מאפשר להנהלת "גשר אל הנוער" לקבל מביה"ס/ רווחה/ גורם מטפל אחר 
כל מידע לימודי/פסיכולוגי/רפואי על בני/ביתי. 
אנו מוותרים בזאת על סודיות לגבי המידע הרלוונטי.
```

### Testing Tools
- `test-consent-image.html` - Standalone HTML test for image generation
- `test-workflow.js` - Complete workflow testing guide
- Browser console shows "Consent image generated successfully" on success

### CSP Configuration
Updated Content Security Policy to allow:
- Google Fonts (fonts.googleapis.com, fonts.gstatic.com)
- Vercel scripts (_vercel/speed-insights)
- Inline styles required for html2canvas

### Troubleshooting

#### Hebrew Text Issues
- Ensure html2canvas is loaded properly
- Check browser console for encoding errors
- Verify font-family is set to Arial

#### Signature Display
- Signatures must be valid base64 data URLs
- Check format: `data:image/png;base64,...`
- Verify signatures aren't empty strings

#### Image Size
- Images are automatically compressed if > 500KB
- Maximum dimension limited to 1200px
- JPEG quality adjusted dynamically

---

## 🖼️ Signature Display in Salesforce

### Implementation
The system automatically displays parent signatures as images in Salesforce Lightning pages without requiring triggers, flows, or complex development.

### How It Works
1. **Data Storage**: Signatures are stored in two formats:
   - `Parent1_Signature__c` / `Parent2_Signature__c` - Raw base64 data (preserved for backup/export)
   - `Parent1_Signature_Display__c` / `Parent2_Signature_Display__c` - HTML-wrapped images for display

2. **Automatic Conversion**: When consent is submitted, the system automatically:
   - Saves the raw base64 signature data
   - Wraps it in HTML `<img>` tags with styling
   - Stores both versions in Salesforce

3. **Display**: Simply add the Rich Text display fields to your Lightning page layout
   - Signatures render automatically as images
   - No additional configuration needed
   - Works on mobile and desktop

### Field Details
```javascript
// Automatic HTML wrapping applied during save
Parent1_Signature_Display__c = `<img src="${base64data}" 
  style="max-width:300px; border:1px solid #ccc; padding:5px; background:white;" 
  alt="חתימת הורה 1"/>`
```

### Deployment
```bash
# Deploy signature display fields
./deploy-signature-fields.sh
```

---

## 🐛 Known Issues & Solutions

### Issue 1: Text Color Too Light
**Solution**: Added CSS to force black text in inputs
```css
input, textarea, select {
  color: #000000 !important;
}
```

### Issue 2: Console URL Logging
**Solution**: Enhanced logging in both API and client
- Server logs to terminal
- Client logs to browser console
- Clear formatting with separators

### Issue 3: Params Await Warning
**Note**: Next.js 15 warning about awaiting params - non-critical

### Issue 4: FieldWrapper JSX Parsing Errors (RESOLVED - January 2025)
**Problem**: Build failed with "Expected '</>', got 'jsx text'" errors across StudentDataForm.tsx
**Root Cause**: Automated script created malformed FieldWrapper components with:
- Missing closing `</FieldWrapper>` tags
- Duplicate closing tags accumulated from multiple runs
- Incorrect indentation breaking JSX structure
- Missing section closing divs

**Solution Applied**:
1. Systematically fixed all 30+ FieldWrapper components
2. Added missing `</FieldWrapper>` tags before error message blocks
3. Fixed indentation on input/select/textarea elements (4-space → 6-space indent)
4. Removed 25+ duplicate closing tags
5. Added 3 missing section closing divs:
   - Basic School Info section (Step 3) - line 1581
   - Assessment done conditional (Step 4) - line 2063
   - Personal Opinion section (Step 6) - line 2428

**Fields Fixed**: school_info_username, school_info_password, social_worker_name, social_worker_phone, youth_worker_name, youth_worker_phone, assessment_details, personal_opinion, and 20+ others

**Verification**:
```bash
npm run build  # Now passes component compilation
npm run dev    # Form renders correctly with all checkmarks
```

**Commit**: "Fix all FieldWrapper structure issues and missing closing tags in StudentDataForm"

### Issue 5: Field Validation Ignoring Completed Status (RESOLVED - January 2025)
**Problem**: Form validation required all fields to be filled even when they had green checkmarks (showing they were already completed and saved). Counselors couldn't navigate through the form without re-entering data in completed fields.

**Root Cause**: The `nextStep()` function validated ALL fields for a step without checking if they were in the `completedFields` set.

**Solution Applied**:
```typescript
const nextStep = async () => {
  const fieldsToValidate = getFieldsForStep(currentStep)
  // Filter out fields that are already completed
  const fieldsNeedingValidation = fieldsToValidate.filter(field => !completedFields.has(field))

  // If all fields are completed, allow moving to next step
  if (fieldsNeedingValidation.length === 0) {
    setCurrentStep(currentStep + 1)
    return
  }

  // Otherwise validate only incomplete fields
  const isValid = await trigger(fieldsNeedingValidation as (keyof FormData)[])
  if (isValid && currentStep < totalSteps) {
    setCurrentStep(currentStep + 1)
  }
}
```

**Result**:
- ✅ Fields with green checkmarks skip validation
- ✅ Only incomplete fields are validated
- ✅ Counselors can save progress and return later
- ✅ Navigation through completed steps without data re-entry
- ✅ Improved user experience for long forms

**Verification**:
```bash
# Form now allows navigation when fields are completed
# Green checkmark = field is trusted and validation skipped
```

**Commit**: "Fix field validation to skip already-completed fields"

### Issue 6: Mandatory Dropdown Fields & Validation Overhaul (RESOLVED - December 2025)
**Problem**: Many dropdown fields were optional and could be skipped. Also, some mandatory field error messages weren't displaying, and Page 6 submit validation wasn't working.

**Changes Made**:

1. **Page 2 - Family Information**:
   - Added error messages for `economic_details`, `debts_loans`, `family_background` fields
   - Parent 2 fields become mandatory when name is filled (conditional validation)
   - UI shows red asterisks and removes "(אופציונלי)" when Parent 2 name entered

2. **Page 3 - School Information**:
   - Made `known_to_welfare` and `youth_promotion` mandatory (cannot be "בחר")
   - Added validation error messages

3. **Page 4 - Intake Assessment + Learning**:
   - Made mandatory: `behavioral_issues`, `has_potential`, `learning_disability`, `adhd`, `assessment_done`, `assessment_needed`
   - Changed motivation label from long description to short "רמת מוטיבציה" with placeholder for instructions
   - All fields show red asterisks and error messages

4. **Page 5 - Risk Assessment**:
   - Made all 6 dropdown fields mandatory: `criminal_record`, `drug_use`, `smoking`, `psychological_treatment`, `psychiatric_treatment`, `takes_medication`
   - Added validation error messages

5. **Page 6 - Final Assessment**:
   - Changed `risk_level` from slider (defaulted to 5) to radio buttons (no default - must select)
   - Made `failing_subjects` fields mandatory when `failing_grades_count > 0`
   - Added Step 6 validation on submit button (validates only Page 6 fields)

**Technical Implementation**:
- Added `.refine()` to Zod schema for all mandatory dropdown fields
- Updated `getFieldsForStep()` for each step
- Dynamic validation for `failing_subjects` based on count
- Submit handler validates Step 6 before submission

**Commit**: "Add comprehensive mandatory field validation across all form steps"

---

## 🔮 Future Enhancements (Phase 2)

### Planned Features
1. **WhatsApp Integration** - Direct notifications to parents
2. **Document Upload** - Attach report cards, assessments
3. **Auto-Assignment** - Smart routing to House Managers
4. **Analytics Dashboard** - Conversion rates, bottlenecks
5. **Multi-Language** - Arabic and Russian support
6. **Offline Mode** - For areas with poor connectivity
7. **Bulk Operations** - Multiple referrals at once
8. **Template System** - Reusable form templates

### Integration Opportunities
- Google Calendar for scheduling
- Zoom/Teams for virtual assessments
- Payment gateway for donors
- Government reporting systems

---

## 📞 Quick Reference

### Key URLs (Local Development)
- Main Form: http://localhost:3000
- Consent Form: http://localhost:3000/consent/[REF-NUMBER]
- Student Form: http://localhost:3000/student-form/[REF-NUMBER]

### Key Commands
```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run lint       # Run linter
```

### Key Files to Modify
- Forms: `src/components/*Form.tsx`
- API Logic: `src/app/api/referrals/*/route.ts`
- Database Schema: `supabase-schema.sql`
- Types: `src/types/forms.ts`

---

## 💡 Tips for Future Development

1. **Always maintain privacy compliance** - No student data before consent
2. **Keep Hebrew translations consistent** - Use existing terminology
3. **Test mobile experience** - House Managers use phones in field
4. **Log extensively in development** - Helps debug workflow issues
5. **Use mock database for testing** - Avoids Supabase setup complexity
6. **Maintain free tier compatibility** - Non-profit budget constraint

---

## 📝 Original Requirements Reference

The original Word document (טופס הפניה 2025 לעדכון.doc) contains the complete paper form that this system digitizes. All fields from that document are implemented in the StudentDataForm component.

---

## Contact & Support

This is a pro bono project developed for Gesher Al HaNoar. For technical questions about the implementation, refer to this documentation or the inline code comments.

---

*Last Updated: January 2025 (Multi-Environment Setup)*
*Project Status: ✅ Fully Operational in Production with Complete Validation & Field Mappings*
*Live URL (Production): https://gesher-intake.vercel.app*
*Preview URL (Staging): https://gesher-intake-preview.vercel.app*
*Repository: https://github.com/Oronmail/gesher-intake (Private)*
*Email Service: Gmail SMTP (gesheryouth@gmail.com)*
*SMS Service: Inwise (Configured)*
*Database: Supabase (Secured with RLS)*
*Salesforce Production: https://geh.my.salesforce.com*
*Salesforce Sandbox: https://geh--partialsb.sandbox.my.salesforce.com*
*Security Status: ✅ All vulnerabilities patched, field-level security configured*
*File Uploads: ✅ Assessment files and grade sheets upload to Salesforce Notes & Attachments*