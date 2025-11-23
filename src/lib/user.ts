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
    current_period_end: string | null
  }>
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
    subscription: typedProfile.subscriptions?.[0] || { tier: 'free', status: 'active', current_period_end: null }
  }
}

export async function isPremiumUser(): Promise<boolean> {
  const user = await getCurrentUser()
  if (!user) return false

  const { subscription } = user
  return subscription.tier === 'premium' &&
         subscription.status === 'active' &&
         (!subscription.current_period_end ||
          new Date(subscription.current_period_end) > new Date())
}
