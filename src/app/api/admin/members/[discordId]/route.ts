import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-server'
import { getEffectiveFeatures } from '@/lib/feature-flags'

// Type definitions for database rows
interface ProfileRow {
  id: string
  discord_id: string
  discord_username: string | null
  discord_avatar: string | null
  email: string | null
  created_at: string
  updated_at: string
}

interface SubscriptionRow {
  id: string
  user_id: string
  discord_id: string
  tier: string
  status: string
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  current_period_start: string | null
  current_period_end: string | null
  created_at: string
  updated_at: string
}

interface FeatureFlagRow {
  id: string
  discord_id: string
  premium_override: boolean | null
  override_animated_gifs: boolean | null
  override_preview: boolean | null
  override_multi_message: boolean | null
  override_avatar_choice: boolean | null
  override_presets: boolean | null
  override_no_watermark: boolean | null
  override_max_gallery_size: number | null
  reason: string | null
  created_by: string | null
  expires_at: string | null
  created_at: string
  updated_at: string
}

interface QuoteGalleryRow {
  id: string
  discord_id: string
  file_path: string
  file_name: string
  public_url: string | null
  template: string
  font: string
  theme: string
  animated: boolean
  quote_text: string | null
  author_name: string | null
  privacy_mode: string | null
  created_at: string
}

interface PresetRow {
  id: string
  user_id: string
  name: string
  template: string
  font: string
  theme: string
  orientation: string | null
  created_at: string
}

// Simple admin key verification
function verifyAdminKey(request: Request): boolean {
  const authHeader = request.headers.get('Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false
  }

  const apiKey = authHeader.substring(7)
  const adminKey = process.env.ADMIN_API_KEY || process.env.BOT_API_KEY
  return adminKey ? apiKey === adminKey : false
}

// GET /api/admin/members/[discordId] - Get comprehensive member details
export async function GET(
  request: Request,
  { params }: { params: Promise<{ discordId: string }> }
) {
  if (!verifyAdminKey(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { discordId } = await params
    const supabase = createServiceClient()

    // Fetch profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('discord_id', discordId)
      .single() as { data: ProfileRow | null; error: any }

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 })
    }

    // Fetch subscription
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('discord_id', discordId)
      .single() as { data: SubscriptionRow | null; error: any }

    // Fetch feature flags
    const { data: featureFlags } = await supabase
      .from('feature_flags')
      .select('*')
      .eq('discord_id', discordId)
      .single() as { data: FeatureFlagRow | null; error: any }

    // Fetch effective features (combines global, individual, and subscription)
    const effectiveFeatures = await getEffectiveFeatures(discordId)

    // Fetch gallery quotes (limited to 50 most recent)
    const { data: quotes, count: totalQuotes } = await supabase
      .from('quote_gallery')
      .select('*', { count: 'exact' })
      .eq('discord_id', discordId)
      .order('created_at', { ascending: false })
      .limit(50) as { data: QuoteGalleryRow[] | null; count: number | null; error: any }

    // Fetch presets
    const { data: presets, count: totalPresets } = await supabase
      .from('presets')
      .select('*', { count: 'exact' })
      .eq('user_id', profile.id) as { data: PresetRow[] | null; count: number | null; error: any }

    // Fetch quote generation history (from quotes table)
    const { count: totalQuotesGenerated } = await supabase
      .from('quotes')
      .select('*', { count: 'exact', head: true })
      .eq('discord_id', discordId) as { count: number | null; error: any }

    // Calculate statistics
    const stats = {
      totalQuotesGenerated: totalQuotesGenerated || 0,
      galleryQuotes: totalQuotes || 0,
      presetCount: totalPresets || 0,
      accountAge: Math.floor((Date.now() - new Date(profile.created_at).getTime()) / (1000 * 60 * 60 * 24)),
      lastUpdated: profile.updated_at
    }

    // Build comprehensive response
    const memberDetails = {
      // Profile info
      profile: {
        id: profile.id,
        discordId: profile.discord_id,
        discordUsername: profile.discord_username,
        discordAvatar: profile.discord_avatar,
        email: profile.email,
        createdAt: profile.created_at,
        updatedAt: profile.updated_at
      },
      // Subscription info
      subscription: subscription ? {
        id: subscription.id,
        tier: subscription.tier,
        status: subscription.status,
        stripeCustomerId: subscription.stripe_customer_id,
        stripeSubscriptionId: subscription.stripe_subscription_id,
        currentPeriodStart: subscription.current_period_start,
        currentPeriodEnd: subscription.current_period_end,
        createdAt: subscription.created_at,
        updatedAt: subscription.updated_at
      } : null,
      // Feature flags (individual overrides)
      featureFlags: featureFlags ? {
        id: featureFlags.id,
        premiumOverride: featureFlags.premium_override,
        overrideAnimatedGifs: featureFlags.override_animated_gifs,
        overridePreview: featureFlags.override_preview,
        overrideMultiMessage: featureFlags.override_multi_message,
        overrideAvatarChoice: featureFlags.override_avatar_choice,
        overridePresets: featureFlags.override_presets,
        overrideNoWatermark: featureFlags.override_no_watermark,
        overrideMaxGallerySize: featureFlags.override_max_gallery_size,
        reason: featureFlags.reason,
        createdBy: featureFlags.created_by,
        expiresAt: featureFlags.expires_at,
        createdAt: featureFlags.created_at,
        updatedAt: featureFlags.updated_at
      } : null,
      // Effective access (what the user actually has)
      effectiveAccess: effectiveFeatures,
      // Statistics
      stats,
      // Recent quotes (for admin to view)
      recentQuotes: quotes?.map(q => ({
        id: q.id,
        fileName: q.file_name,
        filePath: q.file_path,
        publicUrl: q.public_url,
        template: q.template,
        font: q.font,
        theme: q.theme,
        animated: q.animated,
        quoteText: q.quote_text,
        authorName: q.author_name,
        privacyMode: q.privacy_mode,
        createdAt: q.created_at
      })) || [],
      // Presets
      presets: presets?.map(p => ({
        id: p.id,
        name: p.name,
        template: p.template,
        font: p.font,
        theme: p.theme,
        orientation: p.orientation,
        createdAt: p.created_at
      })) || []
    }

    return NextResponse.json(memberDetails)
  } catch (error) {
    console.error('Error fetching member details:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH /api/admin/members/[discordId] - Update member's subscription tier directly
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ discordId: string }> }
) {
  if (!verifyAdminKey(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { discordId } = await params
    const body = await request.json()
    const { tier, status } = body

    const supabase = createServiceClient()

    // Check if user exists
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('discord_id', discordId)
      .single() as { data: { id: string } | null; error: any }

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 })
    }

    // Check if subscription exists
    const { data: existingSubscription } = await supabase
      .from('subscriptions')
      .select('id')
      .eq('discord_id', discordId)
      .single() as { data: { id: string } | null; error: any }

    if (existingSubscription) {
      // Update existing subscription
      const { error: updateError } = await (supabase as any)
        .from('subscriptions')
        .update({
          tier: tier || 'free',
          status: status || 'active',
          updated_at: new Date().toISOString()
        })
        .eq('discord_id', discordId)

      if (updateError) {
        console.error('Error updating subscription:', updateError)
        return NextResponse.json({ error: 'Failed to update subscription' }, { status: 500 })
      }
    } else {
      // Create new subscription record
      const { error: insertError } = await (supabase as any)
        .from('subscriptions')
        .insert({
          user_id: profile.id,
          discord_id: discordId,
          tier: tier || 'free',
          status: status || 'active'
        })

      if (insertError) {
        console.error('Error creating subscription:', insertError)
        return NextResponse.json({ error: 'Failed to create subscription' }, { status: 500 })
      }
    }

    return NextResponse.json({
      success: true,
      message: `Subscription updated for Discord ID: ${discordId}`
    })
  } catch (error) {
    console.error('Error updating member subscription:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
