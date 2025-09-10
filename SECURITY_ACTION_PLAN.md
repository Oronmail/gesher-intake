# 🔒 Security Action Plan - Gesher Intake System
## Generated: January 10, 2025

---

## 📊 Executive Summary

**Current Security Status**: MODERATE (6/10)  
**Target Security Status**: HIGH (8/10)  
**Critical Issues Found**: 5  
**Estimated Time to Fix**: 2-4 hours  

---

## 🚨 CRITICAL - Fix Immediately (Priority 1)

### 1. Delete Sensitive Backup Files
**Risk Level**: HIGH  
**Time Required**: 2 minutes  

These files contain old credentials and must be deleted:

```bash
# Delete environment backup files
rm -f .env.local.backup

# Delete old certificate files
rm -f certs/server.key.old
rm -f certs/server.crt.old
rm -f certs/server.csr.old

# Verify deletion
ls -la .env.local.backup 2>/dev/null || echo "✅ Env backup deleted"
ls -la certs/*.old 2>/dev/null || echo "✅ Certificate backups deleted"
```

### 2. Deploy Database Security (RLS Policies)
**Risk Level**: HIGH  
**Time Required**: 15 minutes  

The RLS policies exist but are NOT deployed. Your database is currently vulnerable.

**Steps:**
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project: `fftnsfaakvahqyfwhtku`
3. Navigate to SQL Editor
4. Copy the ENTIRE contents of `supabase-secure-rls.sql`
5. Paste and execute in SQL editor
6. Verify policies are active:
   ```sql
   SELECT tablename, policyname, permissive, roles, cmd 
   FROM pg_policies 
   WHERE tablename = 'referrals';
   ```

### 3. Enable Database Encryption
**Risk Level**: MEDIUM-HIGH  
**Time Required**: 10 minutes  

**Steps:**
1. In Supabase Dashboard → Database → Extensions
2. Enable `pgcrypto` extension
3. Run this SQL to verify:
   ```sql
   SELECT * FROM pg_extension WHERE extname = 'pgcrypto';
   ```
4. Update encryption functions in database:
   ```sql
   -- Replace placeholder functions with real encryption
   CREATE OR REPLACE FUNCTION encrypt_sensitive_field(
     p_data TEXT,
     p_key TEXT DEFAULT 'use-your-encryption-key-from-env'
   ) RETURNS TEXT AS $$
   BEGIN
     RETURN encode(encrypt(p_data::bytea, p_key::bytea, 'aes'), 'base64');
   END;
   $$ LANGUAGE plpgsql;
   ```

---

## ⚠️ IMPORTANT - Fix This Week (Priority 2)

### 4. Implement CSRF Protection
**Risk Level**: MEDIUM  
**Time Required**: 30 minutes  

The CSRF functions exist but aren't implemented in forms.

**Implementation Steps:**

1. **Update CounselorInitialForm.tsx:**
   ```typescript
   import { generateCSRFToken } from '@/lib/security'
   
   // In component:
   const [csrfToken] = useState(() => generateCSRFToken())
   
   // Add to form submission:
   const formData = {
     ...data,
     csrf_token: csrfToken
   }
   ```

2. **Update API routes to validate:**
   ```typescript
   // In /api/referrals/initiate/route.ts
   import { verifyCSRFToken } from '@/lib/security'
   
   // Validate token
   const sessionToken = request.cookies.get('csrf_token')?.value
   if (!verifyCSRFToken(body.csrf_token, sessionToken)) {
     return NextResponse.json({ error: 'Invalid CSRF token' }, { status: 403 })
   }
   ```

3. **Repeat for all forms:**
   - ParentConsentForm
   - StudentDataForm

### 5. Update Environment Variables in Vercel
**Risk Level**: MEDIUM  
**Time Required**: 15 minutes  

**Steps:**
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select `gesher-intake` project
3. Settings → Environment Variables
4. Update ALL variables from `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL
   NEXT_PUBLIC_SUPABASE_ANON_KEY
   SUPABASE_SERVICE_KEY
   RESEND_API_KEY
   SALESFORCE_PRIVATE_KEY
   JWT_SECRET
   ENCRYPTION_KEY
   API_SECRET_KEY
   ```
5. Redeploy to apply changes

### 6. Set Up Monitoring
**Risk Level**: MEDIUM  
**Time Required**: 20 minutes  

**Supabase Monitoring:**
1. Dashboard → Settings → Monitoring
2. Enable email alerts for:
   - Failed authentication attempts
   - Rate limit violations
   - Database errors
   - Unusual query patterns

**Vercel Monitoring:**
1. Analytics → Web Vitals
2. Set up alerts for:
   - Error rates > 1%
   - Response time > 3s
   - Failed deployments

---

## 📋 RECOMMENDED - Implement This Month (Priority 3)

### 7. Implement Redis Rate Limiting
**Risk Level**: LOW-MEDIUM  
**Current Issue**: Rate limiting resets on server restart  

**Options:**
1. **Upstash Redis** (Recommended for Vercel):
   ```bash
   npm install @upstash/redis @upstash/ratelimit
   ```
   - Sign up at [upstash.com](https://upstash.com)
   - Create Redis database
   - Update middleware.ts with Upstash rate limiter

2. **Vercel KV** (Alternative):
   ```bash
   npm install @vercel/kv
   ```
   - Enable in Vercel dashboard
   - Update rate limiting implementation

### 8. Add Security Testing
**Risk Level**: LOW  

**Add to package.json:**
```json
{
  "scripts": {
    "security:check": "npm audit && npm run security:headers && npm run security:secrets",
    "security:headers": "curl -I https://gesher-intake.vercel.app | grep -E 'X-Frame|Strict-Transport|X-Content'",
    "security:secrets": "git ls-files | xargs grep -E 'api[_-]?key|password|secret|token' || echo 'No secrets found'"
  }
}
```

**Run before each deployment:**
```bash
npm run security:check
```

### 9. Create API Key Rotation Schedule
**Risk Level**: LOW  

**Monthly Rotation Schedule:**
- Week 1: Rotate Resend API key
- Week 2: Rotate Supabase service key
- Week 3: Rotate API_SECRET_KEY
- Week 4: Security audit

**Document in ROTATION_SCHEDULE.md**

---

## 🛡️ Security Checklist

Before marking complete, verify:

### Immediate Actions
- [ ] All backup files deleted (.env.local.backup, *.old files)
- [ ] RLS policies deployed to Supabase
- [ ] pgcrypto extension enabled
- [ ] Vercel environment variables updated

### This Week
- [ ] CSRF tokens implemented in all forms
- [ ] Monitoring alerts configured
- [ ] Security headers verified
- [ ] API key rotation schedule documented

### This Month
- [ ] Redis rate limiting implemented
- [ ] Security testing added to CI/CD
- [ ] Penetration testing scheduled
- [ ] Incident response plan created

---

## 🔍 Verification Commands

Run these after implementing fixes:

```bash
# 1. Verify no backup files
find . -name "*.backup" -o -name "*.old" 2>/dev/null

# 2. Check security headers
curl -I https://gesher-intake.vercel.app | grep -E "X-Frame|Strict|Content-Security"

# 3. Test rate limiting
for i in {1..101}; do curl -X POST https://gesher-intake.vercel.app/api/referrals/initiate; done

# 4. Verify no exposed secrets
git grep -E "(api[_-]?key|password|secret|token).*=.*['\"][A-Za-z0-9]" --cached

# 5. Check npm vulnerabilities
npm audit

# 6. Verify certificate permissions
ls -la certs/ | grep -E "^-rw-------.*\.key$"
```

---

## 📞 Emergency Contacts

If security breach suspected:

1. **Immediate Actions:**
   - Rotate ALL credentials immediately
   - Check Supabase audit logs
   - Review Vercel access logs
   - Document incident

2. **Contact Support:**
   - Supabase: support@supabase.io
   - Vercel: support@vercel.com
   - Salesforce Security: security@salesforce.com

3. **Notify:**
   - Data Protection Officer
   - Development team
   - Affected users (if data compromised)

---

## 📈 Progress Tracking

| Task | Priority | Status | Completed Date |
|------|----------|--------|----------------|
| Delete backup files | P1 | ⏳ Pending | |
| Deploy RLS policies | P1 | ⏳ Pending | |
| Enable pgcrypto | P1 | ⏳ Pending | |
| Implement CSRF | P2 | ⏳ Pending | |
| Update Vercel env | P2 | ⏳ Pending | |
| Set up monitoring | P2 | ⏳ Pending | |
| Redis rate limiting | P3 | ⏳ Pending | |
| Security testing | P3 | ⏳ Pending | |
| API key rotation | P3 | ⏳ Pending | |

---

## 💡 Additional Recommendations

1. **Regular Security Audits**: Schedule quarterly security reviews
2. **Dependency Updates**: Run `npm update` monthly
3. **Backup Strategy**: Implement automated database backups
4. **Access Control**: Review and limit production access
5. **Security Training**: Team training on OWASP Top 10

---

## ✅ Success Criteria

The security implementation is complete when:
- All P1 issues resolved
- No npm audit vulnerabilities
- RLS policies active and tested
- Monitoring alerts configured
- CSRF protection implemented
- All sensitive data encrypted
- Security documentation updated

---

**Generated by**: Security Audit System  
**Date**: January 10, 2025  
**Next Review**: February 10, 2025  
**Estimated Time to Complete All**: 4-6 hours  

---

## Notes Section
_Use this space to track issues encountered during implementation:_

- 
- 
- 

---

**Remember**: Security is an ongoing process, not a one-time fix. Regular reviews and updates are essential.