import { NextResponse } from 'next/server'
import { getBillingSettings, updateBillingSettings } from '@/lib/billing'

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

// GET /api/admin/billing/settings - Get current billing settings
export async function GET(request: Request) {
  if (!verifyAdminKey(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const settings = await getBillingSettings()
    return NextResponse.json({ settings })
  } catch (error) {
    console.error('Error fetching billing settings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch billing settings' },
      { status: 500 }
    )
  }
}

// POST /api/admin/billing/settings - Update billing settings
export async function POST(request: Request) {
  if (!verifyAdminKey(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const {
      monthlyPriceId,
      annualPriceId,
      monthlyPriceAmount,
      annualPriceAmount,
      currency,
      allowPromotionCodes,
      updatedBy
    } = body

    const result = await updateBillingSettings({
      monthlyPriceId,
      annualPriceId,
      monthlyPriceAmount,
      annualPriceAmount,
      currency,
      allowPromotionCodes,
      updatedBy
    })

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Billing settings updated successfully'
    })
  } catch (error) {
    console.error('Error updating billing settings:', error)
    return NextResponse.json(
      { error: 'Failed to update billing settings' },
      { status: 500 }
    )
  }
}
