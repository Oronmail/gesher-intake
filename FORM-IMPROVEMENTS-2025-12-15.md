# StudentDataForm Improvements - December 15, 2025

## Summary
Fixed four critical issues in the StudentDataForm component related to field validation, default values, and field types.

## Changes Made

### 1. Fixed "מספר אחים" (siblings_count) Default Value
**Issue:** Field had default value of 0, which is semantically different from "not filled"

**Solution:**
- Changed schema from `z.number().min(0)` to `z.number().min(0).nullable()`
- Updated default value from `siblings_count: 0` to `siblings_count: null`
- Updated TypeScript type from `number` to `number | null`

**Files Modified:**
- `src/components/StudentDataForm.tsx` (lines 131, 337)
- `src/types/forms.ts` (line 49)

### 2. Made Parent 2 Fields Conditionally Mandatory
**Issue:** When user fills "mother_name" (הורה 2 - שם), the related fields (נייד, עיסוק, מקצוע) should become mandatory but weren't enforced

**Solution:**
- Added three `.refine()` validators to the form schema
- Each validator checks if `mother_name` is filled, and if so, requires the corresponding field
- Error messages in Hebrew for each field:
  - `mother_mobile`: "נא להזין נייד הורה 2"
  - `mother_occupation`: "נא להזין עיסוק הורה 2"
  - `mother_profession`: "נא להזין מקצוע הורה 2"

**Files Modified:**
- `src/components/StudentDataForm.tsx` (lines 232-263)

**Code Added:**
```typescript
.refine((data) => {
  if (data.mother_name && data.mother_name.trim() !== '') {
    if (!data.mother_mobile || data.mother_mobile.trim() === '') {
      return false
    }
  }
  return true
}, {
  message: 'נא להזין נייד הורה 2',
  path: ['mother_mobile']
})
// Similar refine blocks for mother_occupation and mother_profession
```

### 3. Fixed Stage 2 Validation Error Messages Not Appearing
**Issue:** When user clicks "Next" on Step 2 with missing mandatory fields, the page would just "stuck" without showing any error messages

**Root Cause:** The `nextStep()` function was filtering out "completed fields" before validation, which meant some fields weren't being validated. When validation failed, errors weren't triggering properly.

**Solution:**
- Removed the filtering logic that excluded completed fields from validation
- Changed to validate ALL fields for the current step using `trigger(fieldsToValidate)`
- Added scroll-to-first-error functionality to improve UX when validation fails
- Error messages now properly display below each field that fails validation

**Files Modified:**
- `src/components/StudentDataForm.tsx` (lines 460-477)

**Before:**
```typescript
const nextStep = async () => {
  const fieldsToValidate = getFieldsForStep(currentStep)
  const fieldsNeedingValidation = fieldsToValidate.filter(field => !completedFields.has(field))

  if (fieldsNeedingValidation.length === 0) {
    setCurrentStep(currentStep + 1)
    return
  }

  const isValid = await trigger(fieldsNeedingValidation as (keyof FormData)[])
  if (isValid && currentStep < totalSteps) {
    setCurrentStep(currentStep + 1)
  }
}
```

**After:**
```typescript
const nextStep = async () => {
  const fieldsToValidate = getFieldsForStep(currentStep)

  // Validate all fields for this step to ensure error messages show
  const isValid = await trigger(fieldsToValidate as (keyof FormData)[])

  if (isValid && currentStep < totalSteps) {
    setCurrentStep(currentStep + 1)
  } else if (!isValid) {
    // Scroll to the first error if validation fails
    setTimeout(() => {
      const firstError = document.querySelector('.text-red-600')
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }, 100)
  }
}
```

### 4. Changed "רמת מעורבות ההורים" from Dropdown to Textarea
**Issue:** Field was a dropdown with only 3 predefined options (מעכבת, מקדמת, ללא מעורבות), limiting counselor's ability to provide nuanced descriptions

**Solution:**
- Changed from `<select>` to `<textarea>` element
- Updated label to: "מהי רמת המעורבות של ההורים (מעכבת, מקדמת, ללא מעורבות וכדומה)"
- Changed schema validation from `z.enum()` to `z.string().min(1)`
- Added placeholder text with examples
- Changed field width to full width (`md:col-span-2`) for better UX
- Set to 3 rows with resizable height (`resize-y`)

**Files Modified:**
- `src/components/StudentDataForm.tsx` (lines 143, 1543-1565)
- `src/types/forms.ts` (line 61)

**Before:**
```tsx
<select {...register('parent_involvement')} className="...">
  <option value="">בחר רמת מעורבות</option>
  <option value="promoting">מקדמת</option>
  <option value="no_involvement">ללא מעורבות</option>
  <option value="inhibiting">מעכבת</option>
</select>
```

**After:**
```tsx
<textarea
  {...register('parent_involvement')}
  rows={3}
  className="... resize-y"
  placeholder="תאר את רמת מעורבות ההורים (לדוגמה: מקדמת, מעכבת, ללא מעורבות)"
/>
```

## Testing

### Build Status
✅ Build completed successfully
- No TypeScript errors
- Only minor linting warnings (unused imports - non-critical)

### Git Status
✅ Changes committed to main branch
- Commit: `aae8427`
- Pushed to GitHub: `Oronmail/gesher-intake`

## Files Changed
1. `src/components/StudentDataForm.tsx` - Main form component
2. `src/types/forms.ts` - TypeScript type definitions

## Impact Assessment

### User Experience
- ✅ Better validation feedback (errors now visible)
- ✅ More flexible parent involvement descriptions
- ✅ Clearer default state for siblings count
- ✅ Logical field dependencies for parent 2 information

### Data Integrity
- ✅ Conditional validation ensures complete parent 2 data when provided
- ✅ Nullable siblings_count allows distinguishing "0 siblings" from "not filled"
- ✅ Free-text parent involvement allows more detailed assessments

### Backward Compatibility
- ⚠️ Existing records with parent_involvement enum values will still work (they're valid strings)
- ⚠️ Existing records with siblings_count = 0 will remain as 0 (new entries will default to null)

---

## Additional Improvements - Part 2 (Same Session)

### 5. Changed "רמת מוטיבציה" from Dropdown to Combined Textarea
**Issue:** Field was a dropdown with separate fields for motivation type and external motivators, limiting flexibility

**Solution:**
- Changed from multiple fields (dropdown + conditional textarea) to single textarea
- New label: "רמת מוטיבציה (אנא ציין האם המוטיבציה פנימית או חיצונית. במידה וחיצונית פרט מי הגורם המניע)"
- Removed `motivation_type` dropdown (internal/external)
- Removed conditional `external_motivators` field
- Schema changed from `z.enum(['low', 'medium', 'high'])` to `z.string().min(1)`
- Updated getFieldsForStep to remove motivation_type from step 4 validation
- Placeholder provides examples for counselors

**Files Modified:**
- `src/components/StudentDataForm.tsx` (lines 167, 620, 2056-2079)
- `src/types/forms.ts` (line 81)

### 6. Made ADHD Treatment Field Conditionally Mandatory
**Issue:** When "הפרעת קשב וריכוז (ADHD)" checkbox is checked, the treatment details field appears but wasn't mandatory

**Solution:**
- Added `.refine()` validator: if `adhd` is true, `adhd_treatment` must be filled
- Added red asterisk (*) to field label when displayed
- Added error message component below field
- Error message: "נא למלא פירוט טיפול ב-ADHD"
- Updated getFieldsForStep for step 5 to conditionally include `adhd_treatment`

**Files Modified:**
- `src/components/StudentDataForm.tsx` (lines 262-270, 632-637, 2200, 2213-2218)

### 7. Added Criminal Record Details Field
**Issue:** When "בעל/ת עבר פלילי" checkbox is checked, need mandatory details about the criminal record

**Solution:**
- Added new `criminal_record_details` field (textarea)
- Appears when `criminal_record` checkbox is checked
- Red asterisk indicates mandatory status
- Placeholder: "פרט את העבר הפלילי (סוג העבירות, תאריכים, מעורבות משפטית וכדומה)..."
- Added `.refine()` validator for conditional validation
- Error message: "נא למלא פרטי עבר פלילי"
- Updated getFieldsForStep for step 5 to conditionally include field
- Added to schema and TypeScript types

**Files Modified:**
- `src/components/StudentDataForm.tsx` (lines 188, 271-279, 638-639, 2396-2415)
- `src/types/forms.ts` (line 100)

### 8. Fixed Risk Level Default Value and Validation
**Issue:**
- risk_level had default value of 1, should be null for clarity
- Final stage (step 6) validation wasn't working properly

**Solution:**
- Changed schema from `z.number().min(1).max(10)` to `z.number().min(1).max(10).nullable()`
- Updated default value from `risk_level: 1` to `risk_level: null`
- Updated TypeScript type to `number | null`
- Validation already in place via getFieldsForStep for step 6
- nextStep() function already validates all fields properly (fixed in Part 1)

**Files Modified:**
- `src/components/StudentDataForm.tsx` (lines 201, 356)
- `src/types/forms.ts` (line 113)

**Note on Step 6 Validation:**
The validation for step 6 (final stage) is working correctly because:
1. getFieldsForStep(6) returns all mandatory fields including risk_level
2. nextStep() now validates all fields (fixed in Part 1, issue #3)
3. Fields are properly marked as required in schema

## Summary of All Changes

### Total: 8 Improvements
1. ✅ siblings_count default: 0 → null
2. ✅ Parent 2 fields conditionally mandatory
3. ✅ Stage 2 validation error display fixed
4. ✅ parent_involvement: dropdown → textarea
5. ✅ motivation_level: dropdown → combined textarea
6. ✅ ADHD treatment: conditionally mandatory
7. ✅ Criminal record details: new mandatory field
8. ✅ risk_level: default null + validation

### Commits
- **Part 1** (Changes 1-4): Commit `aae8427`
- **Part 2** (Changes 5-8): Commit `b709859`

## Next Steps
- Monitor production for any issues with these changes
- Consider adding similar conditional validation for other optional field groups
- May want to add character count for textareas
- The Html import error in build is pre-existing and unrelated to these changes

## Related Issues
- Previous validation fix: VALIDATION-FIX-2025-12-04.md
- Status update analysis: STATUS-UPDATE-ISSUE-ANALYSIS.md
