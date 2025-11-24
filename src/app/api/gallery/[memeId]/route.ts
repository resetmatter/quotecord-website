import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-server'

// GET /api/gallery/[memeId] - Get a single meme
export async function GET(
  request: Request,
  { params }: { params: { memeId: string } }
) {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { memeId } = params

    const { data: meme, error } = await supabase
      .from('meme_gallery')
      .select('*')
      .eq('id', memeId)
      .eq('user_id', session.user.id)
      .single()

    if (error || !meme) {
      return NextResponse.json(
        { error: 'Meme not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ meme })
  } catch (error) {
    console.error('Meme fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch meme' },
      { status: 500 }
    )
  }
}

// DELETE /api/gallery/[memeId] - Delete a meme
export async function DELETE(
  request: Request,
  { params }: { params: { memeId: string } }
) {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { memeId } = params

    // First, get the meme to check ownership and get file path
    const { data: meme, error: fetchError } = await supabase
      .from('meme_gallery')
      .select('id, file_path, user_id')
      .eq('id', memeId)
      .eq('user_id', session.user.id)
      .single()

    if (fetchError || !meme) {
      return NextResponse.json(
        { error: 'Meme not found or access denied' },
        { status: 404 }
      )
    }

    // Delete from storage using service client (has full access)
    const serviceClient = createServiceClient()
    const { error: storageError } = await serviceClient.storage
      .from('quotes')
      .remove([meme.file_path])

    if (storageError) {
      console.error('Storage delete error:', storageError)
      // Continue anyway to delete from database
    }

    // Delete from database
    const { error: deleteError } = await supabase
      .from('meme_gallery')
      .delete()
      .eq('id', memeId)
      .eq('user_id', session.user.id)

    if (deleteError) {
      console.error('Database delete error:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete meme' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Meme deleted successfully'
    })
  } catch (error) {
    console.error('Meme delete error:', error)
    return NextResponse.json(
      { error: 'Failed to delete meme' },
      { status: 500 }
    )
  }
}
