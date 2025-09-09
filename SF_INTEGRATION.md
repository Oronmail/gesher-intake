# Salesforce Integration Documentation
## Registration_Request__c Queue Object

---

## Overview

The Salesforce integration implements complete pipeline tracking with immediate visibility:

### Workflow Stages
1. **Counselor Submission** → Creates Registration_Request__c with "Pending Consent"
2. **Parent Consent** → Updates to "Consent Signed" with signatures
3. **Student Data** → Updates to "Data Submitted" with full information
4. **Staff Review** → "Pending Review" → "In Review"
5. **Final Decision** → "Approved" or "Rejected"

**Key Features**:
- Registration_Request__c record created immediately upon counselor submission
- Full visibility from initial request through completion
- No student data stored in Supabase - goes directly to Salesforce
- Real-time status tracking for non-profit staff

---

## Queue Object Structure

### Object Details
- **Object Name**: Registration Request
- **API Name**: Registration_Request__c
- **Auto-Number Field**: REG-{0000}
- **Sharing Model**: ReadWrite
- **Deployment Status**: ✅ Deployed to sandbox

---

## Field API Reference (89 Fields)

### Quick Copy Reference
For easy field mapping in code:

```javascript
const fieldMapping = {
  // Metadata
  referralNumber: 'Name',  // Standard Name field stores the referral number
  status: 'Status__c',
  priority: 'Priority__c',
  submissionDate: 'Submission_Date__c',
  consentDate: 'Consent_Date__c',
  
  // Counselor
  counselorName: 'Counselor_Name__c',
  counselorEmail: 'Counselor_Email__c',
  schoolName: 'School_Name__c',
  
  // Student Personal
  studentFirstName: 'Student_First_Name__c',
  studentLastName: 'Student_Last_Name__c',
  studentId: 'Student_ID__c',
  dateOfBirth: 'Date_of_Birth__c',
  gender: 'Gender__c',
  countryOfBirth: 'Country_of_Birth__c',
  immigrationYear: 'Immigration_Year__c',
  studentAddress: 'Student_Address__c',
  studentFloor: 'Student_Floor__c',
  studentApartment: 'Student_Apartment__c',
  studentPhone: 'Student_Phone__c',
  studentMobile: 'Student_Mobile__c',
  schoolSystemPassword: 'School_System_Password__c',
  
  // Parents
  parent1Name: 'Parent1_Name__c',
  parent1Id: 'Parent1_ID__c',
  parent1Address: 'Parent1_Address__c',
  parent1Phone: 'Parent1_Phone__c',
  parent1Signature: 'Parent1_Signature__c',
  parent2Name: 'Parent2_Name__c',
  parent2Id: 'Parent2_ID__c',
  parent2Address: 'Parent2_Address__c',
  parent2Phone: 'Parent2_Phone__c',
  parent2Signature: 'Parent2_Signature__c',
  parentEmail: 'Parent_Email__c',
  
  // Family
  siblingsCount: 'Siblings_Count__c',
  fatherName: 'Father_Name__c',
  fatherMobile: 'Father_Mobile__c',
  fatherOccupation: 'Father_Occupation__c',
  fatherProfession: 'Father_Profession__c',
  fatherIncome: 'Father_Income__c',
  motherName: 'Mother_Name__c',
  motherMobile: 'Mother_Mobile__c',
  motherOccupation: 'Mother_Occupation__c',
  motherProfession: 'Mother_Profession__c',
  motherIncome: 'Mother_Income__c',
  debtsLoans: 'Debts_Loans__c',
  parentInvolvement: 'Parent_Involvement__c',
  economicStatus: 'Economic_Status__c',
  economicDetails: 'Economic_Details__c',
  familyBackground: 'Family_Background__c',
  
  // School & Academic
  grade: 'Grade__c',
  homeroomTeacher: 'Homeroom_Teacher__c',
  teacherPhone: 'Teacher_Phone__c',
  schoolCounselorName: 'School_Counselor_Name__c',
  schoolCounselorPhone: 'School_Counselor_Phone__c',
  failingGradesCount: 'Failing_Grades_Count__c',
  failingSubjects: 'Failing_Subjects__c',
  
  // Welfare
  knownToWelfare: 'Known_to_Welfare__c',
  socialWorkerName: 'Social_Worker_Name__c',
  socialWorkerPhone: 'Social_Worker_Phone__c',
  youthPromotion: 'Youth_Promotion__c',
  youthWorkerName: 'Youth_Worker_Name__c',
  youthWorkerPhone: 'Youth_Worker_Phone__c',
  
  // Assessment
  behavioralIssues: 'Behavioral_Issues__c',
  hasPotential: 'Has_Potential__c',
  motivationLevel: 'Motivation_Level__c',
  motivationType: 'Motivation_Type__c',
  externalMotivators: 'External_Motivators__c',
  socialStatus: 'Social_Status__c',
  afternoonActivities: 'Afternoon_Activities__c',
  
  // Learning & Health
  learningDisability: 'Learning_Disability__c',
  requiresRemedialTeaching: 'Requires_Remedial_Teaching__c',
  adhd: 'ADHD__c',
  adhdTreatment: 'ADHD_Treatment__c',
  assessmentDone: 'Assessment_Done__c',
  assessmentNeeded: 'Assessment_Needed__c',
  assessmentDetails: 'Assessment_Details__c',
  
  // Risk Assessment
  criminalRecord: 'Criminal_Record__c',
  drugUse: 'Drug_Use__c',
  smoking: 'Smoking__c',
  probationOfficer: 'Probation_Officer__c',
  youthProbationOfficer: 'Youth_Probation_Officer__c',
  psychologicalTreatment: 'Psychological_Treatment__c',
  psychiatricTreatment: 'Psychiatric_Treatment__c',
  takesMedication: 'Takes_Medication__c',
  medicationDescription: 'Medication_Description__c',
  riskLevel: 'Risk_Level__c',
  riskFactors: 'Risk_Factors__c',
  
  // Final Assessment
  militaryServicePotential: 'Military_Service_Potential__c',
  canHandleProgram: 'Can_Handle_Program__c',
  personalOpinion: 'Personal_Opinion__c'
};
```

---

## Field Types & Constraints

### Text Fields
| Field | Max Length |
|-------|------------|
| Name (standard field) | 80 |
| Student_First_Name__c | 100 |
| Student_Last_Name__c | 100 |
| School_Name__c | 200 |
| Student_Address__c | 255 |

### Picklist Values

**Status__c** (Updated with workflow tracking):
- Pending Consent - Initial counselor submission
- Consent Signed - Parent signed consent form
- Data Submitted - Student data completed
- Pending Review - Ready for staff review
- In Review - Being reviewed by staff
- Approved - Accepted into program
- Rejected - Not accepted

**Priority__c**:
- High
- Medium
- Low

**Gender__c**:
- Male
- Female

**Parent_Involvement__c**:
- Inhibiting
- Promoting
- No Involvement

**Economic_Status__c**:
- Low
- Medium
- High

**Motivation_Level__c**:
- Low
- Medium
- High

**Motivation_Type__c**:
- Internal
- External

### Long Text Areas
- Parent1_Signature__c (32768 chars) - Base64 encoded signature
- Parent2_Signature__c (32768 chars) - Base64 encoded signature
- Economic_Details__c (4000 chars)
- Family_Background__c (4000 chars)
- Assessment_Details__c (4000 chars)
- Risk_Factors__c (4000 chars)
- Personal_Opinion__c (4000 chars)

### Number Fields
- Siblings_Count__c - Precision: 2, Scale: 0
- Failing_Grades_Count__c - Precision: 2, Scale: 0
- Risk_Level__c - Precision: 2, Scale: 0 (1-10 scale)

### Date/DateTime Fields
- Date_of_Birth__c - Date only
- Submission_Date__c - DateTime with timezone
- Consent_Date__c - DateTime with timezone

### Checkbox Fields (Boolean)
- Known_to_Welfare__c
- Youth_Promotion__c
- Behavioral_Issues__c
- Has_Potential__c
- Learning_Disability__c
- Requires_Remedial_Teaching__c
- ADHD__c
- Assessment_Done__c
- Assessment_Needed__c
- Criminal_Record__c
- Drug_Use__c
- Smoking__c
- Psychological_Treatment__c
- Psychiatric_Treatment__c
- Takes_Medication__c
- Military_Service_Potential__c
- Can_Handle_Program__c

---

## Authentication Method: JWT Bearer Token Flow

### Overview
The system uses JWT Bearer authentication for fully automated server-to-server communication:
- **No manual intervention required** - Tokens refresh automatically
- **Certificate-based security** - Uses RSA-256 signed JWT tokens
- **Automatic session recovery** - Handles expired sessions seamlessly
- **Multiple fallback methods** - Ensures high availability

### JWT Service Architecture (src/lib/salesforce-jwt.ts)
The JWT service handles all authentication automatically:
- Generates JWT tokens with 5-minute expiry
- Exchanges JWT for access tokens via OAuth
- Refreshes tokens before they expire (every 50 minutes)
- Automatically retries on session failures

## Implementation Code

### Salesforce JWT Service (src/lib/salesforce-jwt.ts)

The service now includes JWT Bearer authentication and three key methods for the complete workflow:

```typescript
import jsforce from 'jsforce';
import jwt from 'jsonwebtoken';

class SalesforceService {
  private conn: jsforce.Connection;

  // 1. Create initial record when counselor submits
  async createInitialRegistration(data: InitialRegistrationData) {
    const initialRequest = {
      Name: data.referralNumber,  // Use standard Name field
      Status__c: 'Pending Consent',
      Counselor_Name__c: data.counselorName,
      Counselor_Email__c: data.counselorEmail,
      School_Name__c: data.schoolName,
      Parent_Email__c: data.parentEmail,
      Parent1_Phone__c: data.parentPhone,
      Submission_Date__c: new Date().toISOString(),
    };
    const result = await this.conn.sobject('Registration_Request__c').create(initialRequest);
    return { success: result.success, recordId: result.id };
  }

  // 2. Update with consent data
  async updateWithConsent(recordId: string, data: ConsentUpdateData) {
    const consentUpdate = {
      Id: recordId,
      Status__c: 'Consent Signed',
      Parent1_Name__c: data.parent1Name,
      Parent1_Signature__c: data.parent1Signature,
      // ... parent fields
      Consent_Date__c: data.consentDate,
    };
    const result = await this.conn.sobject('Registration_Request__c').update(consentUpdate);
    return { success: result.success };
  }

  // 3. Update with student data
  async updateWithStudentData(recordId: string, data: RegistrationRequestData) {
    const studentUpdate = {
      Id: recordId,
      Status__c: 'Data Submitted',
      // ... all 89 fields
    };
    const result = await this.conn.sobject('Registration_Request__c').update(studentUpdate);
    return { success: result.success };
  }
}
```

### API Routes - Complete Workflow

**1. Initial Submission (src/app/api/referrals/initiate/route.ts)**
```typescript
// Create Registration_Request__c immediately
const salesforce = new SalesforceService();
const sfResult = await salesforce.createInitialRegistration({
  referralNumber,
  counselorName,
  counselorEmail,
  schoolName,
  parentEmail,
  parentPhone,
});
// Store SF record ID in Supabase for tracking
```

**2. Consent Update (src/app/api/referrals/consent/route.ts)**
```typescript
// Update existing SF record with consent
if (referral.salesforce_contact_id) {
  await salesforce.updateWithConsent(referral.salesforce_contact_id, consentData);
}
```

**3. Student Data (src/app/api/referrals/student-data/route.ts)**
```typescript
// Update SF record with complete student data
await salesforce.updateWithStudentData(referral.salesforce_contact_id, registrationData);
```

---

## SFDX Commands

### Deploy to Sandbox
```bash
# Deploy all metadata
sf project deploy start -d force-app -o gesher-sandbox

# Deploy specific object
sf project deploy start -d force-app/main/default/objects/Registration_Request__c -o gesher-sandbox
```

### Test Deployment
```bash
# Run test script
node test-sf-queue.js

# Query records via CLI
sf data query -q "SELECT Id, Name, Status__c FROM Registration_Request__c" -o gesher-sandbox
```

### Generate Fields
```bash
# Create field metadata files
node create-sf-fields.js
```

---

## Environment Variables

```env
# JWT Bearer Authentication (Primary Method - Fully Automated)
SALESFORCE_CLIENT_ID=your_connected_app_consumer_key
SALESFORCE_CLIENT_SECRET=your_connected_app_consumer_secret  
SALESFORCE_USERNAME=your_salesforce_username
SALESFORCE_LOGIN_URL=https://test.salesforce.com

# Fallback Method (Direct Access Token)
SALESFORCE_INSTANCE_URL=https://geh--partialsb.sandbox.my.salesforce.com
SALESFORCE_ACCESS_TOKEN=temporary_access_token_if_jwt_fails
```

### Certificate Files Required
- `certs/server.key` - Private key for JWT signing (never commit)
- `certs/server.crt` - Public certificate (upload to Connected App)

---

## Workflow States - Complete Pipeline

```
┌─────────────────┐
│ Pending Consent │ ← Counselor submits initial form
└────────┬────────┘
         ↓
┌─────────────────┐
│ Consent Signed  │ ← Parent signs digital consent
└────────┬────────┘
         ↓
┌─────────────────┐
│ Data Submitted  │ ← Student data completed
└────────┬────────┘
         ↓
┌─────────────────┐
│ Pending Review  │ ← Ready for staff review
└────────┬────────┘
         ↓
┌─────────────────┐
│   In Review     │ ← Staff actively reviewing
└────────┬────────┘
         ↓
    ┌────┴────┐
┌───┴───┐ ┌───┴────┐
│Approved│ │Rejected│ ← Final decision
└────────┘ └────────┘
```

**Key Benefits**:
- Immediate visibility upon counselor submission
- Track conversion rates between stages
- Identify and act on stalled requests
- Complete audit trail of the process

---

## Data Mapping: Form to Salesforce

### Student Form Step 1 → Personal Information
```javascript
{
  Student_First_Name__c: formData.firstName,
  Student_Last_Name__c: formData.lastName,
  Student_ID__c: formData.studentId,
  Date_of_Birth__c: formData.dateOfBirth,
  Gender__c: formData.gender,
  Country_of_Birth__c: formData.birthCountry,
  Immigration_Year__c: formData.immigrationYear,
  Student_Address__c: formData.address,
  Student_Floor__c: formData.floor,
  Student_Apartment__c: formData.apartment,
  Student_Phone__c: formData.homePhone,
  Student_Mobile__c: formData.mobilePhone,
  School_System_Password__c: formData.schoolPassword
}
```

### Parent Consent → Signature Fields
```javascript
{
  Parent1_Name__c: consentData.parent1_name,
  Parent1_ID__c: consentData.parent1_id,
  Parent1_Signature__c: consentData.parent1_signature, // Base64
  Parent2_Name__c: consentData.parent2_name,
  Parent2_ID__c: consentData.parent2_id,
  Parent2_Signature__c: consentData.parent2_signature, // Base64
  Consent_Date__c: new Date().toISOString()
}
```

---

## Testing Checklist

- [ ] Object deployed to sandbox
- [ ] All 89 fields created
- [ ] jsforce connection established
- [ ] Test record creation via API
- [ ] Verify field mappings
- [ ] Check picklist values
- [ ] Validate signature storage (Base64)
- [ ] Test query operations
- [ ] Verify auto-number generation

---

## Next Steps

1. **Stage 2 Implementation**:
   - Create Apex trigger for Contact conversion
   - Build approval process
   - Design house visit checklist

2. **Monitoring**:
   - Set up reports for queue status
   - Create dashboards for staff
   - Configure alerts for new submissions

3. **Integration Testing**:
   - End-to-end workflow test
   - Performance testing
   - Security review

---

*Last Updated: January 2025*
*Object Status: Deployed to Sandbox*
*Total Fields: 89 Custom Fields + Page Layouts + Lightning Pages*
*Authentication: JWT Bearer Token (Fully Automated)*