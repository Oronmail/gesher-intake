# Fix Inwise API Key Issue

## Current Status
✅ JSON request structure is correct
✅ Authentication header format is correct (`X-API-Key`)
❌ **API key value is being rejected by Inwise**

Error: `"Parameter 'X-API-Key' is invalid."`

---

## Solution: Update API Key in Vercel

### Step 1: Get Correct API Key from Inwise

1. **Log into your Inwise account**: https://inwise.com
2. **Navigate to Developer section**:
   - Click on the **black left sidebar**
   - Select **"Developer"**
   - Click **"Api Key"**
3. **Copy the API key**:
   - You should see your API key(s) listed
   - Copy the **entire key** (it should be a long alphanumeric string)
   - Make sure there are no spaces or extra characters

**Important Notes:**
- If you don't see any API keys, create one by clicking "New Api Key"
- Give it a descriptive name like "Gesher Intake System"
- **Contact Inwise support** if the key exists but isn't working - they may need to activate API access for your account
- Support email: support@inwise.com

---

### Step 2: Update API Key in Vercel

Run these commands from your project directory:

```bash
cd "/Users/oronsmac/Library/CloudStorage/Dropbox-ChinkyBeachLTD/oron mizrachi/D2R Internet Holdings, LLC/Developments/Gesher/gesher-intake"

# Remove old API key
vercel env rm INWISE_API_KEY

# When prompted, select:
# - Environment: Production, Preview, Development (all of them)

# Add new API key
vercel env add INWISE_API_KEY

# When prompted:
# 1. Paste your API key from Inwise (no quotes, just the key)
# 2. Select: Production, Preview, Development (all)
```

---

### Step 3: Trigger Redeploy

After updating the environment variable, you need to trigger a new deployment:

**Option A: Automatic (Recommended)**
```bash
# Make a small change and push
git commit --allow-empty -m "Trigger redeploy after API key update"
git push origin main
```

**Option B: Manual via Vercel Dashboard**
1. Go to https://vercel.com/oronmails-projects/gesher-intake
2. Click "Deployments"
3. Click the three dots on the latest deployment
4. Click "Redeploy"

---

### Step 4: Test Again

After deployment completes:

1. Go to https://gesher-intake.vercel.app
2. Submit a test referral with your phone number
3. Check the logs: `vercel logs`

**Expected Success:**
```
[SMS] ✅ SMS sent successfully via Inwise
[SMS] Response: { status: 'queued', messageId: '...' }
```

**If still failing:**
- The API key might not be activated
- Contact Inwise support: support@inwise.com
- Ask them to verify API access is enabled for transactional SMS

---

## Alternative: Test API Key Locally First

Before updating Vercel, test the API key locally:

### 1. Add to .env.local
```bash
# Open .env.local and add/update:
INWISE_API_KEY=your_api_key_from_inwise_dashboard
```

### 2. Run Test Script
```bash
cd gesher-intake
node test-sms.js 0506470578
```

**If it works locally:**
- The API key is valid
- Update it in Vercel using the steps above

**If it fails locally:**
- The API key is not activated
- Contact Inwise support to enable API access

---

## Common Issues

### Issue 1: API Key Not Activated
**Symptom:** `"Parameter 'X-API-Key' is invalid"`
**Solution:** Contact Inwise support to activate API access for your account

### Issue 2: Wrong API Key Copied
**Symptom:** Same error
**Solution:** Double-check you copied the API key (not account ID or other value)

### Issue 3: API Key Has Spaces
**Symptom:** Authentication fails
**Solution:** Remove any spaces from the beginning/end of the key

### Issue 4: Free Trial Limitations
**Symptom:** Key works but SMS not sent
**Solution:** Check if your Inwise account has SMS credits or is activated for transactional SMS

---

## Contact Inwise Support

If the API key still doesn't work after following these steps:

**Email:** support@inwise.com

**Tell them:**
```
Subject: API Key Not Working for Transactional SMS

Hi Inwise Support,

I'm trying to use the Transactional SMS API but getting error:
"Parameter 'X-API-Key' is invalid"

My account: [your email/account ID]
API Key (first 10 chars): [first 10 characters of your key]

Can you please verify:
1. Is my API key activated for REST API access?
2. Is transactional SMS enabled for my account?
3. Are there any restrictions I should know about?

Thank you!
```

---

## Next Steps After Fix

Once the API key is working:

1. ✅ Test SMS in production
2. ✅ Verify cron job for Supabase keep-alive
3. ✅ Monitor SMS delivery in Inwise dashboard
4. ✅ Document the working API key location for future reference

---

**Current Date:** October 29, 2025
**Status:** Waiting for correct API key from Inwise dashboard
