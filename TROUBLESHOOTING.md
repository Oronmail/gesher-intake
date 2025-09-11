# Troubleshooting Guide - Gesher Intake System

## Image-Based Consent System Issues

### Problem: Hebrew Text Shows as Gibberish in Generated Images
**Symptoms**: Hebrew characters appear as question marks or random symbols
**Solutions**:
1. Verify HTML meta charset is UTF-8:
   ```html
   <meta charset="UTF-8">
   ```
2. Set explicit font-family in CSS:
   ```css
   font-family: 'Arial', 'Helvetica Neue', sans-serif;
   ```
3. Check html2canvas is loaded properly:
   ```javascript
   console.log(typeof html2canvas); // Should output 'function'
   ```
4. Test with the standalone test file:
   ```bash
   open test-consent-image.html
   ```

### Problem: Digital Signatures Appear as Black Squares
**Symptoms**: Signature areas show solid black rectangles instead of actual signatures
**Solutions**:
1. Verify signature data is valid base64:
   ```javascript
   // Should start with this prefix
   data:image/png;base64,iVBORw0KGgoAAAANS...
   ```
2. Add CORS settings to html2canvas:
   ```javascript
   html2canvas(element, {
     useCORS: true,
     allowTaint: true
   })
   ```
3. Check signature pad is saving correctly:
   ```javascript
   const signatureData = signaturePad.toDataURL('image/png')
   console.log(signatureData.substring(0, 50)) // Check format
   ```

### Problem: Consent Image Too Large (413 Payload Too Large)
**Symptoms**: API returns 413 error when submitting consent
**Solutions**:
1. Use the compression function:
   ```javascript
   const compressed = await compressImage(imageBase64, 500) // 500KB max
   ```
2. Reduce canvas quality:
   ```javascript
   canvas.toDataURL('image/jpeg', 0.7) // 70% quality
   ```
3. Check image size before sending:
   ```javascript
   console.log('Image size:', Math.round(imageBase64.length / 1024), 'KB')
   ```

### Problem: Timestamp Badge Not Appearing
**Symptoms**: Top-left timestamp badge missing from generated image
**Solutions**:
1. Check container has relative positioning:
   ```css
   position: relative;
   ```
2. Verify badge HTML is included:
   ```javascript
   console.log(generateConsentHTML(data).includes('נחתם דיגיטלית'))
   ```
3. Increase wait time for rendering:
   ```javascript
   await new Promise(resolve => setTimeout(resolve, 1000))
   ```

### Problem: CSP Blocking Google Fonts
**Symptoms**: Console errors about Content Security Policy violations
**Solutions**:
1. Check middleware.ts includes font sources:
   ```typescript
   'font-src': "'self' data: https://fonts.gstatic.com"
   'style-src': "'self' 'unsafe-inline' https://fonts.googleapis.com"
   ```
2. Verify in browser dev tools Network tab that fonts are loading
3. Use fallback system fonts if external fonts fail

## Salesforce Integration Issues

### Problem: JWT Authentication Failing
**Symptoms**: "invalid_grant: invalid assertion" error
**Solutions**:
1. Test JWT authentication:
   ```bash
   node test-jwt.js
   ```
2. Verify certificate is uploaded to Connected App in Salesforce
3. Check username matches exactly (including sandbox suffix):
   ```
   oronmail@geh.com.partialsb  # Note the .partialsb suffix
   ```
4. Ensure user is pre-authorized for the Connected App
5. Regenerate certificate if expired:
   ```bash
   ./generate-jwt-cert.sh
   ```

### Problem: Consent Image Not Uploading to Salesforce
**Symptoms**: Record created but no attachment visible
**Solutions**:
1. Check Vercel logs for errors:
   ```bash
   vercel logs --yes
   ```
2. Verify ContentDocument API permissions in Salesforce
3. Test with smaller image:
   ```javascript
   // Reduce image size for testing
   const testImage = imageBase64.substring(0, 1000)
   ```
4. Check FirstPublishLocationId is set correctly

### Problem: Consent_HTML__c Field Not Storing Data
**Symptoms**: HTML field empty in Salesforce
**Solutions**:
1. Verify field exists and has correct API name:
   ```bash
   sf schema describe -s Registration_Request__c -o gesher-sandbox | grep Consent_HTML
   ```
2. Check field length limit (32768 characters for Long Text Area)
3. Ensure HTML is properly escaped for storage

## Email/SMS Issues

### Problem: Emails Not Being Sent
**Symptoms**: No consent email received by parents
**Solutions**:
1. Check Gmail SMTP credentials:
   ```bash
   # Test email sending
   node test-email.js parent@example.com
   ```
2. Verify app password is correct (16 characters, no spaces)
3. Check spam/junk folders
4. Review Vercel environment variables:
   ```bash
   vercel env ls
   ```

### Problem: SMS Not Delivered (Inwise)
**Symptoms**: SMS notifications not reaching parents
**Solutions**:
1. Test SMS directly:
   ```bash
   node test-sms.js 0501234567
   ```
2. Verify phone number format (Israeli format: 05XXXXXXXX)
3. Check Inwise API credentials
4. Review API response for error messages

## Database Issues

### Problem: Supabase Connection Failing
**Symptoms**: "Failed to fetch" errors in console
**Solutions**:
1. Test database connection:
   ```bash
   node supabase-query.js
   ```
2. Verify environment variables are set
3. Check Row Level Security (RLS) policies
4. Use mock database for local testing:
   ```javascript
   // System auto-detects and uses mock if Supabase not configured
   ```

### Problem: Data Not Persisting Between Forms
**Symptoms**: Parent consent not found, student form link invalid
**Solutions**:
1. Check referral number format matches
2. Verify status updates are saving:
   ```sql
   SELECT * FROM referrals WHERE referral_number = 'REF-202511-001';
   ```
3. Ensure cookies are enabled for session tracking

## Deployment Issues

### Problem: Vercel Build Failing
**Symptoms**: Deployment fails with TypeScript errors
**Solutions**:
1. Run build locally first:
   ```bash
   npm run build
   ```
2. Fix any TypeScript errors
3. Check for missing dependencies:
   ```bash
   npm install
   ```
4. Verify all imports are correct

### Problem: Production Site Not Updating
**Symptoms**: Changes not visible after deployment
**Solutions**:
1. Clear browser cache
2. Check deployment status:
   ```bash
   vercel list --yes
   ```
3. Force redeploy:
   ```bash
   vercel --prod --force
   ```
4. Check correct branch is deployed

## Performance Issues

### Problem: Image Generation Taking Too Long
**Symptoms**: Browser freezes, timeout errors
**Solutions**:
1. Reduce image quality/size
2. Show loading spinner during generation
3. Use web worker for processing (advanced)
4. Pre-generate template HTML

### Problem: Form Submission Slow
**Symptoms**: Long wait after clicking submit
**Solutions**:
1. Add loading states to buttons
2. Optimize image compression settings
3. Check API response times in Network tab
4. Consider async processing for non-critical tasks

## Browser Compatibility

### Problem: Features Not Working in Safari
**Symptoms**: Signature pad, image generation failing
**Solutions**:
1. Test in latest Safari version
2. Add Safari-specific CSS fixes
3. Use polyfills for missing features
4. Provide fallback options

### Problem: Mobile Layout Issues
**Symptoms**: Forms cut off, buttons not clickable
**Solutions**:
1. Test on actual devices (not just browser dev tools)
2. Check viewport meta tag:
   ```html
   <meta name="viewport" content="width=device-width, initial-scale=1">
   ```
3. Use responsive Tailwind classes
4. Test signature pad on touch devices

## Quick Diagnostic Commands

```bash
# Check all connections
./verify-connections.sh

# Test JWT auth
node test-jwt.js

# Query database
node supabase-query.js

# Check production status
curl -I https://gesher-intake.vercel.app

# View recent Salesforce records
sf data query --query "SELECT Id, Name, CreatedDate FROM Registration_Request__c ORDER BY CreatedDate DESC LIMIT 5" -o gesher-sandbox

# Check Vercel logs
vercel logs --yes --since 1h

# Test image generation
open test-consent-image.html

# Run full workflow test
node test-workflow.js
```

## Getting Help

If issues persist after trying these solutions:

1. Check browser console for detailed error messages
2. Review Vercel function logs
3. Test with mock data to isolate the issue
4. Check CLAUDE.md for detailed implementation notes
5. Review recent commits for changes that might have introduced issues

## Prevention Tips

1. Always test locally before deploying
2. Keep backups of working configurations
3. Document any environment variable changes
4. Test the complete workflow after updates
5. Monitor Vercel logs for production issues
6. Use the test files for quick verification
7. Keep credentials secure and rotate regularly