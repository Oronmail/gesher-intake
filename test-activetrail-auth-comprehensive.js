#!/usr/bin/env node

/**
 * Comprehensive ActiveTrail API Authentication Test
 * Based on research: ActiveTrail uses direct token in Authorization header with 0x prefix
 */

require('dotenv').config({ path: '.env.local' });

const API_KEY = process.env.ACTIVETRAIL_API_KEY;
const BASE_URL = process.env.ACTIVETRAIL_BASE_URL || 'https://webapi.mymarketing.co.il';

if (!API_KEY) {
  console.error('❌ ACTIVETRAIL_API_KEY not found in .env.local');
  process.exit(1);
}

console.log('=== Comprehensive ActiveTrail API Authentication Test ===\n');
console.log('Original API Key (first 20 chars):', API_KEY.substring(0, 20) + '...');
console.log('Base URL:', BASE_URL);
console.log('\n' + '='.repeat(60) + '\n');

// Test phone and message
const testPhone = '+972506470578';
const testMessage = 'גשר אל הנוער: בדיקת מערכת SMS - ActiveTrail Test';

// Generate key variations
const keyVariations = {
  original: API_KEY,
  lowercase: API_KEY.toLowerCase(),
  lowercaseX: API_KEY.startsWith('0X') ? '0x' + API_KEY.substring(2) : API_KEY,
  uppercase: API_KEY.toUpperCase(),
  withoutPrefix: API_KEY.startsWith('0X') || API_KEY.startsWith('0x') ? API_KEY.substring(2) : API_KEY,
};

// Test endpoints
const endpoints = [
  // Account endpoint to test basic auth
  {
    name: 'Account Info (GET)',
    url: `${BASE_URL}/api/account`,
    method: 'GET',
    body: null,
  },
  // SMS endpoints from documentation
  {
    name: 'SMS Operational Message (external)',
    url: `${BASE_URL}/api/external/operational/sms_message`,
    method: 'POST',
    body: {
      phone_number: testPhone,
      message: testMessage,
      sender_id: 'GesherYouth',
    },
  },
  {
    name: 'SMS Campaign Operational',
    url: `${BASE_URL}/api/smscampaign/OperationalMessage`,
    method: 'POST',
    body: {
      to: testPhone,
      message: testMessage,
      from: 'GesherYouth',
    },
  },
  {
    name: 'SMS Operational (simple)',
    url: `${BASE_URL}/api/sms/operational`,
    method: 'POST',
    body: {
      phone: testPhone,
      message: testMessage,
    },
  },
  // Try groups endpoint from PHP example
  {
    name: 'Groups List (GET)',
    url: `${BASE_URL}/api/groups`,
    method: 'GET',
    body: null,
  },
];

async function testAuth(keyName, key, endpoint) {
  const testName = `${keyName} - ${endpoint.name}`;
  console.log(`\n📍 Testing: ${testName}`);
  console.log('   Key format:', key.substring(0, 20) + '...');
  console.log('   Endpoint:', endpoint.url);
  console.log('   Method:', endpoint.method);
  
  try {
    // Test both uppercase and lowercase header names
    const headerVariations = [
      { 'Authorization': key, 'Content-Type': 'application/json' },
      { 'authorization': key, 'content-type': 'application/json' },
    ];
    
    for (const headers of headerVariations) {
      const headerType = headers.Authorization ? 'Uppercase' : 'Lowercase';
      console.log(`   Headers (${headerType}):`, Object.keys(headers).join(', '));
      
      const options = {
        method: endpoint.method,
        headers: headers,
      };
      
      if (endpoint.body) {
        options.body = JSON.stringify(endpoint.body);
      }
      
      const response = await fetch(endpoint.url, options);
      const text = await response.text();
      
      console.log(`   Response: ${response.status} ${response.statusText}`);
      
      if (response.ok) {
        console.log('   ✅ SUCCESS! This authentication works!');
        console.log('   Response:', text.substring(0, 200));
        return {
          success: true,
          keyName,
          key,
          endpoint: endpoint.name,
          headers: headerType,
          response: text
        };
      } else if (response.status === 404) {
        console.log('   ⚠️  404 - Endpoint not found');
      } else if (response.status === 401) {
        console.log('   ❌ 401 - Authentication failed');
        if (text.includes('API Key')) {
          console.log('   Error:', text.substring(0, 100));
        }
      } else if (response.status === 405) {
        console.log('   ⚠️  405 - Method not allowed (might mean partial auth success)');
      } else {
        console.log('   ❌ Failed:', text.substring(0, 100));
      }
    }
  } catch (error) {
    console.log('   ❌ Error:', error.message);
  }
  
  return { success: false };
}

async function runTests() {
  const successfulTests = [];
  
  console.log('Testing all combinations of keys and endpoints...\n');
  console.log('Key Variations:');
  Object.entries(keyVariations).forEach(([name, key]) => {
    console.log(`  - ${name}: ${key.substring(0, 20)}...`);
  });
  
  console.log('\nEndpoints to test:', endpoints.map(e => e.name).join(', '));
  console.log('\n' + '='.repeat(60));
  
  // Test each key variation with each endpoint
  for (const [keyName, key] of Object.entries(keyVariations)) {
    for (const endpoint of endpoints) {
      const result = await testAuth(keyName, key, endpoint);
      if (result.success) {
        successfulTests.push(result);
      }
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    console.log('\n' + '-'.repeat(60));
  }
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('\n📊 SUMMARY\n');
  
  if (successfulTests.length > 0) {
    console.log('✅ SUCCESSFUL AUTHENTICATIONS FOUND:\n');
    successfulTests.forEach(test => {
      console.log(`  ✓ Key Format: ${test.keyName}`);
      console.log(`    Endpoint: ${test.endpoint}`);
      console.log(`    Headers: ${test.headers}`);
      console.log(`    Key: ${test.key.substring(0, 30)}...`);
      console.log('');
    });
    
    console.log('\n💡 RECOMMENDATION:');
    console.log('Update your SMS service to use the successful authentication method above.');
  } else {
    console.log('❌ No successful authentication found.\n');
    console.log('Possible issues:');
    console.log('1. API key does not have SMS permissions');
    console.log('2. SMS service not activated for this account');
    console.log('3. API endpoints might be different for your account type');
    console.log('4. IP restriction on the API key');
    console.log('\nNext steps:');
    console.log('1. Check API app settings in ActiveTrail dashboard');
    console.log('2. Verify SMS service is enabled');
    console.log('3. Contact ActiveTrail support with these test results');
  }
  
  // Test specific PHP example format
  console.log('\n' + '='.repeat(60));
  console.log('\n🔬 Testing PHP Example Format (from documentation):\n');
  
  const phpExampleKey = keyVariations.lowercaseX || keyVariations.original;
  console.log('Testing with key:', phpExampleKey.substring(0, 30) + '...');
  console.log('URL: http://webapi.mymarketing.co.il/api/groups (HTTP not HTTPS)\n');
  
  try {
    // Test with HTTP (not HTTPS) as shown in PHP example
    const httpUrl = 'http://webapi.mymarketing.co.il/api/groups';
    const response = await fetch(httpUrl, {
      method: 'GET',
      headers: {
        'Content-type': 'application/json',
        'Authorization': phpExampleKey
      }
    });
    
    console.log('HTTP Response:', response.status, response.statusText);
    if (response.ok) {
      console.log('✅ HTTP endpoint works! Consider using HTTP instead of HTTPS');
    } else {
      const text = await response.text();
      console.log('Response:', text.substring(0, 200));
    }
  } catch (error) {
    console.log('HTTP test error:', error.message);
  }
}

// Run tests
console.log('Starting comprehensive authentication tests...\n');
runTests().catch(console.error);