# Gesher Al HaNoar - Digital Intake System

A web-based student referral system for Gesher Al HaNoar non-profit organization, integrating with Salesforce CRM.

## Features

- 🔒 Privacy-first workflow (no data before consent)
- ✍️ Digital parent consent with signature
- 📱 Mobile-responsive design
- 🌐 Hebrew/English support
- 📊 Salesforce integration
- 🔄 Automated workflow notifications

## Setup Instructions

### 1. Clone the repository
```bash
git clone [repository-url]
cd gesher-intake
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
Copy `.env.local.example` to `.env.local` and fill in your credentials:
```bash
cp .env.local.example .env.local
```

Required environment variables:
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_KEY` - Supabase service key
- `SALESFORCE_USERNAME` - Salesforce username
- `SALESFORCE_PASSWORD` - Salesforce password
- `SALESFORCE_SECURITY_TOKEN` - Salesforce security token

### 4. Set up Supabase
1. Create a free account at [supabase.com](https://supabase.com)
2. Create a new project
3. Run the SQL schema from `supabase-schema.sql` in the SQL editor
4. Copy your project URL and anon key to `.env.local`

### 5. Configure Salesforce (Coming Soon)
1. Create a Connected App in Salesforce
2. Enable OAuth settings
3. Add your credentials to `.env.local`

### 6. Run development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Current Implementation Status

✅ **Completed:**
- Project setup with Next.js and TypeScript
- Supabase configuration for workflow tracking
- Counselor initial form (parent contact only)
- Parent consent form with digital signature
- Basic API endpoints structure

🚧 **In Progress:**
- Student data form (comprehensive intake)
- Salesforce integration
- Hebrew language support
- Deployment configuration

## Workflow

1. **School Counselor** initiates referral with parent contact info
2. **Parent** receives consent form link via email/SMS
3. **Parent** signs digital consent
4. **School Counselor** receives notification and fills student data
5. **Data** is sent to Salesforce Contact record
6. **House Manager** sees new referral in Salesforce dashboard

## Project Structure

```
src/
├── app/              # Next.js app router pages
│   ├── api/         # API endpoints
│   └── consent/     # Consent form pages
├── components/       # React components
├── lib/             # Utility libraries (Supabase, Salesforce)
├── types/           # TypeScript type definitions
└── utils/           # Helper functions
```

## Testing the Current Implementation

1. Start the dev server: `npm run dev`
2. Navigate to http://localhost:3000
3. Fill out the counselor form with test data
4. Check console for the consent URL
5. Visit the consent URL to test the parent signature flow

## Next Steps

1. Complete the student data form with all fields from the original Word document
2. Implement Salesforce API integration using JSforce
3. Add Hebrew translations and RTL support
4. Set up email/SMS notifications
5. Deploy to Vercel

## Support

For issues or questions, contact the development team.