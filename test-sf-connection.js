const jsforce = require('jsforce');
require('dotenv').config({ path: '.env.local' });

const SF_INSTANCE_URL = process.env.SALESFORCE_INSTANCE_URL;
const SF_ACCESS_TOKEN = process.env.SALESFORCE_ACCESS_TOKEN;

console.log('Testing Salesforce connection...');
console.log('Instance URL:', SF_INSTANCE_URL);
console.log('Access Token:', SF_ACCESS_TOKEN ? 'Configured (length: ' + SF_ACCESS_TOKEN.length + ')' : 'NOT CONFIGURED');

async function testConnection() {
  try {
    const conn = new jsforce.Connection({
      instanceUrl: SF_INSTANCE_URL,
      accessToken: SF_ACCESS_TOKEN,
      version: '64.0'
    });

    console.log('\n1. Testing connection...');
    const identity = await conn.identity();
    console.log('✅ Connected as:', identity.display_name);
    console.log('   Organization:', identity.organization_id);

    console.log('\n2. Checking Registration_Request__c object...');
    const objectMetadata = await conn.sobject('Registration_Request__c').describe();
    console.log('✅ Object found!');
    console.log('   Total fields:', objectMetadata.fields.length);
    console.log('   Object label:', objectMetadata.label);
    console.log('   API name:', objectMetadata.name);

    console.log('\n3. Checking critical fields...');
    const criticalFields = [
      'Name',  // Standard Name field now stores the referral number
      'Status__c',
      'Counselor_Name__c',
      'Student_First_Name__c',
      'Parent1_Signature__c'
    ];

    const fieldNames = objectMetadata.fields.map(f => f.name);
    criticalFields.forEach(field => {
      if (fieldNames.includes(field)) {
        console.log(`   ✅ ${field} exists`);
      } else {
        console.log(`   ❌ ${field} NOT FOUND`);
      }
    });

    console.log('\n4. Testing query...');
    const records = await conn.query(
      "SELECT Id, Name, Status__c FROM Registration_Request__c LIMIT 5"
    );
    console.log('✅ Query successful!');
    console.log('   Records found:', records.totalSize);
    if (records.records.length > 0) {
      console.log('   Sample records:');
      records.records.forEach(r => {
        console.log(`     - ${r.Name}: ${r.Status__c}`);
      });
    }

    console.log('\n5. Testing create capability...');
    const testData = {
      Name: 'TEST-' + Date.now(),  // Use standard Name field instead of Referral_Number__c
      Status__c: 'Pending Consent',
      Counselor_Name__c: 'Test Counselor',
      Counselor_Email__c: 'test@example.com',
      School_Name__c: 'Test School',
      Submission_Date__c: new Date().toISOString()
    };

    console.log('   Creating test record...');
    const result = await conn.sobject('Registration_Request__c').create(testData);
    
    if (result.success) {
      console.log('✅ Test record created successfully!');
      console.log('   Record ID:', result.id);
      
      // Clean up - delete test record
      console.log('   Cleaning up test record...');
      await conn.sobject('Registration_Request__c').delete(result.id);
      console.log('   ✅ Test record deleted');
    } else {
      console.log('❌ Failed to create test record');
    }

    console.log('\n✅ ALL TESTS PASSED! Salesforce integration is working correctly.');

  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.message);
    
    if (error.message.includes('INVALID_SESSION_ID')) {
      console.error('\n⚠️  Access token has expired. You need to refresh it.');
      console.error('Run: sf org display -o gesher-sandbox --verbose');
      console.error('And update the SALESFORCE_ACCESS_TOKEN in .env.local');
    } else if (error.message.includes('INVALID_TYPE')) {
      console.error('\n⚠️  Registration_Request__c object not found in Salesforce.');
      console.error('Make sure the object is deployed to the sandbox.');
    } else {
      console.error('\nFull error:', error);
    }
  }
}

testConnection();