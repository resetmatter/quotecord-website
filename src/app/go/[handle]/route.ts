import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-server'
import { createHash } from 'crypto'

// Database row type for ads
interface AdRow {
  id: string
  destination_url: string | null
  name: string | null
  enabled: boolean
}

// GET /go/[handle] - Redirect to advertiser URL and track click
export async function GET(
  request: NextRequest,
  { params }: { params: { handle: string } }
) {
  const { handle } = params

  try {
    const supabase = createServiceClient()

    // Look up the ad by handle
    const { data: ad, error } = await (supabase as any)
      .from('ads')
      .select('id, destination_url, name, enabled')
      .eq('handle', handle.toLowerCase())
      .single() as { data: AdRow | null; error: any }

    if (error || !ad) {
      // Handle not found - redirect to homepage
      return NextResponse.redirect(new URL('/', request.url))
    }

    if (!ad.enabled || !ad.destination_url) {
      // Ad is disabled or has no destination - redirect to homepage
      return NextResponse.redirect(new URL('/', request.url))
    }

    // Get tracking info
    const referrer = request.headers.get('referer') || null
    const userAgent = request.headers.get('user-agent') || null

    // Hash the IP for privacy (we don't store raw IPs)
    const forwardedFor = request.headers.get('x-forwarded-for')
    const ip = forwardedFor ? forwardedFor.split(',')[0].trim() : request.ip || 'unknown'
    const ipHash = createHash('sha256').update(ip + process.env.SUPABASE_SERVICE_ROLE_KEY).digest('hex').substring(0, 16)

    // Record the click (fire and forget)
    ;(supabase as any)
      .from('ads')
      .update({ clicks: ad.id }) // This will be handled by RPC
      .eq('id', ad.id)

    // Record detailed click and increment counter
    await (supabase as any).rpc('record_ad_click', {
      ad_id: ad.id,
      click_referrer: referrer,
      click_user_agent: userAgent,
      click_ip_hash: ipHash
    }).catch((err: any) => {
      console.error('Failed to record click:', err)
      // Still redirect even if tracking fails
    })

    // Redirect to the destination URL
    return NextResponse.redirect(ad.destination_url)
  } catch (error) {
    console.error('Error in ad redirect:', error)
    // On error, redirect to homepage
    return NextResponse.redirect(new URL('/', request.url))
  }
}
