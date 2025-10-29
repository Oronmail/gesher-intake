/**
 * Inwise SMS Test Script
 *
 * Tests the SMS service with Inwise API
 *
 * Usage:
 *   node test-sms.js [phone_number]
 *
 * Example:
 *   node test-sms.js 0501234567
 *   node test-sms.js 972501234567
 */

require('dotenv').config({ path: '.env.local' });

// Phone number formatting function (matching src/lib/sms.ts)
function formatPhoneNumber(phone) {
  // Remove all non-digits
  let cleaned = phone.replace(/\D/g, '');

  // Handle Israeli numbers
  if (cleaned.startsWith('0')) {
    // Remove leading 0 and add country code
    cleaned = '972' + cleaned.substring(1);
  } else if (!cleaned.startsWith('972')) {
    // Assume it's Israeli if no country code
    cleaned = '972' + cleaned;
  }

  // Format as 972-XX-XXXXXXX (Inwise format)
  if (cleaned.startsWith('972')) {
    const countryCode = cleaned.substring(0, 3); // 972
    const areaCode = cleaned.substring(3, 5);     // 50
    const number = cleaned.substring(5);          // 1234567
    return `${countryCode}-${areaCode}-${number}`;
  }

  return cleaned;
}

async function testInwiseSMS(phoneNumber) {
  console.log('='.repeat(60));
  console.log('📱 INWISE SMS API TEST');
  console.log('='.repeat(60));

  // Check environment variables
  const apiKey = process.env.INWISE_API_KEY;
  const baseUrl = process.env.INWISE_BASE_URL || 'https://api.inwise.com/rest/v1';
  const senderId = process.env.INWISE_SENDER_ID || 'GesherYouth';

  console.log('\n1️⃣ Configuration Check:');
  console.log('   API Key:', apiKey ? `✅ Set (${apiKey.substring(0, 10)}...)` : '❌ Not set');
  console.log('   Base URL:', baseUrl);
  console.log('   Sender ID:', senderId);

  if (!apiKey) {
    console.error('\n❌ ERROR: INWISE_API_KEY not found in .env.local');
    console.log('\nPlease add to .env.local:');
    console.log('INWISE_API_KEY=your_api_token_here');
    console.log('INWISE_BASE_URL=https://api.inwise.com/rest/v1');
    console.log('INWISE_SENDER_ID=GesherYouth');
    process.exit(1);
  }

  // Format phone number
  const formattedPhone = formatPhoneNumber(phoneNumber);
  console.log('\n2️⃣ Phone Number Formatting:');
  console.log('   Input:', phoneNumber);
  console.log('   Formatted:', formattedPhone);

  // Test message in Hebrew
  const testMessage = 'גשר אל הנוער - זהו מסרון בדיקה. Test SMS from Gesher intake system.';

  console.log('\n3️⃣ Message:');
  console.log('   Content:', testMessage);
  console.log('   Length:', testMessage.length, 'characters');

  // Prepare request
  const endpoint = `${baseUrl}/transactional/sms/send`;
  const requestBody = {
    message: {
      content: testMessage,
      charset: 'unicode', // Required for Hebrew
      to: [
        {
          mobile_number: formattedPhone
        }
      ]
    }
  };

  console.log('\n4️⃣ API Request:');
  console.log('   Endpoint:', endpoint);
  console.log('   Body:', JSON.stringify(requestBody, null, 2));

  // Try both authentication methods
  const authMethods = [
    { name: 'Authorization: Bearer', headers: { 'Authorization': `Bearer ${apiKey}` } },
    { name: 'X-API-Key', headers: { 'X-API-Key': apiKey } },
  ];

  for (const authMethod of authMethods) {
    console.log(`\n5️⃣ Testing with ${authMethod.name}...`);

    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...authMethod.headers
    };

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody),
      });

      const responseText = await response.text();

      console.log('   Status:', response.status, response.statusText);
      console.log('   Response:', responseText);

      if (response.ok) {
        console.log('\n✅ SUCCESS! SMS sent with', authMethod.name);

        try {
          const result = JSON.parse(responseText);
          console.log('   Parsed Response:', JSON.stringify(result, null, 2));

          if (result.status) {
            console.log('   Message Status:', result.status);
          }
          if (result.reject_reason) {
            console.log('   Reject Reason:', result.reject_reason);
          }
        } catch {
          console.log('   Response is not JSON');
        }

        console.log('\n' + '='.repeat(60));
        console.log('✅ SMS TEST COMPLETED SUCCESSFULLY');
        console.log('='.repeat(60));
        return; // Exit on first success
      } else {
        console.log(`   ❌ Failed with ${authMethod.name}`);

        if (response.status === 401) {
          console.log('   → Authentication failed. Trying next method...');
        }
      }
    } catch (error) {
      console.error('   ❌ Error:', error.message);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('❌ SMS TEST FAILED - All authentication methods failed');
  console.log('='.repeat(60));
  console.log('\nTroubleshooting:');
  console.log('1. Verify API key is correct in .env.local');
  console.log('2. Check Inwise account has SMS credits');
  console.log('3. Verify phone number format is correct');
  console.log('4. Check Inwise API documentation for auth method');
}

// Get phone number from command line or use default test number
const testPhone = process.argv[2] || '0501234567';

console.log('\n🚀 Starting SMS test...\n');
testInwiseSMS(testPhone)
  .then(() => {
    console.log('\n✅ Test script completed');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Test script error:', error);
    process.exit(1);
  });
