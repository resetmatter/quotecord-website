import { NextResponse } from 'next/server'
import { getTrialDaysForPromoCode } from '@/lib/billing'

export async function POST(req: Request) {
  try {
    const { code } = await req.json()

    if (!code || typeof code !== 'string') {
      return NextResponse.json({ valid: false, error: 'No code provided' })
    }

    const trialDays = await getTrialDaysForPromoCode(code.toUpperCase())

    if (trialDays > 0) {
      return NextResponse.json({
        valid: true,
        trialDays,
        message: `${trialDays}-day free trial`
      })
    }

    return NextResponse.json({ valid: false, error: 'Invalid promo code' })
  } catch (error) {
    console.error('Promo validation error:', error)
    return NextResponse.json({ valid: false, error: 'Failed to validate code' })
  }
}
