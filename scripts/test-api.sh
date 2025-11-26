#!/bin/bash

# API Endpoint Test Script for quotecord
# Usage: ./scripts/test-api.sh <base_url> <bot_api_key> [discord_id]
#
# Examples:
#   ./scripts/test-api.sh http://localhost:3000 my-secret-key
#   ./scripts/test-api.sh https://your-app.railway.app my-secret-key 123456789

BASE_URL="${1:-http://localhost:3000}"
BOT_API_KEY="${2:-}"
DISCORD_ID="${3:-123456789012345678}"

if [ -z "$BOT_API_KEY" ]; then
  echo "Usage: $0 <base_url> <bot_api_key> [discord_id]"
  echo ""
  echo "Example:"
  echo "  $0 http://localhost:3000 your-bot-api-key"
  exit 1
fi

echo "=========================================="
echo "Testing quotecord API Endpoints"
echo "=========================================="
echo "Base URL: $BASE_URL"
echo "Discord ID: $DISCORD_ID"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

test_endpoint() {
  local method=$1
  local endpoint=$2
  local data=$3
  local description=$4

  echo -n "Testing: $description... "

  if [ "$method" = "GET" ]; then
    response=$(curl -s -w "\n%{http_code}" -X GET \
      -H "Authorization: Bearer $BOT_API_KEY" \
      -H "Content-Type: application/json" \
      "$BASE_URL$endpoint")
  else
    response=$(curl -s -w "\n%{http_code}" -X POST \
      -H "Authorization: Bearer $BOT_API_KEY" \
      -H "Content-Type: application/json" \
      -d "$data" \
      "$BASE_URL$endpoint")
  fi

  http_code=$(echo "$response" | tail -n1)
  body=$(echo "$response" | sed '$d')

  if [ "$http_code" = "200" ] || [ "$http_code" = "201" ]; then
    echo -e "${GREEN}✓ PASS${NC} (HTTP $http_code)"
    echo "  Response: $(echo "$body" | head -c 200)"
  elif [ "$http_code" = "401" ]; then
    echo -e "${YELLOW}⚠ AUTH FAILED${NC} (HTTP $http_code)"
    echo "  Check your BOT_API_KEY"
  elif [ "$http_code" = "404" ]; then
    echo -e "${RED}✗ NOT FOUND${NC} (HTTP $http_code)"
    echo "  Endpoint may not be deployed"
  else
    echo -e "${YELLOW}⚠ WARNING${NC} (HTTP $http_code)"
    echo "  Response: $(echo "$body" | head -c 200)"
  fi
  echo ""
}

echo "--- Bot API Endpoints ---"
echo ""

# Test 1: Get user premium status
test_endpoint "GET" "/api/bot/users/$DISCORD_ID" "" "GET /api/bot/users/[discordId]"

# Test 2: Check feature access
test_endpoint "POST" "/api/bot/users/$DISCORD_ID" '{"feature":"animatedGifs"}' "POST /api/bot/users/[discordId] (feature check)"

# Test 3: Get quote stats
test_endpoint "GET" "/api/bot/quotes?discordId=$DISCORD_ID" "" "GET /api/bot/quotes (stats)"

echo "--- Summary ---"
echo ""
echo "If you see 404 errors:"
echo "  1. Make sure you've merged the PR to main"
echo "  2. Wait for Railway to finish deploying"
echo "  3. Check Railway logs for build errors"
echo ""
echo "If you see 401 errors:"
echo "  1. Verify BOT_API_KEY matches your .env"
echo "  2. Check the key is set in Railway environment variables"
echo ""
echo "To test POST /api/bot/quotes (upload), you'll need to send"
echo "base64 image data - use the Discord bot for that test."
echo ""
