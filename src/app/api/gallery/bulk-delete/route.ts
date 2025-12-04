import { NextResponse } from 'next/server'
import { createRouteClient, createServiceClient } from '@/lib/supabase-server'
import { broadcastQuoteDeleted } from '@/lib/realtime-broadcast'

interface QuoteRecord {
  id: string
  file_path: string
  user_id: string
  discord_id: string
}

// POST /api/gallery/bulk-delete - Delete multiple quotes at once
export async function POST(request: Request) {
  try {
    const supabase = await createRouteClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { quoteIds } = body as { quoteIds: string[] }

    if (!quoteIds || !Array.isArray(quoteIds) || quoteIds.length === 0) {
      return NextResponse.json(
        { error: 'No quote IDs provided' },
        { status: 400 }
      )
    }

    // Limit bulk delete to 50 quotes at a time for safety
    if (quoteIds.length > 50) {
      return NextResponse.json(
        { error: 'Cannot delete more than 50 quotes at once' },
        { status: 400 }
      )
    }

    // Fetch all quotes to check ownership and get file paths
    const { data, error: fetchError } = await supabase
      .from('quote_gallery')
      .select('id, file_path, user_id, discord_id')
      .in('id', quoteIds)
      .eq('user_id', user.id)

    if (fetchError) {
      console.error('Bulk fetch error:', fetchError)
      return NextResponse.json(
        { error: 'Failed to fetch quotes' },
        { status: 500 }
      )
    }

    const quotes = data as QuoteRecord[] | null

    if (!quotes || quotes.length === 0) {
      return NextResponse.json(
        { error: 'No quotes found or access denied' },
        { status: 404 }
      )
    }

    // Get file paths for storage deletion
    const filePaths = quotes.map((q: QuoteRecord) => q.file_path)
    const discordId = quotes[0].discord_id
    const deletedIds = quotes.map((q: QuoteRecord) => q.id)

    // Delete from storage using service client
    const serviceClient = createServiceClient()
    const { error: storageError } = await serviceClient.storage
      .from('quotes')
      .remove(filePaths)

    if (storageError) {
      console.error('Bulk storage delete error:', storageError)
      // Continue anyway to delete from database
    }

    // Delete from database
    const { error: deleteError } = await supabase
      .from('quote_gallery')
      .delete()
      .in('id', deletedIds)
      .eq('user_id', user.id)

    if (deleteError) {
      console.error('Bulk database delete error:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete quotes' },
        { status: 500 }
      )
    }

    // Broadcast deletions to connected clients
    for (const id of deletedIds) {
      await broadcastQuoteDeleted(discordId, id)
    }

    return NextResponse.json({
      success: true,
      deleted: deletedIds.length,
      message: `Successfully deleted ${deletedIds.length} quote${deletedIds.length !== 1 ? 's' : ''}`
    })
  } catch (error) {
    console.error('Bulk delete error:', error)
    return NextResponse.json(
      { error: 'Failed to delete quotes' },
      { status: 500 }
    )
  }
}
