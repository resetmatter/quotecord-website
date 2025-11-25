#!/bin/bash

#############################################
# quotecord Auto-Fix Script
# Automatically fixes common issues
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
echo -e "${BLUE}       quotecord Auto-Fix                  ${NC}"
echo -e "${BLUE}═══════════════════════════════════════════${NC}"
echo ""

fix_count=0

# Fix 1: Clear node_modules and reinstall
fix_dependencies() {
    echo -e "${YELLOW}Fixing dependencies...${NC}"

    rm -rf node_modules package-lock.json
    npm install --legacy-peer-deps

    echo -e "${GREEN}✓ Dependencies reinstalled${NC}"
    ((fix_count++))
}

# Fix 2: Clear Next.js cache
fix_cache() {
    echo -e "${YELLOW}Clearing caches...${NC}"

    rm -rf .next
    rm -rf node_modules/.cache

    echo -e "${GREEN}✓ Caches cleared${NC}"
    ((fix_count++))
}

# Fix 3: Create .env.local from example
fix_env() {
    if [ ! -f ".env.local" ] && [ -f ".env.example" ]; then
        echo -e "${YELLOW}Creating .env.local...${NC}"
        cp .env.example .env.local
        echo -e "${GREEN}✓ Created .env.local from template${NC}"
        ((fix_count++))
    fi
}

# Fix 4: Fix permissions
fix_permissions() {
    echo -e "${YELLOW}Fixing permissions...${NC}"

    chmod +x install.sh
    chmod +x scripts/*.sh 2>/dev/null || true

    echo -e "${GREEN}✓ Permissions fixed${NC}"
    ((fix_count++))
}

# Fix 5: Rebuild project
fix_build() {
    echo -e "${YELLOW}Rebuilding project...${NC}"

    npm run build

    echo -e "${GREEN}✓ Project rebuilt${NC}"
    ((fix_count++))
}

# Main
echo "Select fixes to apply:"
echo "1. Reinstall dependencies"
echo "2. Clear caches"
echo "3. Create .env.local"
echo "4. Fix permissions"
echo "5. Rebuild project"
echo "6. All of the above"
echo ""

read -p "Enter choice (1-6): " choice

case $choice in
    1) fix_dependencies ;;
    2) fix_cache ;;
    3) fix_env ;;
    4) fix_permissions ;;
    5) fix_build ;;
    6)
        fix_permissions
        fix_env
        fix_dependencies
        fix_cache
        fix_build
        ;;
    *)
        echo -e "${RED}Invalid choice${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}Applied $fix_count fix(es)${NC}"
echo ""
echo "Run ./scripts/health-check.sh to verify"
