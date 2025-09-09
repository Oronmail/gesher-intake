# Registration_Request__c Page Layouts Documentation

## Overview
Created comprehensive Salesforce Page Layouts for the Registration_Request__c object, organizing all 89 fields into logical, user-friendly sections with bilingual Hebrew/English labels.

## Files Created

### 1. Main Page Layout
**File**: `force-app/main/default/layouts/Registration_Request__c-Registration Request Layout.layout-meta.xml`

**Purpose**: Full page layout for viewing and editing Registration Request records in Salesforce.

### 2. Compact Layout
**File**: `force-app/main/default/objects/Registration_Request__c/compactLayouts/Registration_Request_Compact.compactLayout-meta.xml`

**Purpose**: Condensed view for list views, related lists, and mobile displays.

## Page Layout Structure

### 14 Logical Sections

1. **Request Information - פרטי הבקשה**
   - Referral Number, Status, Priority
   - Submission Date, Consent Date

2. **Counselor & School - יועץ ובית ספר**
   - Counselor Name, Email
   - School Name

3. **Student Personal Information - פרטים אישיים של התלמיד**
   - Name, ID, Date of Birth, Gender
   - Address, Contact Information
   - Immigration details

4. **Parent/Guardian Information - פרטי הורים/אפוטרופוסים**
   - Parent 1 & 2 Details
   - Contact Information
   - Parent Email

5. **Digital Signatures - חתימות דיגיטליות**
   - Parent 1 Signature (Base64)
   - Parent 2 Signature (Base64)

6. **Family Information - מידע משפחתי**
   - Parents' Names, Occupations, Income
   - Siblings Count

7. **Economic Status - מצב כלכלי**
   - Economic Status Level
   - Debts/Loans
   - Parent Involvement
   - Economic Details, Family Background

8. **School & Academic Information - מידע לימודי**
   - Grade, Teachers
   - Academic Performance
   - Failing Grades/Subjects

9. **Welfare & Social Services - רווחה ושירותים חברתיים**
   - Welfare Status
   - Social Worker Details
   - Youth Promotion Services

10. **Behavioral & Motivation Assessment - הערכת התנהגות ומוטיבציה**
    - Behavioral Issues, Potential
    - Motivation Level/Type
    - Social Status, Activities

11. **Learning & Health Assessment - הערכת למידה ובריאות**
    - Learning Disabilities, ADHD
    - Assessment Status
    - Treatment Details

12. **Risk Assessment - הערכת סיכון**
    - Criminal Record, Substance Use
    - Psychological/Psychiatric Treatment
    - Medications
    - Risk Level (1-10)

13. **Risk Factors Details - פרטי גורמי סיכון**
    - Detailed Risk Factors (Long Text)

14. **Final Assessment - הערכה סופית**
    - Military Service Potential
    - Program Suitability
    - Personal Opinion

## Compact Layout Fields
Displays key information in list views:
- Referral Number
- Status
- Student Name (First & Last)
- School Name
- Priority
- Submission Date
- Counselor Name
- Parent 1 Name
- Risk Level

## Related Lists Included
- Notes & Attachments
- Files
- Activities (Tasks & Events)
- Activity History

## Mini Layout (Console View)
Optimized for Service Console with essential fields:
- Referral Number
- Status
- Student Name
- School Name
- Priority

## Deployment Instructions

### Deploy to Salesforce
```bash
# Deploy layouts to sandbox
cd "/Users/oronsmac/Library/CloudStorage/Dropbox-ChinkyBeachLTD/oron mizrachi/D2R Internet Holdings, LLC/Developments/Gesher/gesher-intake"

sf project deploy start -d force-app/main/default/layouts -o gesher-sandbox
sf project deploy start -d force-app/main/default/objects/Registration_Request__c/compactLayouts -o gesher-sandbox
```

### Assign Layout to Profiles
After deployment:
1. Go to Setup → Object Manager → Registration_Request__c
2. Click "Page Layouts"
3. Click "Page Layout Assignment"
4. Assign "Registration Request Layout" to relevant profiles

## Field Organization Benefits

### Logical Grouping
- Fields grouped by business process stage
- Bilingual labels for Israeli users
- Progressive disclosure of information

### User Experience
- Two-column layout for efficient space usage
- Related fields placed together
- System fields in separate section
- Long text fields in single-column sections

### Mobile Optimization
- Compact layout for mobile devices
- Essential fields prioritized
- Quick access to key information

## Visual Highlights

### Critical Fields
- **Status**: Controls workflow progression
- **Risk Level**: 1-10 scale for quick assessment
- **Priority**: High/Medium/Low for triage
- **Signatures**: Base64 encoded for legal compliance

### Conditional Visibility
Consider adding field dependencies:
- Social Worker fields visible when Known_to_Welfare = true
- ADHD Treatment visible when ADHD = true
- Medication Description visible when Takes_Medication = true

## Next Steps

1. **Deploy to Sandbox**
   ```bash
   sf project deploy start -d force-app -o gesher-sandbox
   ```

2. **Test Layout**
   - Create test record
   - Verify all sections display
   - Check mobile rendering
   - Test related lists

3. **Configure Record Types** (if needed)
   - Create different layouts for different stages
   - Simplify views for specific user groups

4. **Add Validation Rules**
   - Ensure required fields by stage
   - Validate signature presence before status changes

5. **Create List Views**
   - Pending Review queue
   - High Priority cases
   - Today's submissions
   - Awaiting consent

## Layout Features

### Highlights Panel
- Enabled for quick record overview
- Shows key fields at top of page

### Interaction Log
- Enabled for tracking communications
- Useful for counselor follow-ups

### Field Behavior
- Most fields set to "Edit" for flexibility
- Status field "Required" for workflow
- System fields "Readonly"

## Performance Considerations
- Large text fields (signatures, opinions) in separate sections
- Optimized field ordering for common use cases
- Minimal scrolling for key information access

---

*Created: January 2025*
*Total Sections: 14*
*Total Fields: 89*
*Bilingual Support: Hebrew/English*