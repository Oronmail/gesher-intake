#!/bin/bash

echo "=========================================="
echo "Deploying Signature Display Fields to Salesforce"
echo "=========================================="

# Deploy the new Rich Text fields to Salesforce
echo "Deploying Parent1_Signature_Display__c and Parent2_Signature_Display__c fields..."

sf project deploy start \
  --source-dir force-app/main/default/objects/Registration_Request__c/fields/Parent1_Signature_Display__c.field-meta.xml \
  --source-dir force-app/main/default/objects/Registration_Request__c/fields/Parent2_Signature_Display__c.field-meta.xml \
  --target-org gesher-sandbox \
  --wait 10

if [ $? -eq 0 ]; then
    echo "✅ Fields deployed successfully!"
    echo ""
    echo "Next steps:"
    echo "1. Go to Setup > Object Manager > Registration Request"
    echo "2. Click on 'Page Layouts'"
    echo "3. Edit the layout to add the new fields:"
    echo "   - Parent 1 Signature Display"
    echo "   - Parent 2 Signature Display"
    echo "4. Save the layout"
    echo ""
    echo "The signatures will now display as images on the record page!"
else
    echo "❌ Deployment failed. Please check the error messages above."
fi