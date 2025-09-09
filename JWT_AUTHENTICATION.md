# Salesforce JWT Bearer Authentication Setup
## Fully Automated Server-to-Server Integration

---

## 🚀 Quick Start

The system is configured for JWT Bearer authentication, which allows completely autonomous operation without any manual intervention.

### Current Status
- ✅ Private key generated (`certs/server.key`)
- ✅ Certificate created (`certs/server.crt`)
- ✅ JWT service implemented (`src/lib/salesforce-jwt.ts`)
- ✅ Connected App configured
- ⏳ Certificate needs to be uploaded to Salesforce Connected App

---

## 📋 Required One-Time Setup in Salesforce

### Step 1: Upload Certificate to Connected App
1. Log into Salesforce: https://geh--partialsb.sandbox.my.salesforce.com
2. Go to **Setup** (gear icon top right)
3. Search for **"App Manager"** in Quick Find
4. Find your Connected App and click **Edit**
5. Scroll to **API (Enable OAuth Settings)** section
6. Check **"Use digital signatures"**
7. Click **"Choose File"** and upload `certs/server.crt`
8. **Save** the Connected App

### Step 2: Pre-Authorize the User
1. In Setup, search for **"Connected Apps"**
2. Click **"Manage Connected Apps"**
3. Find your app and click **"Manage"**
4. Click **"Edit Policies"**
5. Set **Permitted Users** to **"Admin approved users are pre-authorized"**
6. **Save**
7. Click **"Manage Profiles"** or **"Manage Permission Sets"**
8. Add the integration user's profile (System Administrator or appropriate profile)
9. **Save**

### Step 3: Verify OAuth Scopes
Ensure these scopes are selected in the Connected App:
- ✅ Perform requests at any time (refresh_token, offline_access)
- ✅ Access the identity URL service (id, profile, email, address, phone)
- ✅ Access unique user identifiers (openid)
- ✅ Manage user data via APIs (api)

---

## 🧪 Testing the Authentication

### Test JWT Authentication
```bash
node test-jwt.js
```

**Expected Success Output:**
```
=== Salesforce JWT Bearer Authentication Test ===

✅ Private key loaded
✅ Client ID: [YOUR_CLIENT_ID]...
✅ Username: oronmail@geh.com.partialsb

🔐 Generating JWT token...
✅ JWT token generated

🔄 Exchanging JWT for access token...
✅ Access token obtained!
   Instance URL: https://geh--partialsb.sandbox.my.salesforce.com
   Token (first 20 chars): 00DcW000003sK3F!AQEA...

🧪 Testing connection with obtained token...
✅ Connected as: Oron Mizrachi
   Organization: 00DcW000003sK3FIAU

📊 Testing Registration_Request__c access...
✅ Object accessible!
   Fields: 89

✏️ Testing create capability...
✅ Test record created: a00cW000004XxXxQAK
   Cleaned up test record

==================================================
🎉 JWT Bearer Authentication is working perfectly!
==================================================

✨ The system will now:
   • Authenticate automatically without any user interaction
   • Generate new tokens as needed
   • Handle all token refresh automatically
   • Never require manual intervention

🚀 Your app is now fully autonomous!
```

---

## 🔧 How It Works

### Authentication Flow
```
1. System generates JWT token with:
   - iss: Client ID (Consumer Key)
   - sub: Salesforce username
   - aud: Login URL (test.salesforce.com)
   - exp: 5 minutes from now

2. JWT is signed with private key (RSA-256)

3. JWT sent to Salesforce OAuth endpoint

4. Salesforce validates:
   - Certificate matches uploaded cert
   - User is pre-authorized
   - JWT signature is valid

5. Salesforce returns access token

6. System uses token for API calls

7. Before token expires (50 min), system automatically gets new token
```

### Code Integration
The JWT authentication is automatically used by the Salesforce service:

```typescript
// In API endpoints, just call the service methods:
import salesforceJWT from '@/lib/salesforce-jwt';

// Create initial registration
const result = await salesforceJWT.createInitialRegistration(data);

// Update with consent
await salesforceJWT.updateWithConsent(recordId, consentData);

// Update with student data
await salesforceJWT.updateWithStudentData(recordId, studentData);
```

The authentication happens automatically behind the scenes!

---

## 🛠️ Troubleshooting

### Common Issues and Solutions

#### 1. "invalid_grant: invalid assertion"
**Causes:**
- Certificate not uploaded to Connected App
- Wrong certificate uploaded
- Username doesn't match exactly

**Solution:**
- Verify `certs/server.crt` is uploaded in Connected App
- Check username includes sandbox suffix (.partialsb)
- Ensure user is pre-authorized

#### 2. "invalid_client_id"
**Cause:** Client ID mismatch

**Solution:**
- Verify SALESFORCE_CLIENT_ID in .env.local matches Connected App Consumer Key

#### 3. "user hasn't approved this consumer"
**Cause:** User not pre-authorized

**Solution:**
- Follow Step 2 above to pre-authorize user
- Add user's profile to Connected App

#### 4. Token expires frequently
**Note:** This is handled automatically! The system refreshes tokens before expiry.

---

## 🔐 Security Best Practices

### DO's
- ✅ Keep `certs/server.key` secure (never commit to git)
- ✅ Use environment variables for sensitive data
- ✅ Rotate certificates every 2 years
- ✅ Limit Connected App to specific users/profiles
- ✅ Use IP restrictions if possible

### DON'Ts
- ❌ Share private key
- ❌ Hardcode credentials in code
- ❌ Use production credentials in development
- ❌ Disable certificate validation

---

## 📁 File Structure

```
gesher-intake/
├── certs/
│   ├── server.key          # Private key (KEEP SECURE)
│   └── server.crt          # Certificate (upload to SF)
├── src/lib/
│   ├── salesforce-jwt.ts   # JWT authentication service
│   └── salesforce.ts       # Legacy auth (fallback)
├── test-jwt.js             # Test JWT authentication
├── generate-jwt-cert.sh    # Generate new certificates
└── .env.local              # Environment variables
```

---

## 🔄 Certificate Renewal (Every 2 Years)

When certificate expires:

1. Generate new certificate:
```bash
./generate-jwt-cert.sh
```

2. Upload new `certs/server.crt` to Connected App

3. Test authentication:
```bash
node test-jwt.js
```

---

## 📝 Environment Variables

```env
# Required for JWT Authentication
SALESFORCE_CLIENT_ID=your_connected_app_consumer_key
SALESFORCE_USERNAME=your_salesforce_username
SALESFORCE_LOGIN_URL=https://test.salesforce.com

# Optional Fallback (if JWT fails)
SALESFORCE_INSTANCE_URL=https://geh--partialsb.sandbox.my.salesforce.com
SALESFORCE_ACCESS_TOKEN=temporary_token_here
```

---

## ✨ Benefits of JWT Bearer Flow

1. **Fully Autonomous**: No manual intervention ever needed
2. **Secure**: Certificate-based, no passwords transmitted
3. **Scalable**: No user sessions to manage
4. **Reliable**: Automatic token refresh and error recovery
5. **Production-Ready**: Suitable for high-volume operations
6. **No Expiry Issues**: Tokens refresh automatically
7. **No Login Required**: Server authenticates itself

---

## 📞 Support

If you encounter issues after following this guide:

1. Check the test output: `node test-jwt.js`
2. Verify certificate is uploaded in Salesforce
3. Confirm user is pre-authorized
4. Check OAuth scopes are correct
5. Ensure environment variables are set

---

*Last Updated: January 2025*
*Authentication Method: JWT Bearer Token Flow*
*Status: Awaiting certificate upload to Salesforce*