import { NextResponse } from 'next/server'
import { createRouteClient, createServiceClient } from '@/lib/supabase-server'

interface QuotedUserStats {
  quoted_user_id: string
  quoted_user_name: string | null
  quoted_user_avatar: string | null
  quote_count: number
  latest_quote_at: string
}

// GET /api/gallery/quoted-users - Get list of quoted users with stats
export async function GET(request: Request) {
  try {
    const supabase = await createRouteClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's discord_id
    const { data: profile } = await supabase
      .from('profiles')
      .select('discord_id')
      .eq('id', user.id)
      .single() as { data: { discord_id: string } | null }

    if (!profile?.discord_id) {
      return NextResponse.json({ quotedUsers: [] })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const limit = parseInt(searchParams.get('limit') || '50')

    const serviceClient = createServiceClient()

    // Get unique quoted users with counts, sorted by most quoted
    // Using raw SQL for aggregation
    let query = serviceClient
      .from('quote_gallery')
      .select('quoted_user_id, quoted_user_name, quoted_user_avatar, created_at')
      .eq('discord_id', profile.discord_id)
      .not('quoted_user_id', 'is', null)

    if (search) {
      query = query.ilike('quoted_user_name', `%${search}%`)
    }

    const { data: quotes, error } = await query

    if (error) {
      console.error('[QuotedUsers API] Error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch quoted users' },
        { status: 500 }
      )
    }

    // Aggregate in memory (more flexible than SQL for this use case)
    const userMap = new Map<string, QuotedUserStats>()

    for (const quote of quotes || []) {
      if (!quote.quoted_user_id) continue

      const existing = userMap.get(quote.quoted_user_id)
      if (existing) {
        existing.quote_count++
        if (quote.created_at > existing.latest_quote_at) {
          existing.latest_quote_at = quote.created_at
          // Update name/avatar to latest in case they changed
          if (quote.quoted_user_name) existing.quoted_user_name = quote.quoted_user_name
          if (quote.quoted_user_avatar) existing.quoted_user_avatar = quote.quoted_user_avatar
        }
      } else {
        userMap.set(quote.quoted_user_id, {
          quoted_user_id: quote.quoted_user_id,
          quoted_user_name: quote.quoted_user_name,
          quoted_user_avatar: quote.quoted_user_avatar,
          quote_count: 1,
          latest_quote_at: quote.created_at
        })
      }
    }

    // Sort by quote count (descending), then by latest quote
    const quotedUsers = Array.from(userMap.values())
      .sort((a, b) => {
        if (b.quote_count !== a.quote_count) {
          return b.quote_count - a.quote_count
        }
        return new Date(b.latest_quote_at).getTime() - new Date(a.latest_quote_at).getTime()
      })
      .slice(0, limit)

    return NextResponse.json({
      quotedUsers,
      total: userMap.size
    })
  } catch (error) {
    console.error('[QuotedUsers API] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch quoted users' },
      { status: 500 }
    )
  }
}
