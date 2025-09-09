#!/usr/bin/env node

/**
 * ActiveTrail API Test Script
 * Tests different authentication methods and endpoints
 */

require('dotenv').config({ path: '.env.local' });

const API_KEY = process.env.ACTIVETRAIL_API_KEY;
const BASE_URL = process.env.ACTIVETRAIL_BASE_URL || 'https://webapi.mymarketing.co.il';

if (!API_KEY) {
  console.error('❌ ACTIVETRAIL_API_KEY not found in .env.local');
  process.exit(1);
}

console.log('=== ActiveTrail API Authentication Test ===\n');
console.log('API Key (first 20 chars):', API_KEY.substring(0, 20) + '...');
console.log('Base URL:', BASE_URL);
console.log('\n' + '='.repeat(50) + '\n');

async function testEndpoint(name, config) {
  console.log(`\n📍 Testing: ${name}`);
  console.log('Endpoint:', config.url);
  console.log('Method:', config.method);
  console.log('Headers:', JSON.stringify(config.headers, null, 2));
  
  try {
    const response = await fetch(config.url, {
      method: config.method,
      headers: config.headers,
      body: config.body ? JSON.stringify(config.body) : undefined,
    });
    
    console.log('Response Status:', response.status, response.statusText);
    
    const text = await response.text();
    console.log('Response Body:', text.substring(0, 500));
    
    if (response.ok) {
      console.log('✅ SUCCESS - This authentication method works!');
      return true;
    } else {
      console.log('❌ FAILED - Status:', response.status);
    }
  } catch (error) {
    console.log('❌ ERROR:', error.message);
  }
  
  return false;
}

async function runTests() {
  const testPhone = '+972506470578'; // Your test number
  const testMessage = 'גשר אל הנוער: בדיקת מערכת SMS';
  
  // Test configurations
  const tests = [
    {
      name: 'Method 1: Bearer Token in Authorization',
      url: `${BASE_URL}/api/external/operational/sms_message`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: {
        phone_number: testPhone,
        message: testMessage,
        sender_id: 'GesherYouth',
      },
    },
    {
      name: 'Method 2: API Key in X-API-KEY header',
      url: `${BASE_URL}/api/external/operational/sms_message`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': API_KEY,
      },
      body: {
        phone_number: testPhone,
        message: testMessage,
        sender_id: 'GesherYouth',
      },
    },
    {
      name: 'Method 3: API Key in Authorization (no Bearer)',
      url: `${BASE_URL}/api/external/operational/sms_message`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': API_KEY,
      },
      body: {
        phone_number: testPhone,
        message: testMessage,
        sender_id: 'GesherYouth',
      },
    },
    {
      name: 'Method 4: Campaign Endpoint with Bearer',
      url: `${BASE_URL}/api/smscampaign/OperationalMessage`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: {
        to: testPhone,
        message: testMessage,
        from: 'GesherYouth',
      },
    },
    {
      name: 'Method 5: Test GET endpoint for auth check',
      url: `${BASE_URL}/api/account`,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Accept': 'application/json',
      },
    },
    {
      name: 'Method 6: API Key as query parameter',
      url: `${BASE_URL}/api/external/operational/sms_message?api_key=${API_KEY}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: {
        phone_number: testPhone,
        message: testMessage,
        sender_id: 'GesherYouth',
      },
    },
  ];
  
  let successfulMethod = null;
  
  for (const test of tests) {
    const success = await testEndpoint(test.name, test);
    if (success) {
      successfulMethod = test.name;
      break;
    }
    console.log('\n' + '-'.repeat(50));
  }
  
  console.log('\n' + '='.repeat(50));
  if (successfulMethod) {
    console.log(`\n✅ FOUND WORKING METHOD: ${successfulMethod}`);
    console.log('\nUpdate the SMS service to use this authentication method.');
  } else {
    console.log('\n❌ No working authentication method found.');
    console.log('\nPossible issues:');
    console.log('1. API key might not have SMS permissions');
    console.log('2. API key might be incorrect');
    console.log('3. Account might not be activated for API access');
    console.log('4. The endpoints might be different than documented');
    console.log('\nContact ActiveTrail support with these test results.');
  }
}

// Run the tests
runTests().catch(console.error);