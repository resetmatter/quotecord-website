import { NextResponse } from 'next/server'
import {
  listPromoTrialRules,
  getPromoTrialRule,
  createPromoTrialRule,
  updatePromoTrialRule,
  deletePromoTrialRule
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

// GET /api/admin/billing/trial-rules - List all trial rules
// GET /api/admin/billing/trial-rules?id=xxx - Get specific trial rule
export async function GET(request: Request) {
  if (!verifyAdminKey(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const ruleId = searchParams.get('id')

    if (ruleId) {
      const rule = await getPromoTrialRule(ruleId)
      if (!rule) {
        return NextResponse.json({ error: 'Trial rule not found' }, { status: 404 })
      }
      return NextResponse.json({ rule })
    }

    const rules = await listPromoTrialRules()
    return NextResponse.json({
      rules,
      count: rules.length
    })
  } catch (error) {
    console.error('Error fetching trial rules:', error)
    return NextResponse.json(
      { error: 'Failed to fetch trial rules' },
      { status: 500 }
    )
  }
}

// POST /api/admin/billing/trial-rules - Create a new trial rule
export async function POST(request: Request) {
  if (!verifyAdminKey(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const {
      promoCode,
      name,
      description,
      trialDays,
      isActive,
      applicablePlan,
      restrictedGuildIds,
      notes,
      createdBy
    } = body

    if (!promoCode) {
      return NextResponse.json(
        { error: 'Promo code is required' },
        { status: 400 }
      )
    }

    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      )
    }

    if (trialDays === undefined || trialDays < 0) {
      return NextResponse.json(
        { error: 'Trial days must be a non-negative number' },
        { status: 400 }
      )
    }

    const result = await createPromoTrialRule({
      promoCode,
      name,
      description,
      trialDays,
      isActive,
      applicablePlan,
      restrictedGuildIds,
      notes,
      createdBy
    })

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      rule: result.rule
    })
  } catch (error) {
    console.error('Error creating trial rule:', error)
    return NextResponse.json(
      { error: 'Failed to create trial rule' },
      { status: 500 }
    )
  }
}

// PUT /api/admin/billing/trial-rules?id=xxx - Update a trial rule
export async function PUT(request: Request) {
  if (!verifyAdminKey(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const ruleId = searchParams.get('id')

    if (!ruleId) {
      return NextResponse.json(
        { error: 'Rule ID is required' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const {
      name,
      description,
      trialDays,
      isActive,
      applicablePlan,
      restrictedGuildIds,
      notes,
      updatedBy
    } = body

    const result = await updatePromoTrialRule(ruleId, {
      name,
      description,
      trialDays,
      isActive,
      applicablePlan,
      restrictedGuildIds,
      notes,
      updatedBy
    })

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Trial rule updated successfully'
    })
  } catch (error) {
    console.error('Error updating trial rule:', error)
    return NextResponse.json(
      { error: 'Failed to update trial rule' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/billing/trial-rules?id=xxx - Delete a trial rule
export async function DELETE(request: Request) {
  if (!verifyAdminKey(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const ruleId = searchParams.get('id')

    if (!ruleId) {
      return NextResponse.json(
        { error: 'Rule ID is required' },
        { status: 400 }
      )
    }

    const result = await deletePromoTrialRule(ruleId)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Trial rule deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting trial rule:', error)
    return NextResponse.json(
      { error: 'Failed to delete trial rule' },
      { status: 500 }
    )
  }
}
