import { NextResponse } from 'next/server'
import { getCheckoutSettings } from '@/lib/billing'

// GET /api/billing/checkout-settings - Get checkout settings
// Query params:
//   - promoCode: optional promo code to check for trial days
//   - plan: 'monthly' or 'annual' to filter trial rules
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const promoCode = searchParams.get('promoCode') || undefined
    const plan = searchParams.get('plan') as 'monthly' | 'annual' | undefined

    const settings = await getCheckoutSettings(promoCode, plan)

    return NextResponse.json({ settings })
  } catch (error) {
    console.error('Error fetching checkout settings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch checkout settings' },
      { status: 500 }
    )
  }
}
