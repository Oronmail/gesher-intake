#!/usr/bin/env node

/**
 * Get all fields from Registration_Request__c and Contact objects
 * Creates mapping between the two objects
 */

const jsforce = require('jsforce');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

// Configuration
const SF_CLIENT_ID = process.env.SALESFORCE_CLIENT_ID;
const SF_USERNAME = process.env.SALESFORCE_USERNAME;
const SF_LOGIN_URL = process.env.SALESFORCE_LOGIN_URL || 'https://test.salesforce.com';

async function getSalesforceConnection() {
  // Check for private key
  const keyPath = path.join(process.cwd(), 'certs', 'server.key');
  if (!fs.existsSync(keyPath)) {
    throw new Error('Private key not found at certs/server.key');
  }
  
  const privateKey = fs.readFileSync(keyPath, 'utf8');
  
  // Generate JWT
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
  
  // Get access token
  const tokenUrl = `${SF_LOGIN_URL}/services/oauth2/token`;
  const params = new URLSearchParams({
    grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
    assertion: jwtToken
  });
  
  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: params.toString()
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`JWT authentication failed: ${error}`);
  }
  
  const data = await response.json();
  
  // Create connection with access token
  const conn = new jsforce.Connection({
    instanceUrl: data.instance_url,
    accessToken: data.access_token,
    version: '64.0'
  });
  
  return conn;
}

async function getObjectFields() {
  try {
    console.log('🔄 Connecting to Salesforce...');
    const conn = await getSalesforceConnection();
    
    console.log('✅ Connected to Salesforce');
    console.log('📋 Fetching Registration_Request__c fields...');
    const registrationDesc = await conn.sobject('Registration_Request__c').describe();
    
    console.log('📋 Fetching Contact fields...');
    const contactDesc = await conn.sobject('Contact').describe();
    
    // Extract field information for Registration Request
    const registrationFields = registrationDesc.fields.map(field => ({
      apiName: field.name,
      label: field.label,
      type: field.type,
      length: field.length,
      required: !field.nillable,
      custom: field.custom,
      updateable: field.updateable,
      createable: field.createable,
      picklistValues: field.picklistValues?.map(p => p.value).join(', ') || ''
    }));
    
    // Extract field information for Contact
    const contactFields = contactDesc.fields.map(field => ({
      apiName: field.name,
      label: field.label,
      type: field.type,
      length: field.length,
      required: !field.nillable,
      custom: field.custom,
      updateable: field.updateable,
      createable: field.createable,
      picklistValues: field.picklistValues?.map(p => p.value).join(', ') || ''
    }));
    
    // Create mapping suggestions
    const fieldMapping = registrationFields.map(regField => {
      let suggestedContactField = '';
      let mappingNotes = '';
      
      // Direct name matches
      const directMatch = contactFields.find(cf => 
        cf.apiName.toLowerCase() === regField.apiName.toLowerCase()
      );
      
      if (directMatch) {
        suggestedContactField = directMatch.apiName;
        mappingNotes = 'Direct match';
      } else {
        // Try to find intelligent matches
        const fieldNameLower = regField.apiName.toLowerCase();
        
        // Student/Person name mappings
        if (fieldNameLower.includes('student_first_name')) {
          suggestedContactField = 'FirstName';
          mappingNotes = 'Student first name to Contact first name';
        } else if (fieldNameLower.includes('student_last_name')) {
          suggestedContactField = 'LastName';
          mappingNotes = 'Student last name to Contact last name';
        } else if (fieldNameLower.includes('student_id')) {
          suggestedContactField = 'Student_ID__c';
          mappingNotes = 'May need custom field on Contact';
        } else if (fieldNameLower.includes('date_of_birth')) {
          suggestedContactField = 'Birthdate';
          mappingNotes = 'Birth date mapping';
        } else if (fieldNameLower.includes('student_phone')) {
          suggestedContactField = 'Phone';
          mappingNotes = 'Student phone to primary phone';
        } else if (fieldNameLower.includes('student_mobile')) {
          suggestedContactField = 'MobilePhone';
          mappingNotes = 'Student mobile to mobile phone';
        } else if (fieldNameLower.includes('student_address')) {
          suggestedContactField = 'MailingStreet';
          mappingNotes = 'Student address to mailing address';
        } else if (fieldNameLower.includes('student_floor')) {
          suggestedContactField = 'MailingStreet';
          mappingNotes = 'Append to mailing address';
        } else if (fieldNameLower.includes('student_apartment')) {
          suggestedContactField = 'MailingStreet';
          mappingNotes = 'Append to mailing address';
        } else if (fieldNameLower.includes('gender')) {
          suggestedContactField = 'Gender__c';
          mappingNotes = 'May need custom field on Contact';
        } else if (fieldNameLower.includes('counselor_email')) {
          suggestedContactField = 'ReportsToId';
          mappingNotes = 'Could link to counselor Contact/User';
        } else if (fieldNameLower.includes('parent_email')) {
          suggestedContactField = 'Parent_Email__c';
          mappingNotes = 'Need custom field for parent email';
        } else if (fieldNameLower.includes('parent1_name') || fieldNameLower.includes('parent2_name')) {
          suggestedContactField = 'Parent_Name__c';
          mappingNotes = 'Need custom field or related Contact';
        } else if (fieldNameLower.includes('school_name')) {
          suggestedContactField = 'AccountId';
          mappingNotes = 'Link to School Account';
        } else if (fieldNameLower.includes('status')) {
          suggestedContactField = 'Lead_Status__c';
          mappingNotes = 'May need custom status field';
        } else if (fieldNameLower.includes('grade')) {
          suggestedContactField = 'Grade_Level__c';
          mappingNotes = 'Need custom field for grade';
        } else if (fieldNameLower.includes('country_of_birth')) {
          suggestedContactField = 'Country_of_Birth__c';
          mappingNotes = 'Need custom field';
        } else if (fieldNameLower.includes('immigration_year')) {
          suggestedContactField = 'Immigration_Year__c';
          mappingNotes = 'Need custom field';
        } else {
          // No direct mapping found
          suggestedContactField = '';
          mappingNotes = 'No standard field match - consider custom field';
        }
      }
      
      return {
        ...regField,
        suggestedContactField,
        mappingNotes
      };
    });
    
    // Save to JSON files
    fs.writeFileSync('registration_fields.json', JSON.stringify(registrationFields, null, 2));
    fs.writeFileSync('contact_fields.json', JSON.stringify(contactFields, null, 2));
    fs.writeFileSync('field_mapping.json', JSON.stringify(fieldMapping, null, 2));
    
    console.log('\n✅ Field information saved to:');
    console.log('  - registration_fields.json');
    console.log('  - contact_fields.json');
    console.log('  - field_mapping.json');
    
    // Display summary
    console.log('\n📊 Summary:');
    console.log(`Registration_Request__c: ${registrationFields.length} fields`);
    console.log(`Contact: ${contactFields.length} fields`);
    console.log(`Custom fields in Registration: ${registrationFields.filter(f => f.custom).length}`);
    console.log(`Suggested mappings: ${fieldMapping.filter(f => f.suggestedContactField).length}`);
    console.log(`Fields needing custom fields on Contact: ${fieldMapping.filter(f => f.mappingNotes.includes('custom field')).length}`);
    
    return { registrationFields, contactFields, fieldMapping };
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  getObjectFields();
}

module.exports = { getObjectFields };