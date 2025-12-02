import { NextResponse } from 'next/server'
import { isAdminUser } from '@/lib/admin'

// POST /api/admin/check - Check if a Discord ID is an admin
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { discordId } = body

    if (!discordId) {
      return NextResponse.json(
        { error: 'discordId is required', isAdmin: false },
        { status: 400 }
      )
    }

    const isAdmin = await isAdminUser(discordId)

    return NextResponse.json({ isAdmin })
  } catch (error) {
    console.error('Error checking admin status:', error)
    return NextResponse.json(
      { error: 'Failed to check admin status', isAdmin: false },
      { status: 500 }
    )
  }
}
