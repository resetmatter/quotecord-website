import { NextResponse } from 'next/server'
import {
  listStripeCoupons,
  createStripeCoupon,
  deleteStripeCoupon,
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

// GET /api/admin/billing/coupons - List all Stripe coupons
export async function GET(request: Request) {
  if (!verifyAdminKey(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const coupons = await listStripeCoupons()
    return NextResponse.json({
      coupons,
      count: coupons.length
    })
  } catch (error) {
    console.error('Error fetching coupons:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch coupons' },
      { status: 500 }
    )
  }
}

// POST /api/admin/billing/coupons - Create a new coupon
export async function POST(request: Request) {
  if (!verifyAdminKey(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const {
      name,
      amountOff,
      percentOff,
      currency,
      duration,
      durationInMonths,
      maxRedemptions,
      redeemBy,
      metadata,
      // Admin tracking fields
      purpose,
      createdFor,
      createdBy
    } = body

    if (!name) {
      return NextResponse.json(
        { error: 'Coupon name is required' },
        { status: 400 }
      )
    }

    if (!amountOff && !percentOff) {
      return NextResponse.json(
        { error: 'Either amountOff or percentOff is required' },
        { status: 400 }
      )
    }

    if (!duration) {
      return NextResponse.json(
        { error: 'Duration is required' },
        { status: 400 }
      )
    }

    const result = await createStripeCoupon({
      name,
      amountOff,
      percentOff,
      currency,
      duration,
      durationInMonths,
      maxRedemptions,
      redeemBy,
      metadata
    })

    if (!result.success || !result.coupon) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    // Track the coupon creation in our database
    await trackCouponCreation({
      stripeCouponId: result.coupon.id,
      purpose,
      createdFor,
      createdBy
    })

    return NextResponse.json({
      success: true,
      coupon: result.coupon
    })
  } catch (error) {
    console.error('Error creating coupon:', error)
    return NextResponse.json(
      { error: 'Failed to create coupon' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/billing/coupons?id=xxx - Delete a coupon
export async function DELETE(request: Request) {
  if (!verifyAdminKey(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const couponId = searchParams.get('id')

    if (!couponId) {
      return NextResponse.json(
        { error: 'Coupon ID is required' },
        { status: 400 }
      )
    }

    const result = await deleteStripeCoupon(couponId)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: `Coupon ${couponId} deleted successfully`
    })
  } catch (error) {
    console.error('Error deleting coupon:', error)
    return NextResponse.json(
      { error: 'Failed to delete coupon' },
      { status: 500 }
    )
  }
}
