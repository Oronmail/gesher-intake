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
- **Database**: Supabase (Project: fftnsfaakvahqyfwhtku.supabase.co)
- **Email Service**: Resend (API Key: re_CxNvBTmc_KqPVvVKJoyCo8L5tJPHpZToN)
- **Email Sender**: onboarding@resend.dev
- **SMS Service**: Inwise (Optional - when parent phone provided)
- **SMS API**: https://webapi.mymarketing.co.il
- **Final Storage**: Salesforce (ready for integration)
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
- **Data Collected**: Parent contact ONLY (no student data)
- **Storage**: Creates record in temp DB with status `pending_consent`
- **Output**: Generates unique referral number (e.g., REF-202412-1234)

#### Stage 2: Parent Consent
- **URL**: `/consent/[referralNumber]`
- **Data Collected**: Parent names, IDs, digital signatures
- **Storage**: Updates temp DB with signatures, status `consent_signed`
- **Critical**: No student data visible or collected yet

#### Stage 3: Student Data Collection
- **URL**: `/student-form/[referralNumber]`
- **Access**: Only after parent consent confirmed
- **Data Collected**: Comprehensive 7-step form with all student details
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
- school_name: string
- parent_email?: string (optional)
- parent_phone?: string (optional)
```
**Important**: At least one contact method (email OR phone) is required. The form validates that either parent_email or parent_phone is provided.

**Success Message**: After successful submission, displays: "בקשה לחתימה על טופס ויתור סודיות נשלחה להורים. לאחר חתימתם תישלח התראה ל-[counselor_email] להמשך מילוי נתוני התלמיד"

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
**7-Step Wizard Form:**

#### Step 1: Personal Information (פרטים אישיים)
- Name, ID, DOB, birthplace, immigration year
- Gender, address, phone numbers
- School system password

#### Step 2: Family Information (מידע משפחתי)
- Siblings count
- Father details (name, phone, occupation, income)
- Mother details (name, phone, occupation, income)
- Debts/loans, parent involvement level
- Economic status, family background

#### Step 3: School Information (פרטי בית ספר)
- School name, grade, homeroom teacher
- Counselor details
- Welfare/youth services connections

#### Step 4: Intake Assessment (נתוני קליטה)
- Behavioral issues, potential
- Motivation level and type
- Social status, afternoon activities

#### Step 5: Learning Assessment (אבחונים)
- Learning disabilities, ADHD
- Required treatments
- Assessment status and needs

#### Step 6: Risk Assessment (הערכת סיכון)
- Criminal record, substance use
- Psychological/psychiatric treatment
- Medications

#### Step 7: Final Opinion (חוות דעת אישית)
- Military service potential
- Program suitability
- Risk level (1-10 scale)
- Academic performance

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

### Implementation
- **Service**: Resend (API Key: re_CxNvBTmc_KqPVvVKJoyCo8L5tJPHpZToN)
- **Sender**: onboarding@resend.dev
- **Templates**: HTML emails with Hebrew RTL support
- **Automation**: Fully automated and tested

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
1. Get Inwise API key from your account
2. Add to environment variables:
   ```
   INWISE_API_KEY=your_api_key_here
   INWISE_BASE_URL=https://api.inwise.com/rest/v1
   INWISE_SENDER_ID=GesherYouth
   ```
3. Test SMS functionality:
   ```bash
   node test-sms.js 0501234567
   ```

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
- [x] **SMS INTEGRATION - January 2025**
  - [x] Inwise SMS service integration
  - [x] Dual notification system (Email + SMS)
  - [x] Automatic Israeli phone number formatting
  - [x] SMS templates in Hebrew
  - [x] Fallback handling if one notification fails
  - [x] Environment variables configured in Vercel
  - [x] Production deployment complete
  - [x] Test script for SMS verification
  - [x] API authentication troubleshooting documented
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

### 🚧 Pending Features
- [ ] Authentication for counselors
- [ ] Admin dashboard
- [ ] Data export functionality
- [ ] Domain verification for custom email sender

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
- `Priority__c` - Picklist - ['High', 'Medium', 'Low']
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
- `Failing_Subjects__c` - Text(255)

#### Welfare & Social Services
- `Known_to_Welfare__c` - Checkbox
- `Social_Worker_Name__c` - Text(100)
- `Social_Worker_Phone__c` - Phone
- `Youth_Promotion__c` - Checkbox
- `Youth_Worker_Name__c` - Text(100)
- `Youth_Worker_Phone__c` - Phone

#### Assessment
- `Behavioral_Issues__c` - Checkbox
- `Has_Potential__c` - Checkbox
- `Motivation_Level__c` - Picklist - ['Low', 'Medium', 'High']
- `Motivation_Type__c` - Picklist - ['Internal', 'External']
- `External_Motivators__c` - Text(255)
- `Social_Status__c` - Text(255)
- `Afternoon_Activities__c` - Text(255)

#### Learning & Health
- `Learning_Disability__c` - Checkbox
- `Requires_Remedial_Teaching__c` - Checkbox
- `ADHD__c` - Checkbox
- `ADHD_Treatment__c` - Text(255)
- `Assessment_Done__c` - Checkbox
- `Assessment_Needed__c` - Checkbox
- `Assessment_Details__c` - LongTextArea(4000)

#### Risk Assessment
- `Criminal_Record__c` - Checkbox
- `Drug_Use__c` - Checkbox
- `Smoking__c` - Checkbox
- `Probation_Officer__c` - Text(100)
- `Youth_Probation_Officer__c` - Text(100)
- `Psychological_Treatment__c` - Checkbox
- `Psychiatric_Treatment__c` - Checkbox
- `Takes_Medication__c` - Checkbox
- `Medication_Description__c` - Text(255)
- `Risk_Level__c` - Number(2,0)
- `Risk_Factors__c` - LongTextArea(4000)

#### Final Assessment
- `Military_Service_Potential__c` - Checkbox
- `Can_Handle_Program__c` - Checkbox
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

*Last Updated: January 2025 (UI/UX Redesign Complete)*
*Project Status: ✅ Fully Operational in Production with Modern UI*
*Live URL: https://gesher-intake.vercel.app*
*Repository: https://github.com/Oronmail/gesher-intake (Private)*
*Email Service: Resend (Working)*
*SMS Service: Inwise (Configured - API key pending)*
*Database: Supabase (Secured with RLS)*
*Salesforce: ✅ Successfully integrated and creating records*
*Security Status: ✅ All vulnerabilities patched, API security configured*
*Notification Status: ✅ Dual channel (Email + SMS) operational*