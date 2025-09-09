# Gesher Al HaNoar - Digital Intake System
## Comprehensive Project Documentation for Claude

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
- parent_phone: string
```

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

## 📧 Email Notification System (FULLY OPERATIONAL)

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

### Setup Requirements
1. Create free account at [Resend.com](https://resend.com)
2. Get API key from dashboard
3. Add to environment variables:
   ```
   RESEND_API_KEY=re_YOUR_API_KEY
   ```
4. For production: Verify domain or use resend.dev sender

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

### Environment Variables (CONFIGURED IN VERCEL)
```env
# .env.local
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://fftnsfaakvahqyfwhtku.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_MfBSFVfIWbZlb9_jzGZtiA_NjjFWHsN
SUPABASE_SERVICE_KEY=sb_secret_NRd5IXZ8dWPaa6eriTwiNQ_6daaBaFS

# Email Service (Resend)
RESEND_API_KEY=re_CxNvBTmc_KqPVvVKJoyCo8L5tJPHpZToN

# Salesforce Integration (JWT Bearer Authentication)
SALESFORCE_INSTANCE_URL=https://geh--partialsb.sandbox.my.salesforce.com
SALESFORCE_LOGIN_URL=https://test.salesforce.com
SALESFORCE_CLIENT_ID=your_connected_app_consumer_key
SALESFORCE_CLIENT_SECRET=your_connected_app_consumer_secret
SALESFORCE_USERNAME=oronmail@geh.com.partialsb
# Fallback (temporary access token - expires after 2 hours)
SALESFORCE_ACCESS_TOKEN=your_access_token_if_jwt_not_configured

# Application
NEXT_PUBLIC_APP_URL=https://gesher-intake.vercel.app
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

### ✅ Completed Features
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

### 🚧 Pending Features
- [x] Salesforce integration - Registration_Request__c queue object deployed
- [ ] SMS notifications (WhatsApp/Twilio)
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

# Optional Fallback (if JWT not configured)
SALESFORCE_INSTANCE_URL=https://geh--partialsb.sandbox.my.salesforce.com
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
- `Referral_Number__c` - Text(50) - Unique referral ID
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
- `Parent2_Name__c` - Text(100)
- `Parent2_ID__c` - Text(20)
- `Parent2_Address__c` - Text(255)
- `Parent2_Phone__c` - Phone
- `Parent2_Signature__c` - LongTextArea(32768) - Base64 signature
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

*Last Updated: January 2025*
*Project Status: Fully Deployed & Operational*
*Live URL: https://gesher-intake.vercel.app*
*Repository: https://github.com/Oronmail/gesher-intake*
*Email Service: Resend (Configured & Working)*
*Database: Supabase (Connected)*