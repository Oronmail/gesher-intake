# SMS Integration Guide - Inwise Service

## Overview
The Gesher intake system uses **Inwise Transactional SMS API** to send SMS notifications to parents and counselors in Hebrew.

## Features
✅ **Parent Consent Requests** - SMS with consent form link
✅ **Counselor Notifications** - SMS after parent signs consent
✅ **Hebrew Support** - Unicode charset for proper Hebrew display
✅ **Israeli Phone Numbers** - Automatic formatting (972-XX-XXXXXXX)
✅ **Dual Authentication** - Supports both Bearer and X-API-Key headers
✅ **Graceful Fallback** - Email still works if SMS fails

## Setup Instructions

### 1. Get Inwise API Key
1. Sign up at [Inwise.com](https://www.inwise.com)
2. Navigate to account settings
3. Find your API key (token)
4. Save it securely

### 2. Configure Environment Variables

Add to `.env.local` (local development):
```env
INWISE_API_KEY=your_api_token_here
INWISE_BASE_URL=https://api.inwise.com/rest/v1
INWISE_SENDER_ID=GesherYouth
```

Add to Vercel (production):
```bash
vercel env add INWISE_API_KEY
# Enter your API token when prompted

vercel env add INWISE_BASE_URL
# Enter: https://api.inwise.com/rest/v1

vercel env add INWISE_SENDER_ID
# Enter: GesherYouth
```

### 3. Test Locally

Run the test script with any Israeli phone number:

```bash
# Test with local number format
node test-sms.js 0501234567

# Test with international format
node test-sms.js 972501234567

# The script will:
# ✅ Check environment variables
# ✅ Format phone number correctly
# ✅ Test both authentication methods
# ✅ Send Hebrew test message
# ✅ Display detailed API request/response
```

**Expected Output:**
```
============================================================
📱 INWISE SMS API TEST
============================================================

1️⃣ Configuration Check:
   API Key: ✅ Set (abc123...)
   Base URL: https://api.inwise.com/rest/v1
   Sender ID: GesherYouth

2️⃣ Phone Number Formatting:
   Input: 0501234567
   Formatted: 972-50-1234567

3️⃣ Message:
   Content: גשר אל הנוער - זהו מסרון בדיקה...
   Length: 62 characters

4️⃣ API Request:
   Endpoint: https://api.inwise.com/rest/v1/transactional/sms/send
   Body: {
     "message": {
       "content": "...",
       "charset": "unicode",
       "to": [{"mobile_number": "972-50-1234567"}]
     }
   }

5️⃣ Testing with Authorization: Bearer...
   Status: 200 OK
   Response: {"status":"queued","messageId":"abc123"}

✅ SUCCESS! SMS sent with Authorization: Bearer

============================================================
✅ SMS TEST COMPLETED SUCCESSFULLY
============================================================
```

### 4. Deploy to Production

```bash
# Commit changes
git add .
git commit -m "Enable SMS notifications via Inwise"
git push origin main

# Deploy to Vercel (automatic deployment on push)
# Or manually:
vercel --prod
```

### 5. Verify in Production

Test the complete workflow:

1. **Go to production URL**: https://gesher-intake.vercel.app
2. **Fill counselor form** with parent phone number
3. **Check parent receives SMS** with consent link
4. **Parent signs consent**
5. **Check counselor receives SMS** with student form link

## Technical Details

### Phone Number Formatting
The system automatically converts any Israeli phone format to Inwise format:

```javascript
// Input formats (all work):
"0501234567"      → "972-50-1234567"
"972501234567"    → "972-50-1234567"
"+972501234567"   → "972-50-1234567"
"050-123-4567"    → "972-50-1234567"
```

### API Request Format
```json
{
  "message": {
    "content": "Your Hebrew message here",
    "charset": "unicode",
    "to": [
      {
        "mobile_number": "972-50-1234567"
      }
    ]
  }
}
```

### Authentication Headers
The system tries both common authentication methods:
1. `Authorization: Bearer {token}` (OAuth-style)
2. `X-API-Key: {token}` (API key style)

Inwise will accept whichever method they support.

### SMS Templates

**Parent Consent Request:**
```
גשר אל הנוער: נדרשת חתימתך על טופס ויתור סודיות עבור הרשמת ילדך לתוכנית.
לחץ על הקישור: https://gesher-intake.vercel.app/consent/REF-202510-1234
```

**Counselor Notification:**
```
גשר אל הנוער: ההורים חתמו על ויתור סודיות עבור [שם התלמיד/ה].
השלם את הרישום: https://gesher-intake.vercel.app/student-form/REF-202510-1234
```

## Files Modified

### Core SMS Service
- **`src/lib/sms.ts`** - Main SMS service implementation
  - `InwiseSMS` class with `sendSMS()` method
  - Phone number formatting to Inwise format (972-XX-XXXXXXX)
  - Request body matching official Inwise API spec
  - Response parsing for status codes
  - Error handling for authentication failures

### API Integration
- **`src/app/api/referrals/initiate/route.ts`**
  - Sends SMS to parent when counselor submits form
  - Already integrated (line 134-148)

- **`src/app/api/referrals/consent/route.ts`**
  - **NEW**: Sends SMS to counselor after parent signs consent
  - Added counselor SMS notification (line 139-154)
  - Tracks both email and SMS delivery status

### Testing
- **`test-sms.js`** - Standalone SMS test script
  - Tests phone number formatting
  - Tests both authentication methods
  - Sends Hebrew test message
  - Displays detailed debugging information

### Documentation
- **`CLAUDE.md`** - Updated SMS integration status
- **`.env.example`** - Includes SMS environment variables
- **`SMS-INTEGRATION.md`** - This guide

## Troubleshooting

### Issue: "SMS service not configured"
**Solution:** Add `INWISE_API_KEY` to environment variables

### Issue: "Authentication failed - check API key"
**Solution:**
1. Verify API key is correct
2. Check for extra spaces in the key
3. Try regenerating the key in Inwise dashboard

### Issue: "Message rejected: insufficient-funds"
**Solution:** Add credits to your Inwise account

### Issue: "Message rejected: invalid-number"
**Solution:**
1. Verify phone number is a valid Israeli mobile number
2. Check number starts with 05X (Israeli mobile prefix)

### Issue: Hebrew text displays as "??????"
**Solution:** Verify `charset: "unicode"` is set in request (already implemented)

### Issue: SMS not received
**Solution:**
1. Check Vercel logs: `vercel logs --prod`
2. Look for `[SMS]` prefixed log messages
3. Verify phone number is correct
4. Check Inwise dashboard for delivery status

## Logging

The SMS service includes comprehensive logging:

```javascript
[SMS] Sending SMS via Inwise to: 972-50-1234567
[SMS] Message preview: גשר אל הנוער - זהו מסרון בדיקה...
[SMS] Request body: { message: { ... } }
[SMS] ✅ SMS sent successfully via Inwise
[SMS] Response: { status: 'queued', messageId: 'abc123' }
```

Check logs in production:
```bash
vercel logs --prod | grep SMS
```

## Cost Considerations

- **Inwise Pricing**: Pay-per-SMS (check current rates at inwise.com)
- **Recommended**: Start with small credit amount for testing
- **Production**: Monitor SMS usage monthly
- **Fallback**: System continues with email if SMS fails (no cost impact)

## Support

- **Inwise Documentation**: https://developers.inwise.com/docs/api
- **Inwise Support**: support@inwise.com
- **System Logs**: Check Vercel function logs for debugging

---

**Last Updated:** October 29, 2025
**Status:** ✅ Implemented and ready for production testing
