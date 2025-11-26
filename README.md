# quotecord Website

Marketing website with premium subscription management for the quotecord Discord bot.

## Quick Start

**One command to install everything:**

```bash
./install.sh
```

That's it! The installer will:
- Check and install Node.js if needed
- Install all npm dependencies
- Guide you through environment setup
- Build the project
- Show next steps

### Install Options

```bash
# Interactive install (recommended for first time)
./install.sh

# Auto mode - uses template .env (edit later)
./install.sh --auto

# Skip build step
./install.sh --skip-build

# Install and start dev server
./install.sh --dev

# Install and start production server
./install.sh --start
```

## Manual Setup

If you prefer to set up manually:

```bash
# 1. Install dependencies
npm install

# 2. Copy environment template
cp .env.example .env.local

# 3. Edit .env.local with your credentials
nano .env.local

# 4. Build the project
npm run build

# 5. Start the server
npm run dev      # Development
npm run start    # Production
```

## Environment Variables

Create a `.env.local` file with these variables:

```env
# Supabase (https://supabase.com/dashboard/project/_/settings/api)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Stripe (https://dashboard.stripe.com/apikeys)
STRIPE_SECRET_KEY=sk_live_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
STRIPE_PREMIUM_MONTHLY_PRICE_ID=price_xxx
STRIPE_PREMIUM_ANNUAL_PRICE_ID=price_xxx

# App
NEXT_PUBLIC_URL=https://your-domain.com
```

## Database Setup

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Run the schema in SQL Editor:
   ```bash
   ./scripts/setup-database.sh
   ```
   Or manually copy `supabase/schema.sql` to the SQL Editor

3. Enable Discord OAuth:
   - Go to Authentication > Providers > Discord
   - Add your Discord app credentials
   - Set redirect URL in Discord Developer Portal:
     `https://YOUR-PROJECT.supabase.co/auth/v1/callback`

## Scripts

```bash
# Development
npm run dev          # Start dev server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run linter

# Helper scripts
./scripts/health-check.sh    # Validate installation
./scripts/fix-issues.sh      # Auto-fix common issues
./scripts/setup-database.sh  # Database setup guide
```

## Project Structure

```
├── src/
│   ├── app/                 # Next.js app router pages
│   │   ├── api/            # API routes
│   │   ├── dashboard/      # User dashboard
│   │   └── ...            # Public pages
│   ├── components/         # React components
│   ├── lib/               # Utilities
│   └── types/             # TypeScript types
├── supabase/
│   └── schema.sql         # Database schema
├── scripts/               # Helper scripts
├── install.sh            # Main installer
└── .env.example          # Environment template
```

## Features

### Free Tier
- Unlimited quote creation
- All 3 templates
- All 19 fonts
- Dark & Light themes
- PNG export

### Premium Tier ($1.99/mo or $14.99/yr)
- Preview mode
- Animated GIF export
- Avatar choice
- Multi-message quotes
- Saved presets
- No watermark

## Troubleshooting

### Common Issues

**Build fails with type errors**
```bash
./scripts/fix-issues.sh
# Select option 6 (All fixes)
```

**Dependencies not installing**
```bash
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

**Environment not configured**
```bash
./scripts/health-check.sh
# Check which variables are missing
```

### Health Check

Run the health check to diagnose issues:
```bash
./scripts/health-check.sh
```

### Logs

Installation logs are saved to `install.log`

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import in Vercel
3. Add environment variables
4. Deploy

### Docker

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY . .
RUN npm install --legacy-peer-deps
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### PM2

```bash
npm run build
pm2 start npm --name "quotecord" -- start
```

## API Endpoints

- `POST /api/create-checkout` - Create Stripe checkout session
- `POST /api/create-portal` - Create Stripe billing portal
- `POST /api/webhooks/stripe` - Handle Stripe webhooks
- `GET /api/subscription` - Get current user's subscription

## Bot Integration

Your Discord bot can check subscription status:

```javascript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function checkPremiumStatus(discordId) {
  const { data } = await supabase
    .from('subscriptions')
    .select('tier, status, current_period_end')
    .eq('discord_id', discordId)
    .single()

  return data?.tier === 'premium' &&
         data?.status === 'active' &&
         new Date(data.current_period_end) > new Date()
}
```

## License

MIT
