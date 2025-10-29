# SMS Quick Start Guide

## 🚀 Test SMS in 3 Minutes

### Step 1: Add API Token (30 seconds)
```bash
cd gesher-intake
```

Open `.env.local` and add:
```env
INWISE_API_KEY=paste_your_token_here
```

Save the file.

### Step 2: Run Test (1 minute)
```bash
node test-sms.js 0501234567
```

Replace `0501234567` with your actual phone number.

### Step 3: Check Your Phone (1 minute)
You should receive:
```
גשר אל הנוער - זהו מסרון בדיקה. Test SMS from Gesher intake system.
```

## ✅ If Test Passes
You'll see:
```
✅ SUCCESS! SMS sent with Authorization: Bearer
✅ SMS TEST COMPLETED SUCCESSFULLY
```

**Next:** Deploy to production
```bash
# Add to Vercel
vercel env add INWISE_API_KEY
# Paste your token

# Deploy
git add .
git commit -m "Enable SMS notifications"
git push origin main
```

## ❌ If Test Fails

### Error: "INWISE_API_KEY not found"
**Fix:** Add the API key to `.env.local`

### Error: "Authentication failed"
**Fix:**
1. Check for spaces in the token
2. Verify token is correct
3. Try regenerating in Inwise dashboard

### Error: "insufficient-funds"
**Fix:** Add credits to your Inwise account

### Error: "invalid-number"
**Fix:** Use a valid Israeli mobile number starting with 05

## 📱 SMS Will Be Sent When:

### Parent Notification (Consent Request)
**Trigger:** Counselor submits initial form
**Recipient:** Parent phone number
**Content:** Link to consent form

### Counselor Notification
**Trigger:** Parent signs consent
**Recipient:** Counselor mobile number
**Content:** Link to student data form

## 🔍 Debug Commands

```bash
# Check environment variables
grep INWISE .env.local

# View recent logs
vercel logs --prod | grep SMS

# Test with different phone formats
node test-sms.js 0501234567
node test-sms.js 972501234567
node test-sms.js +972-50-1234567
```

## 💡 Quick Tips

1. **Hebrew text works automatically** - charset is set to unicode
2. **Phone format doesn't matter** - auto-converted to 972-XX-XXXXXXX
3. **SMS fails gracefully** - email still works if SMS fails
4. **Check Inwise dashboard** for delivery status and credits

## 📞 Need Help?

1. Check [SMS-INTEGRATION.md](./SMS-INTEGRATION.md) for detailed guide
2. Review [SMS-IMPLEMENTATION-SUMMARY.md](./SMS-IMPLEMENTATION-SUMMARY.md) for changes
3. Run test script with debugging: `node test-sms.js 0501234567`

---

**Ready to go?** Run: `node test-sms.js YOUR_PHONE_NUMBER`
