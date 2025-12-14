import { supabase } from './supabase'

export interface UserProfile {
  id: string
  discord_id: string
  discord_username: string | null
  discord_avatar: string | null
  email: string | null
  subscription: {
    tier: string
    status: string
    current_period_start: string | null
    current_period_end: string | null
  }
}

interface ProfileWithSubscription {
  id: string
  discord_id: string
  discord_username: string | null
  discord_avatar: string | null
  email: string | null
  subscriptions: Array<{
    tier: string
    status: string
    current_period_start: string | null
    current_period_end: string | null
  }>
}

// Helper to determine billing period from subscription dates
export function getBillingPeriod(subscription: { current_period_start: string | null; current_period_end: string | null }): 'monthly' | 'annual' | null {
  if (!subscription.current_period_start || !subscription.current_period_end) {
    return null
  }
  const start = new Date(subscription.current_period_start)
  const end = new Date(subscription.current_period_end)
  const days = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  // Annual is typically 365 days, monthly is ~30 days
  return days > 60 ? 'annual' : 'monthly'
}

export async function getCurrentUser(): Promise<UserProfile | null> {
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
        current_period_start,
        current_period_end
      )
    `)
    .eq('id', session.user.id)
    .single()

  if (!profile) return null

  const typedProfile = profile as unknown as ProfileWithSubscription

  return {
    id: typedProfile.id,
    discord_id: typedProfile.discord_id,
    discord_username: typedProfile.discord_username,
    discord_avatar: typedProfile.discord_avatar,
    email: typedProfile.email,
    subscription: typedProfile.subscriptions?.[0] || { tier: 'free', status: 'active', current_period_start: null, current_period_end: null }
  }
}

export async function isPremiumUser(): Promise<boolean> {
  const user = await getCurrentUser()
  if (!user) return false

  // Use the database function which checks both subscription AND feature flags
  const { data: isPremium } = await (supabase as any)
    .rpc('is_premium_user', { discord_user_id: user.discord_id })

  // If the RPC call fails, fall back to local subscription check
  if (isPremium === null || isPremium === undefined) {
    const { subscription } = user
    return subscription.tier === 'premium' &&
           subscription.status === 'active' &&
           (!subscription.current_period_end ||
            new Date(subscription.current_period_end) > new Date())
  }

  return isPremium === true
}
