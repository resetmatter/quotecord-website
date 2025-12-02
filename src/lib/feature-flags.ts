import { createServiceClient } from './supabase-server'
import { FeatureKey } from './bot-auth'
import { getGlobalFeatureFlags, GlobalFeatureFlags } from './admin'

export interface FeatureFlags {
  premiumOverride: boolean | null
  overrideAnimatedGifs: boolean | null
  overridePreview: boolean | null
  overrideMultiMessage: boolean | null
  overrideAvatarChoice: boolean | null
  overridePresets: boolean | null
  overrideNoWatermark: boolean | null
  overrideMaxGallerySize: number | null
  reason: string | null
  expiresAt: string | null
}

// Re-export GlobalFeatureFlags for convenience
export type { GlobalFeatureFlags }

// Database row type for feature_flags table
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

export interface FeatureFlagInput {
  discordId: string
  premiumOverride?: boolean | null
  overrideAnimatedGifs?: boolean | null
  overridePreview?: boolean | null
  overrideMultiMessage?: boolean | null
  overrideAvatarChoice?: boolean | null
  overridePresets?: boolean | null
  overrideNoWatermark?: boolean | null
  overrideMaxGallerySize?: number | null
  reason?: string
  createdBy?: string
  expiresAt?: string | null
}

// Get feature flags for a user by Discord ID
export async function getFeatureFlags(discordId: string): Promise<FeatureFlags | null> {
  const supabase = createServiceClient()

  const { data, error } = await supabase
    .from('feature_flags')
    .select('*')
    .eq('discord_id', discordId)
    .or('expires_at.is.null,expires_at.gt.now()')
    .single() as { data: FeatureFlagRow | null; error: any }

  if (error || !data) {
    return null
  }

  return {
    premiumOverride: data.premium_override,
    overrideAnimatedGifs: data.override_animated_gifs,
    overridePreview: data.override_preview,
    overrideMultiMessage: data.override_multi_message,
    overrideAvatarChoice: data.override_avatar_choice,
    overridePresets: data.override_presets,
    overrideNoWatermark: data.override_no_watermark,
    overrideMaxGallerySize: data.override_max_gallery_size,
    reason: data.reason,
    expiresAt: data.expires_at
  }
}

// Check if a user has premium access (either via subscription or feature flag)
export async function hasPremiumAccess(discordId: string): Promise<boolean> {
  const supabase = createServiceClient()

  // Use the database function which already checks feature flags
  const { data: isPremium } = await (supabase as any)
    .rpc('is_premium_user', { discord_user_id: discordId })

  return isPremium === true
}

// Get effective feature access for a user, considering global flags, individual flags, and subscription
// Priority: Global flags > Individual flags > Subscription status
export async function getEffectiveFeatures(discordId: string): Promise<{
  isPremium: boolean
  features: {
    animatedGifs: boolean
    preview: boolean
    multiMessage: boolean
    avatarChoice: boolean
    presets: boolean
    noWatermark: boolean
    galleryStorage: boolean
    maxGallerySize: number
  }
  hasOverrides: boolean
  hasGlobalOverrides: boolean
}> {
  const supabase = createServiceClient()

  // Get global feature flags first (highest priority)
  const globalFlags = await getGlobalFeatureFlags()

  // Get subscription status
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('tier, status, current_period_end')
    .eq('discord_id', discordId)
    .single() as { data: { tier: string; status: string; current_period_end: string | null } | null; error: any }

  // Check if user has valid premium subscription
  const hasActiveSubscription = subscription &&
    subscription.tier === 'premium' &&
    subscription.status === 'active' &&
    (!subscription.current_period_end || new Date(subscription.current_period_end) > new Date())

  // Get individual feature flags
  const flags = await getFeatureFlags(discordId)

  // Determine effective premium status
  // Priority: Global > Individual > Subscription
  let isPremium: boolean
  if (globalFlags.globalPremiumOverride !== null) {
    isPremium = globalFlags.globalPremiumOverride
  } else if (flags !== null && flags.premiumOverride !== null) {
    isPremium = flags.premiumOverride === true
  } else {
    isPremium = !!hasActiveSubscription
  }

  // Calculate effective feature access
  // For each feature: check global first, then individual, then premium status
  const features = {
    animatedGifs: globalFlags.globalAnimatedGifs ?? flags?.overrideAnimatedGifs ?? isPremium,
    preview: globalFlags.globalPreview ?? flags?.overridePreview ?? isPremium,
    multiMessage: globalFlags.globalMultiMessage ?? flags?.overrideMultiMessage ?? isPremium,
    avatarChoice: globalFlags.globalAvatarChoice ?? flags?.overrideAvatarChoice ?? isPremium,
    presets: globalFlags.globalPresets ?? flags?.overridePresets ?? isPremium,
    noWatermark: globalFlags.globalNoWatermark ?? flags?.overrideNoWatermark ?? isPremium,
    galleryStorage: true, // Always available
    maxGallerySize: globalFlags.globalMaxGallerySize ?? flags?.overrideMaxGallerySize ?? (isPremium ? 1000 : 50)
  }

  // Check if any global overrides are active
  const hasGlobalOverrides =
    globalFlags.globalPremiumOverride !== null ||
    globalFlags.globalAnimatedGifs !== null ||
    globalFlags.globalPreview !== null ||
    globalFlags.globalMultiMessage !== null ||
    globalFlags.globalAvatarChoice !== null ||
    globalFlags.globalPresets !== null ||
    globalFlags.globalNoWatermark !== null ||
    globalFlags.globalMaxGallerySize !== null

  return {
    isPremium,
    features,
    hasOverrides: flags !== null,
    hasGlobalOverrides
  }
}

// Check if a specific feature is enabled for a user
export async function isFeatureEnabled(
  discordId: string,
  feature: FeatureKey
): Promise<boolean> {
  const { features } = await getEffectiveFeatures(discordId)

  switch (feature) {
    case 'animatedGifs':
      return features.animatedGifs
    case 'preview':
      return features.preview
    case 'multiMessage':
      return features.multiMessage
    case 'avatarChoice':
      return features.avatarChoice
    case 'presets':
      return features.presets
    case 'noWatermark':
      return features.noWatermark
    case 'galleryStorage':
      return features.galleryStorage
    default:
      return false
  }
}

// Set feature flags for a user (admin function)
export async function setFeatureFlags(input: FeatureFlagInput): Promise<{ success: boolean; error?: string }> {
  const supabase = createServiceClient()

  const { error } = await (supabase as any)
    .from('feature_flags')
    .upsert({
      discord_id: input.discordId,
      premium_override: input.premiumOverride,
      override_animated_gifs: input.overrideAnimatedGifs,
      override_preview: input.overridePreview,
      override_multi_message: input.overrideMultiMessage,
      override_avatar_choice: input.overrideAvatarChoice,
      override_presets: input.overridePresets,
      override_no_watermark: input.overrideNoWatermark,
      override_max_gallery_size: input.overrideMaxGallerySize,
      reason: input.reason,
      created_by: input.createdBy,
      expires_at: input.expiresAt,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'discord_id'
    })

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true }
}

// Remove feature flags for a user (admin function)
export async function removeFeatureFlags(discordId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = createServiceClient()

  const { error } = await (supabase as any)
    .from('feature_flags')
    .delete()
    .eq('discord_id', discordId)

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true }
}

// Type for list query result
interface FeatureFlagListRow {
  discord_id: string
  premium_override: boolean | null
  reason: string | null
  created_by: string | null
  expires_at: string | null
  created_at: string
}

// List all active feature flags (admin function)
export async function listActiveFeatureFlags(): Promise<Array<{
  discordId: string
  premiumOverride: boolean | null
  reason: string | null
  createdBy: string | null
  expiresAt: string | null
  createdAt: string
}>> {
  const supabase = createServiceClient()

  const { data, error } = await (supabase as any)
    .from('feature_flags')
    .select('discord_id, premium_override, reason, created_by, expires_at, created_at')
    .or('expires_at.is.null,expires_at.gt.now()')
    .order('created_at', { ascending: false }) as { data: FeatureFlagListRow[] | null; error: any }

  if (error || !data) {
    return []
  }

  return data.map((row) => ({
    discordId: row.discord_id,
    premiumOverride: row.premium_override,
    reason: row.reason,
    createdBy: row.created_by,
    expiresAt: row.expires_at,
    createdAt: row.created_at
  }))
}
