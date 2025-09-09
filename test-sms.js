#!/usr/bin/env node

/**
 * Test ActiveTrail SMS Integration
 * Tests the SMS sending functionality
 */

require('dotenv').config({ path: '.env.local' });

// Check if API key is configured
if (!process.env.ACTIVETRAIL_API_KEY) {
  console.error('❌ ACTIVETRAIL_API_KEY not found in .env.local');
  console.log('\nPlease add the following to your .env.local file:');
  console.log('ACTIVETRAIL_API_KEY=your_api_key_here');
  console.log('ACTIVETRAIL_BASE_URL=https://webapi.mymarketing.co.il (optional)');
  console.log('ACTIVETRAIL_SENDER_ID=GesherYouth (optional)');
  process.exit(1);
}

console.log('=== ActiveTrail SMS Test ===\n');
console.log('API Key configured: ✅');
console.log('Base URL:', process.env.ACTIVETRAIL_BASE_URL || 'https://webapi.mymarketing.co.il');
console.log('Sender ID:', process.env.ACTIVETRAIL_SENDER_ID || 'GesherYouth');

// Import the SMS service
import('./src/lib/sms.js').then(async (smsModule) => {
  const { sendConsentSMS } = smsModule;
  
  // Test phone number - you can change this
  const testPhone = process.argv[2] || '0501234567'; // Default Israeli number format
  
  console.log('\n📱 Testing SMS to:', testPhone);
  console.log('Sending test message...\n');
  
  try {
    const result = await sendConsentSMS({
      parentPhone: testPhone,
      referralNumber: 'TEST-2025-001',
      consentUrl: 'https://gesher-intake.vercel.app/consent/TEST-2025-001',
    });
    
    if (result.success) {
      console.log('✅ SMS sent successfully!');
      console.log('Message ID:', result.messageId);
    } else {
      console.log('❌ Failed to send SMS');
      console.log('Error:', result.error);
    }
  } catch (error) {
    console.error('❌ Error during SMS test:', error.message);
  }
}).catch(error => {
  console.error('Failed to import SMS module:', error);
  console.log('\nNote: The SMS module uses ES6 imports. Testing alternative approach...\n');
  
  // Alternative test using direct fetch
  testDirectAPI();
});

async function testDirectAPI() {
  const apiKey = process.env.ACTIVETRAIL_API_KEY;
  const baseUrl = process.env.ACTIVETRAIL_BASE_URL || 'https://webapi.mymarketing.co.il';
  const testPhone = process.argv[2] || '0501234567';
  
  // Format phone number
  let formattedPhone = testPhone.replace(/\D/g, '');
  if (formattedPhone.startsWith('0')) {
    formattedPhone = '972' + formattedPhone.substring(1);
  }
  formattedPhone = '+' + formattedPhone;
  
  console.log('Testing direct API call...');
  console.log('Formatted phone:', formattedPhone);
  
  const endpoints = [
    '/api/external/operational/sms_message',
    '/api/smscampaign/OperationalMessage',
  ];
  
  for (const endpoint of endpoints) {
    console.log(`\nTrying endpoint: ${endpoint}`);
    
    try {
      const response = await fetch(`${baseUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': apiKey,
          'X-API-KEY': apiKey,
        },
        body: JSON.stringify({
          phone_number: formattedPhone,
          to: formattedPhone, // Alternative field name
          message: 'גשר אל הנוער: בדיקת מערכת SMS. אם קיבלת הודעה זו, המערכת עובדת כראוי.',
          sender_id: process.env.ACTIVETRAIL_SENDER_ID || 'GesherYouth',
          from: process.env.ACTIVETRAIL_SENDER_ID || 'GesherYouth',
        }),
      });
      
      const responseText = await response.text();
      console.log('Response status:', response.status);
      console.log('Response:', responseText);
      
      if (response.ok) {
        console.log('✅ SMS might have been sent via', endpoint);
        break;
      }
    } catch (error) {
      console.log('❌ Error with endpoint:', error.message);
    }
  }
  
  console.log('\n=== Test Complete ===');
  console.log('\nIf SMS is not working, please check:');
  console.log('1. API key is valid and has SMS permissions');
  console.log('2. Phone number format is correct');
  console.log('3. ActiveTrail account has SMS credits');
  console.log('4. Contact ActiveTrail support for exact API documentation');
}

// Instructions for running the test
if (process.argv.length < 3) {
  console.log('\nUsage: node test-sms.js [phone-number]');
  console.log('Example: node test-sms.js 0501234567');
}