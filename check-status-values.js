const salesforceJWT = require('./src/lib/salesforce-jwt.ts').default;

async function checkStatusValues() {
  try {
    // Query a record to see what status value it has
    const query = `SELECT Id, Name, Status__c FROM Registration_Request__c ORDER BY CreatedDate DESC LIMIT 5`;
    
    const result = await salesforceJWT.query(query);
    
    if (result.success && result.records) {
      console.log('\n📊 Recent Registration Requests with Status:');
      console.log('='.repeat(60));
      result.records.forEach(record => {
        console.log(`Name: ${record.Name}`);
        console.log(`Status: "${record.Status__c}"`);
        console.log(`ID: ${record.Id}`);
        console.log('-'.repeat(60));
      });
    } else {
      console.error('Query failed:', result.error);
    }
    
    // Try to describe the Status__c field to see picklist values
    console.log('\n🔍 Attempting to get picklist values...');
    const describeResult = await salesforceJWT.describeField('Registration_Request__c', 'Status__c');
    if (describeResult) {
      console.log('Field details:', JSON.stringify(describeResult, null, 2));
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkStatusValues();
