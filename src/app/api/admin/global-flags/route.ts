import { NextResponse } from 'next/server'
import { getGlobalFeatureFlags, setGlobalFeatureFlags, resetGlobalFeatureFlags } from '@/lib/admin'

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

// GET /api/admin/global-flags - Get current global feature flags
export async function GET(request: Request) {
  if (!verifyAdminKey(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const globalFlags = await getGlobalFeatureFlags()
    return NextResponse.json({ globalFlags })
  } catch (error) {
    console.error('Error fetching global feature flags:', error)
    return NextResponse.json(
      { error: 'Failed to fetch global feature flags' },
      { status: 500 }
    )
  }
}

// POST /api/admin/global-flags - Update global feature flags
export async function POST(request: Request) {
  if (!verifyAdminKey(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const {
      globalPremiumOverride,
      globalAnimatedGifs,
      globalPreview,
      globalMultiMessage,
      globalAvatarChoice,
      globalPresets,
      globalNoWatermark,
      globalMaxGallerySize,
      reason,
      updatedBy
    } = body

    const result = await setGlobalFeatureFlags({
      globalPremiumOverride,
      globalAnimatedGifs,
      globalPreview,
      globalMultiMessage,
      globalAvatarChoice,
      globalPresets,
      globalNoWatermark,
      globalMaxGallerySize,
      reason,
      updatedBy
    })

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Global feature flags updated successfully'
    })
  } catch (error) {
    console.error('Error updating global feature flags:', error)
    return NextResponse.json(
      { error: 'Failed to update global feature flags' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/global-flags - Reset global feature flags to defaults
export async function DELETE(request: Request) {
  if (!verifyAdminKey(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const updatedBy = searchParams.get('updatedBy')

    const result = await resetGlobalFeatureFlags(updatedBy || undefined)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Global feature flags reset to defaults'
    })
  } catch (error) {
    console.error('Error resetting global feature flags:', error)
    return NextResponse.json(
      { error: 'Failed to reset global feature flags' },
      { status: 500 }
    )
  }
}
