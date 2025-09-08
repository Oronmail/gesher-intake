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
- **Temporary Storage**: Supabase (free tier) or mock for local testing
- **Final Storage**: Salesforce (existing client system)
- **Hosting**: Vercel (free tier)
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

### Environment Variables
```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_key
SALESFORCE_USERNAME=your_salesforce_username
SALESFORCE_PASSWORD=your_salesforce_password
SALESFORCE_SECURITY_TOKEN=your_security_token
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
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
- [x] Counselor initial form
- [x] Parent digital consent with dual signatures
- [x] Comprehensive 7-step student data form
- [x] Hebrew UI throughout
- [x] Organization logo integration
- [x] Mock database for testing
- [x] API endpoints structure
- [x] Mobile-responsive design
- [x] Form validation with Zod
- [x] RTL layout support

### 🚧 Pending Features
- [ ] Salesforce integration (JSforce setup)
- [ ] Email/SMS notifications
- [ ] Production Supabase setup
- [ ] Vercel deployment
- [ ] Authentication for counselors
- [ ] Admin dashboard
- [ ] Data export functionality

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

*Last Updated: December 2024*
*Project Status: MVP Complete, Ready for Production Setup*