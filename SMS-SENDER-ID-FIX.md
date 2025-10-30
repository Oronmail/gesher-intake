# SMS Sender ID and Unsubscribe Link - Configuration

## 🎉 SMS Now Working!

Great news - your SMS gateway is configured and messages are being delivered!

## Two Issues to Address

### Issue 1: Sender Shows "SenderID" Instead of "GesherYouth"

**Current**: Messages show from "SenderID"
**Desired**: Messages show from "GesherYouth"

### Issue 2: Unwanted Unsubscribe Link

**Current**: Inwise adds unsubscribe link to messages
**Desired**: Remove unsubscribe link (these are transactional messages, not marketing)

## ✅ What I've Done

### 1. Disabled Unsubscribe Link (DONE)

Updated [src/lib/sms.ts](src/lib/sms.ts) to include:
```typescript
add_unsubscribe_link: false,
add_unsubscribe_sms_reply: false,
```

This should remove the unsubscribe link from your messages.

### 2. Added Sender ID Parameter (TESTING NEEDED)

Added sender_id to the request:
```typescript
...(this.config.senderId && { sender_id: this.config.senderId }),
```

Your environment variable `INWISE_SENDER_ID` is already set to "GesherYouth".

## 🔍 Sender ID - Two Possible Scenarios

### Scenario A: API Parameter (sender_id)

If Inwise supports `sender_id` as an API parameter, our code change will work automatically.

**Test**: Deploy and send an SMS. Check if it shows "GesherYouth" instead of "SenderID".

### Scenario B: Account-Level Configuration (Most Likely)

Sender ID is usually configured at the **account level**, not per-message. This means:

1. **You need to configure it in Inwise dashboard** under:
   - Settings → SMS → Sender ID
   - Account Settings → SMS Configuration
   - Messaging → Sender Configuration
   - Similar settings section

2. **Or contact Inwise support** to configure "GesherYouth" as your sender ID

## 📋 What You Need to Do

### Step 1: Test Unsubscribe Link Fix

After deployment, send a test SMS and verify:
- ✅ Unsubscribe link is removed
- ✅ Message is cleaner

### Step 2: Configure Sender ID

#### Option A - Try Dashboard First
1. Log into your Inwise account: https://app.inwise.com
2. Look for SMS settings/configuration
3. Find "Sender ID" or "Sender Name" setting
4. Set it to: **GesherYouth**
5. Save and test

#### Option B - Contact Inwise Support (Recommended)
Send them this request:

---

**Subject**: Configure Alphanumeric Sender ID for SMS

Hi Inwise Support,

We successfully configured our SMS gateway (thank you!) and messages are now being delivered.

We need to configure our **SMS Sender ID** (also called alphanumeric sender ID).

**Current**: Messages show from "SenderID"
**Desired**: Messages should show from "**GesherYouth**"

Our account: Gesher El Hanoar
Use case: Transactional SMS for youth referral intake system
Target: Israeli mobile numbers (972-XX-XXXXXXX)

Questions:
1. How do we configure "GesherYouth" as our SMS sender ID?
2. Is this configured in the dashboard or do we need your assistance?
3. Does Israel support alphanumeric sender IDs?
4. Is there a registration/approval process required?
5. Does this affect our API requests, or is it account-level only?

We already have `INWISE_SENDER_ID=GesherYouth` in our code, and we've added `sender_id` parameter to our API requests. Please let us know if additional configuration is needed.

Thank you!
Gesher El Hanoar Team

---

## 🌍 Important Notes About Alphanumeric Sender IDs

### Israel/Hebrew Support
- Israel **does** support alphanumeric sender IDs
- Maximum 11 characters (GesherYouth = 11 chars ✅)
- Can include: A-Z, a-z, 0-9, and spaces
- Cannot be numbers only

### Limitations
- **One-way only**: Recipients cannot reply to alphanumeric sender IDs
- This is fine for your use case (transactional notifications)

### Registration
- Some countries require sender ID registration/approval
- Check with Inwise if Israel requires this

## 📊 Changes Summary

### Code Changes Made

**File**: [src/lib/sms.ts](src/lib/sms.ts)

**Changes**:
1. Added `add_unsubscribe_link: false`
2. Added `add_unsubscribe_sms_reply: false`
3. Added conditional `sender_id` parameter

**Before**:
```typescript
const requestBody = {
  message: {
    content: message,
    charset: 'unicode',
    to: [{ mobile_number: formattedPhone }],
    ...(referralNumber && { tags: [referralNumber] })
  }
};
```

**After**:
```typescript
const requestBody = {
  message: {
    content: message,
    charset: 'unicode',
    to: [{ mobile_number: formattedPhone }],
    add_unsubscribe_link: false,
    add_unsubscribe_sms_reply: false,
    ...(this.config.senderId && { sender_id: this.config.senderId }),
    ...(referralNumber && { tags: [referralNumber] })
  }
};
```

## 🚀 Next Steps

1. **I will deploy** these changes now
2. **You test** - send SMS and verify unsubscribe link is gone
3. **Configure Sender ID** - via dashboard or Inwise support
4. **Test again** - verify sender shows as "GesherYouth"

## 📞 If Sender ID Still Shows "SenderID"

This means it's account-level configuration. Ask Inwise support:

1. "How do I configure alphanumeric sender ID for my account?"
2. "Can you set 'GesherYouth' as our SMS sender ID?"
3. "What's the process for Israel-based sender IDs?"

## Expected Results After Fix

**Current SMS**:
```
From: SenderID
Message: גשר אל הנוער: נדרשת חתימתך על טופס...
[unsubscribe link]
```

**After Fix**:
```
From: GesherYouth
Message: גשר אל הנוער: נדרשת חתימתך על טופס...
(no unsubscribe link)
```

Much cleaner and more professional! 🎯
