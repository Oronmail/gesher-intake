# Vercel Environment Variable Setup for Salesforce JWT

## Required Environment Variables

Add these to your Vercel project settings:

### 1. Salesforce JWT Configuration
```
SALESFORCE_CLIENT_ID=3MVG9TSugzPK9MvrF9wgE3WgvBliLBDVIxzHvtI94iTIJdYAo0KqqtLENATXdmV9PkeiEpah3Bdgp1JVr7lrI
SALESFORCE_USERNAME=oronmail@geh.com.partialsb
SALESFORCE_LOGIN_URL=https://test.salesforce.com
SALESFORCE_INSTANCE_URL=https://geh--partialsb.sandbox.my.salesforce.com
```

### 2. Private Key (CRITICAL)
The private key must be added as a single-line string with `\n` for line breaks:

```
SALESFORCE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQDDBDcSRQf+Uf4Q\njsoRthsKpieYE6lXNK/9+yERui9S8TKI2KPBXXmCpVRFuPrGkHiGxdFneKg1b7lz\ndwInMaLonPXEUV6oEqRcNhrV0Xb0uRFBssqNhKKa+ZNKcac1dSb25zt3U7qBsjS8\nqNA/EIDwQc3v/nQbyCwUQZvTlm4czqsFa+H1js7WFK6Bhr/iXFAh2yefb4Xoqn6r\npeypyV86l4PowZP6WaiXEwY/F/wCjq6AVuCDZX8Lkt3dueiDcAdMYWQE7Bw/mScH\nKeySoe4AMN+2j6GP9Qr0MwZToCehW/JWkkmO+fEudqRfKXxSrWKgvICaHasRye7r\ncgEklMHpAgMBAAECggEADRp15tTbliOFOjCV9D2zsHH8nBPKH5FrN9oNXUcQ0fZh\n6l8AFciFlxkrwemNdBUV/BxDlzu8taZ1pAP9kYucwht1ygSboxhpkcaS5AYIg6YB\nulPcl0ivslENrAVZ8lYWUaW00a4/DGLgd0Kyh2JA/6O0RilnPMyk5ZGI+l0Ttfyw\n6Zwmw9HNa+yQkybdisG7jC8/zE2xBp5h8xAF6WOUrvEY5DTTRCg7X0UDdHNt/7Uu\nLtnJEVwHgIEZxu5K8pTWyIm5CDv6b4uZ6xF8URMZ0mWc3kcmidfzfIcyFZQ+B3rm\nalSp04dNbIqYu1sCuZsGzEXf8LwIa361Zz+PvwM3DwKBgQDkLtbhu6uwmu+PcBmy\nK4r9VgeKruedREK1JSCKqd8izyRwmAIRpMMZis/urnd2BaYmA2HJsbFqjYiQI/Mk\nG7Ji1YCjZ4sqBXpi/n5+EAjxrIro7ulgycwqVYIg+NYwnM6jc8D6Zw2uLylM8b7l\npXwrb3JdcY5CoE9bDL4xyriQWwKBgQDayk/MObzotD4A4hP6hbTKTHagTvGUgIMT\n8TOO+P9OUvy4mzUIImZc2QWwFfBJz0LwuTALGK5rfYLU1LfczOi6kCMygT2PkdDH\nbMjiUA2y5tKCbYnG+vn4zjTMiznXLPXXjKCGOm58969mfMADnafJ6MjU1+19znWO\nB6HCWnkKCwKBgH1orNsFnRgEH1PTRZwhyFLx3FVBSbSqlosea6MqN6PW+u0S7lgq\nGLxKCXvh0XBBLI7J3w3OJncscHjf+TrIKiOdugSU3OxsdFZCDt1UDMZekT3ySLvU\nTOybcFiUyouPMxasgMxepSstamKKnuNyLytkJhPrXEeL+fFNsJ6HDybvAoGAL+Ln\n5EMe3a/Vgkv5I3PwRfbGX//nUCFwjwTTzA8jkfkH5z/RM56T2O6HGCs1FHKQrC9c\nHJGiW1R1Ni/4rhMLPQofKgaveqTnlT5yGVZ8KRPsLy/aX/q+i35WgA5Y8oecpzjY\nSYiwdhmgAkZ7oE75Um/oxO0dxdNSV2vEM82pgFECgYBCQtjcs+I24QwCbST7xja3\nj7fd59/0XLt9V/nu2b16jWNZS7J3/hVQvcU3WPnKLE/CRkpwJl8XVKD5qnoa4/Zu\nrzbRF1QXIgVIl2PtutVNQ0CZRYaR/ZBub70eJbETI85y9hKafEMIYVj5yVjixKtC\ntSBYNDk8b9PKqxN28Pq/Tw==\n-----END PRIVATE KEY-----
```

### 3. Supabase Configuration
```
NEXT_PUBLIC_SUPABASE_URL=https://fftnsfaakvahqyfwhtku.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_MfBSFVfIWbZlb9_jzGZtiA_NjjFWHsN
SUPABASE_SERVICE_KEY=sb_secret_NRd5IXZ8dWPaa6eriTwiNQ_6daaBaFS
```

### 4. Email Service
```
RESEND_API_KEY=re_CxNvBTmc_KqPVvVKJoyCo8L5tJPHpZToN
```

### 5. Application URL
```
NEXT_PUBLIC_APP_URL=https://gesher-intake.vercel.app
```

### 6. Optional Fallback (if JWT fails)
If JWT authentication doesn't work, you can temporarily use a direct access token:
```
SALESFORCE_ACCESS_TOKEN=your_access_token_here
```
Note: This token expires after ~2 hours and needs manual refresh. JWT is the recommended approach.

## How to Add to Vercel

1. Go to your Vercel project dashboard
2. Click on "Settings" tab
3. Click on "Environment Variables" in the left sidebar
4. Add each variable above
5. For the SALESFORCE_PRIVATE_KEY:
   - Copy the entire private key content
   - Replace all actual line breaks with `\n`
   - Paste as a single line
6. Save and redeploy

## Testing the Integration

After deployment, the JWT authentication should work automatically. Check the Vercel function logs to confirm:
- "JWT private key loaded from environment variable" message
- Successful Salesforce record creation

## Troubleshooting

If Salesforce integration isn't working:
1. Check Vercel function logs for errors
2. Verify all environment variables are set
3. Ensure the certificate is uploaded to Salesforce Connected App
4. Confirm the user is pre-authorized in Salesforce