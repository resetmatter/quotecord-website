import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-server'
import type { Ad } from '@/types/ads'

interface AdRow {
  id: string
  text: string
  short_text: string
  name: string | null
  enabled: boolean
  weight: number
  created_at: string
  updated_at: string
}

function verifyAdminKey(request: Request): boolean {
  const authHeader = request.headers.get('Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) return false
  const apiKey = authHeader.substring(7)
  const adminKey = process.env.ADMIN_API_KEY || process.env.BOT_API_KEY
  return adminKey ? apiKey === adminKey : false
}

function dbRowToAd(row: AdRow): Ad {
  return {
    id: row.id,
    text: row.text,
    shortText: row.short_text,
    name: row.name,
    enabled: row.enabled,
    weight: row.weight || 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }
}

// GET /api/admin/ads - Get all ads
export async function GET(request: Request) {
  if (!verifyAdminKey(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const supabase = createServiceClient()

    const { data: ads, error } = await (supabase as any)
      .from('ads')
      .select('*')
      .order('enabled', { ascending: false })
      .order('weight', { ascending: false })
      .order('created_at', { ascending: false }) as { data: AdRow[] | null; error: any }

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch ads' }, { status: 500 })
    }

    return NextResponse.json({ ads: (ads || []).map(dbRowToAd) })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch ads' }, { status: 500 })
  }
}

// POST /api/admin/ads - Create a new ad
export async function POST(request: Request) {
  if (!verifyAdminKey(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()

    if (!body.text || !body.shortText) {
      return NextResponse.json({ error: 'text and shortText are required' }, { status: 400 })
    }

    const supabase = createServiceClient()

    const { data: ad, error } = await (supabase as any)
      .from('ads')
      .insert({
        text: body.text,
        short_text: body.shortText,
        name: body.name || null,
        enabled: body.enabled ?? false,
        weight: body.weight ?? 1
      })
      .select()
      .single() as { data: AdRow | null; error: any }

    if (error) {
      return NextResponse.json({ error: 'Failed to create ad' }, { status: 500 })
    }

    return NextResponse.json({ success: true, ad: ad ? dbRowToAd(ad) : null })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create ad' }, { status: 500 })
  }
}

// PATCH /api/admin/ads - Update an ad
export async function PATCH(request: Request) {
  if (!verifyAdminKey(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const url = new URL(request.url)
    const id = url.searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 })
    }

    const body = await request.json()
    const supabase = createServiceClient()

    const updates: Record<string, any> = { updated_at: new Date().toISOString() }
    if (body.text !== undefined) updates.text = body.text
    if (body.shortText !== undefined) updates.short_text = body.shortText
    if (body.name !== undefined) updates.name = body.name
    if (body.enabled !== undefined) updates.enabled = body.enabled
    if (body.weight !== undefined) updates.weight = body.weight

    const { data: ad, error } = await (supabase as any)
      .from('ads')
      .update(updates)
      .eq('id', id)
      .select()
      .single() as { data: AdRow | null; error: any }

    if (error) {
      return NextResponse.json({ error: 'Failed to update ad' }, { status: 500 })
    }

    return NextResponse.json({ success: true, ad: ad ? dbRowToAd(ad) : null })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update ad' }, { status: 500 })
  }
}

// DELETE /api/admin/ads - Delete an ad
export async function DELETE(request: Request) {
  if (!verifyAdminKey(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const url = new URL(request.url)
    const id = url.searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 })
    }

    const supabase = createServiceClient()

    const { error } = await (supabase as any)
      .from('ads')
      .delete()
      .eq('id', id)

    if (error) {
      return NextResponse.json({ error: 'Failed to delete ad' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete ad' }, { status: 500 })
  }
}
