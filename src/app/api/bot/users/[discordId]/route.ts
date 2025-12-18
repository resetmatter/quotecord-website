import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-server'
import { verifyBotApiKey, PREMIUM_FEATURES, FeatureKey } from '@/lib/bot-auth'
import { getEffectiveFeatures, getFeatureFlags } from '@/lib/feature-flags'

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
      .single() as { data: { tier: string; status: string; current_period_end: string | null } | null; error: any }

    // Get effective features (includes feature flag overrides)
    const { isPremium, premiumSource, features, hasOverrides, debug } = await getEffectiveFeatures(discordId)

    // Get quote count for quota info
    const { data: quoteCount } = await (supabase as any)
      .rpc('get_user_quote_count', { discord_user_id: discordId })

    // Get feature flag info if any overrides exist
    const flags = hasOverrides ? await getFeatureFlags(discordId) : null

    if (error || !subscription) {
      // User doesn't have an account yet - but may have feature flags
      return NextResponse.json({
        discordId,
        tier: hasOverrides && isPremium ? 'premium' : 'free',
        status: 'active',
        hasAccount: false,
        isPremium,
        premiumSource,
        features,
        quoteCount: quoteCount || 0,
        debug,
        ...(hasOverrides && {
          featureFlags: {
            hasOverrides: true,
            reason: flags?.reason || null,
            expiresAt: flags?.expiresAt || null
          }
        })
      })
    }

    return NextResponse.json({
      discordId,
      tier: isPremium ? 'premium' : subscription.tier,
      status: subscription.status,
      hasAccount: true,
      isPremium,
      premiumSource,
      currentPeriodEnd: subscription.current_period_end,
      features,
      quoteCount: quoteCount || 0,
      debug,
      ...(hasOverrides && {
        featureFlags: {
          hasOverrides: true,
          reason: flags?.reason || null,
          expiresAt: flags?.expiresAt || null
        }
      })
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

    // If feature doesn't require premium, allow it
    if (!featureConfig.requiresPremium) {
      return NextResponse.json({
        feature,
        allowed: true,
        reason: null
      })
    }

    // Get effective features including any overrides
    const { isPremium, features, hasOverrides } = await getEffectiveFeatures(discordId)

    // Check if this specific feature is enabled (considering individual overrides)
    const featureEnabled = (() => {
      switch (feature) {
        case 'animatedGifs': return features.animatedGifs
        case 'preview': return features.preview
        case 'multiMessage': return features.multiMessage
        case 'avatarChoice': return features.avatarChoice
        case 'presets': return features.presets
        case 'noWatermark': return features.noWatermark
        case 'galleryStorage': return features.galleryStorage
        default: return isPremium
      }
    })()

    if (featureEnabled) {
      return NextResponse.json({
        feature,
        allowed: true,
        reason: null,
        ...(hasOverrides && { hasOverride: true })
      })
    }

    // Feature is not enabled
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
