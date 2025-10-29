#!/bin/bash

# Supabase Wake-Up Script
#
# Purpose: Manually wake up Supabase if it has paused due to inactivity
#
# Usage:
#   ./wake-supabase.sh
#
# This script:
# 1. Checks the health endpoint
# 2. Triggers the keep-alive endpoint
# 3. Shows the status of all services

echo "================================================"
echo "🔄 Waking Up Supabase Database"
echo "================================================"
echo ""

PRODUCTION_URL="https://gesher-intake.vercel.app"

echo "1️⃣ Checking system health..."
echo ""

HEALTH_RESPONSE=$(curl -s "${PRODUCTION_URL}/api/health")

if [ $? -eq 0 ]; then
    echo "✅ Health check successful"
    echo "$HEALTH_RESPONSE" | jq '.' 2>/dev/null || echo "$HEALTH_RESPONSE"
else
    echo "❌ Health check failed"
fi

echo ""
echo "================================================"
echo "2️⃣ Triggering keep-alive endpoint..."
echo ""

KEEPALIVE_RESPONSE=$(curl -s "${PRODUCTION_URL}/api/cron/keep-alive")

if [ $? -eq 0 ]; then
    echo "✅ Keep-alive triggered"
    echo "$KEEPALIVE_RESPONSE" | jq '.' 2>/dev/null || echo "$KEEPALIVE_RESPONSE"
else
    echo "❌ Keep-alive failed"
fi

echo ""
echo "================================================"
echo "3️⃣ Verifying Supabase is now active..."
echo ""

sleep 2

VERIFY_RESPONSE=$(curl -s "${PRODUCTION_URL}/api/health")

if echo "$VERIFY_RESPONSE" | grep -q '"status":"healthy"'; then
    echo "✅ Supabase is ACTIVE and HEALTHY!"
elif echo "$VERIFY_RESPONSE" | grep -q '"status":"unhealthy"'; then
    echo "⚠️  Supabase is still PAUSED"
    echo ""
    echo "Next steps:"
    echo "1. Go to https://supabase.com/dashboard"
    echo "2. Find your project: fftnsfaakvahqyfwhtku"
    echo "3. Click 'Resume' if it shows as paused"
    echo "4. Wait 2-3 minutes for it to wake up"
    echo "5. Run this script again"
else
    echo "❓ Unable to determine Supabase status"
    echo "$VERIFY_RESPONSE" | jq '.' 2>/dev/null || echo "$VERIFY_RESPONSE"
fi

echo ""
echo "================================================"
echo "Done!"
echo "================================================"
