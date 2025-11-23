#!/bin/bash

#############################################
# DisQuote Database Setup Helper
# Helps set up Supabase database
#############################################

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$SCRIPT_DIR"

echo -e "${BLUE}═══════════════════════════════════════════${NC}"
echo -e "${BLUE}       Supabase Database Setup             ${NC}"
echo -e "${BLUE}═══════════════════════════════════════════${NC}"
echo ""

# Check if schema exists
if [ ! -f "supabase/schema.sql" ]; then
    echo -e "${RED}Error: supabase/schema.sql not found${NC}"
    exit 1
fi

echo -e "${CYAN}Follow these steps to set up your database:${NC}"
echo ""
echo "1. Open your Supabase Dashboard:"
echo "   https://supabase.com/dashboard"
echo ""
echo "2. Select your project (or create a new one)"
echo ""
echo "3. Go to SQL Editor (left sidebar)"
echo ""
echo "4. Click 'New query'"
echo ""
echo "5. Copy the SQL below and paste it in the editor:"
echo ""
echo -e "${YELLOW}─────────────────────────────────────────────${NC}"

# Show schema with line numbers
cat -n supabase/schema.sql

echo -e "${YELLOW}─────────────────────────────────────────────${NC}"
echo ""
echo "6. Click 'Run' to execute the schema"
echo ""
echo "7. You should see 'Success' for each statement"
echo ""

# Copy to clipboard if possible
if command -v pbcopy &> /dev/null; then
    cat supabase/schema.sql | pbcopy
    echo -e "${GREEN}✓ Schema copied to clipboard (macOS)${NC}"
elif command -v xclip &> /dev/null; then
    cat supabase/schema.sql | xclip -selection clipboard
    echo -e "${GREEN}✓ Schema copied to clipboard (Linux)${NC}"
else
    echo "Tip: You can copy the schema file directly:"
    echo "  cat supabase/schema.sql"
fi

echo ""
echo -e "${CYAN}Discord OAuth Setup:${NC}"
echo ""
echo "1. In Supabase, go to Authentication > Providers"
echo ""
echo "2. Find Discord and click to enable"
echo ""
echo "3. Go to Discord Developer Portal:"
echo "   https://discord.com/developers/applications"
echo ""
echo "4. Create or select your application"
echo ""
echo "5. Go to OAuth2 > General"
echo ""
echo "6. Add Redirect URL:"
echo "   https://YOUR-PROJECT-ID.supabase.co/auth/v1/callback"
echo ""
echo "7. Copy Client ID and Client Secret to Supabase"
echo ""
echo -e "${GREEN}Done! Your database should now be ready.${NC}"
