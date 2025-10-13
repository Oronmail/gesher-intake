// Fixed script to make all Registration_Request__c fields visible to all profiles
// Excludes OwnerId which causes issues with field permissions

System.debug('🔐 Starting field-level security update for Registration_Request__c');

// Get all Permission Sets linked to profiles
List<PermissionSet> permSets = [
    SELECT Id, Name, ProfileId, Profile.Name
    FROM PermissionSet
    WHERE ProfileId != null
];
System.debug('Found ' + permSets.size() + ' permission sets linked to profiles');

// Get existing field permissions
Map<String, Set<String>> existingPermsByProfile = new Map<String, Set<String>>();
List<FieldPermissions> existingPerms = [
    SELECT Id, Field, PermissionsEdit, PermissionsRead, ParentId
    FROM FieldPermissions
    WHERE SobjectType = 'Registration_Request__c'
];

for(FieldPermissions fp : existingPerms) {
    if(!existingPermsByProfile.containsKey(fp.ParentId)) {
        existingPermsByProfile.put(fp.ParentId, new Set<String>());
    }
    existingPermsByProfile.get(fp.ParentId).add(fp.Field);
}

System.debug('Found ' + existingPerms.size() + ' existing field permissions');

// Get all custom fields for Registration_Request__c
Map<String, Schema.SObjectField> fieldsMap = Schema.SObjectType.Registration_Request__c.fields.getMap();
List<String> fieldNames = new List<String>();

for(String fieldName : fieldsMap.keySet()) {
    Schema.DescribeFieldResult fieldDescribe = fieldsMap.get(fieldName).getDescribe();
    // Only include custom fields (exclude standard fields like OwnerId that cause issues)
    if(fieldDescribe.isCustom()) {
        fieldNames.add('Registration_Request__c.' + fieldDescribe.getName());
    }
}

System.debug('Found ' + fieldNames.size() + ' custom fields to process');

// Update existing permissions
List<FieldPermissions> permissionsToUpdate = new List<FieldPermissions>();

for(FieldPermissions fp : existingPerms) {
    Boolean needsUpdate = false;

    if(!fp.PermissionsRead) {
        fp.PermissionsRead = true;
        needsUpdate = true;
    }

    // Make editable if not a formula field or auto-number
    String fieldName = fp.Field.substringAfter('.');
    if(fieldsMap.containsKey(fieldName.toLowerCase())) {
        Schema.DescribeFieldResult fieldDescribe = fieldsMap.get(fieldName.toLowerCase()).getDescribe();
        if(!fieldDescribe.isCalculated() && !fieldDescribe.isAutoNumber() && fieldDescribe.isUpdateable()) {
            if(!fp.PermissionsEdit) {
                fp.PermissionsEdit = true;
                needsUpdate = true;
            }
        }
    }

    if(needsUpdate) {
        permissionsToUpdate.add(fp);
    }
}

// Create new permissions for missing field-profile combinations
List<FieldPermissions> newPermissions = new List<FieldPermissions>();

for(PermissionSet ps : permSets) {
    Set<String> existingFields = existingPermsByProfile.get(ps.Id);
    if(existingFields == null) {
        existingFields = new Set<String>();
    }

    for(String fieldName : fieldNames) {
        if(!existingFields.contains(fieldName)) {
            FieldPermissions newPerm = new FieldPermissions();
            newPerm.ParentId = ps.Id;
            newPerm.SobjectType = 'Registration_Request__c';
            newPerm.Field = fieldName;
            newPerm.PermissionsRead = true;

            // Check if field is editable
            String justFieldName = fieldName.substringAfter('.');
            if(fieldsMap.containsKey(justFieldName.toLowerCase())) {
                Schema.DescribeFieldResult fieldDescribe = fieldsMap.get(justFieldName.toLowerCase()).getDescribe();
                if(!fieldDescribe.isCalculated() && !fieldDescribe.isAutoNumber() && fieldDescribe.isUpdateable()) {
                    newPerm.PermissionsEdit = true;
                }
            }

            newPermissions.add(newPerm);
        }
    }
}

System.debug('Permissions to update: ' + permissionsToUpdate.size());
System.debug('New permissions to create: ' + newPermissions.size());

// Perform DML operations
Integer successCount = 0;
Integer errorCount = 0;

// Update existing permissions
if(!permissionsToUpdate.isEmpty()) {
    try {
        update permissionsToUpdate;
        successCount += permissionsToUpdate.size();
        System.debug('✅ Successfully updated ' + permissionsToUpdate.size() + ' existing permissions');
    } catch(Exception e) {
        errorCount += permissionsToUpdate.size();
        System.debug('❌ Error updating existing permissions: ' + e.getMessage());
    }
}

// Insert new permissions in smaller batches to avoid hitting limits
if(!newPermissions.isEmpty()) {
    Integer batchSize = 100; // Smaller batch size
    Integer batchNum = 1;

    for(Integer i = 0; i < newPermissions.size(); i += batchSize) {
        List<FieldPermissions> batch = new List<FieldPermissions>();
        for(Integer j = i; j < Math.min(i + batchSize, newPermissions.size()); j++) {
            batch.add(newPermissions[j]);
        }

        try {
            insert batch;
            successCount += batch.size();
            System.debug('✅ Batch ' + batchNum + ': Inserted ' + batch.size() + ' new permissions');
        } catch(Exception e) {
            // Try to insert one by one if batch fails
            Integer individualSuccess = 0;
            for(FieldPermissions perm : batch) {
                try {
                    insert perm;
                    individualSuccess++;
                } catch(Exception ex) {
                    // Skip this permission
                }
            }
            if(individualSuccess > 0) {
                successCount += individualSuccess;
                System.debug('⚠️ Batch ' + batchNum + ': Inserted ' + individualSuccess + ' of ' + batch.size() + ' permissions individually');
            } else {
                errorCount += batch.size();
                System.debug('❌ Batch ' + batchNum + ' failed: ' + e.getMessage());
            }
        }
        batchNum++;
    }
}

// Summary
System.debug('');
System.debug('========================================');
System.debug('📊 FIELD-LEVEL SECURITY UPDATE SUMMARY');
System.debug('========================================');
System.debug('✅ Successfully processed: ' + successCount + ' permissions');
if(errorCount > 0) {
    System.debug('⚠️ Errors encountered: ' + errorCount + ' permissions');
}
System.debug('📋 Total custom fields: ' + fieldNames.size());
System.debug('👥 Total profiles processed: ' + permSets.size());
System.debug('');
System.debug('✨ Field-level security update completed!');
System.debug('All custom fields in Registration_Request__c should now be visible to all profiles.');