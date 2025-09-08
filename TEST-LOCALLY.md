# 🧪 Testing the Application Locally

The application is set up with mock data for local testing. You don't need Supabase or Salesforce configured to test the workflow.

## 📝 How to Test the Complete Workflow

### 1. **Start the Application**
```bash
npm run dev
```
Open http://localhost:3000 in your browser

### 2. **Test as School Counselor** 
- You'll see the initial form (טופס הפניית תלמיד/ה)
- Fill in the form with test data:
  - **שם היועצ/ת**: יעל כהן
  - **אימייל יועצ/ת**: yael@school.edu
  - **שם בית הספר**: בית ספר תיכון רמות
  - **אימייל הורה**: parent@gmail.com (optional)
  - **טלפון הורה**: 050-123-4567
- Click "יצירת הפניה"
- You'll see a success message with a reference number (e.g., REF-202412-1234)

### 3. **Test as Parent**
- Check the browser console (F12) for the consent URL
- Copy the URL that looks like: `http://localhost:3000/consent/REF-202412-1234`
- Open this URL in a new tab (or incognito window to simulate parent)
- Fill the parent consent form:
  - **שם התלמיד/ה**: דני לוי
  - **שם מלא (הורה 1)**: משה לוי
  - **מספר תעודת זהות**: 123456789
  - Add optional second parent if needed
- Draw a signature in the signature pad
- Click "שמור חתימה" to save the signature
- Click "שליחת הסכמה"

### 4. **Test as Counselor (Full Student Data)**
- Check the browser console for the student form URL
- Copy the URL that looks like: `http://localhost:3000/student-form/REF-202412-1234`
- Open this URL
- Fill the comprehensive 7-step form:
  - **Step 1**: Personal Information (פרטים אישיים)
  - **Step 2**: Family Information (מידע משפחתי)
  - **Step 3**: School Information (פרטי בית ספר)
  - **Step 4**: Intake Assessment (נתוני קליטה)
  - **Step 5**: Learning Assessment (אבחונים)
  - **Step 6**: Risk Assessment (הערכת סיכון)
  - **Step 7**: Final Opinion (חוות דעת אישית)
- Navigate between steps using "הבא" (Next) and "הקודם" (Previous)
- Submit the form with "שליחת טופס"

## 🎯 Test Data Suggestions

### For Testing Different Scenarios:

**Scenario 1: Student with Learning Disabilities**
- Check "לקוי למידה" in Step 5
- This will show additional fields for remedial teaching

**Scenario 2: At-Risk Youth**
- In Step 6, check multiple risk factors
- Set risk level to 7-8
- This simulates a high-risk referral

**Scenario 3: Student with ADHD**
- Check "הפרעת קשב וריכוז" in Step 5
- Fill in treatment details

## 🔍 Viewing Console Logs

The mock system logs all operations to the browser console:
1. Open Developer Tools (F12)
2. Go to Console tab
3. You'll see:
   - "Mock: Created referral" when form is submitted
   - "Mock: Updated referral" when consent is signed
   - "Mock: Fetched referral" when data is retrieved

## ⚠️ Important Notes

- **Data is not persistent** - refreshing the page will clear all data
- **URLs are logged to console** - in production, these would be sent via email/SMS
- **No real database** - using in-memory mock for testing
- **Dark text fix applied** - input text should now be clearly visible

## 🚀 Next Steps for Production

When ready for production:
1. Set up real Supabase account
2. Configure Salesforce credentials
3. Add email/SMS service for notifications
4. Deploy to Vercel

## 📱 Mobile Testing

The forms are mobile-responsive. To test on mobile:
1. Open Chrome DevTools (F12)
2. Click device toggle (Ctrl+Shift+M)
3. Select a mobile device
4. Test the forms in mobile view