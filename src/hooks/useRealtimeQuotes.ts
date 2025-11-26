'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { RealtimeChannel } from '@supabase/supabase-js'

export interface RealtimeQuote {
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

interface BroadcastPayload {
  type: 'quote_created' | 'quote_deleted'
  quote?: RealtimeQuote
  quoteId?: string
  discordId: string
}

interface UseRealtimeQuotesOptions {
  discordId: string | null
  onInsert?: (quote: RealtimeQuote) => void
  onDelete?: (quoteId: string) => void
  enabled?: boolean
}

interface UseRealtimeQuotesReturn {
  isConnected: boolean
  reconnect: () => void
}

/**
 * Hook for subscribing to real-time quote updates via Supabase Broadcast
 *
 * Uses Supabase's broadcast feature (pub/sub) which doesn't require
 * database replication to be enabled. The bot API broadcasts messages
 * when quotes are created/deleted.
 */
export function useRealtimeQuotes({
  discordId,
  onInsert,
  onDelete,
  enabled = true
}: UseRealtimeQuotesOptions): UseRealtimeQuotesReturn {
  const channelRef = useRef<RealtimeChannel | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  // Store callbacks in refs to avoid re-subscribing when they change
  const onInsertRef = useRef(onInsert)
  const onDeleteRef = useRef(onDelete)
  const discordIdRef = useRef(discordId)

  useEffect(() => {
    onInsertRef.current = onInsert
    onDeleteRef.current = onDelete
    discordIdRef.current = discordId
  }, [onInsert, onDelete, discordId])

  useEffect(() => {
    if (!enabled || !discordId) {
      console.log('[Realtime] Disabled or no discordId, skipping subscription')
      return
    }

    // Subscribe to a broadcast channel specific to this user
    const channelName = `quotes:${discordId}`
    console.log('[Realtime] Subscribing to broadcast channel:', channelName)

    const channel = supabase
      .channel(channelName)
      .on('broadcast', { event: 'quote_update' }, (payload) => {
        const data = payload.payload as BroadcastPayload
        console.log('[Realtime] Received broadcast:', data.type)

        // Verify this message is for this user
        if (data.discordId !== discordIdRef.current) {
          console.log('[Realtime] Message not for this user, ignoring')
          return
        }

        if (data.type === 'quote_created' && data.quote) {
          console.log('[Realtime] New quote received:', data.quote.id)
          onInsertRef.current?.(data.quote)
        } else if (data.type === 'quote_deleted' && data.quoteId) {
          console.log('[Realtime] Quote deleted:', data.quoteId)
          onDeleteRef.current?.(data.quoteId)
        }
      })
      .subscribe((status, err) => {
        console.log('[Realtime] Subscription status:', status, err ? `Error: ${err.message}` : '')

        if (status === 'SUBSCRIBED') {
          console.log('[Realtime] Connected to broadcast channel')
          setIsConnected(true)
        } else if (status === 'CHANNEL_ERROR') {
          console.error('[Realtime] Channel error:', err)
          setIsConnected(false)
        } else if (status === 'TIMED_OUT') {
          console.error('[Realtime] Connection timed out')
          setIsConnected(false)
        } else if (status === 'CLOSED') {
          console.log('[Realtime] Channel closed')
          setIsConnected(false)
        }
      })

    channelRef.current = channel

    return () => {
      if (channelRef.current) {
        console.log('[Realtime] Unsubscribing from broadcast channel')
        setIsConnected(false)
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }
    }
  }, [discordId, enabled])

  const reconnect = useCallback(() => {
    if (channelRef.current) {
      console.log('[Realtime] Manually reconnecting...')
      channelRef.current.subscribe()
    }
  }, [])

  return { isConnected, reconnect }
}
