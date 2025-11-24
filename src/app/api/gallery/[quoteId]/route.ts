import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-server'

// GET /api/gallery/[quoteId] - Get a single quote
export async function GET(
  request: Request,
  { params }: { params: { quoteId: string } }
) {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { quoteId } = params

    const { data: quote, error } = await supabase
      .from('quote_gallery')
      .select('*')
      .eq('id', quoteId)
      .eq('user_id', session.user.id)
      .single()

    if (error || !quote) {
      return NextResponse.json(
        { error: 'Quote not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ quote })
  } catch (error) {
    console.error('Quote fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch quote' },
      { status: 500 }
    )
  }
}

// DELETE /api/gallery/[quoteId] - Delete a quote
export async function DELETE(
  request: Request,
  { params }: { params: { quoteId: string } }
) {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { quoteId } = params

    // First, get the quote to check ownership and get file path
    const { data: quote, error: fetchError } = await supabase
      .from('quote_gallery')
      .select('id, file_path, user_id')
      .eq('id', quoteId)
      .eq('user_id', session.user.id)
      .single()

    if (fetchError || !quote) {
      return NextResponse.json(
        { error: 'Quote not found or access denied' },
        { status: 404 }
      )
    }

    // Delete from storage using service client (has full access)
    const serviceClient = createServiceClient()
    const { error: storageError } = await serviceClient.storage
      .from('quotes')
      .remove([quote.file_path])

    if (storageError) {
      console.error('Storage delete error:', storageError)
      // Continue anyway to delete from database
    }

    // Delete from database
    const { error: deleteError } = await supabase
      .from('quote_gallery')
      .delete()
      .eq('id', quoteId)
      .eq('user_id', session.user.id)

    if (deleteError) {
      console.error('Database delete error:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete quote' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Quote deleted successfully'
    })
  } catch (error) {
    console.error('Quote delete error:', error)
    return NextResponse.json(
      { error: 'Failed to delete quote' },
      { status: 500 }
    )
  }
}
