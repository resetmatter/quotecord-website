# Quotecord Website Documentation

## Overview

This document outlines the architecture and implementation details for the Quotecord website, focusing on user authentication via Discord and subscription management using Supabase.

## Technology Stack

- **Database & Backend**: Supabase
- **Authentication**: Discord OAuth (via Supabase Auth)
- **Frontend**: (To be determined - React/Next.js recommended for Supabase integration)

---

## Authentication: Login with Discord

### How It Works

Users authenticate using their Discord account through Supabase's built-in OAuth provider support. This creates a seamless experience where:

1. User clicks "Login with Discord" on the website
2. User is redirected to Discord's OAuth consent screen
3. Upon approval, Discord redirects back to the website with auth tokens
4. Supabase creates/updates the user record with Discord profile data
5. The user's Discord ID is stored and linked to their subscription status

### Supabase Discord OAuth Setup

1. **Enable Discord Provider in Supabase**:
   - Go to Supabase Dashboard → Authentication → Providers
   - Enable Discord
   - Add your Discord Application's Client ID and Client Secret

2. **Create Discord Application**:
   - Go to [Discord Developer Portal](https://discord.com/developers/applications)
   - Create a new application
   - Under OAuth2, add redirect URL: `https://<your-project>.supabase.co/auth/v1/callback`
   - Copy Client ID and Client Secret to Supabase

3. **Required Discord OAuth Scopes**:
   - `identify` - Access user's Discord ID, username, avatar
   - `email` - Access user's email address

### Frontend Implementation

```javascript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

// Login with Discord
async function loginWithDiscord() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'discord',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
      scopes: 'identify email'
    }
  })
}

// Get current user session
async function getSession() {
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

// Logout
async function logout() {
  await supabase.auth.signOut()
}
```

---

## Database Schema

### Tables

#### `profiles`
Stores user profile information linked to their Discord account.

```sql
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  discord_id TEXT UNIQUE NOT NULL,
  discord_username TEXT,
  discord_avatar TEXT,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);
```

#### `subscriptions`
Tracks user subscription status and tier.

```sql
CREATE TABLE subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  discord_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'inactive', -- 'active', 'inactive', 'cancelled', 'past_due'
  tier TEXT NOT NULL DEFAULT 'free', -- 'free', 'premium', 'pro'
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(user_id),
  UNIQUE(discord_id)
);

-- Enable RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can read their own subscription
CREATE POLICY "Users can view own subscription" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);
```

### Database Functions

#### Auto-create profile on signup

```sql
-- Function to handle new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, discord_id, discord_username, discord_avatar, email)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'provider_id',
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.email
  );

  -- Create default free subscription
  INSERT INTO subscriptions (user_id, discord_id, status, tier)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'provider_id',
    'active',
    'free'
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call function on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

#### Check subscription status by Discord ID

```sql
-- Function to check if a Discord user has an active paid subscription
CREATE OR REPLACE FUNCTION is_paid_user(discord_user_id TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM subscriptions
    WHERE discord_id = discord_user_id
    AND status = 'active'
    AND tier IN ('premium', 'pro')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## Subscription Management

### Checking Paid Status

The website checks subscription status to determine which features to show:

```javascript
// Check if current user is a paid subscriber
async function isPaidUser() {
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) return false

  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('status, tier')
    .eq('user_id', session.user.id)
    .single()

  return subscription?.status === 'active' &&
         ['premium', 'pro'].includes(subscription?.tier)
}

// Get user's subscription details
async function getSubscription() {
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) return null

  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', session.user.id)
    .single()

  return subscription
}
```

### Feature Gating Example

```javascript
function FeatureComponent() {
  const [isPaid, setIsPaid] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    isPaidUser().then(paid => {
      setIsPaid(paid)
      setLoading(false)
    })
  }, [])

  if (loading) return <LoadingSpinner />

  return (
    <div>
      {/* Free features available to all */}
      <FreeFeatures />

      {/* Premium features only for paid users */}
      {isPaid ? (
        <PremiumFeatures />
      ) : (
        <UpgradePrompt />
      )}
    </div>
  )
}
```

---

## Integration with Discord Bot

The Quotecord Discord bot can verify subscription status by querying Supabase directly using the user's Discord ID:

### Bot-side Subscription Check

```javascript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Use service role for server-side
)

// Check if Discord user has paid subscription
async function checkPaidStatus(discordId) {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('status, tier')
    .eq('discord_id', discordId)
    .single()

  if (error || !data) return false

  return data.status === 'active' && ['premium', 'pro'].includes(data.tier)
}

// Usage in bot command
client.on('interactionCreate', async (interaction) => {
  if (interaction.commandName === 'premium-feature') {
    const isPaid = await checkPaidStatus(interaction.user.id)

    if (!isPaid) {
      return interaction.reply({
        content: 'This is a premium feature! Subscribe at https://quotecord.com/pricing',
        ephemeral: true
      })
    }

    // Execute premium feature...
  }
})
```

---

## Payment Integration (Stripe)

### Webhook Handler

Handle Stripe webhooks to update subscription status in Supabase:

```javascript
// /api/webhooks/stripe.js
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function POST(req) {
  const sig = req.headers['stripe-signature']
  const body = await req.text()

  let event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    return new Response(`Webhook Error: ${err.message}`, { status: 400 })
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object
      const discordId = session.metadata.discord_id

      await supabase
        .from('subscriptions')
        .update({
          status: 'active',
          tier: session.metadata.tier,
          stripe_customer_id: session.customer,
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
          status: subscription.status === 'active' ? 'active' : 'inactive',
          current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('stripe_subscription_id', subscription.id)
      break
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object

      await supabase
        .from('subscriptions')
        .update({
          status: 'cancelled',
          tier: 'free',
          updated_at: new Date().toISOString()
        })
        .eq('stripe_subscription_id', subscription.id)
      break
    }
  }

  return new Response('OK', { status: 200 })
}
```

### Creating Checkout Session

```javascript
// /api/create-checkout.js
export async function POST(req) {
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    return new Response('Unauthorized', { status: 401 })
  }

  // Get user's Discord ID from profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('discord_id, email')
    .eq('id', session.user.id)
    .single()

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    customer_email: profile.email,
    line_items: [
      {
        price: process.env.STRIPE_PREMIUM_PRICE_ID,
        quantity: 1
      }
    ],
    metadata: {
      discord_id: profile.discord_id,
      tier: 'premium'
    },
    success_url: `${process.env.NEXT_PUBLIC_URL}/success`,
    cancel_url: `${process.env.NEXT_PUBLIC_URL}/pricing`
  })

  return Response.json({ url: checkoutSession.url })
}
```

---

## Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PREMIUM_PRICE_ID=price_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...

# App
NEXT_PUBLIC_URL=https://quotecord.com
```

---

## Security Considerations

1. **Row Level Security (RLS)**: Always enable RLS on tables to ensure users can only access their own data.

2. **Service Role Key**: Never expose the service role key to the client. Use it only in server-side code (API routes, webhooks).

3. **Webhook Verification**: Always verify Stripe webhook signatures to prevent spoofed requests.

4. **Discord ID as Link**: The Discord ID serves as the immutable link between the website user and their Discord account, enabling the bot to check subscription status.

---

## User Flow Summary

1. **New User Signup**:
   - User visits website → Clicks "Login with Discord"
   - Redirected to Discord OAuth → Approves access
   - Supabase creates user → Trigger creates profile + free subscription
   - User is logged in with free tier access

2. **Upgrade to Premium**:
   - User clicks "Upgrade" → Redirected to Stripe Checkout
   - Completes payment → Stripe webhook fires
   - Subscription table updated with `status: 'active'`, `tier: 'premium'`
   - User now sees premium features on website
   - Discord bot recognizes them as premium user

3. **Using Discord Bot**:
   - User runs premium command in Discord
   - Bot queries Supabase with user's Discord ID
   - Bot checks subscription status
   - Grants or denies access based on tier

---

## API Endpoints Summary

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/auth/callback` | GET | Supabase OAuth callback handler |
| `/api/create-checkout` | POST | Create Stripe checkout session |
| `/api/webhooks/stripe` | POST | Handle Stripe webhook events |
| `/api/subscription` | GET | Get current user's subscription |

---

## Next Steps

1. Set up Supabase project and configure Discord OAuth provider
2. Create database tables and functions
3. Build frontend authentication flow
4. Integrate Stripe for payment processing
5. Connect Discord bot to Supabase for subscription verification
6. Test complete flow end-to-end
