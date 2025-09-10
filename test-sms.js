#!/usr/bin/env node

/**
 * Test Inwise SMS Integration
 * Tests the SMS sending functionality
 */

require('dotenv').config({ path: '.env.local' });

// Check if API key is configured
if (!process.env.INWISE_API_KEY) {
  console.error('❌ INWISE_API_KEY not found in .env.local');
  console.log('\nPlease add the following to your .env.local file:');
  console.log('INWISE_API_KEY=your_api_key_here');
  console.log('INWISE_BASE_URL=https://api.inwise.com/rest/v1 (optional)');
  console.log('INWISE_SENDER_ID=GesherYouth (optional)');
  process.exit(1);
}

console.log('=== Inwise SMS Test ===\n');
console.log('API Key configured: ✅');
console.log('Base URL:', process.env.INWISE_BASE_URL || 'https://api.inwise.com/rest/v1');
console.log('Sender ID:', process.env.INWISE_SENDER_ID || 'GesherYouth');

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
  const apiKey = process.env.INWISE_API_KEY;
  const baseUrl = process.env.INWISE_BASE_URL || 'https://api.inwise.com/rest/v1';
  const testPhone = process.argv[2] || '0501234567';
  
  // Format phone number
  let formattedPhone = testPhone.replace(/\D/g, '');
  if (formattedPhone.startsWith('0')) {
    formattedPhone = '972' + formattedPhone.substring(1);
  }
  formattedPhone = '+' + formattedPhone;
  
  console.log('Testing direct API call...');
  console.log('Formatted phone:', formattedPhone);
  
  const endpoint = '/transactional/sms/send';
  
  console.log(`\nTrying endpoint: ${endpoint}`);
  
  try {
    const response = await fetch(`${baseUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-API-Key': apiKey,
      },
      body: JSON.stringify({
        phoneNumber: formattedPhone,
        message: 'גשר אל הנוער: בדיקת מערכת SMS. אם קיבלת הודעה זו, המערכת עובדת כראוי.',
        sender: process.env.INWISE_SENDER_ID || 'GesherYouth',
      }),
    });
    
    const responseText = await response.text();
    console.log('Response status:', response.status);
    console.log('Response:', responseText);
    
    if (response.ok) {
      console.log('✅ SMS sent successfully via Inwise!');
    } else {
      console.log('❌ Failed to send SMS');
    }
  } catch (error) {
    console.log('❌ Error with endpoint:', error.message);
  }
  
  console.log('\n=== Test Complete ===');
  console.log('\nIf SMS is not working, please check:');
  console.log('1. API key is valid and has SMS permissions');
  console.log('2. Phone number format is correct');
  console.log('3. Inwise account has SMS credits');
  console.log('4. Contact Inwise support at https://developers.inwise.com');
}

// Instructions for running the test
if (process.argv.length < 3) {
  console.log('\nUsage: node test-sms.js [phone-number]');
  console.log('Example: node test-sms.js 0501234567');
}