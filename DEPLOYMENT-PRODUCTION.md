# Salesforce Production Deployment Plan

## Overview
Deploy the Gesher Al HaNoar intake system to Salesforce Production while maintaining dual environments:
- **Vercel Preview deployments** → Salesforce Sandbox (for testing)
- **Vercel Production** → Salesforce Production (for live use)

**Production Instance:** `https://geh.my.salesforce.com`

---

## Phase 1: Salesforce Production Setup (Manual Steps in SF)

### Step 1.1: Generate JWT Certificate FIRST

**Run these commands in your terminal before creating the app:**

```bash
# Navigate to project
cd "/Users/oronsmac/Library/CloudStorage/Dropbox-ChinkyBeachLTD/oron mizrachi/D2R Internet Holdings, LLC/Developments/Gesher/gesher-intake"

# Create directory for production certificates
mkdir -p certs/production

# Generate private key (2048-bit RSA)
openssl genrsa -out certs/production/server.key 2048

# Generate self-signed certificate (valid for 1 year)
openssl req -new -x509 -key certs/production/server.key -out certs/production/server.crt -days 365 -subj "/C=IL/ST=Israel/O=Gesher Al HaNoar/CN=gesher-intake-prod"

# Verify certificate was created
ls -la certs/production/
```

You should see:
- `server.key` - Private key (keep secure, needed for Vercel)
- `server.crt` - Public certificate (upload to Salesforce)

---

### Step 1.2: Create External Client App (New Salesforce UI 2024+)

**In Salesforce Production (https://geh.my.salesforce.com):**

#### Navigate to App Manager:
1. Click **Setup** (gear icon → Setup)
2. In Quick Find, type: `App Manager`
3. Click **App Manager** under Apps

#### Create New External Client App:
4. Click **"New External Client App"** button (top right)
   > ⚠️ Note: In newer Salesforce versions (2024+), "New Connected App" was replaced with "New External Client App"

#### Step 1 - Basic Info:
5. Fill in the basic information:
   | Field | Value |
   |-------|-------|
   | **App Name** | `Gesher Intake System` |
   | **API Name** | `Gesher_Intake_System` (auto-generated) |
   | **Contact Email** | Your admin email |
   | **Description** | `Integration app for Gesher Al HaNoar intake system` |

6. Click **Continue** or **Next**

#### Step 2 - API Integration (OAuth):
7. **Enable OAuth**: ✓ Check "Enable OAuth Settings"

8. **Callback URL**:
   ```
   https://gesher-intake.vercel.app/api/auth/callback
   ```

9. **Selected OAuth Scopes** - Add these:
   - `Access the identity URL service (id)`
   - `Manage user data via APIs (api)`
   - `Perform requests at any time (refresh_token, offline_access)`

10. **Use digital signatures**: ✓ Check this option

11. **Upload Certificate**: Click "Choose File" and upload `certs/production/server.crt`

12. **Require Proof Key for Code Exchange (PKCE)**: Leave unchecked (not needed for JWT)

13. Click **Save**

#### Step 3 - Get Consumer Credentials:
14. After saving, you'll see the app details page

15. Click **"Manage Consumer Details"** button
    > You may need to verify your identity via email/authenticator

16. **Copy and save these values:**
    ```
    Consumer Key (CLIENT_ID):     ________________________________
    Consumer Secret (CLIENT_SECRET): ________________________________
    ```
    > ⚠️ IMPORTANT: Save these immediately! You'll need them for Vercel.

---

### Step 1.3: Configure App Policies (Pre-Authorization)

**Navigate to the app management:**

1. Setup → Quick Find → Type `Connected Apps`
2. Click **"Manage Connected Apps"**
3. Find **"Gesher Intake System"** in the list
4. Click **Edit** (in Action column)

**Configure Policies:**

5. Under **OAuth Policies**:
   | Setting | Value |
   |---------|-------|
   | **Permitted Users** | `Admin approved users are pre-authorized` |
   | **IP Relaxation** | `Relax IP restrictions` |
   | **Refresh Token Policy** | `Refresh token is valid until revoked` |

6. Click **Save**

**Add Authorized User:**

7. Back on the Connected App page, click **"Manage Profiles"** or **"Manage Permission Sets"**

8. Add the profile for user `oronmail@geh.com`:
   - If using Profiles: Add "System Administrator" (or the user's profile)
   - If using Permission Sets: Add a permission set assigned to the user

9. Click **Save**

---

### Step 1.4: Verify Connected App Setup

**Checklist before proceeding:**

- [ ] Certificate uploaded successfully (server.crt)
- [ ] Consumer Key copied
- [ ] Consumer Secret copied
- [ ] Permitted Users set to "Admin approved users are pre-authorized"
- [ ] User profile/permission set added
- [ ] IP Relaxation configured

**Test in Salesforce:**
1. Setup → Quick Find → "Connected Apps OAuth Usage"
2. Your app should appear in the list (may take 2-10 minutes to propagate)

---

## Phase 2: Deploy Salesforce Metadata

### Step 2.1: Authenticate SFDX CLI to Production

```bash
# Authenticate to production (opens browser for login)
sf org login web -a gesher-production -r https://login.salesforce.com

# Verify authentication
sf org list

# Expected output should show gesher-production in the list
```

### Step 2.2: Validate Deployment (Dry Run - Recommended)

```bash
# Validate without actually deploying (checks for errors)
sf project deploy validate -d force-app -o gesher-production --wait 30
```

If validation passes, proceed to deployment.

### Step 2.3: Deploy All Metadata

```bash
# Deploy all metadata to production
sf project deploy start -d force-app -o gesher-production --wait 30

# Check deployment status
sf project deploy report -o gesher-production
```

### Step 2.4: What Gets Deployed

| Component Type | Count | Description |
|----------------|-------|-------------|
| Custom Object | 1 | `Registration_Request__c` |
| Custom Fields | 91 | All student/parent/assessment fields |
| Compact Layout | 1 | Mobile view optimization |
| List Views | 2 | Record list configurations |
| FlexiPage | 1 | Lightning Record Page |
| LWC Component | 1 | `registrationRequestView` |
| Permission Set | 1 | Field-level access |

### Step 2.5: Assign Permission Set

After deployment, assign the permission set to the integration user:

```bash
# Assign permission set to user
sf org assign permset -n Registration_Request_Fields -o gesher-production
```

Or manually in Salesforce:
1. Setup → Permission Sets → Registration Request Fields
2. Manage Assignments → Add Assignment
3. Select user `oronmail@geh.com`

---

## Phase 3: Configure Vercel Environment Variables

### Step 3.1: How Vercel Environment Scoping Works

In Vercel, each environment variable can be scoped to specific environments:
- **Production** - Applied to deployments from the `main` branch
- **Preview** - Applied to deployments from other branches and pull requests
- **Development** - Applied when running `vercel dev` locally

**To have different values for Production vs Preview:** Create the **same variable twice** with different scopes.

### Step 3.2: Environment Strategy

| Variable | Preview (Sandbox) | Production (SF Prod) |
|----------|-------------------|----------------------|
| `SALESFORCE_LOGIN_URL` | `https://test.salesforce.com` | `https://login.salesforce.com` |
| `SALESFORCE_INSTANCE_URL` | `https://geh--partialsb.sandbox.my.salesforce.com` | `https://geh.my.salesforce.com` |
| `SALESFORCE_USERNAME` | `oronmail@geh.com.partialsb` | `oronmail@geh.com` |
| `SALESFORCE_CLIENT_ID` | (from Sandbox Connected App) | (from Production Connected App) |
| `SALESFORCE_CLIENT_SECRET` | (from Sandbox Connected App) | (from Production Connected App) |
| `SALESFORCE_PRIVATE_KEY` | (existing sandbox key) | (new production key from Step 3.3) |

### Step 3.3: Convert Private Key for Vercel

The private key must be converted to a single-line format with escaped newlines:

```bash
# Convert multi-line key to escaped single-line format
cat certs/production/server.key | awk '{printf "%s\\n", $0}'
```

Copy the entire output (including `-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----`).

### Step 3.4: Update Vercel Dashboard - Step by Step

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select **gesher-intake** project
3. Go to **Settings** → **Environment Variables**

#### For Variables That Need Different Values:

For each Salesforce variable, you'll create **TWO entries**:

**Example: SALESFORCE_INSTANCE_URL**

**Entry 1 (Preview/Sandbox):**
```
Name:        SALESFORCE_INSTANCE_URL
Value:       https://geh--partialsb.sandbox.my.salesforce.com
Environment: ☑️ Preview  ☐ Production  ☐ Development
```

**Entry 2 (Production):**
```
Name:        SALESFORCE_INSTANCE_URL
Value:       https://geh.my.salesforce.com
Environment: ☐ Preview  ☑️ Production  ☐ Development
```

#### Complete Variable List to Add:

**Production-Only Variables (check only "Production"):**

| Variable | Production Value |
|----------|------------------|
| `SALESFORCE_INSTANCE_URL` | `https://geh.my.salesforce.com` |
| `SALESFORCE_LOGIN_URL` | `https://login.salesforce.com` |
| `SALESFORCE_CLIENT_ID` | (from Production Connected App) |
| `SALESFORCE_CLIENT_SECRET` | (from Production Connected App) |
| `SALESFORCE_USERNAME` | `oronmail@geh.com` |
| `SALESFORCE_PRIVATE_KEY` | (escaped production key from Step 3.3) |

**Preview-Only Variables (check only "Preview"):**

| Variable | Preview Value |
|----------|---------------|
| `SALESFORCE_INSTANCE_URL` | `https://geh--partialsb.sandbox.my.salesforce.com` |
| `SALESFORCE_LOGIN_URL` | `https://test.salesforce.com` |
| `SALESFORCE_CLIENT_ID` | (from Sandbox Connected App) |
| `SALESFORCE_CLIENT_SECRET` | (from Sandbox Connected App) |
| `SALESFORCE_USERNAME` | `oronmail@geh.com.partialsb` |
| `SALESFORCE_PRIVATE_KEY` | (existing escaped sandbox key) |

#### Variables That Stay the Same (All Environments):

These variables should have **both Production AND Preview checked**:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_KEY`
- `GMAIL_USER`
- `GMAIL_APP_PASSWORD`
- `JWT_SECRET`
- `ENCRYPTION_KEY`
- `API_SECRET_KEY`
- All other non-Salesforce variables

### Step 3.5: Verify Configuration

After adding all variables:
1. Go to **Settings** → **Environment Variables**
2. You should see each Salesforce variable listed **twice**:
   - One with "Preview" badge
   - One with "Production" badge
3. Other variables should show "Production, Preview, Development"

---

## Phase 4: Test JWT Authentication

### Step 4.1: Create Test Script

Create file `test-jwt-production.js`:

```javascript
const jwt = require('jsonwebtoken');
const axios = require('axios');
const fs = require('fs');

const privateKey = fs.readFileSync('certs/server.key', 'utf8');
const clientId = 'YOUR_PRODUCTION_CLIENT_ID'; // From Step 1.3
const username = 'oronmail@geh.com';
const loginUrl = 'https://login.salesforce.com';

const claims = {
  iss: clientId,
  sub: username,
  aud: loginUrl,
  exp: Math.floor(Date.now() / 1000) + 300
};

const token = jwt.sign(claims, privateKey, { algorithm: 'RS256' });

axios.post(`${loginUrl}/services/oauth2/token`, null, {
  params: {
    grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
    assertion: token
  }
}).then(response => {
  console.log('✅ SUCCESS! Access token received');
  console.log('Instance URL:', response.data.instance_url);
  console.log('Token (first 50 chars):', response.data.access_token.substring(0, 50) + '...');
}).catch(error => {
  console.error('❌ FAILED:', error.response?.data || error.message);
});
```

### Step 4.2: Run Test

```bash
# Make sure you're in the project directory
cd "/Users/oronsmac/Library/CloudStorage/Dropbox-ChinkyBeachLTD/oron mizrachi/D2R Internet Holdings, LLC/Developments/Gesher/gesher-intake"

# Run the test
node test-jwt-production.js
```

**Expected output:**
```
✅ SUCCESS! Access token received
Instance URL: https://geh.my.salesforce.com
Token (first 50 chars): 00D...
```

If you see an error, check:
- Certificate uploaded correctly
- User pre-authorized
- CLIENT_ID is correct

---

## Phase 5: Deploy and Verify Application

### Step 5.1: Trigger Vercel Redeploy

Option A - Via Git:
```bash
git add -A
git commit -m "Add production deployment documentation"
git push origin main
```

Option B - Via Vercel Dashboard:
1. Go to Vercel → gesher-intake → Deployments
2. Click on latest deployment → "..." menu → Redeploy

### Step 5.2: Verify Health Check

```bash
curl https://gesher-intake.vercel.app/api/health
```

Look for Salesforce status in the response.

### Step 5.3: End-to-End Testing

#### Test 1: Counselor Form
1. Go to `https://gesher-intake.vercel.app`
2. Submit a test referral
3. **Verify in SF Production:** Check that Registration_Request__c record was created
   - Status should be "Pending Consent"

#### Test 2: Parent Consent
1. Open the parent consent link from email/SMS
2. Complete the consent form with signatures
3. **Verify in SF Production:**
   - Status updated to "Consent Signed"
   - Signature images attached

#### Test 3: Student Data Form
1. Open the student data link from email
2. Fill all 6 steps of the form
3. **Verify in SF Production:**
   - Status updated to "Data Submitted"
   - All 91 fields populated
   - File attachments present

---

## Phase 6: Logging & Monitoring

### Step 6.1: Vercel Logs

Monitor real-time logs:
1. Vercel Dashboard → gesher-intake → Deployments → Latest
2. Click "Functions" tab
3. Watch for:
   - `[SF-JWT] Successfully authenticated` ✅
   - `[SF-JWT] Token refreshed` ✅
   - `[SF] Created Registration Request` ✅
   - `ERROR` ❌

### Step 6.2: Salesforce Debug Logs

Enable debug logging for the integration user:
1. Setup → Debug Logs
2. Click "New"
3. User: `oronmail@geh.com`
4. Debug Level: SFDC_DevConsole (or custom)
5. Start/End dates

### Step 6.3: Set Up Uptime Monitoring (Recommended)

Use UptimeRobot or similar:
- **URL:** `https://gesher-intake.vercel.app/api/health`
- **Interval:** 5 minutes
- **Alert:** Email on failure

---

## Rollback Plan

### If Issues Occur:

#### Option 1: Revert to Sandbox Only
1. Go to Vercel → Settings → Environment Variables
2. Delete the Production-scoped Salesforce variables
3. Redeploy - app will use Preview/Development (Sandbox) config

#### Option 2: Revert Code
```bash
git checkout v1.0.0-stable
git push origin main --force
```

#### Option 3: Salesforce Metadata
- Metadata in Production doesn't affect Sandbox
- Can be deleted manually if needed, but usually safe to leave

---

## Deployment Checklist

### Pre-Deployment
- [ ] Create Connected App in Salesforce Production
- [ ] Generate new JWT certificate (`certs/production/server.key`)
- [ ] Upload certificate to Connected App
- [ ] Pre-authorize integration user (`oronmail@geh.com`)
- [ ] Copy CLIENT_ID and CLIENT_SECRET
- [ ] Authenticate SFDX CLI to production

### Metadata Deployment
- [ ] Validate deployment (dry run)
- [ ] Deploy all metadata to production
- [ ] Assign permission set to integration user
- [ ] Verify fields exist in SF Production

### Application Configuration
- [ ] Convert private key for Vercel format
- [ ] Add Production-scoped variables to Vercel
- [ ] Test JWT authentication locally
- [ ] Trigger Vercel redeploy

### Post-Deployment Testing
- [ ] Verify health check endpoint
- [ ] Test counselor form submission
- [ ] Verify SF record created in Production
- [ ] Test parent consent flow
- [ ] Verify signatures captured
- [ ] Test student data form (all 6 steps)
- [ ] Verify all 91 fields populated
- [ ] Test file uploads (assessment, grade sheet)
- [ ] Verify email notifications working
- [ ] Verify SMS notifications (if configured)

---

## Quick Reference

| Item | Value |
|------|-------|
| **Production Instance** | `https://geh.my.salesforce.com` |
| **Login URL** | `https://login.salesforce.com` |
| **Username** | `oronmail@geh.com` |
| **App URL** | `https://gesher-intake.vercel.app` |
| **Health Check** | `https://gesher-intake.vercel.app/api/health` |
| **Stable Tag** | `v1.0.0-stable` |

---

## Support

If you encounter issues:
1. Check Vercel logs for error messages
2. Check Salesforce debug logs
3. Verify all environment variables are set correctly
4. Test JWT authentication locally first

---

*Created: December 2025*
*Project: Gesher Al HaNoar Intake System*
