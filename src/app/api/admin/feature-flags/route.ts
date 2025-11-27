import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-server'
import {
  setFeatureFlags,
  removeFeatureFlags,
  listActiveFeatureFlags,
  getFeatureFlags
} from '@/lib/feature-flags'

// Simple admin key verification - use BOT_API_KEY or a separate ADMIN_API_KEY
function verifyAdminKey(request: Request): boolean {
  const authHeader = request.headers.get('Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false
  }

  const apiKey = authHeader.substring(7)

  // Check against admin key (falls back to BOT_API_KEY if ADMIN_API_KEY not set)
  const adminKey = process.env.ADMIN_API_KEY || process.env.BOT_API_KEY
  return adminKey ? apiKey === adminKey : false
}

// GET /api/admin/feature-flags - List all active feature flags
// GET /api/admin/feature-flags?discordId=123 - Get flags for specific user
export async function GET(request: Request) {
  if (!verifyAdminKey(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const discordId = searchParams.get('discordId')

    if (discordId) {
      // Get flags for specific user
      const flags = await getFeatureFlags(discordId)
      return NextResponse.json({
        discordId,
        flags: flags || null,
        hasFlags: flags !== null
      })
    }

    // List all active flags
    const flags = await listActiveFeatureFlags()
    return NextResponse.json({
      flags,
      count: flags.length
    })
  } catch (error) {
    console.error('Error fetching feature flags:', error)
    return NextResponse.json(
      { error: 'Failed to fetch feature flags' },
      { status: 500 }
    )
  }
}

// POST /api/admin/feature-flags - Create or update feature flags
export async function POST(request: Request) {
  if (!verifyAdminKey(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const {
      discordId,
      premiumOverride,
      overrideAnimatedGifs,
      overridePreview,
      overrideMultiMessage,
      overrideAvatarChoice,
      overridePresets,
      overrideNoWatermark,
      overrideMaxGallerySize,
      reason,
      createdBy,
      expiresAt
    } = body

    if (!discordId) {
      return NextResponse.json(
        { error: 'discordId is required' },
        { status: 400 }
      )
    }

    const result = await setFeatureFlags({
      discordId,
      premiumOverride,
      overrideAnimatedGifs,
      overridePreview,
      overrideMultiMessage,
      overrideAvatarChoice,
      overridePresets,
      overrideNoWatermark,
      overrideMaxGallerySize,
      reason,
      createdBy,
      expiresAt
    })

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `Feature flags set for Discord ID: ${discordId}`
    })
  } catch (error) {
    console.error('Error setting feature flags:', error)
    return NextResponse.json(
      { error: 'Failed to set feature flags' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/feature-flags?discordId=123 - Remove feature flags for a user
export async function DELETE(request: Request) {
  if (!verifyAdminKey(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const discordId = searchParams.get('discordId')

    if (!discordId) {
      return NextResponse.json(
        { error: 'discordId query parameter is required' },
        { status: 400 }
      )
    }

    const result = await removeFeatureFlags(discordId)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `Feature flags removed for Discord ID: ${discordId}`
    })
  } catch (error) {
    console.error('Error removing feature flags:', error)
    return NextResponse.json(
      { error: 'Failed to remove feature flags' },
      { status: 500 }
    )
  }
}
