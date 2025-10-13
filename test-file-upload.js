#!/usr/bin/env node

/**
 * Test script for file upload functionality
 * Tests the complete workflow of uploading files to Salesforce
 */

const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

// Import the Salesforce JWT service
const salesforceJWT = require('./src/lib/salesforce-jwt').default;

async function testFileUpload() {
  console.log('🔧 Testing File Upload to Salesforce');
  console.log('=====================================\n');

  try {
    // Test 1: Authenticate with Salesforce
    console.log('1️⃣ Testing Salesforce authentication...');
    const testResult = await salesforceJWT.testConnection();

    if (!testResult.success) {
      throw new Error(`Authentication failed: ${testResult.message}`);
    }
    console.log('✅ Successfully connected to Salesforce');
    console.log(`   Using: ${testResult.authMethod}\n`);

    // Test 2: Create a test file
    console.log('2️⃣ Creating test files...');

    // Create a test PDF content
    const testPdfContent = Buffer.from('%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /Resources << /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> >> >> /MediaBox [0 0 612 792] /Contents 4 0 R >>\nendobj\n4 0 obj\n<< /Length 44 >>\nstream\nBT /F1 12 Tf 100 700 Td (Test Grade Sheet) Tj ET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f\n0000000009 00000 n\n0000000058 00000 n\n0000000117 00000 n\n0000000279 00000 n\ntrailer\n<< /Size 5 /Root 1 0 R >>\nstartxref\n366\n%%EOF');

    // Create a test image content (small PNG)
    const testImageContent = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64');

    console.log('✅ Test files created');
    console.log('   - Test PDF: test-grade-sheet.pdf');
    console.log('   - Test Image: test-assessment.png\n');

    // Test 3: Get a Registration Request record to attach files to
    console.log('3️⃣ Finding a Registration Request record...');

    const conn = await salesforceJWT.getConnection();
    const queryResult = await conn.query(
      "SELECT Id, Name FROM Registration_Request__c ORDER BY CreatedDate DESC LIMIT 1"
    );

    if (!queryResult.records || queryResult.records.length === 0) {
      console.log('⚠️ No Registration Request records found');
      console.log('   Creating a test record...');

      // Create a test record
      const createResult = await conn.sobject('Registration_Request__c').create({
        Name: 'TEST-FILE-UPLOAD-' + Date.now(),
        Status__c: 'Pending Consent',
        Counselor_Name__c: 'Test Counselor',
        Counselor_Email__c: 'test@example.com',
        School_Name__c: 'Test School'
      });

      if (!createResult.success) {
        throw new Error('Failed to create test record');
      }

      var recordId = createResult.id;
      console.log(`✅ Test record created: ${recordId}\n`);
    } else {
      var recordId = queryResult.records[0].Id;
      console.log(`✅ Found record: ${queryResult.records[0].Name} (${recordId})\n`);
    }

    // Test 4: Upload PDF file
    console.log('4️⃣ Uploading test PDF file...');
    const pdfResult = await salesforceJWT.uploadFile(
      recordId,
      testPdfContent,
      'test-grade-sheet.pdf',
      'application/pdf',
      'Test Grade Sheet Upload'
    );

    if (pdfResult.success) {
      console.log(`✅ PDF uploaded successfully!`);
      console.log(`   ContentDocumentId: ${pdfResult.contentDocumentId}\n`);
    } else {
      console.log(`❌ PDF upload failed: ${pdfResult.error}\n`);
    }

    // Test 5: Upload Image file
    console.log('5️⃣ Uploading test image file...');
    const imageResult = await salesforceJWT.uploadFile(
      recordId,
      testImageContent,
      'test-assessment.png',
      'image/png',
      'Test Assessment Image Upload'
    );

    if (imageResult.success) {
      console.log(`✅ Image uploaded successfully!`);
      console.log(`   ContentDocumentId: ${imageResult.contentDocumentId}\n`);
    } else {
      console.log(`❌ Image upload failed: ${imageResult.error}\n`);
    }

    // Test 6: Query to verify files are attached
    console.log('6️⃣ Verifying file attachments...');
    const filesQuery = await conn.query(
      `SELECT ContentDocument.Title, ContentDocument.FileType, ContentDocument.ContentSize
       FROM ContentDocumentLink
       WHERE LinkedEntityId = '${recordId}'
       ORDER BY ContentDocument.CreatedDate DESC`
    );

    if (filesQuery.records && filesQuery.records.length > 0) {
      console.log(`✅ Found ${filesQuery.records.length} attached file(s):`);
      filesQuery.records.forEach((file, index) => {
        console.log(`   ${index + 1}. ${file.ContentDocument.Title}.${file.ContentDocument.FileType} (${file.ContentDocument.ContentSize} bytes)`);
      });
    } else {
      console.log('⚠️ No files found attached to the record');
    }

    console.log('\n========================================');
    console.log('✨ File Upload Test Completed!');
    console.log('========================================');
    console.log('\n📝 Summary:');
    console.log(`   - Record ID: ${recordId}`);
    console.log(`   - Files uploaded: ${(pdfResult.success ? 1 : 0) + (imageResult.success ? 1 : 0)}`);
    console.log('\n💡 Check the record in Salesforce to see the files in Notes & Attachments section.');
    console.log(`   Direct link: ${conn.instanceUrl}/${recordId}`);

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    if (error.stack) {
      console.error('\nStack trace:', error.stack);
    }
    process.exit(1);
  }
}

// Run the test
testFileUpload();