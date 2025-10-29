# Supabase Keep-Alive System

## Problem

Supabase free tier **automatically pauses projects after 7 days of inactivity** to save resources. When paused:
- ❌ The database becomes unavailable
- ❌ API requests fail with connection errors
- ❌ Your application stops working

## Solution

We've implemented an **automated keep-alive system** using Vercel Cron Jobs that:
- ✅ Runs every 3 days automatically
- ✅ Sends a simple query to Supabase
- ✅ Keeps your free tier database active
- ✅ Requires zero manual intervention

---

## How It Works

### 1. Automated Cron Job

**File:** [src/app/api/cron/keep-alive/route.ts](src/app/api/cron/keep-alive/route.ts)

**Schedule:** Every 3 days at 2:00 AM UTC
```
0 2 */3 * *
```

**What it does:**
- Sends a lightweight query to count referrals
- Logs the result
- Keeps Supabase active

### 2. Vercel Cron Configuration

**File:** [vercel.json](vercel.json)

```json
{
  "crons": [
    {
      "path": "/api/cron/keep-alive",
      "schedule": "0 2 */3 * *"
    }
  ]
}
```

Vercel automatically triggers this endpoint every 3 days.

### 3. Health Check Endpoint

**File:** [src/app/api/health/route.ts](src/app/api/health/route.ts)

**URL:** https://gesher-intake.vercel.app/api/health

**What it does:**
- Checks Supabase connection status
- Checks Email service configuration
- Checks SMS service configuration
- Checks Salesforce configuration
- Returns overall system health

---

## Manual Wake-Up (If Supabase is Already Paused)

If Supabase has already paused and you need to wake it up immediately:

### Option 1: Use the Wake-Up Script

```bash
cd gesher-intake
./wake-supabase.sh
```

This script will:
1. Check system health
2. Trigger the keep-alive endpoint
3. Verify Supabase is active

### Option 2: Manual HTTP Requests

```bash
# Check health
curl https://gesher-intake.vercel.app/api/health

# Trigger keep-alive
curl https://gesher-intake.vercel.app/api/cron/keep-alive

# Check health again
curl https://gesher-intake.vercel.app/api/health
```

### Option 3: Supabase Dashboard

If the API endpoints don't wake it up:

1. Go to https://supabase.com/dashboard
2. Find your project: `fftnsfaakvahqyfwhtku`
3. If it shows "Paused", click **Resume**
4. Wait 2-3 minutes for it to fully wake up
5. Run the wake-up script or try the health endpoint again

---

## Monitoring

### View Cron Job Logs

Check if the keep-alive cron is running:

```bash
# View recent logs
vercel logs | grep "KEEP-ALIVE"

# Watch in real-time
vercel logs --follow | grep "KEEP-ALIVE"
```

### Expected Log Output (Success)

```
[KEEP-ALIVE] Supabase keep-alive cron job triggered
[KEEP-ALIVE] ✅ Supabase connection successful
[KEEP-ALIVE] Database active - 45 referrals in database
```

### Expected Log Output (Failure)

```
[KEEP-ALIVE] Supabase keep-alive cron job triggered
[KEEP-ALIVE] ❌ Supabase query failed: Connection timeout
```

If you see failures, it means Supabase is paused and needs manual intervention.

---

## Cron Job Schedule Explained

**Schedule:** `0 2 */3 * *`

Breaking it down:
- `0` - At minute 0
- `2` - At 2:00 AM
- `*/3` - Every 3 days
- `*` - Every month
- `*` - Every day of week

**When it runs:**
- Day 1: 2:00 AM UTC
- Day 4: 2:00 AM UTC
- Day 7: 2:00 AM UTC (before Supabase pauses at day 7)
- Day 10: 2:00 AM UTC
- And so on...

This ensures Supabase **never reaches 7 days of inactivity**.

---

## Testing the Keep-Alive System

### 1. Test Locally (Simulated)

```bash
cd gesher-intake

# Start dev server
npm run dev

# In another terminal, trigger keep-alive
curl http://localhost:3000/api/cron/keep-alive
```

### 2. Test in Production

```bash
# Trigger the keep-alive endpoint manually
curl https://gesher-intake.vercel.app/api/cron/keep-alive

# Expected response:
{
  "success": true,
  "message": "Supabase keep-alive successful",
  "timestamp": "2025-10-29T13:15:00.000Z",
  "recordCount": 45,
  "nextRun": "In 3 days"
}
```

### 3. Verify in Vercel Dashboard

1. Go to https://vercel.com/oronmails-projects/gesher-intake
2. Click "Cron Jobs" in the sidebar
3. You should see:
   - `/api/cron/keep-alive`
   - Schedule: `0 2 */3 * *`
   - Status: Active
   - Last Run: [timestamp]
   - Next Run: [timestamp]

---

## Security

### Cron Secret (Optional)

For added security, you can require authentication for cron jobs:

1. **Add environment variable:**
   ```bash
   vercel env add CRON_SECRET
   # Enter a random secret like: abc123xyz789
   ```

2. **The cron endpoint already checks this:**
   ```typescript
   const authHeader = request.headers.get('authorization');
   const cronSecret = process.env.CRON_SECRET;

   if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
   }
   ```

3. **Vercel automatically adds the header** when calling cron jobs

---

## Troubleshooting

### Issue: Supabase still paused after cron runs

**Possible causes:**
1. Cron job failed to execute
2. Supabase was already paused before cron ran
3. Vercel cron jobs not enabled for your project

**Solution:**
```bash
# Check cron logs
vercel logs | grep KEEP-ALIVE

# Manually wake up Supabase
./wake-supabase.sh

# Verify cron is configured
cat vercel.json
```

### Issue: "fetch failed" errors

**Cause:** Supabase is paused or unreachable

**Solution:**
1. Go to Supabase dashboard
2. Resume the project manually
3. Wait 2-3 minutes
4. Run `./wake-supabase.sh`

### Issue: Cron job not showing in Vercel

**Cause:** `vercel.json` not deployed or misconfigured

**Solution:**
```bash
# Verify vercel.json exists
cat vercel.json

# Redeploy
git add vercel.json
git commit -m "Configure keep-alive cron"
git push origin main

# Check Vercel dashboard after deployment
```

---

## Cost

**Vercel Cron Jobs:**
- ✅ FREE on all Vercel plans
- ✅ Unlimited cron jobs
- ✅ No additional charges

**Supabase Free Tier:**
- ✅ Stays active with this system
- ✅ No need to upgrade to paid plan
- ✅ 500MB database storage
- ✅ Unlimited API requests

**Total cost:** $0 🎉

---

## Alternative: Uptime Monitoring Services

As an alternative or backup, you can use free uptime monitoring services:

### Option 1: UptimeRobot (Recommended)

1. Sign up at https://uptimerobot.com (free)
2. Add monitor:
   - **Type:** HTTP(s)
   - **URL:** `https://gesher-intake.vercel.app/api/health`
   - **Interval:** Every 5 minutes (free tier)
3. UptimeRobot will ping your health endpoint every 5 minutes
4. This keeps both Vercel AND Supabase active

### Option 2: Cron-Job.org

1. Sign up at https://cron-job.org
2. Create job:
   - **URL:** `https://gesher-intake.vercel.app/api/cron/keep-alive`
   - **Schedule:** Every 3 days
3. Free tier allows this

---

## Files Created

| File | Purpose |
|------|---------|
| [src/app/api/cron/keep-alive/route.ts](src/app/api/cron/keep-alive/route.ts) | Cron job endpoint |
| [src/app/api/health/route.ts](src/app/api/health/route.ts) | Health check endpoint |
| [vercel.json](vercel.json) | Cron schedule configuration |
| [wake-supabase.sh](wake-supabase.sh) | Manual wake-up script |
| [SUPABASE-KEEPALIVE.md](SUPABASE-KEEPALIVE.md) | This documentation |

---

## Next Steps After Deployment

1. ✅ Deploy the changes (done automatically on git push)
2. ✅ Verify cron job appears in Vercel dashboard
3. ✅ Test the keep-alive endpoint manually
4. ✅ Check logs after 3 days to confirm cron ran
5. ✅ (Optional) Set up UptimeRobot as backup

---

**Last Updated:** October 29, 2025
**Status:** ✅ Implemented and Ready to Deploy
