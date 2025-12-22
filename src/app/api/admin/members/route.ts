import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-server'

// Type definitions
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
  discord_id: string
  tier: string
  status: string
  current_period_end: string | null
}

interface FeatureFlagRow {
  discord_id: string
  premium_override: boolean | null
  reason: string | null
  expires_at: string | null
}

interface QuoteRow {
  discord_id: string
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

// GET /api/admin/members - List all members with optional search and pagination
export async function GET(request: Request) {
  if (!verifyAdminKey(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = (page - 1) * limit

    const supabase = createServiceClient()

    // Build the query for profiles
    let query = supabase
      .from('profiles')
      .select(`
        id,
        discord_id,
        discord_username,
        discord_avatar,
        email,
        created_at,
        updated_at
      `, { count: 'exact' })

    // Add search filter if provided
    if (search) {
      query = query.or(`discord_id.ilike.%${search}%,discord_username.ilike.%${search}%,email.ilike.%${search}%`)
    }

    // Add pagination and ordering
    const { data: profiles, count, error: profilesError } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1) as { data: ProfileRow[] | null; count: number | null; error: any }

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError)
      return NextResponse.json({ error: 'Failed to fetch members' }, { status: 500 })
    }

    if (!profiles || profiles.length === 0) {
      return NextResponse.json({
        members: [],
        total: 0,
        page,
        limit,
        totalPages: 0
      })
    }

    // Get discord IDs for fetching related data
    const discordIds = profiles.map(p => p.discord_id)

    // Fetch subscriptions for all these users
    const { data: subscriptions } = await supabase
      .from('subscriptions')
      .select('discord_id, tier, status, current_period_end')
      .in('discord_id', discordIds) as { data: SubscriptionRow[] | null; error: any }

    // Fetch feature flags for all these users
    const { data: featureFlags } = await supabase
      .from('feature_flags')
      .select('discord_id, premium_override, reason, expires_at')
      .in('discord_id', discordIds)
      .or('expires_at.is.null,expires_at.gt.now()') as { data: FeatureFlagRow[] | null; error: any }

    // Fetch quote counts for all users
    const { data: quoteCounts } = await supabase
      .from('quote_gallery')
      .select('discord_id')
      .in('discord_id', discordIds) as { data: QuoteRow[] | null; error: any }

    // Count quotes per user
    const quoteCountMap: Record<string, number> = {}
    quoteCounts?.forEach(q => {
      quoteCountMap[q.discord_id] = (quoteCountMap[q.discord_id] || 0) + 1
    })

    // Create lookup maps
    const subscriptionMap = new Map(subscriptions?.map(s => [s.discord_id, s]) || [])
    const flagsMap = new Map(featureFlags?.map(f => [f.discord_id, f]) || [])

    // Combine the data
    const members = profiles.map(profile => {
      const subscription = subscriptionMap.get(profile.discord_id)
      const flags = flagsMap.get(profile.discord_id)

      // Determine effective premium status
      let isPremium = false
      let premiumSource: 'subscription' | 'flag' | 'none' = 'none'

      if (flags?.premium_override === true) {
        isPremium = true
        premiumSource = 'flag'
      } else if (flags?.premium_override === false) {
        isPremium = false
        premiumSource = 'flag'
      } else if (subscription?.tier === 'premium' && subscription?.status === 'active') {
        isPremium = true
        premiumSource = 'subscription'
      }

      return {
        id: profile.id,
        discordId: profile.discord_id,
        discordUsername: profile.discord_username,
        discordAvatar: profile.discord_avatar,
        email: profile.email,
        createdAt: profile.created_at,
        updatedAt: profile.updated_at,
        subscription: subscription ? {
          tier: subscription.tier,
          status: subscription.status,
          currentPeriodEnd: subscription.current_period_end
        } : null,
        hasFeatureFlag: !!flags,
        featureFlag: flags ? {
          premiumOverride: flags.premium_override,
          reason: flags.reason,
          expiresAt: flags.expires_at
        } : null,
        isPremium,
        premiumSource,
        quoteCount: quoteCountMap[profile.discord_id] || 0
      }
    })

    return NextResponse.json({
      members,
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit)
    })
  } catch (error) {
    console.error('Error in members API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
