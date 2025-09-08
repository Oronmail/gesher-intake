# Gesher Al HaNoar - Digital Intake System

A privacy-compliant digital intake system for Gesher Al HaNoar (גשר אל הנוער), a non-profit organization providing free tutoring and family support to at-risk youth in Israel.

## 🎯 Overview

This system digitizes the student referral process, replacing paper forms with a secure, efficient digital workflow that ensures parental consent before any student data is collected.

## 🚀 Features

- **Privacy-First Design**: No student data collected before parental consent
- **Digital Signatures**: Secure electronic signature capture for parents
- **Hebrew Interface**: Full RTL support with Hebrew UI
- **Mobile Responsive**: Works on all devices
- **Multi-Step Forms**: Comprehensive data collection with validation
- **Mock Database**: Built-in testing mode for development

## 🔄 Workflow

1. **Counselor Initiation**: School counselor enters parent contact info
2. **Parent Consent**: Parents digitally sign privacy waiver
3. **Data Collection**: Counselor fills comprehensive student form
4. **Processing**: Data sent to organization's Salesforce CRM

## 🛠️ Technology Stack

- **Framework**: Next.js 15.5 with TypeScript
- **Styling**: Tailwind CSS
- **Forms**: React Hook Form + Zod validation
- **Signatures**: React Signature Canvas
- **Database**: Supabase (optional) or built-in mock
- **Deployment**: Vercel

## 📦 Installation

```bash
# Clone the repository
git clone [repository-url]

# Install dependencies
npm install

# Set up environment variables (optional)
cp .env.local.example .env.local

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 🔧 Configuration

The system works out-of-the-box with a mock database for testing. For production:

### Environment Variables

Create a `.env.local` file:

```env
# Optional - Supabase (for persistent storage)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# Optional - Salesforce (for CRM integration)
SALESFORCE_USERNAME=your_username
SALESFORCE_PASSWORD=your_password
SALESFORCE_SECURITY_TOKEN=your_token

# Application URL
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
```

## 🧪 Testing

The application includes a mock database for local testing. No external services required!

1. Start the development server
2. Fill out the counselor form
3. Check console for parent consent URL
4. Complete parent signature
5. Check console for student form URL
6. Fill student data form

## 📝 Forms

### Counselor Initial Form
- Counselor details
- School information
- Parent contact (phone/email)

### Parent Consent Form
- Student name
- Parent details and ID
- Digital signatures (up to 2 parents)
- Privacy waiver agreement

### Student Data Form (7 Steps)
1. Personal Information
2. Family Background
3. School Details
4. Intake Assessment
5. Learning Evaluation
6. Risk Assessment
7. Final Recommendation

## 🚀 Deployment

### Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/gesher-intake)

1. Click the deploy button above
2. Connect your GitHub account
3. Configure environment variables (optional)
4. Deploy!

## 📱 Mobile Support

All forms are fully responsive and optimized for mobile devices, enabling field workers to collect data on-site.

## 🔒 Privacy & Security

- No student data collected without consent
- Signatures stored securely
- Data encrypted in transit
- Temporary storage auto-expires
- GDPR/Privacy compliant workflow

## 🤝 Contributing

This is a pro bono project. Contributions are welcome to help improve the system for the organization.

## 📄 License

MIT License - Free to use and modify

## 🙏 Acknowledgments

Developed pro bono for Gesher Al HaNoar (גשר אל הנוער) to support their mission of helping at-risk youth in Israel.

---

**For technical documentation and development details, see [CLAUDE.md](./CLAUDE.md)**
