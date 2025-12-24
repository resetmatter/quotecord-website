import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-server'
import { verifyBotApiKey } from '@/lib/bot-auth'

// Database row type for ads table
interface AdRow {
  id: string
  text: string
  short_text: string
  name: string | null
  description: string | null
  handle: string | null
  destination_url: string | null
  enabled: boolean
  weight: number
  start_date: string | null
  end_date: string | null
  impressions: number
}

// Response type for the bot
interface BotAdResponse {
  text: string
  shortText: string
  enabled: boolean
  description?: string
  handle?: string
  url?: string // The tracking URL (quotecord.com/go/handle)
}

// GET /api/bot/ads - Get a random ad from all enabled ads (weighted selection)
export async function GET(request: Request) {
  // Verify bot API key
  if (!await verifyBotApiKey(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const supabase = createServiceClient()

    // Get all enabled ads within their date range
    const { data: ads, error } = await (supabase as any)
      .from('ads')
      .select('*')
      .eq('enabled', true)
      .order('weight', { ascending: false }) as { data: AdRow[] | null; error: any }

    if (error) {
      console.error('Error fetching ads:', error)
      return NextResponse.json({
        text: '',
        shortText: '',
        enabled: false
      } as BotAdResponse)
    }

    if (!ads || ads.length === 0) {
      return NextResponse.json({
        text: '',
        shortText: '',
        enabled: false
      } as BotAdResponse)
    }

    // Filter ads by date constraints
    const now = new Date()
    const activeAds = ads.filter(ad => {
      if (ad.start_date && new Date(ad.start_date) > now) return false
      if (ad.end_date && new Date(ad.end_date) <= now) return false
      return true
    })

    if (activeAds.length === 0) {
      return NextResponse.json({
        text: '',
        shortText: '',
        enabled: false
      } as BotAdResponse)
    }

    // Weighted random selection
    const totalWeight = activeAds.reduce((sum, ad) => sum + (ad.weight || 1), 0)
    let randomValue = Math.random() * totalWeight
    let selectedAd: AdRow | null = null

    for (const ad of activeAds) {
      randomValue -= (ad.weight || 1)
      if (randomValue <= 0) {
        selectedAd = ad
        break
      }
    }

    // Fallback to first ad if something went wrong
    if (!selectedAd) {
      selectedAd = activeAds[0]
    }

    // Increment impressions (fire and forget)
    ;(supabase as any)
      .from('ads')
      .update({ impressions: selectedAd.impressions + 1 })
      .eq('id', selectedAd.id)
      .then(() => {})

    // Build the tracking URL if handle exists
    const trackingUrl = selectedAd.handle
      ? `https://quotecord.com/go/${selectedAd.handle}`
      : selectedAd.destination_url || undefined

    const response: BotAdResponse = {
      text: selectedAd.text,
      shortText: selectedAd.short_text,
      enabled: selectedAd.enabled,
      ...(selectedAd.description && { description: selectedAd.description }),
      ...(selectedAd.handle && { handle: selectedAd.handle }),
      ...(trackingUrl && { url: trackingUrl })
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error in GET /api/bot/ads:', error)
    return NextResponse.json({
      text: '',
      shortText: '',
      enabled: false
    } as BotAdResponse)
  }
}
