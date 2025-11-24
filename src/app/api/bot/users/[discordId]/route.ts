import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-server'
import { verifyBotApiKey, PREMIUM_FEATURES, FeatureKey } from '@/lib/bot-auth'

// GET /api/bot/users/[discordId] - Get user's subscription tier and info
export async function GET(
  request: Request,
  { params }: { params: { discordId: string } }
) {
  // Verify bot API key
  if (!await verifyBotApiKey(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { discordId } = params

  try {
    const supabase = createServiceClient()

    // Get subscription info
    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .select('tier, status, current_period_end')
      .eq('discord_id', discordId)
      .single()

    if (error || !subscription) {
      // User doesn't have an account yet - return free tier
      return NextResponse.json({
        discordId,
        tier: 'free',
        status: 'active',
        hasAccount: false,
        isPremium: false,
        features: {
          animatedGifs: false,
          preview: false,
          multiMessage: false,
          avatarChoice: false,
          presets: false,
          noWatermark: false,
          galleryStorage: true,
          maxGallerySize: 50
        }
      })
    }

    // Check if premium is valid (active and not expired)
    const isPremium = subscription.tier === 'premium' &&
      subscription.status === 'active' &&
      (!subscription.current_period_end || new Date(subscription.current_period_end) > new Date())

    // Get quote count for quota info
    const { data: quoteCount } = await supabase
      .rpc('get_user_quote_count' as any, { discord_user_id: discordId })

    return NextResponse.json({
      discordId,
      tier: subscription.tier,
      status: subscription.status,
      hasAccount: true,
      isPremium,
      currentPeriodEnd: subscription.current_period_end,
      features: {
        animatedGifs: isPremium,
        preview: isPremium,
        multiMessage: isPremium,
        avatarChoice: isPremium,
        presets: isPremium,
        noWatermark: isPremium,
        galleryStorage: true,
        maxGallerySize: isPremium ? 1000 : 50
      },
      quoteCount: quoteCount || 0
    })
  } catch (error) {
    console.error('Error fetching user tier:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user tier' },
      { status: 500 }
    )
  }
}

// POST /api/bot/users/[discordId] - Check specific feature access
export async function POST(
  request: Request,
  { params }: { params: { discordId: string } }
) {
  // Verify bot API key
  if (!await verifyBotApiKey(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { discordId } = params

  try {
    const body = await request.json()
    const { feature } = body as { feature: FeatureKey }

    if (!feature || !PREMIUM_FEATURES[feature]) {
      return NextResponse.json(
        { error: 'Invalid feature specified' },
        { status: 400 }
      )
    }

    const featureConfig = PREMIUM_FEATURES[feature]
    const supabase = createServiceClient()

    // If feature doesn't require premium, allow it
    if (!featureConfig.requiresPremium) {
      return NextResponse.json({
        feature,
        allowed: true,
        reason: null
      })
    }

    // Check premium status
    const { data: isPremium } = await supabase
      .rpc('is_premium_user' as any, { discord_user_id: discordId })

    if (isPremium) {
      return NextResponse.json({
        feature,
        allowed: true,
        reason: null
      })
    }

    // User is not premium
    return NextResponse.json({
      feature,
      allowed: false,
      reason: `${featureConfig.name} is a Premium feature. Upgrade at quotecord.com/dashboard/billing`
    })
  } catch (error) {
    console.error('Error checking feature access:', error)
    return NextResponse.json(
      { error: 'Failed to check feature access' },
      { status: 500 }
    )
  }
}
