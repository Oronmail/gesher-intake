# Salesforce Deployment Instructions

## 📦 What's Ready for Deployment

We've created comprehensive Salesforce layouts and Lightning pages for the Registration_Request__c object:

### Files Created:
1. **Page Layout**: `Registration_Request__c-Registration Request Layout.layout-meta.xml`
   - 14 organized sections with all 89 fields
   - Bilingual Hebrew/English labels
   - Related lists included

2. **Lightning Record Pages**:
   - `Registration_Request_Record_Page.flexipage-meta.xml`
   - `Registration_Request_Lightning_Page.flexipage-meta.xml`
   - 14 tabs for better organization
   - Mobile-optimized

3. **Compact Layout**: `Registration_Request_Compact.compactLayout-meta.xml`
   - For list views and mobile

4. **Deployment Package**: `salesforce-deployment.zip`
   - Ready-to-deploy zip file with all components

## 🚀 Deployment Options

### Option 1: Deploy via Workbench (Recommended)

1. **Login to Workbench**:
   - Go to https://workbench.developerforce.com
   - Select Environment: Sandbox
   - API Version: 59.0
   - Login with your Salesforce credentials

2. **Deploy the Package**:
   - Navigate to **Migration → Deploy**
   - Click **Choose File**
   - Select `salesforce-deployment.zip` from the gesher-intake folder
   - Check **Rollback on Error**
   - Check **Single Package**
   - Click **Next**
   - Click **Deploy**

3. **Monitor Deployment**:
   - Watch the deployment status
   - Should complete in 1-2 minutes

### Option 2: Deploy via Salesforce CLI

1. **Authenticate** (if not already done):
   ```bash
   sf org login web --instance-url https://test.salesforce.com --alias gesher-sandbox
   ```

2. **Deploy**:
   ```bash
   cd "/Users/oronsmac/Library/CloudStorage/Dropbox-ChinkyBeachLTD/oron mizrachi/D2R Internet Holdings, LLC/Developments/Gesher/gesher-intake"
   sf project deploy start -d force-app -o gesher-sandbox
   ```

### Option 3: Manual Setup in Salesforce

1. **Login to Salesforce Sandbox**
2. Go to **Setup**
3. Navigate to **Object Manager → Registration_Request__c**

#### For Page Layout:
1. Click **Page Layouts**
2. Click **New**
3. Copy the structure from our XML file
4. Add all 89 fields in the organized sections

#### For Lightning Pages:
1. Click **Lightning Record Pages**
2. Click **New**
3. Select **Record Page**
4. Choose **Registration_Request__c** object
5. Use **Tabs** template
6. Add field sections to each tab

## 📋 Post-Deployment Configuration

### 1. Activate Page Layout
- Go to **Setup → Object Manager → Registration_Request__c**
- Click **Page Layouts**
- Click **Page Layout Assignment**
- Assign "Registration Request Layout" to relevant profiles

### 2. Activate Lightning Record Page
- Go to **Setup → Object Manager → Registration_Request__c**
- Click **Lightning Record Pages**
- Click on one of the deployed pages
- Click **Activation**
- Choose activation option:
  - **Org Default**: Use for all users
  - **App Default**: Use for specific apps
  - **Record Type Default**: Use for specific record types

### 3. Set Compact Layout
- Go to **Setup → Object Manager → Registration_Request__c**
- Click **Compact Layouts**
- Click **Compact Layout Assignment**
- Set "Registration Request Compact Layout" as default

## 🎯 14 Organized Sections

The layouts organize all 89 fields into these logical sections:

1. **Request Information** - פרטי הבקשה
   - Status tracking, priorities, dates

2. **Counselor & School** - יועץ ובית ספר
   - Referral source information

3. **Student Personal Info** - פרטים אישיים של התלמיד
   - Demographics, contact details

4. **Parent/Guardian Info** - פרטי הורים/אפוטרופוסים
   - Parent contact information

5. **Digital Signatures** - חתימות דיגיטליות
   - Base64 encoded signatures

6. **Family Information** - מידע משפחתי
   - Household composition, occupations

7. **Economic Status** - מצב כלכלי
   - Financial assessment

8. **School & Academic** - מידע לימודי
   - Educational performance

9. **Welfare & Social Services** - רווחה ושירותים חברתיים
   - Support systems

10. **Behavioral & Motivation** - הערכת התנהגות ומוטיבציה
    - Assessment data

11. **Learning & Health** - הערכת למידה ובריאות
    - Medical and learning needs

12. **Risk Assessment** - הערכת סיכון
    - Safety evaluation

13. **Risk Factors Details** - פרטי גורמי סיכון
    - Detailed notes

14. **Final Assessment** - הערכה סופית
    - Program suitability

## ✅ Verification Steps

After deployment, verify:

1. **Page Layout**:
   - Create a test Registration_Request__c record
   - Verify all sections appear
   - Check field organization

2. **Lightning Page**:
   - Open a Registration_Request__c record
   - Verify tabs display correctly
   - Check mobile view

3. **Compact Layout**:
   - View Registration_Request__c list view
   - Verify key fields display

## 🔧 Troubleshooting

### If deployment fails:
1. Check you have proper permissions (System Administrator profile)
2. Ensure Registration_Request__c object exists
3. Verify all 89 fields are created
4. Check for any validation rules blocking deployment

### If layouts don't appear:
1. Check Page Layout Assignment
2. Verify Lightning Page activation
3. Clear browser cache
4. Check user profile permissions

## 📞 Support

For deployment assistance:
1. Use the deployment zip file: `salesforce-deployment.zip`
2. All metadata files are in `force-app/main/default/`
3. Package.xml included for easy deployment

---

**Files Location**: 
`/Users/oronsmac/Library/CloudStorage/Dropbox-ChinkyBeachLTD/oron mizrachi/D2R Internet Holdings, LLC/Developments/Gesher/gesher-intake/`

**Ready for Deployment**: ✅ All files created and packaged