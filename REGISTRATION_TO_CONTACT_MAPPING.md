# Registration Request to Contact Object Mapping Analysis
## Gesher Intake System - Field Migration Strategy

---

## 📊 Executive Summary

**Date Generated**: January 10, 2025  
**Objects Analyzed**: Registration_Request__c → Contact  
**Total Fields**: 102 Registration fields → 250 Contact fields  
**Action Required**: Create 77 custom fields on Contact object  

### Key Metrics:
- **Direct Matches**: 12 fields (12%)
- **Fields Needing Custom Fields**: 77 fields (75%)
- **Fields with No Clear Mapping**: 68 fields (67%)
- **Fields with Suggested Mapping**: 34 fields (33%)

---

## 🎯 Migration Strategy

### Phase 1: Direct Field Mappings (Immediate)
These fields can be mapped directly without any modifications:

| Registration Field | Contact Field | Notes |
|-------------------|---------------|-------|
| Student_First_Name__c | FirstName | Direct name mapping |
| Student_Last_Name__c | LastName | Direct name mapping |
| Date_of_Birth__c | Birthdate | Date field mapping |
| Student_Phone__c | Phone | Primary phone |
| Student_Mobile__c | MobilePhone | Mobile phone |
| Student_Address__c | MailingStreet | Address line 1 |
| Parent_Email__c | Email | Can use for initial contact |
| School_Name__c | AccountId | Link to School Account |

### Phase 2: Fields Requiring Custom Fields (Priority)
These critical fields need custom fields created on Contact:

#### Student Information
- **Student_ID__c** → Create Contact.Student_ID__c (Text, 20)
- **Gender__c** → Create Contact.Gender__c (Picklist: Male/Female)
- **Country_of_Birth__c** → Create Contact.Country_of_Birth__c (Text, 100)
- **Immigration_Year__c** → Create Contact.Immigration_Year__c (Text, 4)
- **Grade__c** → Create Contact.Grade_Level__c (Text, 20)
- **School_System_Password__c** → Create Contact.School_Password__c (Text, Encrypted)

#### Parent Information (Related Contacts)
- **Parent1_Name__c** → Create Contact.Primary_Parent__c (Lookup to Contact)
- **Parent1_ID__c** → Create Contact.Primary_Parent_ID__c (Text, 20)
- **Parent1_Phone__c** → Create Contact.Primary_Parent_Phone__c (Phone)
- **Parent2_Name__c** → Create Contact.Secondary_Parent__c (Lookup to Contact)
- **Parent2_ID__c** → Create Contact.Secondary_Parent_ID__c (Text, 20)
- **Parent2_Phone__c** → Create Contact.Secondary_Parent_Phone__c (Phone)

#### Academic Information
- **Homeroom_Teacher__c** → Create Contact.Homeroom_Teacher__c (Text, 100)
- **Teacher_Phone__c** → Create Contact.Teacher_Phone__c (Phone)
- **School_Counselor_Name__c** → Create Contact.School_Counselor__c (Text/Lookup)
- **Failing_Grades_Count__c** → Create Contact.Failing_Grades__c (Number)
- **Failing_Subjects__c** → Create Contact.Failing_Subjects__c (Text, 255)

#### Assessment Fields
- **Behavioral_Issues__c** → Create Contact.Has_Behavioral_Issues__c (Checkbox)
- **Has_Potential__c** → Create Contact.Has_Academic_Potential__c (Checkbox)
- **Motivation_Level__c** → Create Contact.Motivation_Level__c (Picklist)
- **Learning_Disability__c** → Create Contact.Has_Learning_Disability__c (Checkbox)
- **ADHD__c** → Create Contact.Has_ADHD__c (Checkbox)
- **Risk_Level__c** → Create Contact.Risk_Assessment_Score__c (Number 1-10)

### Phase 3: Complex Field Mappings
These fields require special handling or data transformation:

#### Address Consolidation
Combine multiple address fields into Contact address fields:
```
Student_Address__c + Student_Floor__c + Student_Apartment__c 
→ MailingStreet (concatenated)
```

#### Signature Fields
Parent signatures should be stored as attachments or in a related object:
- **Parent1_Signature__c** → Store as File/Attachment
- **Parent2_Signature__c** → Store as File/Attachment

#### Status Tracking
Create a custom object or use Case object for tracking:
- **Status__c** → Create custom Status field or use Case.Status
- **Submission_Date__c** → Use Contact.CreatedDate or custom field
- **Consent_Date__c** → Create Contact.Consent_Date__c

---

## 🔧 Implementation Plan

### Step 1: Create Custom Fields (Week 1)
1. Create field set on Contact for "Gesher Program Fields"
2. Add all 77 identified custom fields
3. Set appropriate field-level security
4. Create page layouts for Gesher program participants

### Step 2: Data Migration Rules (Week 2)
1. Create mapping configuration
2. Handle null values and defaults
3. Set up data validation rules
4. Create duplicate prevention rules

### Step 3: Migration Process (Week 3)
1. Export Registration_Request__c data
2. Transform data according to mapping
3. Import into Contact object
4. Verify data integrity

### Step 4: Relationship Management
1. Create parent-child relationships between Contacts
2. Link students to school Accounts
3. Associate with counselor Users/Contacts
4. Create household relationships

---

## ⚠️ Critical Considerations

### Data Loss Prevention
The following fields have no clear mapping and need business decision:
- All welfare/social worker fields
- Criminal record and substance use fields
- Psychiatric treatment fields
- Military service potential
- Family financial information

**Recommendation**: Create a related "Program Assessment" custom object to store sensitive assessment data separately from Contact.

### Privacy & Security
- Encrypt sensitive fields (ID numbers, passwords)
- Set appropriate field-level security
- Consider creating separate record types
- Implement sharing rules for counselor access

### Parent Relationships
**Option 1**: Create separate Contact records for parents and link via lookup
**Option 2**: Store parent info as fields on student Contact
**Option 3**: Use Account-Contact relationships with household Accounts

**Recommendation**: Option 1 - Separate parent Contacts with relationships

---

## 📋 Field Categories Analysis

### ✅ Ready to Map (12 fields)
- Basic contact information
- Name fields
- Phone numbers
- Birth date
- Primary address

### 🔧 Need Custom Fields (77 fields)
- Student-specific information
- Parent/guardian details
- Academic information
- Assessment data
- Risk factors
- Program-specific fields

### ❌ No Standard Mapping (68 fields)
- Signature fields
- Complex assessment fields
- Sensitive information
- Program-specific evaluations

---

## 🎯 Recommended Actions

### Immediate Actions:
1. **Review the Excel file**: `Registration_to_Contact_Mapping_2025-09-10.xlsx`
2. **Approve custom field creation**: Review "Custom Fields to Create" sheet
3. **Decide on sensitive data**: Determine handling of criminal/medical records

### Planning Actions:
1. **Design data model**: Decide on related objects vs. fields on Contact
2. **Set security model**: Define who can see which fields
3. **Plan migration timing**: Schedule migration windows

### Technical Actions:
1. **Create sandbox**: Test migration in sandbox first
2. **Build migration tools**: Use Data Loader or custom Apex
3. **Validate mappings**: Test with sample data

---

## 📊 Resource Requirements

### Development Effort:
- **Field Creation**: 2-3 days
- **Page Layout Design**: 1-2 days
- **Security Configuration**: 1 day
- **Data Migration Script**: 3-5 days
- **Testing & Validation**: 2-3 days
- **Total Estimate**: 2-3 weeks

### Team Requirements:
- Salesforce Administrator
- Data Migration Specialist
- Business Analyst (for field mapping decisions)
- QA Tester

---

## 🔄 Migration Approach Options

### Option A: Direct Migration
- Migrate all Registration Requests to Contacts immediately
- Pros: Fast, simple
- Cons: May create duplicates, data quality issues

### Option B: Phased Migration
- Migrate approved registrations first
- Then pending registrations
- Finally, rejected/historical records
- Pros: Controlled, quality-focused
- Cons: Slower, more complex

### Option C: Parallel Running
- Keep Registration_Request__c active
- Create Contacts for new approvals only
- Gradually migrate historical data
- Pros: Low risk, reversible
- Cons: Dual maintenance, confusion

**Recommendation**: Option B - Phased Migration

---

## 📝 Next Steps

1. **Review this document** with stakeholders
2. **Open the Excel file** for detailed field-by-field analysis
3. **Make decisions** on:
   - Which fields to migrate
   - How to handle sensitive data
   - Parent relationship model
   - Migration timeline
4. **Create a project plan** based on chosen approach
5. **Begin field creation** in sandbox

---

## 📎 Attachments

- **Excel Mapping File**: `Registration_to_Contact_Mapping_2025-09-10.xlsx`
- **JSON Field Data**: 
  - `registration_fields.json`
  - `contact_fields.json`
  - `field_mapping.json`

---

## ❓ Questions for Business

1. Should we maintain historical Registration Request records after migration?
2. How should we handle duplicate Contacts (same student, multiple registrations)?
3. What is the acceptable downtime for migration?
4. Should parent information create separate Contact records?
5. How long should we keep the parallel system running?
6. What are the compliance requirements for data retention?

---

*Generated by Gesher Intake System Field Analysis Tool*  
*Date: January 10, 2025*  
*For questions, contact the development team*