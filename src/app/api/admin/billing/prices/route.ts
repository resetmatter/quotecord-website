import { NextResponse } from 'next/server'
import { listStripePrices, getStripePrice } from '@/lib/billing'

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

// GET /api/admin/billing/prices - List all Stripe prices
// GET /api/admin/billing/prices?id=price_xxx - Get specific price
export async function GET(request: Request) {
  if (!verifyAdminKey(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const priceId = searchParams.get('id')

    if (priceId) {
      const price = await getStripePrice(priceId)
      if (!price) {
        return NextResponse.json({ error: 'Price not found' }, { status: 404 })
      }
      return NextResponse.json({ price })
    }

    const prices = await listStripePrices()
    return NextResponse.json({
      prices,
      count: prices.length
    })
  } catch (error) {
    console.error('Error fetching Stripe prices:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch prices' },
      { status: 500 }
    )
  }
}
