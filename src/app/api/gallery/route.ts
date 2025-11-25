import { NextResponse } from 'next/server'
import { createRouteClient, createServiceClient } from '@/lib/supabase-server'

// GET /api/gallery - Get user's quote gallery
export async function GET(request: Request) {
  try {
    console.log('[Gallery API] Starting request')
    const supabase = await createRouteClient()

    const { data: { user }, error: userError } = await supabase.auth.getUser()
    console.log(`[Gallery API] Auth User ID: ${user?.id || 'null'}, Error: ${userError?.message || 'none'}`)

    if (!user) {
      console.log('[Gallery API] No user found, returning 401')
      return NextResponse.json({ error: 'Unauthorized', debug: userError?.message }, { status: 401 })
    }

    // Get user's profile to find their discord_id and info
    const { data: profile } = await supabase
      .from('profiles')
      .select('discord_id, discord_username, discord_avatar')
      .eq('id', user.id)
      .single() as { data: { discord_id: string; discord_username: string | null; discord_avatar: string | null } | null }

    console.log(`[Gallery API] Profile discord_id: ${profile?.discord_id || 'null'}`)

    if (!profile?.discord_id) {
      console.log('[Gallery API] No discord_id found in profile')
      return NextResponse.json({
        quotes: [],
        pagination: { page: 1, limit: 12, total: 0, totalPages: 0 },
        quota: { used: 0, max: 50, remaining: 50 },
        debug: 'No discord_id in profile'
      })
    }

    // Get query parameters for pagination and filtering
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const template = searchParams.get('template')
    const animated = searchParams.get('animated')
    const quotedUserId = searchParams.get('quotedUserId')
    const search = searchParams.get('search')

    const offset = (page - 1) * limit

    // Use service client to bypass RLS for querying
    // This handles quotes created before user logged in (user_id was null)
    const serviceClient = createServiceClient()

    // Debug: Check what's in the database
    const { data: allQuotesDebug, count: totalInDb } = await serviceClient
      .from('quote_gallery')
      .select('id, user_id, discord_id', { count: 'exact' })
      .limit(5)

    console.log(`[Gallery API] Total quotes in DB: ${totalInDb}`)
    console.log(`[Gallery API] Sample quotes:`, JSON.stringify(allQuotesDebug))

    // Query quotes by discord_id (most reliable since bot always has this)
    let query = serviceClient
      .from('quote_gallery')
      .select('*', { count: 'exact' })
      .eq('discord_id', profile.discord_id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    // Apply filters
    if (template) {
      query = query.eq('template', template)
    }
    if (animated !== null && animated !== undefined) {
      query = query.eq('animated', animated === 'true')
    }
    if (quotedUserId) {
      query = query.eq('quoted_user_id', quotedUserId)
    }
    if (search) {
      query = query.or(`quote_text.ilike.%${search}%,quoted_user_name.ilike.%${search}%,author_name.ilike.%${search}%`)
    }

    const { data: quotes, count, error } = await query

    if (error) {
      console.error('[Gallery API] Query error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch gallery', debug: error.message },
        { status: 500 }
      )
    }

    console.log(`[Gallery API] Found ${count} quotes for discord_id ${profile.discord_id}`)

    // Get user's subscription for quota info
    const { data: subscription } = await serviceClient
      .from('subscriptions')
      .select('tier')
      .eq('discord_id', profile.discord_id)
      .single() as { data: { tier: string } | null }

    const isPremium = subscription?.tier === 'premium'
    const maxQuotes = isPremium ? 1000 : 50

    return NextResponse.json({
      quotes: quotes || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      },
      quota: {
        used: count || 0,
        max: maxQuotes,
        remaining: maxQuotes - (count || 0)
      },
      // Include user profile for fallback when quoter info is missing
      userProfile: {
        discordId: profile.discord_id,
        username: profile.discord_username,
        avatar: profile.discord_avatar
      }
    })
  } catch (error) {
    console.error('[Gallery API] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch gallery' },
      { status: 500 }
    )
  }
}
