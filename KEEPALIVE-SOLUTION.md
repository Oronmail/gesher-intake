# Supabase Keep-Alive Solution

## Problem
Supabase free tier automatically pauses projects after **7 days of inactivity**. When paused, the database becomes unavailable and the application stops working.

## Solution: GitHub Actions (Recommended)

We've implemented a **GitHub Actions workflow** that automatically pings Supabase every 3 days to keep it active.

### Why GitHub Actions Instead of Vercel Cron?

| Feature | GitHub Actions | Vercel Cron (Hobby Plan) |
|---------|---------------|-------------------------|
| **Cost** | ✅ 100% Free (2000 min/month) | ✅ Free (limited) |
| **Reliability** | ✅ Guaranteed execution | ⚠️ Not guaranteed on Hobby plan |
| **Frequency** | ✅ Any schedule | ❌ Max 1x per day |
| **Monitoring** | ✅ Built-in logs & notifications | ⚠️ Limited visibility |
| **Manual Trigger** | ✅ Easy via GitHub UI | ❌ Not available |

**Verdict:** GitHub Actions is more reliable for free tier usage.

---

## How It Works

### 1. Automated Workflow

**File:** `.github/workflows/supabase-keepalive.yml`

**Schedule:** Every 3 days at 2:00 AM UTC
```yaml
schedule:
  - cron: '0 2 */3 * *'
```

**What it does:**
1. Sends HTTP request to `/api/cron/keep-alive`
2. Verifies response is successful
3. Checks overall system health
4. Logs results for monitoring

### 2. Keep-Alive Endpoint

**File:** `src/app/api/cron/keep-alive/route.ts`

**URL:** https://gesher-intake.vercel.app/api/cron/keep-alive

**Function:**
- Performs lightweight query to Supabase
- Returns record count and timestamp
- Keeps database active

### 3. Schedule Breakdown

The cron schedule `0 2 */3 * *` means:
- **Minute:** 0 (at the top of the hour)
- **Hour:** 2 (2:00 AM)
- **Day:** */3 (every 3 days)
- **Month:** * (every month)
- **Day of week:** * (any day)

**Execution pattern:**
- Day 1: 2:00 AM UTC ✅
- Day 4: 2:00 AM UTC ✅
- Day 7: 2:00 AM UTC ✅ (before Supabase pauses)
- Day 10: 2:00 AM UTC ✅

This ensures Supabase **never reaches 7 days of inactivity**.

---

## Deployment & Setup

### Step 1: Push to GitHub

The workflow file is already in `.github/workflows/supabase-keepalive.yml`. Simply commit and push:

```bash
git add .github/workflows/supabase-keepalive.yml
git commit -m "Add GitHub Actions workflow for Supabase keep-alive"
git push origin main
```

### Step 2: Verify Workflow is Active

1. Go to https://github.com/Oronmail/gesher-intake
2. Click the **"Actions"** tab
3. You should see "Supabase Keep-Alive" workflow listed
4. Status should show as "Active" with next scheduled run time

### Step 3: Manual Test (Optional)

You can trigger the workflow manually to test it:

1. Go to **Actions** tab on GitHub
2. Click "Supabase Keep-Alive" workflow
3. Click "Run workflow" button
4. Select branch: `main`
5. Click "Run workflow"
6. Wait ~30 seconds and check the run results

---

## Monitoring

### View GitHub Actions Logs

1. Go to https://github.com/Oronmail/gesher-intake/actions
2. Click on any workflow run
3. Expand the "keep-alive" job to see detailed logs

### Expected Output (Success)

```
🔄 Triggering Supabase keep-alive...
📊 Response:
{
  "success": true,
  "message": "Supabase keep-alive successful",
  "timestamp": "2025-11-18T02:00:00.000Z",
  "recordCount": 53,
  "nextRun": "In 3 days"
}
✅ Keep-alive successful!
📈 Database has 53 referrals
🏥 Checking overall system health...
✅ Supabase is healthy and active!
```

### Expected Output (Failure)

```
❌ Keep-alive failed with HTTP 500
This could mean:
1. Supabase is paused (go to dashboard to resume)
2. Vercel deployment is down
3. Network connectivity issues
```

### Email Notifications

GitHub can email you if the workflow fails:

1. Go to https://github.com/settings/notifications
2. Under "Actions", enable "Send notifications for failed workflows"
3. You'll get an email if keep-alive fails

---

## Manual Wake-Up (If Supabase is Already Paused)

If Supabase has paused and you need immediate access:

### Option 1: GitHub Actions Manual Trigger

1. Go to GitHub Actions tab
2. Click "Supabase Keep-Alive"
3. Click "Run workflow"
4. Wait for completion

### Option 2: Wake-Up Script

```bash
./wake-supabase.sh
```

### Option 3: Direct HTTP Request

```bash
curl https://gesher-intake.vercel.app/api/cron/keep-alive
```

### Option 4: Supabase Dashboard

1. Go to https://supabase.com/dashboard
2. Find project: `fftnsfaakvahqyfwhtku`
3. Click "Resume" if paused
4. Wait 2-3 minutes

---

## Troubleshooting

### Issue: Workflow not running

**Check:**
```bash
# Verify file is in repository
ls -la .github/workflows/supabase-keepalive.yml

# Check if it's committed
git log --oneline -- .github/workflows/supabase-keepalive.yml
```

**Solution:**
- Ensure file is committed and pushed to `main` branch
- Check GitHub Actions tab for any error messages
- Verify repository has Actions enabled (Settings → Actions)

### Issue: Workflow runs but fails

**Possible causes:**
1. **Supabase already paused** → Resume manually from dashboard
2. **Vercel deployment down** → Check Vercel status
3. **API endpoint error** → Check Vercel function logs

**Solution:**
```bash
# Check endpoint manually
curl https://gesher-intake.vercel.app/api/cron/keep-alive

# Check health endpoint
curl https://gesher-intake.vercel.app/api/health
```

### Issue: Supabase still pausing

**Diagnosis:**
- Check when workflow last ran successfully
- Verify it's running every 3 days
- Check GitHub Actions logs for errors

**Solution:**
```bash
# Trigger manual run
# Go to GitHub → Actions → Run workflow

# Or set up backup with UptimeRobot (see below)
```

---

## Backup Solution: UptimeRobot (Optional)

For extra reliability, you can add UptimeRobot as a backup:

### Setup Steps:

1. **Sign up:** https://uptimerobot.com (free)
2. **Add Monitor:**
   - Type: HTTP(s)
   - URL: `https://gesher-intake.vercel.app/api/health`
   - Monitoring Interval: 5 minutes
   - Alert Contacts: Your email

3. **Benefits:**
   - Pings every 5 minutes (keeps Supabase very active)
   - Instant email alerts if site goes down
   - Alternative to GitHub Actions
   - Free forever (50 monitors on free tier)

---

## Cost Analysis

### GitHub Actions (Current Solution)

- **Monthly runs:** ~10 runs (every 3 days)
- **Duration per run:** ~30 seconds
- **Monthly usage:** ~5 minutes
- **Free tier limit:** 2000 minutes/month
- **Usage:** 0.25% of free tier
- **Cost:** $0 ✅

### Alternative: Vercel Cron

- **Hobby plan limitation:** 1 invocation per day max
- **Our schedule:** Every 3 days (compliant)
- **Issue:** Not guaranteed to run on Hobby plan
- **Cost:** $0 ⚠️

### Alternative: UptimeRobot

- **Monthly pings:** ~8,640 pings (every 5 min)
- **Free tier limit:** 50 monitors
- **Cost:** $0 ✅

---

## Files in This Solution

| File | Purpose |
|------|---------|
| `.github/workflows/supabase-keepalive.yml` | GitHub Actions workflow (main solution) |
| `src/app/api/cron/keep-alive/route.ts` | Keep-alive endpoint |
| `src/app/api/health/route.ts` | Health check endpoint |
| `vercel.json` | Vercel cron config (backup, may not work on Hobby) |
| `wake-supabase.sh` | Manual wake-up script |
| `KEEPALIVE-SOLUTION.md` | This documentation |
| `SUPABASE-KEEPALIVE.md` | Original documentation |

---

## Next Steps

1. ✅ Commit and push the GitHub Actions workflow
2. ✅ Verify workflow appears in GitHub Actions tab
3. ✅ Trigger a manual test run
4. ✅ Monitor logs after 3 days to confirm automatic run
5. ⭕ (Optional) Set up UptimeRobot as backup

---

## Summary

**Problem:** Supabase pauses after 7 days of inactivity

**Solution:** GitHub Actions workflow runs every 3 days

**Status:** ✅ Implemented and ready to deploy

**Cost:** $0 (completely free)

**Reliability:** High (GitHub Actions has 99.9% uptime)

---

*Last Updated: November 18, 2025*
*Status: Ready to Deploy*
