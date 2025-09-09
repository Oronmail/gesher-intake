#!/bin/bash

# Gesher Intake System - Connection Verification Script
# This script verifies all service connections are active

echo "================================================"
echo "🔍 Gesher Intake - Service Connection Verifier"
echo "================================================"
echo ""

# Color codes for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Track overall status
ALL_GOOD=true

# 1. Check Salesforce CLI
echo "1️⃣  Checking Salesforce CLI..."
if sf org list 2>/dev/null | grep -q "gesher-sandbox.*Connected"; then
    echo -e "   ${GREEN}✅ Salesforce: Connected (gesher-sandbox)${NC}"
    sf org list | grep gesher-sandbox | head -1
else
    echo -e "   ${RED}❌ Salesforce: Not connected${NC}"
    echo "   Run: sf auth:web:login -a gesher-sandbox"
    ALL_GOOD=false
fi
echo ""

# 2. Check Vercel CLI
echo "2️⃣  Checking Vercel CLI..."
VERCEL_USER=$(vercel whoami 2>/dev/null)
if [ $? -eq 0 ]; then
    echo -e "   ${GREEN}✅ Vercel: Logged in as $VERCEL_USER${NC}"
else
    echo -e "   ${RED}❌ Vercel: Not logged in${NC}"
    echo "   Run: vercel login"
    ALL_GOOD=false
fi
echo ""

# 3. Check GitHub
echo "3️⃣  Checking GitHub Repository..."
if git remote -v 2>/dev/null | grep -q "Oronmail/gesher-intake"; then
    echo -e "   ${GREEN}✅ GitHub: Repository connected${NC}"
    BRANCH=$(git branch --show-current 2>/dev/null)
    echo "   Current branch: $BRANCH"
    
    # Check if there are uncommitted changes
    if [ -n "$(git status --porcelain 2>/dev/null)" ]; then
        echo -e "   ${YELLOW}⚠️  Uncommitted changes detected${NC}"
    fi
else
    echo -e "   ${RED}❌ GitHub: Repository not found${NC}"
    ALL_GOOD=false
fi
echo ""

# 4. Check Supabase Connection
echo "4️⃣  Checking Supabase Database..."
if [ -f ".env.local" ] && grep -q "SUPABASE_SERVICE_KEY" .env.local; then
    # Try to query the database
    DB_CHECK=$(node -e "
        require('dotenv').config({ path: '.env.local' });
        const { createClient } = require('@supabase/supabase-js');
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.SUPABASE_SERVICE_KEY
        );
        supabase.from('referrals').select('count', { count: 'exact', head: true })
            .then(({count}) => console.log(count !== null ? 'OK' : 'FAIL'))
            .catch(() => console.log('FAIL'));
    " 2>/dev/null)
    
    if [ "$DB_CHECK" = "OK" ]; then
        echo -e "   ${GREEN}✅ Supabase: Connected${NC}"
        # Show record count
        node supabase-query.js 2>/dev/null | grep "Total Records" | head -1
    else
        echo -e "   ${RED}❌ Supabase: Connection failed${NC}"
        echo "   Check .env.local credentials"
        ALL_GOOD=false
    fi
else
    echo -e "   ${RED}❌ Supabase: Missing .env.local${NC}"
    ALL_GOOD=false
fi
echo ""

# 5. Check Production Site
echo "5️⃣  Checking Production Site..."
PROD_CHECK=$(curl -s -o /dev/null -w "%{http_code}" https://gesher-intake.vercel.app)
if [ "$PROD_CHECK" = "200" ]; then
    echo -e "   ${GREEN}✅ Production: Online${NC}"
    echo "   URL: https://gesher-intake.vercel.app"
else
    echo -e "   ${RED}❌ Production: Not accessible (HTTP $PROD_CHECK)${NC}"
    ALL_GOOD=false
fi
echo ""

# 6. Check Salesforce JWT Authentication
echo "6️⃣  Checking Salesforce JWT Authentication..."
JWT_CHECK=$(node test-jwt.js 2>/dev/null | grep -c "JWT Bearer Authentication is working")
if [ "$JWT_CHECK" -gt 0 ]; then
    echo -e "   ${GREEN}✅ Salesforce JWT: Working${NC}"
else
    echo -e "   ${YELLOW}⚠️  Salesforce JWT: Not tested${NC}"
    echo "   Run: node test-jwt.js"
fi
echo ""

# 7. Check Node Dependencies
echo "7️⃣  Checking Node Dependencies..."
if [ -d "node_modules" ] && [ -f "package-lock.json" ]; then
    echo -e "   ${GREEN}✅ Dependencies: Installed${NC}"
    NODE_VERSION=$(node -v 2>/dev/null)
    NPM_VERSION=$(npm -v 2>/dev/null)
    echo "   Node: $NODE_VERSION, npm: $NPM_VERSION"
else
    echo -e "   ${RED}❌ Dependencies: Not installed${NC}"
    echo "   Run: npm install"
    ALL_GOOD=false
fi
echo ""

# Summary
echo "================================================"
if [ "$ALL_GOOD" = true ]; then
    echo -e "${GREEN}✅ All services are connected and operational!${NC}"
    echo ""
    echo "Quick Commands:"
    echo "  📝 Start dev server:     npm run dev"
    echo "  🚀 Deploy to production: vercel --prod"
    echo "  📊 Query database:       node supabase-query.js"
    echo "  🧪 Test Salesforce:      node test-jwt.js"
else
    echo -e "${YELLOW}⚠️  Some services need attention. See above for details.${NC}"
fi
echo "================================================"