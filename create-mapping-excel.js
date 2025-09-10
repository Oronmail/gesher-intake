#!/usr/bin/env node

/**
 * Create Excel file with field mapping between Registration_Request__c and Contact
 */

const XLSX = require('xlsx');
const fs = require('fs');

// Load the JSON files
const registrationFields = JSON.parse(fs.readFileSync('registration_fields.json', 'utf8'));
const contactFields = JSON.parse(fs.readFileSync('contact_fields.json', 'utf8'));
const fieldMapping = JSON.parse(fs.readFileSync('field_mapping.json', 'utf8'));

// Create workbook
const workbook = XLSX.utils.book_new();

// Sheet 1: Field Mapping
const mappingData = fieldMapping.map(field => ({
  'Registration Field API Name': field.apiName,
  'Registration Field Label': field.label,
  'Registration Field Type': field.type,
  'Length': field.length || '',
  'Required': field.required ? 'Yes' : 'No',
  'Suggested Contact Field': field.suggestedContactField || '',
  'Mapping Notes': field.mappingNotes || '',
  'Action Required': field.mappingNotes.includes('custom field') ? 'Create Custom Field' : 
                     field.suggestedContactField ? 'Map Field' : 'Review'
}));

const mappingSheet = XLSX.utils.json_to_sheet(mappingData);

// Set column widths
const mappingCols = [
  { wch: 30 }, // Registration Field API Name
  { wch: 30 }, // Registration Field Label
  { wch: 15 }, // Registration Field Type
  { wch: 10 }, // Length
  { wch: 10 }, // Required
  { wch: 25 }, // Suggested Contact Field
  { wch: 50 }, // Mapping Notes
  { wch: 20 }  // Action Required
];
mappingSheet['!cols'] = mappingCols;

XLSX.utils.book_append_sheet(workbook, mappingSheet, 'Field Mapping');

// Sheet 2: Registration Request Fields (All)
const registrationData = registrationFields.map(field => ({
  'API Name': field.apiName,
  'Label': field.label,
  'Type': field.type,
  'Length': field.length || '',
  'Required': field.required ? 'Yes' : 'No',
  'Custom': field.custom ? 'Yes' : 'No',
  'Updateable': field.updateable ? 'Yes' : 'No',
  'Createable': field.createable ? 'Yes' : 'No',
  'Picklist Values': field.picklistValues || ''
}));

const registrationSheet = XLSX.utils.json_to_sheet(registrationData);
const registrationCols = [
  { wch: 30 }, // API Name
  { wch: 30 }, // Label
  { wch: 15 }, // Type
  { wch: 10 }, // Length
  { wch: 10 }, // Required
  { wch: 10 }, // Custom
  { wch: 12 }, // Updateable
  { wch: 12 }, // Createable
  { wch: 50 }  // Picklist Values
];
registrationSheet['!cols'] = registrationCols;

XLSX.utils.book_append_sheet(workbook, registrationSheet, 'Registration Fields');

// Sheet 3: Contact Fields (All)
const contactData = contactFields.map(field => ({
  'API Name': field.apiName,
  'Label': field.label,
  'Type': field.type,
  'Length': field.length || '',
  'Required': field.required ? 'Yes' : 'No',
  'Custom': field.custom ? 'Yes' : 'No',
  'Updateable': field.updateable ? 'Yes' : 'No',
  'Createable': field.createable ? 'Yes' : 'No',
  'Picklist Values': field.picklistValues || ''
}));

const contactSheet = XLSX.utils.json_to_sheet(contactData);
const contactCols = [
  { wch: 30 }, // API Name
  { wch: 30 }, // Label
  { wch: 15 }, // Type
  { wch: 10 }, // Length
  { wch: 10 }, // Required
  { wch: 10 }, // Custom
  { wch: 12 }, // Updateable
  { wch: 12 }, // Createable
  { wch: 50 }  // Picklist Values
];
contactSheet['!cols'] = contactCols;

XLSX.utils.book_append_sheet(workbook, contactSheet, 'Contact Fields');

// Sheet 4: Gap Analysis
const gapAnalysis = [];

// Fields that need custom fields on Contact
const needsCustomField = fieldMapping.filter(f => f.mappingNotes.includes('custom field'));
needsCustomField.forEach(field => {
  gapAnalysis.push({
    'Category': 'Needs Custom Field',
    'Registration Field': field.apiName,
    'Label': field.label,
    'Type': field.type,
    'Suggested Field Name': field.suggestedContactField || field.apiName.replace('__c', '__c'),
    'Notes': field.mappingNotes
  });
});

// Fields with no mapping
const noMapping = fieldMapping.filter(f => !f.suggestedContactField);
noMapping.forEach(field => {
  gapAnalysis.push({
    'Category': 'No Mapping',
    'Registration Field': field.apiName,
    'Label': field.label,
    'Type': field.type,
    'Suggested Field Name': '',
    'Notes': 'Consider if this field is needed in Contact object'
  });
});

// Direct matches
const directMatches = fieldMapping.filter(f => f.mappingNotes === 'Direct match');
directMatches.forEach(field => {
  gapAnalysis.push({
    'Category': 'Direct Match',
    'Registration Field': field.apiName,
    'Label': field.label,
    'Type': field.type,
    'Suggested Field Name': field.suggestedContactField,
    'Notes': 'Ready to map'
  });
});

const gapSheet = XLSX.utils.json_to_sheet(gapAnalysis);
const gapCols = [
  { wch: 20 }, // Category
  { wch: 30 }, // Registration Field
  { wch: 30 }, // Label
  { wch: 15 }, // Type
  { wch: 30 }, // Suggested Field Name
  { wch: 50 }  // Notes
];
gapSheet['!cols'] = gapCols;

XLSX.utils.book_append_sheet(workbook, gapSheet, 'Gap Analysis');

// Sheet 5: Migration Summary
const summary = [
  { 'Metric': 'Total Registration Fields', 'Count': registrationFields.length },
  { 'Metric': 'Total Contact Fields', 'Count': contactFields.length },
  { 'Metric': 'Custom Fields in Registration', 'Count': registrationFields.filter(f => f.custom).length },
  { 'Metric': 'Standard Fields in Registration', 'Count': registrationFields.filter(f => !f.custom).length },
  { 'Metric': 'Fields with Direct Match', 'Count': directMatches.length },
  { 'Metric': 'Fields Needing Custom Fields', 'Count': needsCustomField.length },
  { 'Metric': 'Fields with No Mapping', 'Count': noMapping.length },
  { 'Metric': 'Fields with Suggested Mapping', 'Count': fieldMapping.filter(f => f.suggestedContactField).length }
];

const summarySheet = XLSX.utils.json_to_sheet(summary);
const summaryCols = [
  { wch: 35 }, // Metric
  { wch: 15 }  // Count
];
summarySheet['!cols'] = summaryCols;

XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

// Sheet 6: Custom Fields to Create
const customFieldsToCreate = needsCustomField.map(field => {
  // Determine the appropriate field type for Contact
  let contactFieldType = field.type;
  let fieldLength = field.length || '';
  
  // Suggest field properties
  return {
    'Field Label': field.label.replace('Student ', '').replace('Parent1 ', 'Primary Parent ').replace('Parent2 ', 'Secondary Parent '),
    'Field API Name': field.suggestedContactField || field.apiName,
    'Data Type': contactFieldType,
    'Length': fieldLength,
    'Required': field.required ? 'No (initially)' : 'No',
    'Description': `Migrated from Registration Request: ${field.label}`,
    'Help Text': field.label,
    'Source Field': field.apiName
  };
});

const customFieldSheet = XLSX.utils.json_to_sheet(customFieldsToCreate);
const customFieldCols = [
  { wch: 30 }, // Field Label
  { wch: 30 }, // Field API Name
  { wch: 15 }, // Data Type
  { wch: 10 }, // Length
  { wch: 15 }, // Required
  { wch: 50 }, // Description
  { wch: 30 }, // Help Text
  { wch: 30 }  // Source Field
];
customFieldSheet['!cols'] = customFieldCols;

XLSX.utils.book_append_sheet(workbook, customFieldSheet, 'Custom Fields to Create');

// Write the Excel file
const fileName = `Registration_to_Contact_Mapping_${new Date().toISOString().split('T')[0]}.xlsx`;
XLSX.writeFile(workbook, fileName);

console.log(`\n✅ Excel file created: ${fileName}`);
console.log('\n📊 Summary:');
console.log(`  - Total Registration fields: ${registrationFields.length}`);
console.log(`  - Fields with direct match: ${directMatches.length}`);
console.log(`  - Fields needing custom fields: ${needsCustomField.length}`);
console.log(`  - Fields with no mapping: ${noMapping.length}`);
console.log('\n📋 Excel sheets created:');
console.log('  1. Field Mapping - Complete mapping analysis');
console.log('  2. Registration Fields - All Registration_Request__c fields');
console.log('  3. Contact Fields - All Contact fields');
console.log('  4. Gap Analysis - Categorized field analysis');
console.log('  5. Summary - Migration statistics');
console.log('  6. Custom Fields to Create - List of new fields needed on Contact');