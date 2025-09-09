const fs = require('fs');
const path = require('path');

// Define all fields with their properties
const fields = [
  // Metadata Fields
  // Note: Referral Number is now stored in the standard Name field (Text 80)
  // { name: 'Referral_Number__c', label: 'Referral Number', type: 'Text', length: 50 },  // REMOVED - using Name field instead
  { name: 'Status__c', label: 'Status', type: 'Picklist', values: ['Pending Review', 'In Review', 'Approved', 'Rejected'] },
  { name: 'Priority__c', label: 'Priority', type: 'Picklist', values: ['High', 'Medium', 'Low'] },
  { name: 'Submission_Date__c', label: 'Submission Date', type: 'DateTime' },
  { name: 'Consent_Date__c', label: 'Consent Date', type: 'DateTime' },
  
  // Counselor & School
  { name: 'Counselor_Name__c', label: 'Counselor Name', type: 'Text', length: 100 },
  { name: 'Counselor_Email__c', label: 'Counselor Email', type: 'Email' },
  { name: 'School_Name__c', label: 'School Name', type: 'Text', length: 200 },
  
  // Student Personal Information
  { name: 'Student_First_Name__c', label: 'Student First Name', type: 'Text', length: 100 },
  { name: 'Student_Last_Name__c', label: 'Student Last Name', type: 'Text', length: 100 },
  { name: 'Student_ID__c', label: 'Student ID', type: 'Text', length: 20 },
  { name: 'Date_of_Birth__c', label: 'Date of Birth', type: 'Date' },
  { name: 'Gender__c', label: 'Gender', type: 'Picklist', values: ['Male', 'Female'] },
  { name: 'Country_of_Birth__c', label: 'Country of Birth', type: 'Text', length: 100 },
  { name: 'Immigration_Year__c', label: 'Immigration Year', type: 'Text', length: 4 },
  { name: 'Student_Address__c', label: 'Student Address', type: 'Text', length: 255 },
  { name: 'Student_Floor__c', label: 'Student Floor', type: 'Text', length: 10 },
  { name: 'Student_Apartment__c', label: 'Student Apartment', type: 'Text', length: 10 },
  { name: 'Student_Phone__c', label: 'Student Phone', type: 'Phone' },
  { name: 'Student_Mobile__c', label: 'Student Mobile', type: 'Phone' },
  { name: 'School_System_Password__c', label: 'School System Password', type: 'Text', length: 50 },
  
  // Parent/Guardian Information
  { name: 'Parent1_Name__c', label: 'Parent 1 Name', type: 'Text', length: 100 },
  { name: 'Parent1_ID__c', label: 'Parent 1 ID', type: 'Text', length: 20 },
  { name: 'Parent1_Address__c', label: 'Parent 1 Address', type: 'Text', length: 255 },
  { name: 'Parent1_Phone__c', label: 'Parent 1 Phone', type: 'Phone' },
  { name: 'Parent1_Signature__c', label: 'Parent 1 Signature', type: 'LongTextArea', length: 32768 },
  { name: 'Parent2_Name__c', label: 'Parent 2 Name', type: 'Text', length: 100 },
  { name: 'Parent2_ID__c', label: 'Parent 2 ID', type: 'Text', length: 20 },
  { name: 'Parent2_Address__c', label: 'Parent 2 Address', type: 'Text', length: 255 },
  { name: 'Parent2_Phone__c', label: 'Parent 2 Phone', type: 'Phone' },
  { name: 'Parent2_Signature__c', label: 'Parent 2 Signature', type: 'LongTextArea', length: 32768 },
  { name: 'Parent_Email__c', label: 'Parent Email', type: 'Email' },
  
  // Family Information
  { name: 'Siblings_Count__c', label: 'Siblings Count', type: 'Number', precision: 2, scale: 0 },
  { name: 'Father_Name__c', label: 'Father Name', type: 'Text', length: 100 },
  { name: 'Father_Mobile__c', label: 'Father Mobile', type: 'Phone' },
  { name: 'Father_Occupation__c', label: 'Father Occupation', type: 'Text', length: 100 },
  { name: 'Father_Profession__c', label: 'Father Profession', type: 'Text', length: 100 },
  { name: 'Father_Income__c', label: 'Father Income', type: 'Text', length: 50 },
  { name: 'Mother_Name__c', label: 'Mother Name', type: 'Text', length: 100 },
  { name: 'Mother_Mobile__c', label: 'Mother Mobile', type: 'Phone' },
  { name: 'Mother_Occupation__c', label: 'Mother Occupation', type: 'Text', length: 100 },
  { name: 'Mother_Profession__c', label: 'Mother Profession', type: 'Text', length: 100 },
  { name: 'Mother_Income__c', label: 'Mother Income', type: 'Text', length: 50 },
  { name: 'Debts_Loans__c', label: 'Debts Loans', type: 'Text', length: 255 },
  { name: 'Parent_Involvement__c', label: 'Parent Involvement', type: 'Picklist', values: ['Inhibiting', 'Promoting', 'No Involvement'] },
  { name: 'Economic_Status__c', label: 'Economic Status', type: 'Picklist', values: ['Low', 'Medium', 'High'] },
  { name: 'Economic_Details__c', label: 'Economic Details', type: 'LongTextArea', length: 4000 },
  { name: 'Family_Background__c', label: 'Family Background', type: 'LongTextArea', length: 4000 },
  
  // School & Academic
  { name: 'Grade__c', label: 'Grade', type: 'Text', length: 20 },
  { name: 'Homeroom_Teacher__c', label: 'Homeroom Teacher', type: 'Text', length: 100 },
  { name: 'Teacher_Phone__c', label: 'Teacher Phone', type: 'Phone' },
  { name: 'School_Counselor_Name__c', label: 'School Counselor Name', type: 'Text', length: 100 },
  { name: 'School_Counselor_Phone__c', label: 'School Counselor Phone', type: 'Phone' },
  { name: 'Failing_Grades_Count__c', label: 'Failing Grades Count', type: 'Number', precision: 2, scale: 0 },
  { name: 'Failing_Subjects__c', label: 'Failing Subjects', type: 'Text', length: 255 },
  
  // Welfare & Social Services
  { name: 'Known_to_Welfare__c', label: 'Known to Welfare', type: 'Checkbox' },
  { name: 'Social_Worker_Name__c', label: 'Social Worker Name', type: 'Text', length: 100 },
  { name: 'Social_Worker_Phone__c', label: 'Social Worker Phone', type: 'Phone' },
  { name: 'Youth_Promotion__c', label: 'Youth Promotion', type: 'Checkbox' },
  { name: 'Youth_Worker_Name__c', label: 'Youth Worker Name', type: 'Text', length: 100 },
  { name: 'Youth_Worker_Phone__c', label: 'Youth Worker Phone', type: 'Phone' },
  
  // Assessment
  { name: 'Behavioral_Issues__c', label: 'Behavioral Issues', type: 'Checkbox' },
  { name: 'Has_Potential__c', label: 'Has Potential', type: 'Checkbox' },
  { name: 'Motivation_Level__c', label: 'Motivation Level', type: 'Picklist', values: ['Low', 'Medium', 'High'] },
  { name: 'Motivation_Type__c', label: 'Motivation Type', type: 'Picklist', values: ['Internal', 'External'] },
  { name: 'External_Motivators__c', label: 'External Motivators', type: 'Text', length: 255 },
  { name: 'Social_Status__c', label: 'Social Status', type: 'Text', length: 255 },
  { name: 'Afternoon_Activities__c', label: 'Afternoon Activities', type: 'Text', length: 255 },
  
  // Learning & Health
  { name: 'Learning_Disability__c', label: 'Learning Disability', type: 'Checkbox' },
  { name: 'Requires_Remedial_Teaching__c', label: 'Requires Remedial Teaching', type: 'Checkbox' },
  { name: 'ADHD__c', label: 'ADHD', type: 'Checkbox' },
  { name: 'ADHD_Treatment__c', label: 'ADHD Treatment', type: 'Text', length: 255 },
  { name: 'Assessment_Done__c', label: 'Assessment Done', type: 'Checkbox' },
  { name: 'Assessment_Needed__c', label: 'Assessment Needed', type: 'Checkbox' },
  { name: 'Assessment_Details__c', label: 'Assessment Details', type: 'LongTextArea', length: 4000 },
  
  // Risk Assessment
  { name: 'Criminal_Record__c', label: 'Criminal Record', type: 'Checkbox' },
  { name: 'Drug_Use__c', label: 'Drug Use', type: 'Checkbox' },
  { name: 'Smoking__c', label: 'Smoking', type: 'Checkbox' },
  { name: 'Probation_Officer__c', label: 'Probation Officer', type: 'Text', length: 100 },
  { name: 'Youth_Probation_Officer__c', label: 'Youth Probation Officer', type: 'Text', length: 100 },
  { name: 'Psychological_Treatment__c', label: 'Psychological Treatment', type: 'Checkbox' },
  { name: 'Psychiatric_Treatment__c', label: 'Psychiatric Treatment', type: 'Checkbox' },
  { name: 'Takes_Medication__c', label: 'Takes Medication', type: 'Checkbox' },
  { name: 'Medication_Description__c', label: 'Medication Description', type: 'Text', length: 255 },
  { name: 'Risk_Level__c', label: 'Risk Level', type: 'Number', precision: 2, scale: 0 },
  { name: 'Risk_Factors__c', label: 'Risk Factors', type: 'LongTextArea', length: 4000 },
  
  // Final Assessment
  { name: 'Military_Service_Potential__c', label: 'Military Service Potential', type: 'Checkbox' },
  { name: 'Can_Handle_Program__c', label: 'Can Handle Program', type: 'Checkbox' },
  { name: 'Personal_Opinion__c', label: 'Personal Opinion', type: 'LongTextArea', length: 4000 }
];

// Function to create field XML
function createFieldXML(field) {
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<CustomField xmlns="http://soap.sforce.com/2006/04/metadata">
    <fullName>${field.name}</fullName>
    <label>${field.label}</label>
    <type>${field.type}</type>`;

  // Add type-specific properties
  switch(field.type) {
    case 'Text':
      xml += `
    <length>${field.length || 255}</length>`;
      break;
    case 'Phone':
    case 'Email':
      // Phone and Email fields don't need length
      break;
    case 'LongTextArea':
      xml += `
    <length>${field.length || 32768}</length>
    <visibleLines>5</visibleLines>`;
      break;
    case 'Number':
      xml += `
    <precision>${field.precision || 18}</precision>
    <scale>${field.scale || 0}</scale>`;
      break;
    case 'Picklist':
      xml += `
    <valueSet>
        <restricted>true</restricted>
        <valueSetDefinition>
            <sorted>false</sorted>`;
      field.values.forEach(value => {
        xml += `
            <value>
                <fullName>${value}</fullName>
                <default>false</default>
                <label>${value}</label>
            </value>`;
      });
      xml += `
        </valueSetDefinition>
    </valueSet>`;
      break;
    case 'Checkbox':
      xml += `
    <defaultValue>false</defaultValue>`;
      break;
  }

  // Add common properties
  xml += `
    <required>false</required>
    <trackHistory>false</trackHistory>
    <trackTrending>false</trackTrending>
</CustomField>`;

  return xml;
}

// Create fields directory if it doesn't exist
const fieldsDir = path.join(__dirname, 'force-app/main/default/objects/Registration_Request__c/fields');
if (!fs.existsSync(fieldsDir)) {
  fs.mkdirSync(fieldsDir, { recursive: true });
}

// Create each field file
fields.forEach(field => {
  const xml = createFieldXML(field);
  const filePath = path.join(fieldsDir, `${field.name}.field-meta.xml`);
  fs.writeFileSync(filePath, xml);
  console.log(`Created field: ${field.name}`);
});

console.log(`\n✅ Created ${fields.length} field metadata files`);
console.log('\nNext steps:');
console.log('1. Deploy to Salesforce: sfdx force:source:deploy -p force-app -u gesher-sandbox');
console.log('2. Test the deployment: node test-sf-queue.js');