# ⚠️ SECURITY NOTICE: NEVER COMMIT ACTUAL VALUES TO GIT
# This is a TEMPLATE file. Copy to .env.local and fill with actual values
# Store actual credentials in Vercel Dashboard or secure password manager

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY_HERE
SUPABASE_SERVICE_KEY=YOUR_SERVICE_KEY_HERE

# Email Service (Gmail)
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=YOUR_APP_SPECIFIC_PASSWORD

# SMS Service (Inwise) - Optional
INWISE_API_KEY=YOUR_INWISE_API_KEY
INWISE_BASE_URL=https://webapi.mymarketing.co.il
INWISE_SENDER_ID=GesherYouth

# Salesforce JWT Authentication
SALESFORCE_INSTANCE_URL=https://YOUR_INSTANCE.salesforce.com
SALESFORCE_LOGIN_URL=https://test.salesforce.com
SALESFORCE_CLIENT_ID=YOUR_CONNECTED_APP_CLIENT_ID
SALESFORCE_USERNAME=your-integration-user@domain.com
SALESFORCE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----

# Application Configuration
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
NODE_ENV=production

# Security Keys (Generate new random values)
API_SECRET_KEY=GENERATE_32_CHAR_RANDOM_STRING
JWT_SECRET=GENERATE_32_CHAR_RANDOM_STRING
ENCRYPTION_KEY=GENERATE_32_CHAR_RANDOM_STRING

# Rate Limiting
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW_MS=60000

# ⚠️ IMPORTANT SECURITY STEPS:
# 1. Copy this file to .env.local
# 2. Fill in actual values
# 3. NEVER commit .env.local to git
# 4. Add all values to Vercel Dashboard
# 5. Delete .env.local from local machine after deployment
# 6. Store credentials in password manager