# Security Cleanup — gesher-intake

Private keys for Salesforce JWT auth are committed to git. This was flagged in a Jan 2026 audit.

## When ready, do the following:

1. **Set certs as Vercel environment variables** (or use Vercel secrets):
   - Production private key (`certs/production/server.key`)
   - Sandbox private key (`certs/sandbox/server.key`)
   - Update your app code to read from env vars instead of file paths

2. **Remove private keys from git tracking:**
   ```bash
   git rm --cached certs/production/server.key certs/sandbox/server.key
   git commit -m "Remove private keys from tracking"
   git push
   ```

3. **Rotate Salesforce JWT certificates** (both production and sandbox):
   - Generate new key pairs
   - Upload new certs to Salesforce Connected App
   - Update Vercel env vars with new keys
