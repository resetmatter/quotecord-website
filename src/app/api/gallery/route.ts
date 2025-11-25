import { NextResponse } from 'next/server'
import { createRouteClient } from '@/lib/supabase-server'

// GET /api/gallery - Get user's quote gallery
export async function GET(request: Request) {
  try {
    console.log('[Gallery API] Starting request')
    const supabase = await createRouteClient()

    const { data: { user }, error: userError } = await supabase.auth.getUser()
    console.log(`[Gallery API] User: ${user?.id || 'null'}, Error: ${userError?.message || 'none'}`)

    if (!user) {
      console.log('[Gallery API] No user found, returning 401')
      return NextResponse.json({ error: 'Unauthorized', debug: userError?.message }, { status: 401 })
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

    // Build query
    let query = supabase
      .from('quote_gallery')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
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
      // Search in quote text and author names
      query = query.or(`quote_text.ilike.%${search}%,quoted_user_name.ilike.%${search}%,author_name.ilike.%${search}%`)
    }

    const { data: quotes, count, error } = await query

    if (error) {
      console.error('Gallery fetch error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch gallery' },
        { status: 500 }
      )
    }

    // Get user's subscription for quota info
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('tier')
      .eq('user_id', user.id)
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
      }
    })
  } catch (error) {
    console.error('Gallery fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch gallery' },
      { status: 500 }
    )
  }
}
