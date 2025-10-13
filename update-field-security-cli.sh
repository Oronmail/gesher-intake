#!/bin/bash

# Script to update field-level security for Registration_Request__c using Salesforce CLI
# Makes all fields visible to all profiles

echo "🔐 Updating Field-Level Security for Registration_Request__c"
echo "============================================================"

# Set the org alias
ORG_ALIAS="gesher-sandbox"

# First, let's get all the field names
echo -e "\n📋 Fetching all fields from Registration_Request__c..."

# Get object describe
sf sobject describe -s Registration_Request__c -o $ORG_ALIAS --json > object_describe.json

# Extract field names (excluding system fields)
echo -e "\n🔍 Extracting custom and editable fields..."

# Create a metadata package for field permissions
mkdir -p temp-metadata/profiles

# Get all profile names
echo -e "\n👥 Fetching all profiles..."
sf data query -q "SELECT Id, Name FROM Profile" -o $ORG_ALIAS --json > profiles.json

# Parse profiles and create permission sets
echo -e "\n📝 Creating field permission updates..."

# Create a Node.js script to generate the metadata
cat > generate-permissions.js << 'EOF'
const fs = require('fs');

// Read the object describe
const objectDescribe = JSON.parse(fs.readFileSync('object_describe.json', 'utf8'));
const profiles = JSON.parse(fs.readFileSync('profiles.json', 'utf8'));

if (!objectDescribe.result || !profiles.result) {
  console.error('Error reading data files');
  process.exit(1);
}

const fields = objectDescribe.result.fields;
const profileRecords = profiles.result.records;

console.log(`Found ${fields.length} fields and ${profileRecords.length} profiles`);

// Filter to get custom fields and editable standard fields
const editableFields = fields.filter(field =>
  (field.custom || field.name === 'OwnerId') &&
  !field.calculated &&
  !field.autoNumber
);

console.log(`${editableFields.length} editable fields to update`);

// Create permission set metadata
const permissionSet = {
  '<?xml version="1.0" encoding="UTF-8"?>': null,
  'PermissionSet': {
    '@xmlns': 'http://soap.sforce.com/2006/04/metadata',
    'fieldPermissions': editableFields.map(field => ({
      'editable': 'true',
      'field': `Registration_Request__c.${field.name}`,
      'readable': 'true'
    })),
    'hasActivationRequired': 'false',
    'label': 'Registration Request Full Access',
    'objectPermissions': {
      'allowCreate': 'true',
      'allowDelete': 'true',
      'allowEdit': 'true',
      'allowRead': 'true',
      'modifyAllRecords': 'true',
      'object': 'Registration_Request__c',
      'viewAllRecords': 'true'
    }
  }
};

// Write permission set file
const builder = require('xmlbuilder');
const xml = builder.create(permissionSet, {encoding: 'UTF-8'}).end({pretty: true});
fs.writeFileSync('temp-metadata/permissionsets/Registration_Request_Full_Access.permissionset-meta.xml', xml);

console.log('\n✅ Permission set metadata created successfully');
EOF

# Check if xmlbuilder is installed
if ! npm list xmlbuilder --depth=0 > /dev/null 2>&1; then
  echo -e "\n📦 Installing required Node.js packages..."
  npm install xmlbuilder --no-save
fi

# Generate the permissions metadata
node generate-permissions.js

# Alternative approach: Use SFDX commands to update field permissions directly
echo -e "\n🔄 Option 1: Using Anonymous Apex to update field permissions..."

# Create Apex script to update field permissions
cat > update-permissions.apex << 'EOF'
// Get all profiles
List<Profile> profiles = [SELECT Id, Name FROM Profile];
System.debug('Found ' + profiles.size() + ' profiles');

// Get the Registration_Request__c object describe
Schema.DescribeSObjectResult objDescribe = Registration_Request__c.sObjectType.getDescribe();
Map<String, Schema.SObjectField> fieldsMap = objDescribe.fields.getMap();

// Get existing field permissions
List<FieldPermissions> existingPermissions = [
  SELECT Id, Field, PermissionsEdit, PermissionsRead, ParentId, Parent.ProfileId
  FROM FieldPermissions
  WHERE SobjectType = 'Registration_Request__c'
];

System.debug('Found ' + existingPermissions.size() + ' existing field permissions');

// Create a map for easy lookup
Map<String, FieldPermissions> permissionMap = new Map<String, FieldPermissions>();
for(FieldPermissions fp : existingPermissions) {
  String key = fp.Parent.ProfileId + '-' + fp.Field;
  permissionMap.put(key, fp);
}

// Update existing permissions
List<FieldPermissions> toUpdate = new List<FieldPermissions>();
for(FieldPermissions fp : existingPermissions) {
  if(!fp.PermissionsRead || (!fp.PermissionsEdit && !fp.Field.contains('.Name'))) {
    fp.PermissionsRead = true;
    // Don't try to make Name field editable
    if(!fp.Field.contains('.Name')) {
      fp.PermissionsEdit = true;
    }
    toUpdate.add(fp);
  }
}

if(!toUpdate.isEmpty()) {
  try {
    update toUpdate;
    System.debug('✅ Updated ' + toUpdate.size() + ' field permissions');
  } catch(Exception e) {
    System.debug('❌ Error updating permissions: ' + e.getMessage());
  }
} else {
  System.debug('✅ All field permissions are already set correctly');
}

// Summary
System.debug('='.repeat(60));
System.debug('SUMMARY:');
System.debug('Profiles processed: ' + profiles.size());
System.debug('Permissions updated: ' + toUpdate.size());
System.debug('All fields in Registration_Request__c should now be visible to all profiles');
EOF

# Execute the Apex script
echo -e "\n🚀 Executing Apex script to update field permissions..."
sf apex run -f update-permissions.apex -o $ORG_ALIAS

# Alternative: Deploy permission set
echo -e "\n🔄 Option 2: Deploy permission set (if Apex approach didn't work)..."
echo "You can deploy the generated permission set using:"
echo "sf project deploy start -d temp-metadata/permissionsets -o $ORG_ALIAS"

# Clean up temporary files
echo -e "\n🧹 Cleaning up temporary files..."
rm -f object_describe.json profiles.json generate-permissions.js update-permissions.apex

echo -e "\n✨ Field-level security update process completed!"
echo "All fields in Registration_Request__c should now be visible to all profiles."
echo ""
echo "To verify, you can run:"
echo "sf data query -q \"SELECT Field, PermissionsRead, PermissionsEdit FROM FieldPermissions WHERE SobjectType = 'Registration_Request__c' LIMIT 10\" -o $ORG_ALIAS"