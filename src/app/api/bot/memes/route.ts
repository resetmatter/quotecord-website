import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-server'
import { verifyBotApiKey } from '@/lib/bot-auth'

interface MemeUploadRequest {
  discordId: string
  imageData: string // Base64 encoded image data
  mimeType: string // 'image/png', 'image/gif', 'image/jpeg', 'image/webp'
  template: string
  font: string
  theme: string
  orientation?: string
  animated?: boolean
  quoteText?: string
  authorName?: string
  guildId?: string
}

// POST /api/bot/memes - Upload and store a meme
export async function POST(request: Request) {
  // Verify bot API key
  if (!await verifyBotApiKey(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json() as MemeUploadRequest
    const {
      discordId,
      imageData,
      mimeType,
      template,
      font,
      theme,
      orientation,
      animated = false,
      quoteText,
      authorName,
      guildId
    } = body

    // Validate required fields
    if (!discordId || !imageData || !mimeType || !template || !font || !theme) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate mime type
    const validMimeTypes = ['image/png', 'image/gif', 'image/jpeg', 'image/webp']
    if (!validMimeTypes.includes(mimeType)) {
      return NextResponse.json(
        { error: 'Invalid mime type' },
        { status: 400 }
      )
    }

    const supabase = createServiceClient()

    // Check if user has an account and storage quota
    const { data: hasQuota } = await supabase
      .rpc('check_storage_quota', { discord_user_id: discordId })

    if (!hasQuota) {
      // Get user's tier to provide appropriate message
      const { data: subscription } = await supabase
        .from('subscriptions')
        .select('tier')
        .eq('discord_id', discordId)
        .single()

      const isPremium = subscription?.tier === 'premium'
      const maxMemes = isPremium ? 1000 : 50

      return NextResponse.json({
        error: 'Storage quota exceeded',
        message: isPremium
          ? `You've reached the maximum of ${maxMemes} memes. Please delete some to make room.`
          : `You've reached the free tier limit of ${maxMemes} memes. Upgrade to Premium for up to 1000 memes.`
      }, { status: 403 })
    }

    // Get user_id from profiles (if they have an account)
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('discord_id', discordId)
      .single()

    // Decode base64 image
    const imageBuffer = Buffer.from(imageData, 'base64')
    const fileSize = imageBuffer.length

    // Generate unique filename
    const extension = mimeType.split('/')[1]
    const timestamp = Date.now()
    const fileName = `${discordId}/${timestamp}.${extension}`

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('memes')
      .upload(fileName, imageBuffer, {
        contentType: mimeType,
        upsert: false
      })

    if (uploadError) {
      console.error('Storage upload error:', uploadError)
      return NextResponse.json(
        { error: 'Failed to upload meme to storage' },
        { status: 500 }
      )
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('memes')
      .getPublicUrl(fileName)

    // Store metadata in meme_gallery
    const { data: meme, error: insertError } = await supabase
      .from('meme_gallery')
      .insert({
        user_id: profile?.id || null,
        discord_id: discordId,
        file_path: uploadData.path,
        file_name: fileName,
        file_size: fileSize,
        mime_type: mimeType,
        template,
        font,
        theme,
        orientation,
        animated,
        quote_text: quoteText,
        author_name: authorName,
        guild_id: guildId,
        public_url: publicUrl
      })
      .select()
      .single()

    if (insertError) {
      console.error('Database insert error:', insertError)
      // Clean up uploaded file
      await supabase.storage.from('memes').remove([fileName])
      return NextResponse.json(
        { error: 'Failed to save meme metadata' },
        { status: 500 }
      )
    }

    // Also log to quotes table for usage tracking
    await supabase
      .from('quotes')
      .insert({
        user_id: profile?.id || null,
        discord_id: discordId,
        guild_id: guildId,
        template,
        font,
        theme,
        orientation,
        animated
      })

    return NextResponse.json({
      success: true,
      meme: {
        id: meme.id,
        publicUrl,
        fileName,
        fileSize,
        createdAt: meme.created_at
      }
    })
  } catch (error) {
    console.error('Error storing meme:', error)
    return NextResponse.json(
      { error: 'Failed to store meme' },
      { status: 500 }
    )
  }
}

// GET /api/bot/memes - Get meme count and stats for a user
export async function GET(request: Request) {
  // Verify bot API key
  if (!await verifyBotApiKey(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const discordId = searchParams.get('discordId')

  if (!discordId) {
    return NextResponse.json(
      { error: 'discordId is required' },
      { status: 400 }
    )
  }

  try {
    const supabase = createServiceClient()

    // Get meme count
    const { data: memeCount } = await supabase
      .rpc('get_user_meme_count', { discord_user_id: discordId })

    // Check if user has account and get their quota
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('tier')
      .eq('discord_id', discordId)
      .single()

    const isPremium = subscription?.tier === 'premium'
    const maxMemes = isPremium ? 1000 : 50

    return NextResponse.json({
      discordId,
      memeCount: memeCount || 0,
      maxMemes,
      hasAccount: !!subscription,
      quotaRemaining: maxMemes - (memeCount || 0)
    })
  } catch (error) {
    console.error('Error fetching meme stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch meme stats' },
      { status: 500 }
    )
  }
}
