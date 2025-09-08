// Load environment variables
require('dotenv').config({ path: '.env.local' });

const jsforce = require('jsforce');

async function testSalesforceConnection() {
  console.log('Testing Salesforce connection...\n');
  
  const conn = new jsforce.Connection({
    instanceUrl: process.env.SALESFORCE_INSTANCE_URL,
    accessToken: process.env.SALESFORCE_ACCESS_TOKEN,
    version: '64.0'
  });

  try {
    // Test connection by getting user info
    const userInfo = await conn.identity();
    console.log('✅ Connected to Salesforce successfully!');
    console.log('User:', userInfo.username);
    console.log('Organization:', userInfo.organization_id);
    console.log('\n-----------------------------------\n');

    // Check available objects
    console.log('Checking available objects...\n');
    const globalDescribe = await conn.describeGlobal();
    const relevantObjects = globalDescribe.sobjects.filter(obj => 
      ['Lead', 'Contact', 'Case', 'Opportunity', 'Account'].includes(obj.name)
    );
    
    for (const obj of relevantObjects) {
      console.log(`✓ ${obj.name} - ${obj.label}`);
    }
    
    console.log('\n-----------------------------------\n');
    
    // Check Lead object fields
    console.log('Checking Lead object fields...\n');
    const leadDescription = await conn.sobject('Lead').describe();
    
    console.log('Standard fields available:');
    leadDescription.fields
      .filter(field => !field.custom)
      .slice(0, 20) // Show first 20 standard fields
      .forEach(field => {
        console.log(`  - ${field.name} (${field.type}): ${field.label}`);
      });
    
    console.log('\nCustom fields available:');
    const customFields = leadDescription.fields.filter(field => field.custom);
    
    if (customFields.length > 0) {
      customFields.forEach(field => {
        console.log(`  - ${field.name} (${field.type}): ${field.label}`);
      });
    } else {
      console.log('  No custom fields found. You may need to create custom fields for:');
      console.log('  - Student_ID__c');
      console.log('  - Date_of_Birth__c');
      console.log('  - Gender__c');
      console.log('  - Grade__c');
      console.log('  - Parent_Names__c');
      console.log('  - Parent_Phone__c');
      console.log('  - Counselor_Name__c');
      console.log('  - Risk_Level__c');
      console.log('  - Referral_Number__c');
      console.log('  - etc.');
    }

    console.log('\n-----------------------------------\n');

    // Test creating a sample Lead
    console.log('Testing Lead creation...\n');
    
    const testLead = {
      FirstName: 'Test',
      LastName: 'Student_' + Date.now(),
      Company: 'Test School',
      Email: 'test@example.com',
      Phone: '050-123-4567',
      LeadSource: 'School Referral',
      Status: 'New',
      Description: 'Test lead from Gesher intake system'
    };

    console.log('Creating test lead:', testLead);
    
    const result = await conn.sobject('Lead').create(testLead);
    
    if (result.success) {
      console.log('✅ Test lead created successfully!');
      console.log('Lead ID:', result.id);
      
      // Clean up - delete the test lead
      await conn.sobject('Lead').delete(result.id);
      console.log('✓ Test lead deleted');
    } else {
      console.log('❌ Failed to create test lead:', result.errors);
    }

  } catch (error) {
    console.error('❌ Salesforce connection error:', error.message);
    console.error('\nPlease check:');
    console.error('1. The access token is still valid');
    console.error('2. The instance URL is correct');
    console.error('3. Your Salesforce org has API access enabled');
    console.error('\nYou may need to re-authenticate using:');
    console.error('sfdx auth:web:login --alias gesher-sandbox --instance-url https://test.salesforce.com --set-default');
  }
}

testSalesforceConnection();