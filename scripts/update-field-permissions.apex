// Get all Permission Sets (including those from profiles)
List<PermissionSet> permSets = [SELECT Id, Name, Profile.Name, IsOwnedByProfile FROM PermissionSet WHERE IsOwnedByProfile = true];

// Get all custom fields for Registration_Request__c
Map<String, Schema.SObjectField> fieldMap = Schema.SObjectType.Registration_Request__c.fields.getMap();

List<FieldPermissions> newPermissions = new List<FieldPermissions>();
Set<String> existingPermKeys = new Set<String>();

// Get existing field permissions
for (FieldPermissions fp : [SELECT Id, ParentId, Field FROM FieldPermissions WHERE SobjectType = 'Registration_Request__c']) {
    existingPermKeys.add(fp.ParentId + '_' + fp.Field);
}

Integer count = 0;
for (PermissionSet ps : permSets) {
    for (String fieldName : fieldMap.keySet()) {
        Schema.DescribeFieldResult dfr = fieldMap.get(fieldName).getDescribe();

        // Skip non-custom fields and non-updateable fields
        if (!dfr.isCustom() || !dfr.isUpdateable()) continue;

        String fullFieldName = 'Registration_Request__c.' + dfr.getName();
        String key = ps.Id + '_' + fullFieldName;

        // Skip if permission already exists
        if (existingPermKeys.contains(key)) continue;

        FieldPermissions fp = new FieldPermissions();
        fp.ParentId = ps.Id;
        fp.SobjectType = 'Registration_Request__c';
        fp.Field = fullFieldName;
        fp.PermissionsRead = true;
        fp.PermissionsEdit = true;
        newPermissions.add(fp);
        count++;
    }
}

System.debug('Creating ' + count + ' new field permissions');

if (!newPermissions.isEmpty()) {
    // Insert in batches of 200
    List<FieldPermissions> batch = new List<FieldPermissions>();
    for (Integer i = 0; i < newPermissions.size(); i++) {
        batch.add(newPermissions[i]);
        if (batch.size() == 200 || i == newPermissions.size() - 1) {
            try {
                insert batch;
                System.debug('Inserted batch of ' + batch.size() + ' permissions');
            } catch (Exception e) {
                System.debug('Error inserting batch: ' + e.getMessage());
            }
            batch.clear();
        }
    }
}

System.debug('Field permissions update complete');
