import { createServiceClient } from './supabase-server'

interface QuoteData {
  id: string
  discord_id: string
  file_path: string
  file_name: string
  file_size: number
  mime_type: string
  template: string
  font: string
  theme: string
  orientation: string | null
  animated: boolean
  quote_text: string | null
  author_name: string | null
  guild_id: string | null
  quoted_user_id: string | null
  quoted_user_name: string | null
  quoted_user_avatar: string | null
  quoter_user_name: string | null
  quoter_user_avatar: string | null
  public_url: string
  created_at: string
  message_url: string | null
  message_urls: string[] | null
  privacy_mode: string | null
}

/**
 * Broadcast a quote creation event to connected clients
 */
export async function broadcastQuoteCreated(discordId: string, quote: QuoteData) {
  const supabase = createServiceClient()

  const channelName = `quotes:${discordId}`

  try {
    const channel = supabase.channel(channelName)

    await channel.send({
      type: 'broadcast',
      event: 'quote_update',
      payload: {
        type: 'quote_created',
        quote,
        discordId
      }
    })

    // Clean up the channel after sending
    await supabase.removeChannel(channel)

    console.log('[Broadcast] Sent quote_created to channel:', channelName)
  } catch (error) {
    console.error('[Broadcast] Failed to broadcast quote_created:', error)
  }
}

/**
 * Broadcast a quote deletion event to connected clients
 */
export async function broadcastQuoteDeleted(discordId: string, quoteId: string) {
  const supabase = createServiceClient()

  const channelName = `quotes:${discordId}`

  try {
    const channel = supabase.channel(channelName)

    await channel.send({
      type: 'broadcast',
      event: 'quote_update',
      payload: {
        type: 'quote_deleted',
        quoteId,
        discordId
      }
    })

    // Clean up the channel after sending
    await supabase.removeChannel(channel)

    console.log('[Broadcast] Sent quote_deleted to channel:', channelName)
  } catch (error) {
    console.error('[Broadcast] Failed to broadcast quote_deleted:', error)
  }
}
