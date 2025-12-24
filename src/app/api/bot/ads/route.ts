import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-server'
import { verifyBotApiKey } from '@/lib/bot-auth'
import type { BotAdResponse } from '@/types/ads'

// Database row type for ads table
interface AdRow {
  id: string
  text: string
  short_text: string
  name: string | null
  description: string | null
  url: string | null
  enabled: boolean
  is_active: boolean
  priority: number
  start_date: string | null
  end_date: string | null
  target_guilds: string[] | null
  impressions: number
  created_by: string | null
  updated_by: string | null
  created_at: string
  updated_at: string
}

// GET /api/bot/ads - Get the current active ad for the bot
export async function GET(request: Request) {
  // Verify bot API key
  if (!await verifyBotApiKey(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const supabase = createServiceClient()

    // Get the active ad directly from the table
    const { data: ads, error } = await (supabase as any)
      .from('ads')
      .select('*')
      .eq('enabled', true)
      .eq('is_active', true)
      .order('priority', { ascending: false })
      .limit(1) as { data: AdRow[] | null; error: any }

    if (error) {
      console.error('Error fetching active ad:', error)
      // Return disabled if we can't fetch
      return NextResponse.json({
        text: '',
        shortText: '',
        enabled: false
      } as BotAdResponse)
    }

    if (!ads || ads.length === 0) {
      // No active ads configured
      return NextResponse.json({
        text: '',
        shortText: '',
        enabled: false
      } as BotAdResponse)
    }

    const ad = ads[0]

    // Check date constraints
    const now = new Date()
    if (ad.start_date && new Date(ad.start_date) > now) {
      return NextResponse.json({
        text: '',
        shortText: '',
        enabled: false
      } as BotAdResponse)
    }
    if (ad.end_date && new Date(ad.end_date) <= now) {
      return NextResponse.json({
        text: '',
        shortText: '',
        enabled: false
      } as BotAdResponse)
    }

    // Increment impressions (fire and forget)
    ;(supabase as any)
      .from('ads')
      .update({ impressions: ad.impressions + 1 })
      .eq('id', ad.id)
      .then(() => {})

    const response: BotAdResponse = {
      text: ad.text,
      shortText: ad.short_text,
      enabled: ad.enabled,
      ...(ad.description && { description: ad.description }),
      ...(ad.url && { url: ad.url })
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error in GET /api/bot/ads:', error)
    // Return disabled ad config on error so bot continues working
    return NextResponse.json({
      text: '',
      shortText: '',
      enabled: false
    } as BotAdResponse)
  }
}
