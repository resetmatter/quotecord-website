import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

// GET /api/gallery - Get user's meme gallery
export async function GET(request: Request) {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get query parameters for pagination and filtering
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const template = searchParams.get('template')
    const animated = searchParams.get('animated')

    const offset = (page - 1) * limit

    // Build query
    let query = supabase
      .from('meme_gallery')
      .select('*', { count: 'exact' })
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    // Apply filters
    if (template) {
      query = query.eq('template', template)
    }
    if (animated !== null && animated !== undefined) {
      query = query.eq('animated', animated === 'true')
    }

    const { data: memes, count, error } = await query

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
      .eq('user_id', session.user.id)
      .single()

    const isPremium = subscription?.tier === 'premium'
    const maxMemes = isPremium ? 1000 : 50

    return NextResponse.json({
      memes: memes || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      },
      quota: {
        used: count || 0,
        max: maxMemes,
        remaining: maxMemes - (count || 0)
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
