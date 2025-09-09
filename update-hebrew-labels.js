const fs = require('fs');
const path = require('path');

// Complete Hebrew translation mapping based on StudentDataForm.tsx
const hebrewLabels = {
  // Metadata Fields
  'Status__c': 'סטטוס',
  'Priority__c': 'עדיפות',
  'Submission_Date__c': 'תאריך הגשה',
  'Consent_Date__c': 'תאריך הסכמה',
  
  // Counselor & School
  'Counselor_Name__c': 'יועצת',
  'Counselor_Email__c': 'אימייל יועצת',
  'School_Name__c': 'בית ספר',
  
  // Student Personal Information
  'Student_First_Name__c': 'שם פרטי',
  'Student_Last_Name__c': 'שם משפחה',
  'Student_ID__c': 'מספר תעודת זהות',
  'Date_of_Birth__c': 'תאריך לידה',
  'Gender__c': 'מין',
  'Country_of_Birth__c': 'ארץ לידה',
  'Immigration_Year__c': 'שנת עלייה',
  'Student_Address__c': 'כתובת',
  'Student_Floor__c': 'קומה',
  'Student_Apartment__c': 'דירה',
  'Student_Phone__c': 'טלפון',
  'Student_Mobile__c': 'נייד של התלמיד/ה',
  'School_System_Password__c': 'סיסמא למערכת מידע בית ספרית',
  
  // Parent/Guardian Information
  'Parent1_Name__c': 'שם הורה 1',
  'Parent1_ID__c': 'ת.ז. הורה 1',
  'Parent1_Address__c': 'כתובת הורה 1',
  'Parent1_Phone__c': 'טלפון הורה 1',
  'Parent1_Signature__c': 'חתימת הורה 1',
  'Parent2_Name__c': 'שם הורה 2',
  'Parent2_ID__c': 'ת.ז. הורה 2',
  'Parent2_Address__c': 'כתובת הורה 2',
  'Parent2_Phone__c': 'טלפון הורה 2',
  'Parent2_Signature__c': 'חתימת הורה 2',
  'Parent_Email__c': 'אימייל הורה',
  
  // Family Information
  'Siblings_Count__c': 'מספר אחים',
  'Father_Name__c': 'שם האב',
  'Father_Mobile__c': 'נייד האב',
  'Father_Occupation__c': 'עיסוק האב',
  'Father_Profession__c': 'מקצוע האב',
  'Father_Income__c': 'הכנסת האב',
  'Mother_Name__c': 'שם האם',
  'Mother_Mobile__c': 'נייד האם',
  'Mother_Occupation__c': 'עיסוק האם',
  'Mother_Profession__c': 'מקצוע האם',
  'Mother_Income__c': 'הכנסת האם',
  'Debts_Loans__c': 'חובות/הלוואות/משכנתא',
  'Parent_Involvement__c': 'רמת מעורבות ההורים',
  'Economic_Status__c': 'מצב כלכלי',
  'Economic_Details__c': 'פירוט מצב כלכלי',
  'Family_Background__c': 'רקע משפחתי',
  
  // School & Academic
  'Grade__c': 'כיתה',
  'Homeroom_Teacher__c': 'מחנכת',
  'Teacher_Phone__c': 'טלפון מחנכת',
  'School_Counselor_Name__c': 'יועצת בית ספר',
  'School_Counselor_Phone__c': 'טלפון יועצת',
  'Failing_Grades_Count__c': 'מספר ציונים שליליים',
  'Failing_Subjects__c': 'תיאור המקצועות בהם יש שליליים',
  
  // Welfare & Social Services
  'Known_to_Welfare__c': 'מוכרים ברווחה',
  'Social_Worker_Name__c': 'שם עו"ס מטפל',
  'Social_Worker_Phone__c': 'טלפון עו"ס',
  'Youth_Promotion__c': 'מטופל בקידום נוער',
  'Youth_Worker_Name__c': 'שם עובד קידום נוער',
  'Youth_Worker_Phone__c': 'טלפון עובד קידום נוער',
  
  // Assessment
  'Behavioral_Issues__c': 'בעיות התנהגות',
  'Has_Potential__c': 'פוטנציאל',
  'Motivation_Level__c': 'רמת מוטיבציה',
  'Motivation_Type__c': 'סוג מוטיבציה',
  'External_Motivators__c': 'גורמים חיצוניים',
  'Social_Status__c': 'מצב חברתי',
  'Afternoon_Activities__c': 'פעילויות בשעות אחה"צ',
  
  // Learning & Health
  'Learning_Disability__c': 'לקוי למידה',
  'Requires_Remedial_Teaching__c': 'מחייב הוראה מתקנת',
  'ADHD__c': 'הפרעת קשב וריכוז',
  'ADHD_Treatment__c': 'טיפול בהפרעת קשב',
  'Assessment_Done__c': 'נעשה אבחון',
  'Assessment_Needed__c': 'יש צורך באבחון',
  'Assessment_Details__c': 'פרטי אבחון',
  
  // Risk Assessment
  'Criminal_Record__c': 'עבר פלילי',
  'Drug_Use__c': 'שימוש בסמים',
  'Smoking__c': 'עישון',
  'Probation_Officer__c': 'קצין ביקור סדיר',
  'Youth_Probation_Officer__c': 'ק. שירות מבחן לנוער',
  'Psychological_Treatment__c': 'טיפול פסיכולוגי',
  'Psychiatric_Treatment__c': 'טיפול פסיכיאטרי',
  'Takes_Medication__c': 'נטילת תרופות',
  'Medication_Description__c': 'תיאור התרופות',
  'Risk_Level__c': 'רמת סיכון',
  'Risk_Factors__c': 'גורמי סיכון',
  
  // Final Assessment
  'Military_Service_Potential__c': 'סיכויי גיוס לצה"ל',
  'Can_Handle_Program__c': 'יכולת עמידה בעומס המסגרת',
  'Personal_Opinion__c': 'דעה אישית'
};

// Also update picklist values to Hebrew
const picklistTranslations = {
  'Status__c': {
    'Pending Review': 'ממתין לבדיקה',
    'In Review': 'בבדיקה',
    'Approved': 'אושר',
    'Rejected': 'נדחה',
    'Pending Consent': 'ממתין להסכמה',
    'Consent Signed': 'הסכמה נחתמה',
    'Data Submitted': 'נתונים הוגשו'
  },
  'Priority__c': {
    'High': 'גבוה',
    'Medium': 'בינוני',
    'Low': 'נמוך'
  },
  'Gender__c': {
    'Male': 'זכר',
    'Female': 'נקבה'
  },
  'Parent_Involvement__c': {
    'Inhibiting': 'מעכבת',
    'Promoting': 'מקדמת',
    'No Involvement': 'ללא מעורבות'
  },
  'Economic_Status__c': {
    'Low': 'נמוך',
    'Medium': 'בינוני',
    'High': 'גבוה'
  },
  'Motivation_Level__c': {
    'Low': 'נמוך',
    'Medium': 'בינוני',
    'High': 'גבוה'
  },
  'Motivation_Type__c': {
    'Internal': 'פנימית',
    'External': 'חיצונית'
  }
};

// Function to update field XML
function updateFieldXML(fieldPath, fieldName) {
  try {
    let xml = fs.readFileSync(fieldPath, 'utf8');
    
    // Update the label
    if (hebrewLabels[fieldName]) {
      xml = xml.replace(/<label>.*?<\/label>/s, `<label>${hebrewLabels[fieldName]}</label>`);
      
      // Update picklist values if applicable
      if (picklistTranslations[fieldName]) {
        const translations = picklistTranslations[fieldName];
        for (const [english, hebrew] of Object.entries(translations)) {
          // Update the label within value definitions
          const regex = new RegExp(`(<fullName>${english}</fullName>[\\s\\S]*?<label>)${english}(</label>)`, 'g');
          xml = xml.replace(regex, `$1${hebrew}$2`);
        }
      }
      
      fs.writeFileSync(fieldPath, xml);
      return { success: true, label: hebrewLabels[fieldName] };
    }
    return { success: false, reason: 'No Hebrew label mapping' };
  } catch (error) {
    return { success: false, reason: error.message };
  }
}

// Main execution
const fieldsDir = path.join(__dirname, 'force-app/main/default/objects/Registration_Request__c/fields');

if (!fs.existsSync(fieldsDir)) {
  console.error('❌ Fields directory not found:', fieldsDir);
  process.exit(1);
}

const fieldFiles = fs.readdirSync(fieldsDir).filter(f => f.endsWith('.field-meta.xml'));

console.log(`\n📝 Updating ${fieldFiles.length} field metadata files with Hebrew labels...\n`);

let successCount = 0;
let skipCount = 0;
let errorCount = 0;

fieldFiles.forEach(file => {
  const fieldName = file.replace('.field-meta.xml', '');
  const fieldPath = path.join(fieldsDir, file);
  
  const result = updateFieldXML(fieldPath, fieldName);
  
  if (result.success) {
    console.log(`✅ ${fieldName}: ${result.label}`);
    successCount++;
  } else if (result.reason === 'No Hebrew label mapping') {
    console.log(`⏭️  ${fieldName}: Skipped (no Hebrew mapping)`);
    skipCount++;
  } else {
    console.log(`❌ ${fieldName}: Error - ${result.reason}`);
    errorCount++;
  }
});

console.log('\n========================================');
console.log(`✅ Successfully updated: ${successCount} fields`);
console.log(`⏭️  Skipped: ${skipCount} fields`);
if (errorCount > 0) {
  console.log(`❌ Errors: ${errorCount} fields`);
}
console.log('========================================\n');

if (successCount > 0) {
  console.log('Next steps:');
  console.log('1. Review the changes');
  console.log('2. Deploy to Salesforce: sf project deploy start -d force-app -o gesher-sandbox');
  console.log('3. Verify in Salesforce UI that Hebrew labels appear correctly');
}