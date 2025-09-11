#!/usr/bin/env node

/**
 * Test script to verify the complete consent workflow
 * Tests: Image generation, HTML storage, and Salesforce integration
 */

const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('==========================================');
console.log('🧪 Gesher Intake - Workflow Test Guide');
console.log('==========================================\n');

console.log('📋 TEST CHECKLIST:\n');

console.log('1️⃣  LOCAL TESTING (http://localhost:3001)');
console.log('   ✓ Open http://localhost:3001');
console.log('   ✓ Fill counselor form with:');
console.log('     - Counselor Name: מבחן יועץ');
console.log('     - Email: test@example.com');
console.log('     - School: בית ספר לבדיקה');
console.log('     - Parent Email: parent@example.com');
console.log('   ✓ Submit and get referral number\n');

console.log('2️⃣  CONSENT FORM TEST');
console.log('   ✓ Open the consent URL from console');
console.log('   ✓ Fill parent details:');
console.log('     - Student Name: תלמיד מבחן');
console.log('     - Parent 1 Name: הורה ראשון');
console.log('     - Parent 1 ID: 123456789');
console.log('     - Add digital signature');
console.log('   ✓ Submit consent form\n');

console.log('3️⃣  VERIFY IMAGE GENERATION');
console.log('   ✓ Check browser console for "Consent image generated successfully"');
console.log('   ✓ No errors about Hebrew text or signatures');
console.log('   ✓ Image should include timestamp badge\n');

console.log('4️⃣  PRODUCTION TESTING (https://gesher-intake.vercel.app)');
console.log('   ✓ Repeat steps 1-3 on production');
console.log('   ✓ Verify emails are sent (if configured)\n');

console.log('5️⃣  SALESFORCE VERIFICATION');
console.log('   Run this command to check the latest record:\n');
console.log('   sf data query --query "SELECT Id, Name, Consent_HTML__c, Parent1_Signature_Display__c FROM Registration_Request__c ORDER BY CreatedDate DESC LIMIT 1" -o gesher-sandbox\n');

console.log('6️⃣  CHECK ATTACHMENTS');
console.log('   Run this command to see if image was uploaded:\n');
console.log('   sf data query --query "SELECT Id, Title, FileType FROM ContentDocument WHERE ParentId IN (SELECT Id FROM Registration_Request__c ORDER BY CreatedDate DESC LIMIT 1)" -o gesher-sandbox\n');

console.log('==========================================');
console.log('📊 EXPECTED RESULTS:\n');
console.log('✅ Hebrew text displays correctly (no gibberish)');
console.log('✅ Signatures render as images (not black squares)');
console.log('✅ Timestamp badge shows in top-left corner');
console.log('✅ Consent_HTML__c field contains full HTML');
console.log('✅ PNG image attached to Salesforce record');
console.log('✅ Parent signature fields show embedded images');
console.log('==========================================\n');

rl.question('Press Enter to see troubleshooting tips...', () => {
  console.log('\n🔧 TROUBLESHOOTING:\n');
  console.log('If Hebrew text is gibberish:');
  console.log('  → Check browser console for encoding errors');
  console.log('  → Verify html2canvas is loading properly\n');
  
  console.log('If signatures are black squares:');
  console.log('  → Check if signature data URLs are valid');
  console.log('  → Verify base64 encoding is correct\n');
  
  console.log('If image not uploading to Salesforce:');
  console.log('  → Check Vercel logs: vercel logs --yes');
  console.log('  → Verify JWT authentication is working');
  console.log('  → Check if Consent_HTML__c field exists\n');
  
  console.log('If deployment fails:');
  console.log('  → Run: npm run build (locally)');
  console.log('  → Check for TypeScript errors');
  console.log('  → Verify all imports are correct\n');
  
  console.log('==========================================');
  console.log('✨ Test workflow complete!');
  console.log('==========================================');
  
  rl.close();
});