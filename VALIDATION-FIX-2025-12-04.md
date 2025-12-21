# Student Form Validation Fix - December 4, 2025

## Problem Summary
The student data form had validation issues on Step 4 and Step 6 when pressing the "Next" button:

### Step 4 (נתוני קליטה - Intake Assessment)
**Issue**: Conditional fields that appear after checking checkboxes were not being validated.
- When `behavioral_issues` checkbox is checked → `behavioral_issues_details` textarea appears (marked as required with *)
- When `has_potential` checkbox is checked → `potential_explanation` textarea appears (marked as required with *)
- These fields were **not validated** when pressing "Next", allowing users to skip required details

### Step 6 (הערכה סופית - Final Assessment)
**Issue**: Only 2 out of 5 mandatory fields were being validated.
- Previously validated: `risk_level`, `failing_grades_count`
- **Not validated**: `risk_factors` (textarea), `personal_opinion` (textarea), `grade_sheet` (file upload)
- Users could skip the most important assessment fields and move forward

## Solution Implemented

### 1. Enhanced Zod Schema Validation
Added conditional validation using `.refine()` method:

```typescript
const formSchema = z.object({
  // ... existing fields ...
}).refine((data) => {
  // If behavioral_issues is checked, behavioral_issues_details must be filled
  if (data.behavioral_issues && (!data.behavioral_issues_details || data.behavioral_issues_details.trim() === '')) {
    return false
  }
  return true
}, {
  message: 'נא לפרט את בעיות ההתנהגות',
  path: ['behavioral_issues_details']
}).refine((data) => {
  // If has_potential is checked, potential_explanation must be filled
  if (data.has_potential && (!data.potential_explanation || data.potential_explanation.trim() === '')) {
    return false
  }
  return true
}, {
  message: 'נא להסביר על הפוטנציאל',
  path: ['potential_explanation']
})
```

### 2. Updated getFieldsForStep() Function

#### Step 4 - Dynamic Field List
```typescript
case 4: {
  const fields: string[] = ['motivation_level', 'motivation_type', 'social_status']
  const formValues = getValues()
  // Add conditional required fields based on checkbox states
  if (formValues.behavioral_issues) {
    fields.push('behavioral_issues_details')
  }
  if (formValues.has_potential) {
    fields.push('potential_explanation')
  }
  return fields
}
```

**Before**: Only validated 3 dropdown fields
**After**: Validates 3 dropdowns + conditional textareas when their checkboxes are checked

#### Step 6 - Complete Field List
```typescript
case 6: return ['risk_level', 'risk_factors', 'personal_opinion', 'grade_sheet', 'failing_grades_count']
```

**Before**: Only validated `risk_level` and `failing_grades_count` (2 fields)
**After**: Validates all 5 mandatory fields including the critical assessment fields

## Testing Recommendations

### Test Step 4 Validation:
1. Navigate to Step 4
2. Select motivation level and type, fill social status
3. **Without checking any checkbox** → Click "Next" → Should proceed (no conditional fields required)
4. Go back, **check "בעיות התנהגות"** → Click "Next" → Should show error "נא לפרט את בעיות ההתנהגות"
5. Fill the behavioral details → Click "Next" → Should proceed
6. Go back, **check "פוטנציאל"** → Click "Next" → Should show error "נא להסביר על הפוטנציאל"
7. Fill the potential explanation → Click "Next" → Should proceed

### Test Step 6 Validation:
1. Navigate to Step 6
2. Try clicking "Submit" without filling anything → Should show errors for:
   - רמת הסיכון (risk_level)
   - מה הגורמים לסיכון? (risk_factors)
   - דעה אישית והמלצות (personal_opinion)
   - גליון ציונים (grade_sheet)
   - מספר ציונים שליליים (failing_grades_count)
3. Fill each field one by one and verify error messages disappear
4. Only after all 5 fields are completed should submission succeed

## Impact
- **Better Data Quality**: Ensures counselors provide complete assessment details
- **User Experience**: Clear validation feedback on what's missing
- **Data Integrity**: No incomplete student assessments will reach Salesforce
- **Compliance**: Meets the requirement that all mandatory fields must be filled before submission

## Files Modified
- `/src/components/StudentDataForm.tsx`
  - Lines 218-236: Added `.refine()` validation for conditional fields
  - Lines 556-571: Updated `getFieldsForStep()` for steps 4 and 6

## Commit
- Commit SHA: `502d13c`
- Branch: `main`
- Status: ✅ Committed and ready for deployment

## Known Issues
- Unrelated build error with `<Html>` import in error pages (pre-existing, not caused by this change)
- This error does not affect the form validation fixes
- Build error occurs during static page generation for 404/500 pages
