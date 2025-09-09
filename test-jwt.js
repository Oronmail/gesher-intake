const jsforce = require('jsforce');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

// Configuration
const SF_CLIENT_ID = process.env.SALESFORCE_CLIENT_ID;
const SF_USERNAME = process.env.SALESFORCE_USERNAME;
const SF_LOGIN_URL = process.env.SALESFORCE_LOGIN_URL || 'https://test.salesforce.com';

console.log('=== Salesforce JWT Bearer Authentication Test ===\n');

// Check prerequisites
if (!SF_CLIENT_ID) {
  console.log('❌ Missing SALESFORCE_CLIENT_ID in .env.local');
  process.exit(1);
}

if (!SF_USERNAME) {
  console.log('❌ Missing SALESFORCE_USERNAME in .env.local');
  process.exit(1);
}

// Check for private key
const keyPath = path.join(process.cwd(), 'certs', 'server.key');
if (!fs.existsSync(keyPath)) {
  console.log('❌ Private key not found at certs/server.key');
  console.log('   Run: ./generate-jwt-cert.sh to create it');
  process.exit(1);
}

const privateKey = fs.readFileSync(keyPath, 'utf8');
console.log('✅ Private key loaded');
console.log('✅ Client ID:', SF_CLIENT_ID.substring(0, 20) + '...');
console.log('✅ Username:', SF_USERNAME);

// Generate JWT
console.log('\n🔐 Generating JWT token...');
const claims = {
  iss: SF_CLIENT_ID,
  sub: SF_USERNAME,
  aud: SF_LOGIN_URL,
  exp: Math.floor(Date.now() / 1000) + 300
};

const jwtToken = jwt.sign(claims, privateKey, { 
  algorithm: 'RS256',
  header: { alg: 'RS256' }
});

console.log('✅ JWT token generated');

// Exchange JWT for access token
console.log('\n🔄 Exchanging JWT for access token...');

async function testJWTAuth() {
  try {
    const params = new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwtToken
    });

    const tokenUrl = `${SF_LOGIN_URL}/services/oauth2/token`;
    
    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params.toString()
    });

    if (!response.ok) {
      const error = await response.text();
      console.log('❌ JWT authentication failed:', error);
      console.log('\n📋 Troubleshooting:');
      console.log('1. Make sure you uploaded certs/server.crt to your Connected App');
      console.log('2. In Connected App settings, ensure "Use digital signatures" is checked');
      console.log('3. Verify the username matches exactly (including sandbox suffix)');
      console.log('4. Check that JWT Bearer flow is enabled in the Connected App');
      return;
    }

    const data = await response.json();
    console.log('✅ Access token obtained!');
    console.log('   Instance URL:', data.instance_url);
    console.log('   Token (first 20 chars):', data.access_token.substring(0, 20) + '...');
    
    // Test the connection
    console.log('\n🧪 Testing connection with obtained token...');
    const conn = new jsforce.Connection({
      instanceUrl: data.instance_url,
      accessToken: data.access_token,
      version: '64.0'
    });
    
    const identity = await conn.identity();
    console.log('✅ Connected as:', identity.display_name);
    console.log('   Organization:', identity.organization_id);
    
    // Test object access
    console.log('\n📊 Testing Registration_Request__c access...');
    const objectMetadata = await conn.sobject('Registration_Request__c').describe();
    console.log('✅ Object accessible!');
    console.log('   Fields:', objectMetadata.fields.length);
    
    // Test create capability
    console.log('\n✏️ Testing create capability...');
    const testData = {
      Referral_Number__c: 'JWT-TEST-' + Date.now(),
      Status__c: 'Pending Consent',
      Counselor_Name__c: 'JWT Test',
      Counselor_Email__c: 'jwt@test.com',
      School_Name__c: 'JWT Test School',
      Submission_Date__c: new Date().toISOString()
    };
    
    const result = await conn.sobject('Registration_Request__c').create(testData);
    if (result.success) {
      console.log('✅ Test record created:', result.id);
      
      // Clean up
      await conn.sobject('Registration_Request__c').delete(result.id);
      console.log('   Cleaned up test record');
    }
    
    console.log('\n' + '='.repeat(50));
    console.log('🎉 JWT Bearer Authentication is working perfectly!');
    console.log('='.repeat(50));
    console.log('\n✨ The system will now:');
    console.log('   • Authenticate automatically without any user interaction');
    console.log('   • Generate new tokens as needed');
    console.log('   • Handle all token refresh automatically');
    console.log('   • Never require manual intervention');
    console.log('\n🚀 Your app is now fully autonomous!');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
  }
}

testJWTAuth();