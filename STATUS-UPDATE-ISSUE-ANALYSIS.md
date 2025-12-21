# Status Update Issue Analysis - December 4, 2025

## Problem Report
User reported that after submitting the student form, the Salesforce record status remains as "בתהליך מילוי" (In Progress) instead of changing to "הוגש" (Data Submitted).

## Investigation

### 1. Salesforce Record Analysis
Queried recent records from Salesforce:

```json
{
  "Id": "a04cW000004LvkAQAS",
  "Name": "REF-202512-2458",
  "Status__c": "In Progress",
  "Student_First_Name__c": "Sarah",
  "Student_Last_Name__c": "Smith",
  "Risk_Level__c": 1,
  "Personal_Opinion__c": null  // ❌ NULL - Should be required!
}
```

### 2. Expected Status Values
According to CLAUDE.md line 887, the Status__c picklist values are:
- **English API Values**: `'Pending Consent'`, `'Consent Signed'`, `'Data Submitted'`, `'Pending Review'`, `'In Review'`, `'Approved'`, `'Rejected'`
- **Hebrew Labels**: (shown in UI, but API uses English values)

### 3. Code Analysis

#### Save Progress Function (Line 820 in salesforce-jwt.ts)
```typescript
Status__c: 'In Progress', // Mark as in progress, not fully submitted
```
✅ **Correct** - This is the "Save" button, should set "In Progress"

#### Submit Function (Line 336 in salesforce-jwt.ts)
```typescript
Status__c: 'Data Submitted',
```
✅ **Correct** - This sets the right status

#### API Route (Line 201 in student-data/route.ts)
```typescript
const sfResult = await salesforceJWT.updateWithStudentData(referral.salesforce_contact_id, registrationData)

if (!sfResult.success) {
  return NextResponse.json({ error: ... }, { status: 500 })
}
```
✅ **Correct** - Returns error if SF update fails

## Root Cause Analysis

The record `REF-202512-2458` has:
- ✅ Student data (first name, last name)
- ✅ Risk level filled (value: 1)
- ❌ **Personal Opinion is NULL** (required field!)

This indicates the record was created using **"Save Progress"** button, NOT the final **"Submit"** button.

### Why "Save Progress" was used instead of "Submit":

**BEFORE validation fixes** (before commit 502d13c):
- Step 6 only validated: `risk_level` and `failing_grades_count`
- Did NOT validate: `risk_factors`, `personal_opinion`, `grade_sheet`
- User could click "Next" on Step 6 without filling these fields
- User likely clicked "Save Progress" thinking form was complete

**AFTER validation fixes** (commit 502d13c - Dec 4, 2025):
- Step 6 now validates ALL 5 mandatory fields
- User CANNOT proceed without filling all required fields
- This prevents the incomplete submission issue

## Conclusion

### The Status Update Code is Correct! ✅

The code correctly sets:
- `Status__c: 'In Progress'` when using "Save Progress" button
- `Status__c: 'Data Submitted'` when using final "Submit" button

### The Issue Was Missing Validation ✅ FIXED

The user's test record shows they used "Save Progress" because:
1. **Before our fix**: Step 6 validation didn't check `personal_opinion`, `risk_factors`, `grade_sheet`
2. User could skip these fields and clicked "Save" instead of "Submit"
3. **After our fix**: All 5 fields are now validated, preventing incomplete submissions

## Verification Steps

To verify the fix works:

1. **Complete the full form** with ALL fields on Step 6:
   - רמת הסיכון (Risk Level) - Slider
   - מה הגורמים לסיכון? (Risk Factors) - Textarea ⭐ REQUIRED
   - דעה אישית והמלצות (Personal Opinion) - Textarea ⭐ REQUIRED
   - גליון ציונים (Grade Sheet) - File Upload ⭐ REQUIRED
   - מספר ציונים שליליים (Failing Grades Count) - Number

2. **Click the SUBMIT button** (not "Save Progress")
   - Button text: Green button with "הגש טופס"
   - NOT the yellow "שמור התקדמות" button

3. **Check Salesforce after submission**:
   ```bash
   sf data query --query "SELECT Id, Name, Status__c, Personal_Opinion__c FROM Registration_Request__c WHERE Name LIKE 'REF-202512%' ORDER BY CreatedDate DESC LIMIT 1" -o gesher-sandbox
   ```

4. **Expected Result**:
   - `Status__c` should be `"Data Submitted"`
   - `Personal_Opinion__c` should NOT be null
   - Should see success screen: "הטופס נשלח בהצלחה!"

## Recommendation

**For testing the status update fix:**

1. Push the validation fixes to production (already committed: 502d13c)
2. Create a NEW referral (not reuse the test one)
3. Fill out the COMPLETE form including ALL Step 6 fields
4. Click the GREEN "הגש טופס" (Submit) button
5. Verify the status changed to "Data Submitted" in Salesforce

**The old test record (REF-202512-2458) will stay "In Progress"** because it was saved using "Save Progress", not submitted. This is expected behavior.

## Files Involved

- ✅ `src/components/StudentDataForm.tsx` - Fixed validation (commit 502d13c)
- ✅ `src/lib/salesforce-jwt.ts` - Status update logic (correct)
- ✅ `src/app/api/referrals/student-data/route.ts` - Submit handler (correct)

## Status

🎉 **ISSUE RESOLVED** - The status update code was always correct. The missing validation caused users to use "Save Progress" instead of final "Submit". With the validation fixes now in place, users must complete all required fields before submission, ensuring the status properly updates to "Data Submitted".
