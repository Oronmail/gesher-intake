# Salesforce Connected App Setup Guide

## Overview
This guide will help you create a Salesforce Connected App for OAuth 2.0 authentication with refresh tokens, providing automatic token management without manual intervention.

---

## Step 1: Create Connected App in Salesforce

1. **Navigate to App Manager**
   - Go to Setup → Apps → App Manager
   - Click "New Connected App"

2. **Basic Information**
   ```
   Connected App Name: Gesher Intake System
   API Name: Gesher_Intake_System
   Contact Email: [your email]
   ```

3. **Enable OAuth Settings**
   - Check: ✅ Enable OAuth Settings
   - Callback URL: `http://localhost:3000/api/auth/callback` (for development)
   - For production add: `https://gesher-intake.vercel.app/api/auth/callback`

4. **Selected OAuth Scopes**
   Add these scopes:
   - `api` - Access and manage your data
   - `refresh_token` - Perform requests at any time
   - `offline_access` - Perform requests while user is offline

5. **Additional Settings**
   - Check: ✅ Require Secret for Web Server Flow
   - Check: ✅ Require Secret for Refresh Token Flow
   - Check: ✅ Enable Client Credentials Flow

6. **Save and Continue**

---

## Step 2: Retrieve Connected App Credentials

After saving, you'll need to wait a few minutes for the app to be created. Then:

1. Go to Setup → Apps → App Manager
2. Find "Gesher Intake System" and click the dropdown → View
3. Click "Manage Consumer Details" (you may need to verify your identity)
4. Copy these values:
   - **Consumer Key** (Client ID)
   - **Consumer Secret** (Client Secret)

---

## Step 3: Configure OAuth Policies

1. In the Connected App settings, click "Edit Policies"
2. Set these policies:
   ```
   Permitted Users: All users may self-authorize
   IP Relaxation: Relax IP restrictions
   Refresh Token Policy: Refresh token is valid until revoked
   ```
3. Save

---

## Step 4: Get Initial Refresh Token

### Option A: Using Salesforce CLI (Recommended)
```bash
# Authorize and get refresh token
sf org login web -r https://test.salesforce.com -a gesher-oauth

# Display auth info including refresh token
sf org display -o gesher-oauth --verbose --json | grep refreshToken
```

### Option B: Manual OAuth Flow
1. Construct authorization URL:
```
https://test.salesforce.com/services/oauth2/authorize?
  response_type=code&
  client_id=YOUR_CONSUMER_KEY&
  redirect_uri=http://localhost:3000/api/auth/callback&
  scope=api refresh_token offline_access
```

2. Visit URL in browser and authorize
3. Exchange code for tokens using POST request to:
```
https://test.salesforce.com/services/oauth2/token
```

---

## Step 5: Environment Variables

Add these to your `.env.local`:

```env
# Salesforce Connected App OAuth
SALESFORCE_CLIENT_ID=your_consumer_key_here
SALESFORCE_CLIENT_SECRET=your_consumer_secret_here
SALESFORCE_REFRESH_TOKEN=your_refresh_token_here
SALESFORCE_INSTANCE_URL=https://geh--partialsb.sandbox.my.salesforce.com
SALESFORCE_LOGIN_URL=https://test.salesforce.com

# Optional: Keep for fallback
SALESFORCE_USERNAME=oronmail@geh.com.partialsb
SALESFORCE_PASSWORD=your_password
SALESFORCE_SECURITY_TOKEN=your_security_token
```

---

## Step 6: Test the Connection

Run the test script to verify:
```bash
node test-sf-oauth.js
```

---

## Benefits of Connected App OAuth

1. **Automatic Token Refresh**: Tokens are automatically refreshed when expired
2. **No Password Storage**: More secure than storing passwords
3. **Revocable Access**: Can revoke access from Salesforce at any time
4. **API Limits**: Better API limit management
5. **Audit Trail**: All API access is logged

---

## Troubleshooting

### Error: "invalid_grant"
- Refresh token may be expired or revoked
- Re-authorize using Step 4

### Error: "invalid_client"
- Check Consumer Key and Secret are correct
- Ensure Connected App is not blocked

### Error: "insufficient_access"
- Check OAuth scopes include 'api' and 'refresh_token'
- Verify user has API access permissions

---

## Security Best Practices

1. **Never commit credentials** to version control
2. **Use environment variables** for all sensitive data
3. **Rotate refresh tokens** periodically
4. **Monitor API usage** in Salesforce Setup
5. **Use IP restrictions** in production

---

## Production Deployment

For production on Vercel:
1. Add all environment variables to Vercel project settings
2. Update callback URL in Connected App to production URL
3. Consider using Vercel's built-in environment variable encryption

---

*Last Updated: January 2025*