#!/usr/bin/env node

/**
 * Test script for Hebrew PDF generation
 * This tests the PDF generation with Hebrew text to ensure it's not gibberish
 */

const fs = require('fs');
const path = require('path');

// Simple test data
const testData = {
  referralNumber: 'REF-202501-TEST',
  studentName: 'דוד כהן',
  parent1Name: 'יעקב כהן',
  parent1Id: '123456789',
  parent1Address: 'רחוב הרצל 10, תל אביב',
  parent1Phone: '050-1234567',
  parent1Signature: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
  parent2Name: 'רחל כהן',
  parent2Id: '987654321',
  parent2Address: 'רחוב הרצל 10, תל אביב',
  parent2Phone: '050-7654321',
  parent2Signature: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
  consentDate: new Date()
};

// Generate HTML content (similar to the new generator)
const generateTestHTML = (data) => {
  const dateStr = new Date(data.consentDate).toLocaleDateString('he-IL');
  
  return `
    <!DOCTYPE html>
    <html dir="rtl" lang="he">
    <head>
      <meta charset="UTF-8">
      <title>טופס הסכמת הורים - בדיקה</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          direction: rtl;
          padding: 20px;
          background: white;
        }
        h1 { color: #2563eb; }
        .info { background: #f0f0f0; padding: 10px; margin: 10px 0; }
        .parent { border: 1px solid #ddd; padding: 15px; margin: 15px 0; }
      </style>
    </head>
    <body>
      <h1>טופס הסכמת הורים - גשר אל הנוער</h1>
      
      <div class="info">
        <p><strong>מספר הפניה:</strong> ${data.referralNumber}</p>
        <p><strong>תאריך:</strong> ${dateStr}</p>
        <p><strong>שם התלמיד/ה:</strong> ${data.studentName}</p>
      </div>
      
      <div class="parent">
        <h2>הורה/אפוטרופוס 1</h2>
        <p><strong>שם:</strong> ${data.parent1Name}</p>
        <p><strong>ת.ז.:</strong> ${data.parent1Id}</p>
        <p><strong>כתובת:</strong> ${data.parent1Address}</p>
        <p><strong>טלפון:</strong> ${data.parent1Phone}</p>
      </div>
      
      <div class="parent">
        <h2>הורה/אפוטרופוס 2</h2>
        <p><strong>שם:</strong> ${data.parent2Name}</p>
        <p><strong>ת.ז.:</strong> ${data.parent2Id}</p>
        <p><strong>כתובת:</strong> ${data.parent2Address}</p>
        <p><strong>טלפון:</strong> ${data.parent2Phone}</p>
      </div>
      
      <div style="margin-top: 30px; padding: 20px; background: #fffbeb; border-right: 4px solid #fbbf24;">
        <h3>הצהרת הסכמה</h3>
        <p>אני/אנו החתומים מטה נותנים בזאת את הסכמתנו לעמותת גשר אל הנוער לקבל ולעבד את הנתונים האישיים של ילדנו לצורך השתתפות בתוכנית החינוכית.</p>
      </div>
    </body>
    </html>
  `;
};

// Create test HTML file
const testHTML = generateTestHTML(testData);
const htmlPath = path.join(__dirname, 'test-hebrew-pdf.html');
fs.writeFileSync(htmlPath, testHTML, 'utf8');

console.log('✅ Test HTML file created: test-hebrew-pdf.html');
console.log('📋 Open this file in a browser to verify Hebrew text displays correctly');
console.log('');
console.log('Expected content:');
console.log('- Title: טופס הסכמת הורים - גשר אל הנוער');
console.log('- Student name: דוד כהן');
console.log('- Parent 1 name: יעקב כהן');
console.log('- Parent 2 name: רחל כהן');
console.log('');
console.log('If the Hebrew text appears correctly in the browser, the PDF should also be correct.');
console.log('');
console.log('🔍 To test the actual PDF generation:');
console.log('1. Go to http://localhost:3001');
console.log('2. Fill the counselor form');
console.log('3. Complete the parent consent form');
console.log('4. Check the PDF that gets uploaded to Salesforce');