// Test Salesforce Registration_Request__c object
require('dotenv').config({ path: '.env.local' });

const jsforce = require('jsforce');

async function testSalesforceQueue() {
  console.log('Testing Salesforce Queue Object (Registration_Request__c)...\n');
  
  const conn = new jsforce.Connection({
    instanceUrl: process.env.SALESFORCE_INSTANCE_URL,
    accessToken: process.env.SALESFORCE_ACCESS_TOKEN,
    version: '64.0'
  });

  try {
    // Test connection
    const identity = await conn.identity();
    console.log('✅ Connected to Salesforce');
    console.log('User:', identity.username);
    console.log('Org:', identity.organization_id);
    console.log('\n-----------------------------------\n');

    // First, let's see what custom objects exist
    console.log('Checking available custom objects...\n');
    const globalDescribe = await conn.describeGlobal();
    const customObjects = globalDescribe.sobjects.filter(obj => obj.name.endsWith('__c'));
    
    console.log(`Found ${customObjects.length} custom objects:`);
    customObjects.forEach(obj => {
      console.log(`  - ${obj.name} (${obj.label})`);
    });
    
    console.log('\n-----------------------------------\n');
    
    // Check if Registration_Request__c object exists
    console.log('Checking for Registration_Request__c object...\n');
    
    try {
      const objectMetadata = await conn.sobject('Registration_Request__c').describe();
      
      console.log('✅ Registration_Request__c object found!');
      console.log(`Total fields: ${objectMetadata.fields.length}`);
      
      // List all custom fields
      const customFields = objectMetadata.fields.filter(field => field.custom);
      
      console.log(`\nCustom fields found (${customFields.length}):\n`);
      
      // Group fields by category for easier reading
      const fieldCategories = {
        'Metadata': ['Referral_Number__c', 'Status__c', 'Priority__c', 'Submission_Date__c', 'Consent_Date__c'],
        'Student': ['Student_First_Name__c', 'Student_Last_Name__c', 'Student_ID__c', 'Date_of_Birth__c', 'Gender__c'],
        'Parent': ['Parent1_Name__c', 'Parent1_ID__c', 'Parent1_Signature__c', 'Parent2_Name__c', 'Parent2_Signature__c'],
        'School': ['School_Name__c', 'Grade__c', 'Counselor_Name__c', 'Counselor_Email__c'],
        'Family': ['Father_Name__c', 'Mother_Name__c', 'Economic_Status__c', 'Parent_Involvement__c'],
        'Assessment': ['Risk_Level__c', 'Behavioral_Issues__c', 'Has_Potential__c', 'Learning_Disability__c', 'ADHD__c'],
      };

      for (const [category, fieldNames] of Object.entries(fieldCategories)) {
        console.log(`\n${category} Fields:`);
        for (const fieldName of fieldNames) {
          const field = customFields.find(f => f.name === fieldName);
          if (field) {
            console.log(`  ✓ ${field.name} (${field.type})`);
          } else {
            console.log(`  ✗ ${fieldName} - NOT FOUND`);
          }
        }
      }

      // List any other custom fields not in our categories
      const categorizedFields = Object.values(fieldCategories).flat();
      const otherFields = customFields.filter(f => !categorizedFields.includes(f.name));
      
      if (otherFields.length > 0) {
        console.log('\nOther Custom Fields:');
        otherFields.forEach(field => {
          console.log(`  - ${field.name} (${field.type})`);
        });
      }

    } catch (error) {
      if (error.message.includes('INVALID_TYPE')) {
        console.log('❌ Registration_Request__c object NOT found!');
        console.log('\nYou need to create this custom object in Salesforce first.');
        console.log('\nHere\'s what to do:');
        console.log('1. Log into your Salesforce sandbox');
        console.log('2. Go to Setup → Object Manager');
        console.log('3. Create a new Custom Object called "Registration Request"');
        console.log('4. The API name will be "Registration_Request__c"');
        console.log('5. Add all the custom fields listed in the plan');
      } else {
        throw error;
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testSalesforceQueue();