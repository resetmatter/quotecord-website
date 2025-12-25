import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// POST - Submit a new ad request (self-serve)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      handle,
      destinationUrl,
      text,
      shortText,
      advertiserName,
      advertiserEmail
    } = body

    // Validate required fields
    if (!handle || !destinationUrl || !text || !shortText || !advertiserName || !advertiserEmail) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    // Validate handle format (letters, numbers, hyphens, underscores only)
    if (!/^[a-z0-9_-]+$/i.test(handle)) {
      return NextResponse.json(
        { error: 'Handle can only contain letters, numbers, hyphens, and underscores' },
        { status: 400 }
      )
    }

    // Check handle length
    if (handle.length < 3 || handle.length > 30) {
      return NextResponse.json(
        { error: 'Handle must be between 3 and 30 characters' },
        { status: 400 }
      )
    }

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(advertiserEmail)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 }
      )
    }

    // Check if handle is already taken
    const { data: existingAd } = await (supabase as any)
      .from('ads')
      .select('id, handle')
      .eq('handle', handle.toLowerCase())
      .single()

    if (existingAd) {
      return NextResponse.json(
        { error: 'This handle is already taken. Please choose a different one.' },
        { status: 409 }
      )
    }

    // Validate text lengths
    if (text.length > 150) {
      return NextResponse.json(
        { error: 'Full text must be 150 characters or less' },
        { status: 400 }
      )
    }

    if (shortText.length > 80) {
      return NextResponse.json(
        { error: 'Short text must be 80 characters or less' },
        { status: 400 }
      )
    }

    // Validate URL format
    try {
      new URL(destinationUrl)
    } catch {
      return NextResponse.json(
        { error: 'Please enter a valid destination URL' },
        { status: 400 }
      )
    }

    // Create the ad (disabled by default, pending approval)
    const { data: newAd, error } = await (supabase as any)
      .from('ads')
      .insert({
        handle: handle.toLowerCase(),
        destination_url: destinationUrl,
        text,
        short_text: shortText,
        advertiser_name: advertiserName,
        advertiser_email: advertiserEmail,
        advertiser_notes: 'Self-serve submission - pending approval',
        enabled: false, // Disabled until approved by admin
        weight: 1,
        created_by: 'self-serve'
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating ad:', error)
      return NextResponse.json(
        { error: 'Failed to submit ad. Please try again.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Your ad has been submitted for review. We\'ll be in touch soon!',
      handle: newAd.handle
    })
  } catch (error) {
    console.error('Error in advertise API:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}

// GET - Check if a handle is available
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const handle = searchParams.get('handle')

  if (!handle) {
    return NextResponse.json(
      { error: 'Handle parameter is required' },
      { status: 400 }
    )
  }

  // Validate handle format
  if (!/^[a-z0-9_-]+$/i.test(handle)) {
    return NextResponse.json({
      available: false,
      reason: 'Invalid format. Use only letters, numbers, hyphens, and underscores.'
    })
  }

  if (handle.length < 3) {
    return NextResponse.json({
      available: false,
      reason: 'Handle must be at least 3 characters'
    })
  }

  // Check if handle exists
  const { data: existingAd } = await (supabase as any)
    .from('ads')
    .select('id')
    .eq('handle', handle.toLowerCase())
    .single()

  return NextResponse.json({
    available: !existingAd,
    reason: existingAd ? 'This handle is already taken' : null
  })
}
