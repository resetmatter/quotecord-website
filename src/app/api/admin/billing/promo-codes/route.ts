import { NextResponse } from 'next/server'
import {
  listStripePromotionCodes,
  createStripePromotionCode,
  deactivateStripePromotionCode,
  trackCouponCreation
} from '@/lib/billing'

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

// GET /api/admin/billing/promo-codes - List all promotion codes
export async function GET(request: Request) {
  if (!verifyAdminKey(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const promoCodes = await listStripePromotionCodes()
    return NextResponse.json({
      promoCodes,
      count: promoCodes.length
    })
  } catch (error) {
    console.error('Error fetching promotion codes:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch promotion codes' },
      { status: 500 }
    )
  }
}

// POST /api/admin/billing/promo-codes - Create a new promotion code
export async function POST(request: Request) {
  if (!verifyAdminKey(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const {
      couponId,
      code,
      maxRedemptions,
      expiresAt,
      metadata,
      // Admin tracking fields
      purpose,
      createdFor,
      createdBy
    } = body

    if (!couponId) {
      return NextResponse.json(
        { error: 'Coupon ID is required' },
        { status: 400 }
      )
    }

    if (!code) {
      return NextResponse.json(
        { error: 'Promotion code is required' },
        { status: 400 }
      )
    }

    const result = await createStripePromotionCode({
      couponId,
      code,
      maxRedemptions,
      expiresAt,
      metadata
    })

    if (!result.success || !result.promotionCode) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    // Track in our database
    await trackCouponCreation({
      stripeCouponId: couponId,
      stripePromoCodeId: result.promotionCode.id,
      code: result.promotionCode.code,
      purpose,
      createdFor,
      createdBy
    })

    return NextResponse.json({
      success: true,
      promotionCode: result.promotionCode
    })
  } catch (error) {
    console.error('Error creating promotion code:', error)
    return NextResponse.json(
      { error: 'Failed to create promotion code' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/billing/promo-codes?id=xxx - Deactivate a promotion code
export async function DELETE(request: Request) {
  if (!verifyAdminKey(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const promoCodeId = searchParams.get('id')

    if (!promoCodeId) {
      return NextResponse.json(
        { error: 'Promotion code ID is required' },
        { status: 400 }
      )
    }

    const result = await deactivateStripePromotionCode(promoCodeId)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: `Promotion code ${promoCodeId} deactivated successfully`
    })
  } catch (error) {
    console.error('Error deactivating promotion code:', error)
    return NextResponse.json(
      { error: 'Failed to deactivate promotion code' },
      { status: 500 }
    )
  }
}
