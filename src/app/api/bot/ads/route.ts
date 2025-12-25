import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-server'
import { verifyBotApiKey } from '@/lib/bot-auth'

interface AdRow {
  id: string
  text: string
  short_text: string
  enabled: boolean
  weight: number
}

interface BotAdResponse {
  text: string
  shortText: string
  enabled: boolean
}

// GET /api/bot/ads - Get a random ad from enabled ads (weighted by priority)
export async function GET(request: Request) {
  if (!await verifyBotApiKey(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const supabase = createServiceClient()

    // Get all enabled ads
    const { data: ads, error } = await (supabase as any)
      .from('ads')
      .select('id, text, short_text, enabled, weight')
      .eq('enabled', true) as { data: AdRow[] | null; error: any }

    if (error || !ads || ads.length === 0) {
      return NextResponse.json({
        text: '',
        shortText: '',
        enabled: false
      } as BotAdResponse)
    }

    // If only one ad, return it
    if (ads.length === 1) {
      return NextResponse.json({
        text: ads[0].text,
        shortText: ads[0].short_text,
        enabled: true
      } as BotAdResponse)
    }

    // Weighted random selection
    const totalWeight = ads.reduce((sum, ad) => sum + (ad.weight || 1), 0)
    let random = Math.random() * totalWeight
    let selectedAd = ads[0]

    for (const ad of ads) {
      random -= (ad.weight || 1)
      if (random <= 0) {
        selectedAd = ad
        break
      }
    }

    return NextResponse.json({
      text: selectedAd.text,
      shortText: selectedAd.short_text,
      enabled: true
    } as BotAdResponse)
  } catch (error) {
    console.error('Error in GET /api/bot/ads:', error)
    return NextResponse.json({
      text: '',
      shortText: '',
      enabled: false
    } as BotAdResponse)
  }
}
