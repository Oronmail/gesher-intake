# Gesher Intake System - Quick Context Summary
## For Claude Sessions - Compact Reference

---

## 🎯 Project Overview
**Digital intake system for Israeli non-profit** (גשר אל הנוער) helping at-risk youth.
- **Live**: https://gesher-intake.vercel.app
- **GitHub**: Oronmail/gesher-intake (private)
- **Status**: ✅ Production Ready & Operational

## 🏗️ Tech Stack
- **Frontend**: Next.js 15.5 + TypeScript + Tailwind
- **Database**: Supabase (fftnsfaakvahqyfwhtku)
- **Email**: Resend (working)
- **SMS**: ActiveTrail (API auth issue - email fallback active)
- **CRM**: Salesforce (JWT auth working)
- **Hosting**: Vercel

## 🔄 Three-Step Workflow
1. **Counselor** → Enters parent contact only
2. **Parent** → Digital consent signature
3. **Student Form** → 7-step comprehensive data

## 🔧 Key Commands
```bash
# Session start
./verify-connections.sh

# Deploy
vercel --prod --yes

# Database query
node supabase-query.js

# Test Salesforce
node test-jwt.js

# Test SMS
node test-sms.js
```

## 📁 Important Files
- `CLAUDE.md` - Full documentation
- `src/lib/sms.ts` - SMS service
- `src/lib/salesforce-jwt.ts` - SF integration
- `src/components/*Form.tsx` - Form components
- `.env.local` - Environment variables

## 🚨 Current Issues
- **SMS**: ActiveTrail API key authentication failing (401)
  - Email notifications working as fallback
  - See `ACTIVETRAIL-TROUBLESHOOTING.md`

## ✅ Recent Updates (Jan 2025)
- SMS integration (pending API fix)
- Fixed student form success message
- Security hardening complete
- Salesforce JWT working
- Production deployed

## 🔐 Access Control
**All CLIs authenticated:**
- ✅ Salesforce (gesher-sandbox)
- ✅ Vercel (oronmail)
- ✅ GitHub (Oronmail/gesher-intake)
- ✅ Supabase (via API)

## 🎯 Quick Actions
```bash
# Check everything
./verify-connections.sh

# Deploy changes
git add . && git commit -m "msg" && git push
vercel --prod --yes

# Query database
node supabase-query.js

# View logs
vercel logs --yes
```

## 📝 Hebrew UI
- Full RTL support
- All forms in Hebrew
- SMS/Email templates in Hebrew

---
*Use CLAUDE.md for detailed information*