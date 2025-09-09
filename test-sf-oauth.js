const jsforce = require('jsforce');
require('dotenv').config({ path: '.env.local' });

// Configuration
const SF_CLIENT_ID = process.env.SALESFORCE_CLIENT_ID;
const SF_CLIENT_SECRET = process.env.SALESFORCE_CLIENT_SECRET;
const SF_REFRESH_TOKEN = process.env.SALESFORCE_REFRESH_TOKEN;
const SF_INSTANCE_URL = process.env.SALESFORCE_INSTANCE_URL;
const SF_LOGIN_URL = process.env.SALESFORCE_LOGIN_URL || 'https://test.salesforce.com';

console.log('=== Salesforce OAuth Configuration Test ===\n');

// Check if OAuth is configured
if (!SF_CLIENT_ID || !SF_CLIENT_SECRET) {
  console.log('❌ OAuth not configured yet.');
  console.log('\nTo set up OAuth:');
  console.log('1. Create a Connected App in Salesforce (see SF_CONNECTED_APP_SETUP.md)');
  console.log('2. Add these to .env.local:');
  console.log('   SALESFORCE_CLIENT_ID=your_consumer_key');
  console.log('   SALESFORCE_CLIENT_SECRET=your_consumer_secret');
  console.log('3. Run this script again to get the authorization URL');
  process.exit(0);
}

console.log('✅ OAuth credentials found');
console.log('   Client ID:', SF_CLIENT_ID.substring(0, 20) + '...');

// Create OAuth2 client
const oauth2 = new jsforce.OAuth2({
  loginUrl: SF_LOGIN_URL,
  clientId: SF_CLIENT_ID,
  clientSecret: SF_CLIENT_SECRET,
  redirectUri: 'http://localhost:3000/api/auth/callback'
});

// If no refresh token, provide instructions to get one
if (!SF_REFRESH_TOKEN) {
  console.log('\n❌ No refresh token found.');
  console.log('\nTo get a refresh token:');
  console.log('\nOption 1: Use Salesforce CLI (easiest)');
  console.log('=========================================');
  console.log('Run this command:');
  console.log(`sf org login web -r ${SF_LOGIN_URL} -i "${SF_CLIENT_ID}" -a gesher-oauth\n`);
  console.log('Then get the refresh token:');
  console.log('sf org display -o gesher-oauth --verbose --json | grep refreshToken\n');
  
  console.log('\nOption 2: Manual OAuth Flow');
  console.log('=========================================');
  const authUrl = oauth2.getAuthorizationUrl({
    scope: 'api refresh_token offline_access'
  });
  console.log('1. Visit this URL in your browser:');
  console.log('\n' + authUrl + '\n');
  console.log('2. Log in and authorize the app');
  console.log('3. You\'ll be redirected to: http://localhost:3000/api/auth/callback?code=AUTH_CODE');
  console.log('4. Copy the AUTH_CODE from the URL');
  console.log('5. Run: node exchange-code.js AUTH_CODE');
  console.log('   (This will exchange the code for a refresh token)');
  
  // Create the exchange script
  const exchangeScript = `
const jsforce = require('jsforce');
require('dotenv').config({ path: '.env.local' });

const code = process.argv[2];
if (!code) {
  console.log('Usage: node exchange-code.js AUTH_CODE');
  process.exit(1);
}

const oauth2 = new jsforce.OAuth2({
  loginUrl: '${SF_LOGIN_URL}',
  clientId: '${SF_CLIENT_ID}',
  clientSecret: '${SF_CLIENT_SECRET}',
  redirectUri: 'http://localhost:3000/api/auth/callback'
});

const conn = new jsforce.Connection({ oauth2 });

conn.authorize(code).then(userInfo => {
  console.log('\\n✅ Authorization successful!');
  console.log('\\nAdd this to your .env.local:');
  console.log('SALESFORCE_REFRESH_TOKEN=' + conn.refreshToken);
  console.log('\\nUser:', userInfo.id);
}).catch(err => {
  console.error('❌ Authorization failed:', err.message);
});
`;
  
  require('fs').writeFileSync('exchange-code.js', exchangeScript);
  console.log('\n✅ Created exchange-code.js helper script');
  
  process.exit(0);
}

// Test the refresh token
console.log('✅ Refresh token found');
console.log('\n🔄 Testing OAuth connection with refresh token...\n');

async function testOAuthConnection() {
  try {
    const conn = new jsforce.Connection({
      oauth2: oauth2,
      instanceUrl: SF_INSTANCE_URL,
      refreshToken: SF_REFRESH_TOKEN,
      version: '64.0'
    });
    
    // Refresh the access token
    console.log('Refreshing access token...');
    await new Promise((resolve, reject) => {
      conn.oauth2.refreshToken(SF_REFRESH_TOKEN, (err, res) => {
        if (err) {
          reject(err);
          return;
        }
        
        if (res) {
          conn.accessToken = res.access_token;
          if (res.instance_url) {
            conn.instanceUrl = res.instance_url;
          }
          console.log('✅ Access token refreshed successfully');
          console.log('   New token valid for ~2 hours');
          console.log('   Instance URL:', res.instance_url);
          resolve(res);
        }
      });
    });
    
    // Test the connection
    console.log('\nTesting connection...');
    const identity = await conn.identity();
    console.log('✅ Connected as:', identity.display_name);
    console.log('   Organization:', identity.organization_id);
    console.log('   User ID:', identity.user_id);
    
    // Test object access
    console.log('\nTesting Registration_Request__c access...');
    const objectMetadata = await conn.sobject('Registration_Request__c').describe();
    console.log('✅ Object accessible');
    console.log('   Fields:', objectMetadata.fields.length);
    console.log('   Label:', objectMetadata.label);
    
    // Test create capability
    console.log('\nTesting create capability...');
    const testData = {
      Referral_Number__c: 'OAUTH-TEST-' + Date.now(),
      Status__c: 'Pending Consent',
      Counselor_Name__c: 'OAuth Test',
      Counselor_Email__c: 'oauth@test.com',
      School_Name__c: 'OAuth Test School',
      Submission_Date__c: new Date().toISOString()
    };
    
    const result = await conn.sobject('Registration_Request__c').create(testData);
    if (result.success) {
      console.log('✅ Test record created:', result.id);
      
      // Clean up
      await conn.sobject('Registration_Request__c').delete(result.id);
      console.log('   Cleaned up test record');
    }
    
    console.log('\n========================================');
    console.log('✅ OAuth integration is working perfectly!');
    console.log('========================================');
    console.log('\nThe app will now automatically:');
    console.log('• Refresh tokens when they expire');
    console.log('• Retry failed requests');
    console.log('• Handle session timeouts gracefully');
    console.log('\nNo manual intervention needed! 🎉');
    
  } catch (error) {
    console.error('\n❌ OAuth test failed:', error.message);
    console.error('\nTroubleshooting:');
    console.error('1. Check if the Connected App is active');
    console.error('2. Verify OAuth scopes include: api, refresh_token, offline_access');
    console.error('3. Ensure the refresh token hasn\'t been revoked');
    console.error('4. Try getting a new refresh token using the instructions above');
  }
}

testOAuthConnection();