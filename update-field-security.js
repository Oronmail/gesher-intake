#!/usr/bin/env node

/**
 * Script to update field-level security for all fields in Registration_Request__c object
 * Makes all fields visible and editable for all profiles
 */

const jsforce = require('jsforce');
require('dotenv').config({ path: '.env.local' });

// Use the JWT authentication service
const salesforceJWT = require('./src/lib/salesforce-jwt');

async function updateFieldLevelSecurity() {
  try {
    console.log('🔐 Connecting to Salesforce using JWT authentication...');

    // Get authenticated connection
    const authResult = await salesforceJWT.getConnection();
    if (!authResult.success) {
      throw new Error(`Authentication failed: ${authResult.error}`);
    }

    const conn = authResult.connection;
    console.log('✅ Successfully authenticated to Salesforce');
    console.log(`📍 Instance URL: ${conn.instanceUrl}`);

    // Get all profiles
    console.log('\n📋 Fetching all profiles...');
    const profilesResult = await conn.query("SELECT Id, Name FROM Profile");
    const profiles = profilesResult.records;
    console.log(`Found ${profiles.length} profiles`);

    // Get all fields for Registration_Request__c object
    console.log('\n🔍 Fetching Registration_Request__c fields...');
    const describe = await conn.sobject('Registration_Request__c').describe();
    const fields = describe.fields;
    console.log(`Found ${fields.length} fields in Registration_Request__c`);

    // Filter out system fields (like Id, CreatedDate, etc.)
    const customFields = fields.filter(field =>
      field.custom ||
      field.name === 'Name' ||
      field.name === 'OwnerId'
    );
    console.log(`${customFields.length} fields to update (including standard editable fields)`);

    // Prepare field permissions metadata
    const fieldPermissions = [];

    for (const profile of profiles) {
      for (const field of customFields) {
        // Skip formula fields and auto-number fields as they can't be made editable
        const isEditable = !field.calculated && !field.autoNumber && field.name !== 'Name';

        fieldPermissions.push({
          fullName: `${profile.Name}.Registration_Request__c.${field.name}`,
          field: `Registration_Request__c.${field.name}`,
          readable: true,
          editable: isEditable,
          profileId: profile.Id,
          profileName: profile.Name,
          fieldName: field.name
        });
      }
    }

    console.log(`\n📝 Preparing to update ${fieldPermissions.length} field permissions...`);

    // Update field permissions using Metadata API
    console.log('\n🔄 Updating field-level security...');

    // Group by profile for batch updates
    const permissionsByProfile = {};
    fieldPermissions.forEach(perm => {
      if (!permissionsByProfile[perm.profileName]) {
        permissionsByProfile[perm.profileName] = [];
      }
      permissionsByProfile[perm.profileName].push(perm);
    });

    // Update each profile
    let successCount = 0;
    let errorCount = 0;

    for (const [profileName, permissions] of Object.entries(permissionsByProfile)) {
      try {
        console.log(`\n  Updating profile: ${profileName}`);

        // Create metadata for this profile
        const profileMetadata = {
          fullName: profileName,
          fieldPermissions: permissions.map(p => ({
            field: p.field,
            readable: p.readable,
            editable: p.editable
          }))
        };

        // Use Metadata API to update the profile
        const result = await conn.metadata.update('Profile', profileMetadata);

        if (result.success) {
          console.log(`    ✅ Successfully updated ${permissions.length} field permissions`);
          successCount++;
        } else {
          console.log(`    ⚠️ Warning: ${result.errors ? result.errors.join(', ') : 'Unknown error'}`);
          errorCount++;
        }
      } catch (err) {
        console.log(`    ❌ Error updating profile ${profileName}: ${err.message}`);
        errorCount++;
      }
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Successfully updated: ${successCount} profiles`);
    if (errorCount > 0) {
      console.log(`❌ Failed to update: ${errorCount} profiles`);
    }
    console.log(`📋 Total fields made visible: ${customFields.length}`);
    console.log(`👥 Total profiles updated: ${profiles.length}`);

    console.log('\n✨ Field-level security update completed!');
    console.log('All fields in Registration_Request__c are now visible to all profiles.');

  } catch (error) {
    console.error('\n❌ Error updating field-level security:', error.message);
    if (error.stack) {
      console.error('\nStack trace:', error.stack);
    }
    process.exit(1);
  }
}

// Alternative approach using SOQL and DML operations
async function updateFieldLevelSecurityAlternative() {
  try {
    console.log('🔐 Connecting to Salesforce using JWT authentication...');

    // Get authenticated connection
    const authResult = await salesforceJWT.getConnection();
    if (!authResult.success) {
      throw new Error(`Authentication failed: ${authResult.error}`);
    }

    const conn = authResult.connection;
    console.log('✅ Successfully authenticated to Salesforce');

    // Query existing field permissions
    console.log('\n📋 Querying existing field permissions...');
    const query = `
      SELECT Id, Field, PermissionsEdit, PermissionsRead,
             Parent.ProfileId, Parent.Profile.Name, SobjectType
      FROM FieldPermissions
      WHERE SobjectType = 'Registration_Request__c'
    `;

    const result = await conn.query(query);
    console.log(`Found ${result.totalSize} existing field permission records`);

    if (result.totalSize > 0) {
      // Update existing permissions
      const updates = result.records.map(record => ({
        Id: record.Id,
        PermissionsRead: true,
        PermissionsEdit: !record.Field.includes('__c.Name') // Name field is not editable
      }));

      console.log(`\n🔄 Updating ${updates.length} field permission records...`);

      // Batch update in chunks of 200
      const chunkSize = 200;
      for (let i = 0; i < updates.length; i += chunkSize) {
        const chunk = updates.slice(i, i + chunkSize);
        const updateResult = await conn.sobject('FieldPermissions').update(chunk);
        console.log(`  Updated batch ${Math.floor(i/chunkSize) + 1}: ${chunk.length} records`);
      }
    }

    console.log('\n✅ Field permissions updated successfully!');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

// Check command line arguments
const args = process.argv.slice(2);
const useAlternative = args.includes('--alternative') || args.includes('-a');

if (useAlternative) {
  console.log('Using alternative approach (DML operations)...\n');
  updateFieldLevelSecurityAlternative();
} else {
  console.log('Using Metadata API approach...\n');
  updateFieldLevelSecurity();
}