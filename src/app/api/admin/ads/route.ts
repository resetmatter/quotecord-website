import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-server'
import type { Ad, CreateAdRequest, UpdateAdRequest } from '@/types/ads'

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

// Simple admin key verification
function verifyAdminKey(request: Request): boolean {
  const authHeader = request.headers.get('Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false
  }

  const apiKey = authHeader.substring(7)
  const adminKey = process.env.ADMIN_API_KEY || process.env.BOT_API_KEY
  return adminKey ? apiKey === adminKey : false
}

// Helper to transform database row to Ad type
function dbRowToAd(row: AdRow): Ad {
  return {
    id: row.id,
    text: row.text,
    shortText: row.short_text,
    name: row.name,
    description: row.description,
    url: row.url,
    enabled: row.enabled,
    isActive: row.is_active,
    priority: row.priority,
    startDate: row.start_date,
    endDate: row.end_date,
    targetGuilds: row.target_guilds,
    impressions: row.impressions,
    createdBy: row.created_by,
    updatedBy: row.updated_by,
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
      .order('is_active', { ascending: false })
      .order('priority', { ascending: false })
      .order('created_at', { ascending: false }) as { data: AdRow[] | null; error: any }

    if (error) {
      console.error('Error fetching ads:', error)
      return NextResponse.json({ error: 'Failed to fetch ads' }, { status: 500 })
    }

    return NextResponse.json({
      ads: (ads || []).map(dbRowToAd)
    })
  } catch (error) {
    console.error('Error in GET /api/admin/ads:', error)
    return NextResponse.json({ error: 'Failed to fetch ads' }, { status: 500 })
  }
}

// POST /api/admin/ads - Create a new ad
export async function POST(request: Request) {
  if (!verifyAdminKey(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body: CreateAdRequest = await request.json()

    if (!body.text || !body.shortText) {
      return NextResponse.json(
        { error: 'text and shortText are required' },
        { status: 400 }
      )
    }

    const supabase = createServiceClient()

    // If this ad is being set as active, deactivate all other ads first
    if (body.isActive) {
      await (supabase as any)
        .from('ads')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq('is_active', true)
    }

    const { data: ad, error } = await (supabase as any)
      .from('ads')
      .insert({
        text: body.text,
        short_text: body.shortText,
        name: body.name || null,
        description: body.description || null,
        url: body.url || null,
        enabled: body.enabled ?? true,
        is_active: body.isActive ?? false,
        priority: body.priority ?? 0,
        start_date: body.startDate || null,
        end_date: body.endDate || null,
        target_guilds: body.targetGuilds || null,
        created_by: body.createdBy || 'admin'
      })
      .select()
      .single() as { data: AdRow | null; error: any }

    if (error) {
      console.error('Error creating ad:', error)
      return NextResponse.json({ error: 'Failed to create ad' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      ad: ad ? dbRowToAd(ad) : null
    })
  } catch (error) {
    console.error('Error in POST /api/admin/ads:', error)
    return NextResponse.json({ error: 'Failed to create ad' }, { status: 500 })
  }
}

// PATCH /api/admin/ads - Update an existing ad
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

    const body: UpdateAdRequest = await request.json()
    const supabase = createServiceClient()

    // If this ad is being set as active, deactivate all other ads first
    if (body.isActive) {
      await (supabase as any)
        .from('ads')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .neq('id', id)
        .eq('is_active', true)
    }

    // Build update object
    const updates: Record<string, any> = {
      updated_at: new Date().toISOString()
    }

    if (body.text !== undefined) updates.text = body.text
    if (body.shortText !== undefined) updates.short_text = body.shortText
    if (body.name !== undefined) updates.name = body.name
    if (body.description !== undefined) updates.description = body.description
    if (body.url !== undefined) updates.url = body.url
    if (body.enabled !== undefined) updates.enabled = body.enabled
    if (body.isActive !== undefined) updates.is_active = body.isActive
    if (body.priority !== undefined) updates.priority = body.priority
    if (body.startDate !== undefined) updates.start_date = body.startDate
    if (body.endDate !== undefined) updates.end_date = body.endDate
    if (body.targetGuilds !== undefined) updates.target_guilds = body.targetGuilds
    if (body.updatedBy !== undefined) updates.updated_by = body.updatedBy

    const { data: ad, error } = await (supabase as any)
      .from('ads')
      .update(updates)
      .eq('id', id)
      .select()
      .single() as { data: AdRow | null; error: any }

    if (error) {
      console.error('Error updating ad:', error)
      return NextResponse.json({ error: 'Failed to update ad' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      ad: ad ? dbRowToAd(ad) : null
    })
  } catch (error) {
    console.error('Error in PATCH /api/admin/ads:', error)
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
      console.error('Error deleting ad:', error)
      return NextResponse.json({ error: 'Failed to delete ad' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Ad deleted successfully'
    })
  } catch (error) {
    console.error('Error in DELETE /api/admin/ads:', error)
    return NextResponse.json({ error: 'Failed to delete ad' }, { status: 500 })
  }
}
