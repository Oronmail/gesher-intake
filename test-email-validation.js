#!/usr/bin/env node

/**
 * Test email validation and sending
 * Helps debug why some emails are not being sent
 */

require('dotenv').config({ path: '.env.local' });

// Test email validation function
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Test various email formats
const testEmails = [
  'test@gmail.com',
  'user@yahoo.com',
  'person@hotmail.com',
  'user@company.com',
  'test@company.co.il',
  'name@subdomain.company.com',
  'user+tag@gmail.com',
  'name.surname@company.com',
  'test@123.com',
  'user@company-name.com',
  'test@company_name.com',
  'invalid@',
  '@invalid.com',
  'no-at-sign.com',
  'user@company..com',
  'user@.company.com'
];

console.log('=== Email Validation Test ===\n');
console.log('Testing email validation regex...\n');

testEmails.forEach(email => {
  const isValid = isValidEmail(email);
  const symbol = isValid ? '✅' : '❌';
  console.log(`${symbol} ${email.padEnd(30)} - ${isValid ? 'VALID' : 'INVALID'}`);
});

// Test with Zod validation
console.log('\n=== Testing with Zod ===\n');
const { z } = require('zod');

const emailSchema = z.string().email();
const customEmailSchema = z.string().email().refine(isValidEmail, 'Invalid email format');

testEmails.forEach(email => {
  try {
    emailSchema.parse(email);
    const zodValid = true;
    
    try {
      customEmailSchema.parse(email);
      console.log(`✅ ${email.padEnd(30)} - Passed both validations`);
    } catch {
      console.log(`⚠️  ${email.padEnd(30)} - Passed Zod, failed custom`);
    }
  } catch {
    console.log(`❌ ${email.padEnd(30)} - Failed Zod validation`);
  }
});

// Test actual email sending with Resend
console.log('\n=== Testing Resend Email Sending ===\n');

async function testResendEmail(testEmail) {
  const { Resend } = require('resend');
  const resend = new Resend(process.env.RESEND_API_KEY);
  
  if (!process.env.RESEND_API_KEY) {
    console.log('❌ RESEND_API_KEY not configured');
    return;
  }
  
  console.log(`Testing email to: ${testEmail}`);
  
  try {
    const { data, error } = await resend.emails.send({
      from: 'Test <onboarding@resend.dev>',
      to: testEmail,
      subject: 'Test Email - Gesher Intake System',
      html: `
        <div dir="rtl">
          <h2>בדיקת מערכת</h2>
          <p>זהו מייל בדיקה מהמערכת.</p>
          <p>אם קיבלת מייל זה, המערכת עובדת כראוי.</p>
        </div>
      `
    });
    
    if (error) {
      console.log(`❌ Failed to send to ${testEmail}:`, error);
      return { success: false, error };
    }
    
    console.log(`✅ Email sent successfully to ${testEmail}`);
    console.log('   Response:', data);
    return { success: true, data };
  } catch (error) {
    console.log(`❌ Error sending to ${testEmail}:`, error.message);
    return { success: false, error: error.message };
  }
}

// Run email test if argument provided
const testEmailAddress = process.argv[2];
if (testEmailAddress) {
  console.log('\n=== Sending Test Email ===\n');
  testResendEmail(testEmailAddress).then(result => {
    if (result.success) {
      console.log('\n✅ Test completed successfully!');
      console.log('Check the inbox for:', testEmailAddress);
    } else {
      console.log('\n❌ Test failed');
      console.log('Error details:', result.error);
    }
  });
} else {
  console.log('\n📧 To test actual email sending, run:');
  console.log('   node test-email-validation.js your-email@example.com');
}