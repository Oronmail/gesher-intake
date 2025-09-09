# ActiveTrail SMS Integration - Troubleshooting Guide

## ⚠️ Current Issue: API Authentication Failing

### Error Details
- **Status**: 401 Unauthorized / 405 Forbidden
- **Message**: "incorrect, expired or invalid API Key"
- **Impact**: SMS notifications not sending
- **Email**: ✅ Working (fallback active)

## 🔍 Diagnosis Results

### Test Date: January 2025

All authentication methods tested returned 401 Unauthorized:
- ❌ Bearer Token in Authorization header
- ❌ X-API-KEY header
- ❌ Direct API key in Authorization
- ❌ Query parameter authentication
- ❌ Alternative endpoints

### Error Response
```json
{
  "Message": "This error can be caused by an incorrect, expired or invalid API Key or incorrect protocol. Please check that values are correct and set in the API apps management."
}
```

## 🛠️ Resolution Steps

### 1. Verify API Key in ActiveTrail Dashboard

1. Log into ActiveTrail account
2. Navigate to **Settings** → **API Management**
3. Check that:
   - API key is active (not expired)
   - SMS permissions are enabled
   - API access is activated for the account

### 2. Generate New API Key

If current key is invalid:
1. Delete existing API key
2. Generate new API key
3. Ensure SMS permissions are checked
4. Copy the EXACT key (no extra spaces)

### 3. Update Environment Variables

```bash
# Local (.env.local)
ACTIVETRAIL_API_KEY=paste_exact_key_here_no_quotes

# Vercel Production
vercel env rm ACTIVETRAIL_API_KEY production
echo "your_new_api_key" | vercel env add ACTIVETRAIL_API_KEY production
```

### 4. Test New Key

```bash
# Test locally first
node test-activetrail-api.js

# If successful, deploy
vercel --prod --yes
```

## 📝 API Key Format Issues

### Observed Issue
Current API key starts with `0X` which may indicate:
- Hexadecimal encoding issue
- Copy/paste error
- Wrong key type

### Expected Format
ActiveTrail API keys should typically be:
- Alphanumeric string
- 40-100 characters
- No special prefixes like "0X"

## 🔄 Temporary Workaround

While SMS is not working:
1. **Email notifications continue working** ✅
2. Parents still receive consent links via email
3. System continues to function without SMS

## 📞 ActiveTrail Support Contact

If API key is correct but still failing:

1. **Contact ActiveTrail Support**
   - Provide account details
   - Share test results from `test-activetrail-api.js`
   - Ask for:
     - Correct API endpoint for SMS
     - Authentication header format
     - API key validation

2. **Information to Provide**
   ```
   - Account email: [your email]
   - API endpoint trying: /api/external/operational/sms_message
   - Error: 401 Unauthorized
   - Need: SMS API access
   ```

## 🧪 Testing Commands

```bash
# Test API authentication methods
node test-activetrail-api.js

# Test SMS with current configuration
node test-sms.js 0501234567

# Check environment variables
grep ACTIVETRAIL .env.local

# Verify Vercel environment
vercel env ls production | grep ACTIVETRAIL
```

## ✅ When Fixed

After resolving the API key issue:

1. Update `.env.local` with working key
2. Test locally with `node test-sms.js`
3. Update Vercel environment variables
4. Deploy to production
5. Test in production

## 📊 Current Status Summary

| Service | Status | Notes |
|---------|--------|-------|
| Email (Resend) | ✅ Working | Primary notification method |
| SMS (ActiveTrail) | ❌ Auth Error | API key issue - see above |
| Salesforce | ✅ Working | JWT authentication successful |
| Database | ✅ Working | Supabase connected |

## 🔗 Related Files

- SMS Service: `src/lib/sms.ts`
- Test Script: `test-activetrail-api.js`
- Simple Test: `test-sms.js`
- Environment: `.env.local`

---

*Last Updated: January 2025*
*Issue: API Authentication - Awaiting valid API key*