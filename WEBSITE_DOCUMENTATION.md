# quotecord Website Documentation

> Complete documentation for building the quotecord marketing website with premium subscription integration using Supabase and Discord OAuth.

---

## Table of Contents 

1. [Bot Overview](#bot-overview)
2. [Feature Breakdown: Free vs Premium](#feature-breakdown-free-vs-premium)
3. [Premium Tier Structure](#premium-tier-structure)
4. [Technical Integration Requirements](#technical-integration-requirements)
5. [Supabase Setup](#supabase-setup)
6. [Database Schema](#database-schema)
7. [Authentication Flow](#authentication-flow)
8. [Subscription Management](#subscription-management)
9. [Bot Integration](#bot-integration)
10. [Stripe Payment Integration](#stripe-payment-integration)
11. [UI/UX Recommendations](#uiux-recommendations)
12. [Marketing Copy](#marketing-copy)
13. [Implementation Checklist](#implementation-checklist)

---

## Bot Overview

### What is quotecord?

quotecord is a Discord bot that transforms messages into beautiful, shareable quote images. Users can right-click any message and instantly generate stunning quote graphics with customizable templates, fonts, and themes.

### Core Value Propositions

- **Instant Quote Generation** - Right-click any message to create a quote
- **Beautiful Templates** - Professional designs for any use case
- **Rich Customization** - Fonts, themes, colors, and orientations
- **Animated Support** - Automatic GIF generation for animated avatars
- **Works Everywhere** - Servers, DMs, and group chats

### Current Statistics (from database)

- Templates: 3 (Classic, Discord Screenshot, Profile Background)
- Fonts: 19 (across 7 categories)
- Themes: 2 (Dark, Light)
- Installation modes: Guild Install + User Install

---

## Feature Breakdown: Free vs Premium

### FREE TIER

| Feature | Description |
|---------|-------------|
| **Unlimited Quote Creation** | Create quotes from any message with no daily limits |
| **All 3 Templates** | Classic, Discord Screenshot, Profile Background |
| **All 19 Fonts** | Full font library across all categories |
| **Both Themes** | Dark and Light modes |
| **Both Orientations** | Portrait and Landscape layouts |
| **Static PNG Export** | High-quality PNG images |
| **Default Avatar** | Uses global Discord avatar (no choice) |
| **Single Message Quotes** | One message per quote |
| **Ads** | Small promotional content shown |

### PREMIUM TIER ($1.99/month or $19.99/year)

| Feature | Description |
|---------|-------------|
| **Everything in Free** | All free features included |
| **Preview Quotes** | Preview your quote before generating |
| **Animated GIF Export** | Auto-generates GIFs for animated avatars |
| **Avatar Choice** | Choose between default and server avatar |
| **Multi-Message Quotes** | Combine multiple messages into one quote (up to 5) |
| **Save Presets** | Save favorite configurations (up to 10) |
| **No Ads** | Ad-free experience |

---

## Premium Tier Structure

### Pricing Model

```
FREE TIER
├── Price: $0
├── Target: Casual users, trial
└── Goal: Conversion to Premium

PREMIUM TIER
├── Monthly: $1.99/month
├── Annual: $19.99/year (2 months free)
├── Target: Power users, content creators
└── Goal: Individual monetization
```

### Feature Gating Logic

```javascript
// Pseudo-code for feature gating
const TIER_FEATURES = {
  free: {
    templates: 'all', // All 3 templates
    fonts: 'all', // All 19 fonts
    themes: ['dark', 'light'],
    orientations: ['portrait', 'landscape'],
    maxMessages: 1,
    preview: false,
    animatedGifs: false,
    avatarChoice: false, // Default avatar only
    showAds: true,
    presets: 0
  },
  premium: {
    templates: 'all',
    fonts: 'all',
    themes: ['dark', 'light'],
    orientations: ['portrait', 'landscape'],
    maxMessages: 5,
    preview: true,
    animatedGifs: true,
    avatarChoice: true, // Can choose default or server avatar
    showAds: false,
    presets: 10
  }
};
```

---

## Technical Integration Requirements

### Architecture Overview

```
┌─────────────────┐                        ┌─────────────────┐
│  Marketing      │                        │  Discord Bot    │
│  Website        │◄──────────────────────►│  (Existing)     │
│  (Next.js)      │                        │  (Discord.js)   │
└────────┬────────┘                        └────────┬────────┘
         │                                          │
         └──────────────────┬───────────────────────┘
                            │
                     ┌──────▼──────┐
                     │  Supabase   │
                     │  (Auth + DB)│
                     └─────────────┘
```

### Why Supabase + Discord OAuth?

- **Simplified Architecture**: No separate API server needed - both website and bot query Supabase directly
- **Built-in Discord OAuth**: Native provider support with automatic user management
- **Discord ID as Key**: The user's Discord ID links their website account to their Discord identity
- **Automatic Subscription Tracking**: Bot checks subscription by Discord ID - no tokens needed
- **Row Level Security**: Secure data access without custom auth middleware
- **Real-time Updates**: Subscription changes reflect immediately

### Required Services

1. **Marketing Website** (New Repository)
   - Framework: Next.js 14+ with App Router
   - Styling: Tailwind CSS
   - Auth: Supabase Auth with Discord OAuth
   - Database: Supabase (PostgreSQL)
   - Payments: Stripe

2. **Bot Updates** (This Repository)
   - Add Supabase client to check subscriptions
   - Query by Discord ID directly
   - Implement feature gating

### Environment Variables (Website)

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Stripe
STRIPE_SECRET_KEY=sk_live_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
STRIPE_PREMIUM_MONTHLY_PRICE_ID=price_xxx
STRIPE_PREMIUM_ANNUAL_PRICE_ID=price_xxx

# App
NEXT_PUBLIC_URL=https://quotecord.app
```

### Environment Variables (Bot)

```env
# Supabase (for subscription checks)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

---

## Supabase Setup

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Note your project URL and API keys

### 2. Enable Discord OAuth Provider

1. Go to **Authentication** → **Providers** → **Discord**
2. Toggle to enable Discord
3. You'll need to add your Discord app credentials here

### 3. Create Discord Application

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application (or use existing quotecord app)
3. Go to **OAuth2** → **General**
4. Add redirect URL: `https://<your-project>.supabase.co/auth/v1/callback`
5. Copy **Client ID** and **Client Secret** to Supabase Discord provider settings

### 4. Configure OAuth Scopes

Required scopes:
- `identify` - Get user's Discord ID, username, avatar
- `email` - Get user's email (for Stripe receipts)

---

## Database Schema

### Tables

#### `profiles` - User profiles linked to Discord

```sql
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  discord_id TEXT UNIQUE NOT NULL,
  discord_username TEXT,
  discord_avatar TEXT,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);
```

#### `subscriptions` - Subscription status by Discord ID

```sql
CREATE TABLE subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  discord_id TEXT UNIQUE NOT NULL,

  -- Subscription status
  tier TEXT NOT NULL DEFAULT 'free', -- 'free', 'premium'
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'cancelled', 'past_due'

  -- Stripe integration
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,

  -- Billing period
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can view their own subscription
CREATE POLICY "Users can view own subscription" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- Service role can manage all subscriptions (for webhooks)
CREATE POLICY "Service role can manage subscriptions" ON subscriptions
  FOR ALL USING (auth.role() = 'service_role');
```

#### `presets` - Saved user presets (Premium feature)

```sql
CREATE TABLE presets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,

  -- Settings
  template TEXT NOT NULL,
  font TEXT NOT NULL,
  theme TEXT NOT NULL,
  orientation TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(user_id, name)
);

-- Enable RLS
ALTER TABLE presets ENABLE ROW LEVEL SECURITY;

-- Users can manage their own presets
CREATE POLICY "Users can manage own presets" ON presets
  FOR ALL USING (auth.uid() = user_id);
```

#### `quotes` - Usage tracking

```sql
CREATE TABLE quotes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  discord_id TEXT NOT NULL,
  guild_id TEXT,

  -- Quote details
  template TEXT NOT NULL,
  font TEXT NOT NULL,
  theme TEXT NOT NULL,
  orientation TEXT,
  animated BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;

-- Users can view their own quotes
CREATE POLICY "Users can view own quotes" ON quotes
  FOR SELECT USING (auth.uid() = user_id);

-- Service role can insert (for bot usage tracking)
CREATE POLICY "Service role can insert quotes" ON quotes
  FOR INSERT WITH CHECK (auth.role() = 'service_role');
```

### Database Functions

#### Auto-create profile and subscription on signup

```sql
-- Function to handle new user signup from Discord OAuth
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Create profile from Discord data
  INSERT INTO profiles (id, discord_id, discord_username, discord_avatar, email)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'provider_id',
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.email
  );

  -- Create default free subscription
  INSERT INTO subscriptions (user_id, discord_id, tier, status)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'provider_id',
    'free',
    'active'
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users insert
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

#### Check if Discord user is premium

```sql
-- Function to check premium status by Discord ID
CREATE OR REPLACE FUNCTION is_premium_user(discord_user_id TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM subscriptions
    WHERE discord_id = discord_user_id
    AND status = 'active'
    AND tier = 'premium'
    AND (current_period_end IS NULL OR current_period_end > NOW())
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

#### Get subscription details by Discord ID

```sql
-- Function to get full subscription info
CREATE OR REPLACE FUNCTION get_subscription_by_discord_id(discord_user_id TEXT)
RETURNS TABLE (
  tier TEXT,
  status TEXT,
  current_period_end TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT s.tier, s.status, s.current_period_end
  FROM subscriptions s
  WHERE s.discord_id = discord_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## Authentication Flow

### Login with Discord (Website)

```javascript
// lib/supabase.js
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

// Login with Discord
export async function loginWithDiscord() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'discord',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
      scopes: 'identify email'
    }
  })

  if (error) throw error
  return data
}

// Get current session
export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

// Logout
export async function logout() {
  await supabase.auth.signOut()
}
```

### Auth Callback Handler

```javascript
// app/auth/callback/route.js
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabase = createRouteHandlerClient({ cookies })
    await supabase.auth.exchangeCodeForSession(code)
  }

  // Redirect to dashboard after login
  return NextResponse.redirect(new URL('/dashboard', request.url))
}
```

### Get User with Subscription Status

```javascript
// lib/user.js
import { supabase } from './supabase'

export async function getCurrentUser() {
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) return null

  // Get profile and subscription
  const { data: profile } = await supabase
    .from('profiles')
    .select(`
      *,
      subscriptions (
        tier,
        status,
        current_period_end
      )
    `)
    .eq('id', session.user.id)
    .single()

  return {
    ...profile,
    subscription: profile?.subscriptions?.[0] || { tier: 'free', status: 'active' }
  }
}

export async function isPremiumUser() {
  const user = await getCurrentUser()
  if (!user) return false

  const { subscription } = user
  return subscription.tier === 'premium' &&
         subscription.status === 'active' &&
         (!subscription.current_period_end ||
          new Date(subscription.current_period_end) > new Date())
}
```

---

## Subscription Management

### Check Premium Status (Website)

```javascript
// components/FeatureGate.jsx
'use client'
import { useState, useEffect } from 'react'
import { isPremiumUser } from '@/lib/user'

export function FeatureGate({ children, fallback }) {
  const [isPremium, setIsPremium] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    isPremiumUser().then(premium => {
      setIsPremium(premium)
      setLoading(false)
    })
  }, [])

  if (loading) return <LoadingSpinner />

  return isPremium ? children : fallback
}

// Usage
function QuoteEditor() {
  return (
    <div>
      {/* Free features */}
      <TemplateSelector />
      <FontSelector />

      {/* Premium features */}
      <FeatureGate fallback={<UpgradePrompt feature="Animated GIFs" />}>
        <AnimatedGifToggle />
      </FeatureGate>

      <FeatureGate fallback={<UpgradePrompt feature="Preview" />}>
        <PreviewButton />
      </FeatureGate>
    </div>
  )
}
```

### Get Subscription Details

```javascript
// app/api/subscription/route.js
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies })

  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', session.user.id)
    .single()

  return Response.json(subscription)
}
```

---

## Bot Integration

### Check Subscription from Bot

The bot can check any user's subscription status by their Discord ID using the Supabase service role key.

```javascript
// bot/lib/supabase.js
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// Check if Discord user has premium subscription
export async function checkPremiumStatus(discordId) {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('tier, status, current_period_end')
    .eq('discord_id', discordId)
    .single()

  if (error || !data) return false

  return data.tier === 'premium' &&
         data.status === 'active' &&
         (!data.current_period_end || new Date(data.current_period_end) > new Date())
}

// Get full subscription details
export async function getSubscription(discordId) {
  const { data } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('discord_id', discordId)
    .single()

  return data || { tier: 'free', status: 'active' }
}

// Log quote creation for analytics
export async function logQuoteCreation(discordId, quoteData) {
  await supabase
    .from('quotes')
    .insert({
      discord_id: discordId,
      ...quoteData
    })
}
```

### Feature Gating in Bot Commands

```javascript
// bot/commands/quote.js
import { checkPremiumStatus, getSubscription } from '../lib/supabase.js'

// Check feature access
async function canUseFeature(discordId, feature) {
  const PREMIUM_FEATURES = ['animatedGifs', 'preview', 'avatarChoice', 'multiMessage', 'presets']

  if (!PREMIUM_FEATURES.includes(feature)) {
    return true // Free feature
  }

  return await checkPremiumStatus(discordId)
}

// Usage in command handler
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return

  if (interaction.commandName === 'quote') {
    const wantsAnimated = interaction.options.getBoolean('animated')

    if (wantsAnimated) {
      const canAnimate = await canUseFeature(interaction.user.id, 'animatedGifs')

      if (!canAnimate) {
        return interaction.reply({
          content: '⭐ **Animated GIF export is a Premium feature!**\n\nUpgrade at https://quotecord.app/upgrade to unlock animated quotes, preview mode, and more!',
          ephemeral: true
        })
      }
    }

    // Generate quote...
  }
})
```

### Premium Indicator in Bot UI

```javascript
// Show premium badge in bot responses
async function buildQuoteEmbed(discordId, quoteUrl) {
  const subscription = await getSubscription(discordId)
  const isPremium = subscription.tier === 'premium'

  const embed = new EmbedBuilder()
    .setImage(quoteUrl)
    .setColor(isPremium ? '#FFD700' : '#5865F2')

  if (!isPremium) {
    embed.setFooter({
      text: 'Made with QuoteCord • Upgrade to remove ads!'
    })
  }

  return embed
}
```

### Upgrade Button Component

```javascript
// Add upgrade button for free users
function getActionRow(isPremium) {
  const row = new ActionRowBuilder()

  row.addComponents(
    new ButtonBuilder()
      .setCustomId('regenerate')
      .setLabel('Regenerate')
      .setStyle(ButtonStyle.Primary)
  )

  if (!isPremium) {
    row.addComponents(
      new ButtonBuilder()
        .setLabel('⭐ Upgrade to Premium')
        .setStyle(ButtonStyle.Link)
        .setURL('https://quotecord.app/upgrade?ref=bot')
    )
  }

  return row
}
```

---

## Stripe Payment Integration

### Create Checkout Session

```javascript
// app/api/create-checkout/route.js
import Stripe from 'stripe'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export async function POST(req) {
  const supabase = createRouteHandlerClient({ cookies })

  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { period } = await req.json() // 'monthly' or 'annual'

  // Get user profile with Discord ID
  const { data: profile } = await supabase
    .from('profiles')
    .select('discord_id, email')
    .eq('id', session.user.id)
    .single()

  // Get or create Stripe customer
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('stripe_customer_id')
    .eq('user_id', session.user.id)
    .single()

  let customerId = subscription?.stripe_customer_id

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: profile.email,
      metadata: {
        discord_id: profile.discord_id,
        supabase_user_id: session.user.id
      }
    })
    customerId = customer.id

    // Save customer ID
    await supabase
      .from('subscriptions')
      .update({ stripe_customer_id: customerId })
      .eq('user_id', session.user.id)
  }

  // Create checkout session
  const checkoutSession = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{
      price: period === 'annual'
        ? process.env.STRIPE_PREMIUM_ANNUAL_PRICE_ID
        : process.env.STRIPE_PREMIUM_MONTHLY_PRICE_ID,
      quantity: 1
    }],
    metadata: {
      discord_id: profile.discord_id,
      supabase_user_id: session.user.id
    },
    success_url: `${process.env.NEXT_PUBLIC_URL}/dashboard?upgraded=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_URL}/pricing`
  })

  return Response.json({ url: checkoutSession.url })
}
```

### Stripe Webhook Handler

```javascript
// app/api/webhooks/stripe/route.js
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

// Use service role for webhook updates
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function POST(req) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  let event
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    )
  } catch (err) {
    return Response.json({ error: `Webhook Error: ${err.message}` }, { status: 400 })
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object
      const discordId = session.metadata.discord_id

      // Upgrade to premium
      await supabase
        .from('subscriptions')
        .update({
          tier: 'premium',
          status: 'active',
          stripe_subscription_id: session.subscription,
          updated_at: new Date().toISOString()
        })
        .eq('discord_id', discordId)
      break
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object

      await supabase
        .from('subscriptions')
        .update({
          status: subscription.status === 'active' ? 'active' : 'past_due',
          current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('stripe_subscription_id', subscription.id)
      break
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object

      // Downgrade to free
      await supabase
        .from('subscriptions')
        .update({
          tier: 'free',
          status: 'cancelled',
          current_period_end: null,
          updated_at: new Date().toISOString()
        })
        .eq('stripe_subscription_id', subscription.id)
      break
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object

      await supabase
        .from('subscriptions')
        .update({
          status: 'past_due',
          updated_at: new Date().toISOString()
        })
        .eq('stripe_customer_id', invoice.customer)
      break
    }
  }

  return Response.json({ received: true })
}
```

### Customer Portal (Manage Subscription)

```javascript
// app/api/create-portal/route.js
import Stripe from 'stripe'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export async function POST() {
  const supabase = createRouteHandlerClient({ cookies })

  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('stripe_customer_id')
    .eq('user_id', session.user.id)
    .single()

  if (!subscription?.stripe_customer_id) {
    return Response.json({ error: 'No subscription found' }, { status: 404 })
  }

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: subscription.stripe_customer_id,
    return_url: `${process.env.NEXT_PUBLIC_URL}/dashboard`
  })

  return Response.json({ url: portalSession.url })
}
```

---

## UI/UX Recommendations

### Website Pages Structure

```
/                     - Landing page (hero, features, pricing, testimonials)
/features             - Detailed feature breakdown
/pricing              - Pricing comparison table
/templates            - Template gallery with previews
/fonts                - Font showcase
/login                - Discord OAuth login
/dashboard            - User dashboard (after login)
  /dashboard/settings - Account settings
  /dashboard/presets  - Saved presets
  /dashboard/stats    - Usage statistics
  /dashboard/billing  - Subscription management
/upgrade              - Upgrade CTA page
/add                  - Add bot to server redirect
/support              - FAQ and contact
/privacy              - Privacy policy
/terms                - Terms of service
```

### Premium Upsell UI Patterns

#### 1. Feature Lock Overlay
```jsx
<div className="relative">
  <FeaturePreview className="opacity-50 pointer-events-none" />
  <div className="absolute inset-0 flex items-center justify-center bg-black/60">
    <div className="text-center">
      <Lock className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
      <p className="font-medium">Premium Feature</p>
      <Button href="/upgrade">Upgrade to Unlock</Button>
    </div>
  </div>
</div>
```

#### 2. Comparison Modal
```jsx
<Dialog>
  <DialogContent>
    <h2>Unlock More with Premium</h2>
    <ComparisonTable
      free={['Static PNG only', 'Ads shown', 'Single messages']}
      premium={['Animated GIF export', 'No ads', 'Multi-message quotes', 'Preview mode']}
    />
    <div className="flex gap-2">
      <Button onClick={() => handleUpgrade('monthly')}>
        $1.99/month
      </Button>
      <Button onClick={() => handleUpgrade('annual')} variant="primary">
        $19.99/year (2 months free)
      </Button>
    </div>
  </DialogContent>
</Dialog>
```

---

## Marketing Copy

### Taglines
- **Primary**: "Turn Discord messages into stunning quotes"
- **Secondary**: "The quote generator Discord deserves"
- **Premium**: "Unlock the full quotecord experience"

### Feature Headlines

**Hero Section**
> Transform any Discord message into a beautiful, shareable quote in seconds. Right-click. Customize. Share.

**Premium**
> Serious about content? Go Premium. Animated exports, preview mode, multi-message quotes, and no ads.

---

## Implementation Checklist

### Phase 1: Supabase Setup
- [ ] Create Supabase project
- [ ] Enable Discord OAuth provider
- [ ] Configure Discord application redirect
- [ ] Create database tables (profiles, subscriptions, presets, quotes)
- [ ] Create database functions and triggers
- [ ] Test auth flow

### Phase 2: Website Foundation
- [ ] Create new repository for website
- [ ] Set up Next.js 14 with TypeScript
- [ ] Configure Tailwind CSS
- [ ] Install Supabase client libraries
- [ ] Create basic landing page
- [ ] Implement Discord login flow

### Phase 3: User Dashboard
- [ ] Create dashboard layout
- [ ] Build settings page
- [ ] Add subscription status display
- [ ] Build presets management (premium)
- [ ] Add usage statistics

### Phase 4: Payments
- [ ] Create Stripe account
- [ ] Configure products and prices
- [ ] Implement checkout flow
- [ ] Set up webhook handlers
- [ ] Build billing management page
- [ ] Test full payment flow

### Phase 5: Bot Integration
- [ ] Add Supabase client to bot
- [ ] Implement checkPremiumStatus function
- [ ] Add feature gating to commands
- [ ] Add upgrade prompts for free users
- [ ] Add usage logging
- [ ] Test subscription checks

### Phase 6: Polish & Launch
- [ ] Design all pages
- [ ] Add animations
- [ ] Implement SEO
- [ ] Add analytics
- [ ] Security audit
- [ ] Beta testing
- [ ] Launch!

---

## Security Considerations

1. **Row Level Security (RLS)**: Always enabled - users can only access their own data
2. **Service Role Key**: Only used server-side (API routes, bot) - never expose to client
3. **Webhook Verification**: Always verify Stripe webhook signatures
4. **Discord ID Immutability**: Discord IDs don't change, making them perfect keys for linking accounts

---

## User Flow Summary

### New User Signup
1. User visits quotecord.app → Clicks "Login with Discord"
2. Redirected to Discord OAuth → Approves access
3. Supabase creates auth user → Trigger creates profile + free subscription
4. User lands on dashboard with free tier

### Upgrade to Premium
1. User clicks "Upgrade" → Selects monthly/annual
2. Redirected to Stripe Checkout → Completes payment
3. Stripe webhook fires → Updates subscription in Supabase
4. User now has premium access on website AND in Discord bot

### Using Premium in Discord Bot
1. User runs `/quote` with animated option
2. Bot queries Supabase with user's Discord ID
3. Supabase returns subscription status
4. Bot grants access (premium) or shows upgrade prompt (free)

---

## Quick Start

```bash
# Website setup
npx create-next-app@latest quotecord-website --typescript --tailwind --app --src-dir
cd quotecord-website

# Install dependencies
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs stripe

# Environment setup
cp .env.example .env.local
# Fill in Supabase and Stripe credentials

# Run locally
npm run dev
```

```bash
# Bot setup - add to existing bot
npm install @supabase/supabase-js

# Add to .env
SUPABASE_URL=your-project-url
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

---

*Documentation for quotecord Bot v1.0*
*Last updated: 2025-11-23*
