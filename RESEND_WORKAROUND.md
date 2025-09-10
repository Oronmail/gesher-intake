# Resend Email Sending Workarounds Without Custom Domain

## Current Issue
Resend blocks emails to recipients other than `oronmail@gmail.com` when using the test domain `onboarding@resend.dev`.

## Solutions

### Option 1: Use a Free Subdomain Service (RECOMMENDED)
You can use a free subdomain from services like:

1. **Subdomain.is** - Free subdomains (e.g., `gesher.subdomain.is`)
2. **FreeDNS** - Free subdomain hosting
3. **Duck DNS** - Free dynamic DNS

Steps:
1. Register a free subdomain
2. Add it to Resend
3. Verify DNS records (they provide free DNS management)
4. Use `noreply@gesher.subdomain.is` as sender

### Option 2: Use Gmail SMTP Instead (FREE)
Replace Resend with Gmail's SMTP service:

```javascript
// Using nodemailer with Gmail
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'oronmail@gmail.com',
    pass: 'your-app-password' // Generate app password in Gmail settings
  }
});
```

Limits: 500 emails/day

### Option 3: Use Alternative Free Email Services

#### MailerSend (100 emails free without domain)
- Provides trial domain
- No verification needed for first 100 emails
- 12,000 emails/month free after domain verification

#### Brevo (formerly Sendinblue)
- 300 emails/day free
- No domain verification required initially
- Can use their domain

#### EmailJS
- 200 emails/month free
- No backend needed
- Works from frontend directly

### Option 4: Add Test Recipients to Resend
For development/testing, you can:
1. Add team members to your Resend account
2. They can receive test emails
3. Use for limited production testing

### Option 5: Use Free .tk/.ml Domain
Get a completely free domain from:
- Freenom.com (free .tk, .ml, .ga domains)
- Then verify it in Resend

## Quick Implementation Guide

### For Immediate Testing (Gmail SMTP):

1. Install nodemailer:
```bash
npm install nodemailer
```

2. Update email.ts to use Gmail:
```typescript
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD
  }
});

export async function sendConsentEmail({ parentEmail, ... }) {
  const mailOptions = {
    from: 'גשר אל הנוער <oronmail@gmail.com>',
    to: parentEmail,
    subject: 'טופס ויתור סודיות - גשר אל הנוער',
    html: emailHtml
  };
  
  try {
    const info = await transporter.sendMail(mailOptions);
    return { success: true, data: info };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
```

3. Generate Gmail App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification
   - App passwords → Generate

## Recommendation

**Short term**: Use Gmail SMTP (immediate, free, 500 emails/day)
**Long term**: Get a free subdomain or use Brevo for better deliverability

Would you like me to implement the Gmail SMTP solution now?