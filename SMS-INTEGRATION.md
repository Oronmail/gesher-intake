# SMS Integration Documentation
## Inwise SMS Service for Gesher Intake System

---

## 📱 Overview

The Gesher Intake System now includes SMS notifications via Inwise, an Israeli SMS service provider. This enables dual-channel communication with parents, ensuring they receive consent form links through both email and SMS.

## 🚀 Current Status

- **Status**: ⚙️ Configured - Awaiting API Key
- **Provider**: Inwise (api.inwise.com)
- **Deployment**: Ready for production once API key provided
- **Last Updated**: January 2025
- **Migration**: Successfully migrated from ActiveTrail

## 🔧 Technical Implementation

### Service Architecture

```
src/lib/sms.ts
├── InwiseSMS class
├── Phone number formatting (Israeli)
├── SMS templates (Hebrew)
├── Error handling & fallbacks
└── Export functions (sendConsentSMS, sendCounselorSMS)
```

### Key Features

1. **Automatic Phone Formatting**
   - Handles Israeli numbers (05x-xxxxxxx)
   - Converts to international format (+972)
   - Removes non-digit characters

2. **Dual Notification System**
   - Email sent when email provided
   - SMS sent when phone provided
   - Both sent when both provided
   - Fallback: If one fails, other continues

3. **Hebrew SMS Templates**
   - Parent consent request
   - Counselor notification
   - All messages in Hebrew with RTL support

## 📝 Configuration

### Environment Variables

Add to `.env.local` for local development:

```env
# Inwise SMS Configuration
INWISE_API_KEY=your_api_key_here
INWISE_BASE_URL=https://api.inwise.com/rest/v1
INWISE_SENDER_ID=GesherYouth
```

### Vercel Production Variables

To be configured in Vercel dashboard:
- [ ] `INWISE_API_KEY` (pending)
- [x] `INWISE_BASE_URL` (configured)
- [x] `INWISE_SENDER_ID` (configured)

## 🔑 Authentication

Inwise uses header-based authentication:
- **Header**: `X-API-Key`
- **Value**: Your Inwise API key
- **Documentation**: https://developers.inwise.com/docs/api/guides/

## 🧪 Testing

### Local Testing

```bash
# Test SMS sending
node test-sms.js 0501234567

# Test with different number
node test-sms.js 0521234567
```

### Production Testing

1. Go to https://gesher-intake.vercel.app
2. Submit form with phone number
3. Check SMS delivery

## 📊 API Integration

### Endpoint

**Transactional SMS**: `/transactional/sms/send`

### Request Format

```javascript
{
  phoneNumber: "+972501234567",
  message: "Hebrew message text",
  sender: "GesherYouth",
  customField: "REF-2025-001" // Optional tracking
}
```

### Headers

```javascript
{
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  'X-API-Key': 'your_api_key_here'
}
```

### Response Handling

```javascript
{
  success: true,
  messageId: "message_id_from_api"
}
```

## 🔄 Workflow Integration

### When Parent Phone Provided

```mermaid
graph LR
    A[Counselor Form] --> B{Phone Provided?}
    B -->|Yes| C[Format Number]
    C --> D[Send SMS via Inwise]
    D --> E[Log Result]
    B -->|No| F[Skip SMS]
```

### Notification Priority

1. **Both email + phone**: Send both notifications
2. **Email only**: Send email notification
3. **Phone only**: Send SMS notification
4. **Neither**: Log warning, continue process

## 📋 SMS Message Templates

### Parent Consent Request
```hebrew
גשר אל הנוער: נדרשת חתימתך על טופס ויתור סודיות עבור הרשמת ילדך לתוכנית. 
לחץ על הקישור: [consent_url]
```

### Counselor Notification
```hebrew
גשר אל הנוער: ההורים חתמו על ויתור סודיות עבור [student_name]. 
השלם את הרישום: [form_url]
```

### Consent Reminder
```hebrew
תזכורת - גשר אל הנוער: טופס ויתור סודיות עבור [student_name] ממתין לחתימתך: [consent_url]
```

## 🛠️ Troubleshooting

### Common Issues

1. **SMS Not Sending**
   - Check API key is valid
   - Verify phone format (+972...)
   - Check Inwise credits
   - Review logs in Vercel Functions

2. **Invalid Phone Number**
   - Ensure Israeli format (05x-xxxxxxx)
   - Check no extra characters
   - Verify 10 digits total

3. **API Errors**
   - Check environment variables
   - Verify API endpoint availability
   - Review error logs
   - Check X-API-Key header is present

### Debug Commands

```bash
# Check environment variables
vercel env ls production | grep INWISE

# View function logs
vercel logs --yes

# Test connection
node test-sms.js
```

## 📈 Monitoring

### Success Metrics
- SMS delivery rate
- Response time
- Fallback usage
- Error frequency

### Log Messages
- `Sending SMS via Inwise to: [phone]`
- `SMS sent successfully via Inwise: [result]`
- `Inwise SMS sending error: [error]`
- `Inwise SMS API Error: [status] [details]`

## 🔐 Security Considerations

1. **API Key Protection**
   - Stored in environment variables
   - Never committed to code
   - Encrypted in Vercel

2. **Phone Number Privacy**
   - Numbers not logged in full
   - Temporary storage only (72 hours)
   - No persistent SMS logs

3. **Rate Limiting**
   - API rate limits apply
   - Middleware protection
   - Fallback on failures

## 🔄 Migration from ActiveTrail

### What Changed
- **Class Name**: `ActiveTrailSMS` → `InwiseSMS`
- **Authentication**: Authorization header → X-API-Key header
- **API Endpoint**: webapi.mymarketing.co.il → api.inwise.com
- **Request Format**: Updated to Inwise schema
- **Environment Variables**: ACTIVETRAIL_* → INWISE_*

### Migration Steps Completed
1. ✅ Updated SMS service class
2. ✅ Changed authentication method
3. ✅ Updated API endpoints
4. ✅ Modified request/response handling
5. ✅ Updated environment variables
6. ✅ Updated test scripts
7. ✅ Updated documentation
8. ⏳ Awaiting API key configuration

## 📞 Support

### Inwise Support
- Documentation: https://developers.inwise.com/docs/api/guides/
- API Reference: https://api.inwise.com/rest/v1/docs/
- Transactional SMS: https://api.inwise.com/rest/v1/docs/index?#!/transactional_sms/

### System Issues
- Check Vercel logs
- Review this documentation
- Test with `test-sms.js`

## ✅ Checklist for Activation

- [ ] Obtain Inwise API key
- [ ] Add API key to `.env.local` for testing
- [ ] Test SMS locally with `test-sms.js`
- [ ] Add API key to Vercel environment variables
- [ ] Deploy to production
- [ ] Verify SMS delivery in production
- [ ] Monitor logs for first 24 hours

## 📋 Quick Reference

### Test Command
```bash
node test-sms.js 0501234567
```

### Environment Variable
```env
INWISE_API_KEY=your_api_key_here
```

### Vercel Configuration
```bash
vercel env add INWISE_API_KEY production
```

---

*This documentation is part of the Gesher Intake System*
*Last Updated: January 2025*
*Migration Status: Complete - Awaiting API Key*