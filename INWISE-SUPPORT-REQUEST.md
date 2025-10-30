# Inwise API Support Request - SMS Gateway Configuration

## Issue Summary
✅ **UPDATE**: REST API authentication is now working!

❌ **NEW ISSUE**: We are receiving error **"no-available-gateways"** when attempting to send transactional SMS. According to your documentation, this means "an internal technical problem with the gateway defined in your account."

We need help configuring an SMS gateway for our account.

## Account Details
- **Account**: Gesher El Hanoar (gesher youth organization)
- **API Endpoint**: `https://api.inwise.com/rest/v1/transactional/sms/send`
- **Current Error**: `status: 'exception', reject_reason: 'no-available-gateways'`
- **API Key**: Working correctly (32 characters, authenticated successfully)

## What We've Done
1. ✅ Created Inwise account
2. ✅ Generated API key and got REST API permissions activated (thank you!)
3. ✅ Updated API key in our production environment (Vercel)
4. ✅ Verified our request format matches official documentation
5. ✅ Successfully authenticated with X-API-Key header
6. ✅ API request reaches Inwise successfully
7. ❌ SMS rejected with "no-available-gateways" error

## Request Format (Verified Correct)
```bash
POST https://api.inwise.com/rest/v1/transactional/sms/send
Headers:
  Content-Type: application/json
  Accept: application/json
  X-API-Key: [OUR-API-KEY]

Body:
{
  "message": {
    "content": "גשר אל הנוער: נדרשת חתימתך...",
    "charset": "unicode",
    "to": [
      {
        "mobile_number": "972-50-6470578"
      }
    ],
    "tags": ["REF-202510-5580"]
  }
}
```

## API Response (Current Error)
```json
[
  {
    "mobile_number": "972-50-6470578",
    "status": "exception",
    "reject_reason": "no-available-gateways",
    "transaction_id": "a316d8f0ffbe4fca928d883f6d93fbc1"
  }
]
```

## What We Need
According to your documentation, "no-available-gateways" means:
> **"An internal technical problem with the gateway defined in your account"**

**Please configure an SMS gateway for our account so we can send transactional SMS.**

Specifically, we need:
- ✅ REST API access enabled (DONE - working!)
- ✅ Transactional SMS sending permissions (DONE - API accepts requests!)
- ❌ SMS Gateway configured in our account (NEEDED!)
- ✅ Unicode/Hebrew text support

## Use Case
We are a nonprofit youth organization in Israel building an intake system for student referrals. We need to:
1. Send SMS to parents with consent form links
2. Send SMS to counselors when parents complete consent
3. All messages are in Hebrew (unicode charset)
4. Low volume: approximately 10-100 SMS per day

## Technical Environment
- Platform: Next.js application hosted on Vercel
- Location: Israel
- Language: Hebrew (unicode)
- Phone format: Israeli mobile numbers (972-XX-XXXXXXX)

## Questions for Support
1. ✅ RESOLVED: API key is now working for REST API access
2. ✅ RESOLVED: Transactional SMS API is responding
3. ❌ **CRITICAL**: How do we configure an SMS gateway for our account?
4. Is the SMS gateway configuration automatic, or does it need manual setup?
5. Are there specific gateway providers we need to choose for Israel/Hebrew SMS?
6. Do we need to configure credits or billing before the gateway becomes available?
7. Is there a minimum account tier required for SMS gateway access?

## Contact Information
- Organization: Gesher El Hanoar
- Email: gesheryouth@gmail.com
- Website: https://gesher-intake.vercel.app

## Expected Timeline
We are ready to go live with our intake system. Once the API permissions are activated, we can begin sending transactional SMS to support our youth referral program.

Thank you for your assistance!

---

**Note**: Our implementation has been tested extensively and matches all documentation requirements. The only remaining blocker is API key permission activation.
