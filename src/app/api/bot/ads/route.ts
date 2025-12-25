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
  // Billing fields
  billing_type: 'free' | 'prepaid' | 'unlimited'
  budget_cents: number
  spent_cents: number
  cost_per_quote_cents: number
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
// This also charges the advertiser for the quote generation
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

    // Filter ads by date constraints AND budget availability
    const now = new Date()
    const activeAds = ads.filter(ad => {
      // Date constraints
      if (ad.start_date && new Date(ad.start_date) > now) return false
      if (ad.end_date && new Date(ad.end_date) <= now) return false

      // Budget constraints
      if (ad.billing_type === 'free' || ad.billing_type === 'unlimited') {
        return true // Always available
      }

      if (ad.billing_type === 'prepaid') {
        const remainingBudget = ad.budget_cents - ad.spent_cents
        return remainingBudget >= (ad.cost_per_quote_cents || 1)
      }

      return true // Default to available if no billing_type set yet
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

    // Charge the advertiser for this quote generation
    // Uses the database function which handles billing_type logic
    const { data: chargeResult, error: chargeError } = await (supabase as any)
      .rpc('charge_ad_for_quote', { ad_id: selectedAd.id })

    if (chargeError) {
      console.error('Error charging for ad:', chargeError)
      // Fall back to simple impression increment if charge function doesn't exist yet
      await (supabase as any)
        .from('ads')
        .update({ impressions: selectedAd.impressions + 1 })
        .eq('id', selectedAd.id)
    }

    // If charge failed (no budget), try to get another ad
    if (chargeResult === false) {
      console.log(`Ad ${selectedAd.id} has no budget, finding alternative`)
      // Remove this ad and try again with remaining ads
      const remainingAds = activeAds.filter(ad => ad.id !== selectedAd!.id)
      if (remainingAds.length > 0) {
        // Simple fallback: just pick the first remaining ad
        selectedAd = remainingAds[0]
        // Try to charge this one
        await (supabase as any).rpc('charge_ad_for_quote', { ad_id: selectedAd.id })
      } else {
        // No ads with budget available
        return NextResponse.json({
          text: '',
          shortText: '',
          enabled: false
        } as BotAdResponse)
      }
    }

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
