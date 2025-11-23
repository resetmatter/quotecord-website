#!/bin/bash

#############################################
# DisQuote Health Check Script
# Validates installation and configuration
#############################################

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$SCRIPT_DIR"

echo -e "${BLUE}═══════════════════════════════════════════${NC}"
echo -e "${BLUE}       DisQuote Health Check               ${NC}"
echo -e "${BLUE}═══════════════════════════════════════════${NC}"
echo ""

errors=0
warnings=0

check() {
    local name="$1"
    local status="$2"
    local message="$3"

    if [ "$status" = "ok" ]; then
        echo -e "${GREEN}✓${NC} $name"
    elif [ "$status" = "warn" ]; then
        echo -e "${YELLOW}⚠${NC} $name - $message"
        ((warnings++))
    else
        echo -e "${RED}✗${NC} $name - $message"
        ((errors++))
    fi
}

# Check Node.js
if command -v node &> /dev/null; then
    node_version=$(node -v | sed 's/v//')
    major=$(echo $node_version | cut -d. -f1)
    if [ "$major" -ge 18 ]; then
        check "Node.js" "ok"
    else
        check "Node.js" "warn" "v$node_version found, v18+ recommended"
    fi
else
    check "Node.js" "fail" "Not installed"
fi

# Check npm
if command -v npm &> /dev/null; then
    check "npm" "ok"
else
    check "npm" "fail" "Not installed"
fi

# Check node_modules
if [ -d "node_modules" ]; then
    check "Dependencies" "ok"
else
    check "Dependencies" "fail" "Run: npm install"
fi

# Check .env.local
if [ -f ".env.local" ]; then
    source .env.local

    # Check Supabase
    if [ -n "$NEXT_PUBLIC_SUPABASE_URL" ] && [[ ! "$NEXT_PUBLIC_SUPABASE_URL" == *"your-project"* ]]; then
        check "Supabase URL" "ok"
    else
        check "Supabase URL" "warn" "Not configured in .env.local"
    fi

    if [ -n "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ] && [[ ! "$NEXT_PUBLIC_SUPABASE_ANON_KEY" == *"your-anon-key"* ]]; then
        check "Supabase Anon Key" "ok"
    else
        check "Supabase Anon Key" "warn" "Not configured in .env.local"
    fi

    # Check Stripe
    if [ -n "$STRIPE_SECRET_KEY" ] && [[ ! "$STRIPE_SECRET_KEY" == *"xxx"* ]]; then
        check "Stripe Secret Key" "ok"
    else
        check "Stripe Secret Key" "warn" "Not configured in .env.local"
    fi

    if [ -n "$STRIPE_WEBHOOK_SECRET" ] && [[ ! "$STRIPE_WEBHOOK_SECRET" == *"xxx"* ]]; then
        check "Stripe Webhook Secret" "ok"
    else
        check "Stripe Webhook Secret" "warn" "Not configured in .env.local"
    fi
else
    check ".env.local" "fail" "File not found - Run: ./install.sh"
fi

# Check build
if [ -d ".next" ]; then
    check "Build" "ok"
else
    check "Build" "warn" "Not built yet - Run: npm run build"
fi

# Check schema file
if [ -f "supabase/schema.sql" ]; then
    check "Database Schema" "ok"
else
    check "Database Schema" "fail" "supabase/schema.sql not found"
fi

echo ""
echo -e "${BLUE}═══════════════════════════════════════════${NC}"

if [ $errors -gt 0 ]; then
    echo -e "${RED}Health check failed with $errors error(s)${NC}"
    exit 1
elif [ $warnings -gt 0 ]; then
    echo -e "${YELLOW}Health check passed with $warnings warning(s)${NC}"
    exit 0
else
    echo -e "${GREEN}All checks passed!${NC}"
    exit 0
fi
