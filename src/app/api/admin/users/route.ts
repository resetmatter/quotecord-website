import { NextResponse } from 'next/server'
import { listAdminUsers, addAdminUser, removeAdminUser, getAdminUser } from '@/lib/admin'

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

// GET /api/admin/users - List all admin users
// GET /api/admin/users?discordId=123 - Get specific admin user
export async function GET(request: Request) {
  if (!verifyAdminKey(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const discordId = searchParams.get('discordId')

    if (discordId) {
      const admin = await getAdminUser(discordId)
      return NextResponse.json({
        admin: admin || null,
        isAdmin: admin !== null
      })
    }

    const admins = await listAdminUsers()
    return NextResponse.json({
      admins,
      count: admins.length
    })
  } catch (error) {
    console.error('Error fetching admin users:', error)
    return NextResponse.json(
      { error: 'Failed to fetch admin users' },
      { status: 500 }
    )
  }
}

// POST /api/admin/users - Add a new admin user
export async function POST(request: Request) {
  if (!verifyAdminKey(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { discordId, role, name, createdBy } = body

    if (!discordId) {
      return NextResponse.json(
        { error: 'discordId is required' },
        { status: 400 }
      )
    }

    const result = await addAdminUser({
      discordId,
      role: role || 'admin',
      name,
      createdBy
    })

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `Admin user added: ${discordId}`
    })
  } catch (error) {
    console.error('Error adding admin user:', error)
    return NextResponse.json(
      { error: 'Failed to add admin user' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/users?discordId=123 - Remove an admin user
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

    const result = await removeAdminUser(discordId)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `Admin user removed: ${discordId}`
    })
  } catch (error) {
    console.error('Error removing admin user:', error)
    return NextResponse.json(
      { error: 'Failed to remove admin user' },
      { status: 500 }
    )
  }
}
