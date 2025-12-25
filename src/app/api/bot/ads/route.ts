import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-server'
import { verifyBotApiKey } from '@/lib/bot-auth'

interface BotAdResponse {
  text: string
  shortText: string
  enabled: boolean
}

// GET /api/bot/ads - Get the currently active ad
export async function GET(request: Request) {
  if (!await verifyBotApiKey(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const supabase = createServiceClient()

    // Get the active ad
    const { data: ad, error } = await (supabase as any)
      .from('ads')
      .select('text, short_text, enabled')
      .eq('enabled', true)
      .eq('is_active', true)
      .single()

    if (error || !ad) {
      return NextResponse.json({
        text: '',
        shortText: '',
        enabled: false
      } as BotAdResponse)
    }

    return NextResponse.json({
      text: ad.text,
      shortText: ad.short_text,
      enabled: ad.enabled
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
