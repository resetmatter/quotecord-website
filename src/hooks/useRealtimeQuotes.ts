'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js'

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

interface UseRealtimeQuotesOptions {
  discordId: string | null
  onInsert?: (quote: RealtimeQuote) => void
  onDelete?: (quoteId: string) => void
  onUpdate?: (quote: RealtimeQuote) => void
  enabled?: boolean
}

interface UseRealtimeQuotesReturn {
  isConnected: boolean
  reconnect: () => void
}

/**
 * Hook for subscribing to real-time quote updates via Supabase
 *
 * Subscribes to INSERT, DELETE, and UPDATE events on the quote_gallery table.
 * RLS ensures users only receive events for their own quotes.
 */
export function useRealtimeQuotes({
  discordId,
  onInsert,
  onDelete,
  onUpdate,
  enabled = true
}: UseRealtimeQuotesOptions): UseRealtimeQuotesReturn {
  const channelRef = useRef<RealtimeChannel | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  // Store callbacks in refs to avoid re-subscribing when they change
  const onInsertRef = useRef(onInsert)
  const onDeleteRef = useRef(onDelete)
  const onUpdateRef = useRef(onUpdate)
  const discordIdRef = useRef(discordId)

  // Update refs when callbacks change
  useEffect(() => {
    onInsertRef.current = onInsert
    onDeleteRef.current = onDelete
    onUpdateRef.current = onUpdate
    discordIdRef.current = discordId
  }, [onInsert, onDelete, onUpdate, discordId])

  useEffect(() => {
    if (!enabled || !discordId) {
      console.log('[Realtime] Disabled or no discordId, skipping subscription')
      return
    }

    // Create a unique channel name for this user session
    const channelName = `quotes-realtime-${discordId}`

    console.log('[Realtime] Setting up subscription for discordId:', discordId)

    // Subscribe to real-time changes on quote_gallery table
    // We don't filter server-side - RLS handles security, and we filter client-side by discord_id
    const channel = supabase
      .channel(channelName)
      .on<RealtimeQuote>(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'quote_gallery'
        },
        (payload: RealtimePostgresChangesPayload<RealtimeQuote>) => {
          const newQuote = payload.new as RealtimeQuote
          console.log('[Realtime] INSERT event received:', newQuote?.id)

          // Client-side filter by discord_id
          if (newQuote && newQuote.discord_id === discordIdRef.current) {
            console.log('[Realtime] Quote matches user, calling onInsert')
            onInsertRef.current?.(newQuote)
          } else {
            console.log('[Realtime] Quote does not match user discord_id, ignoring')
          }
        }
      )
      .on<RealtimeQuote>(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'quote_gallery'
        },
        (payload: RealtimePostgresChangesPayload<RealtimeQuote>) => {
          const oldQuote = payload.old as RealtimeQuote
          console.log('[Realtime] DELETE event received:', oldQuote?.id)

          // Client-side filter by discord_id
          if (oldQuote && oldQuote.discord_id === discordIdRef.current) {
            console.log('[Realtime] Deleted quote matches user, calling onDelete')
            onDeleteRef.current?.(oldQuote.id)
          }
        }
      )
      .on<RealtimeQuote>(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'quote_gallery'
        },
        (payload: RealtimePostgresChangesPayload<RealtimeQuote>) => {
          const updatedQuote = payload.new as RealtimeQuote
          console.log('[Realtime] UPDATE event received:', updatedQuote?.id)

          // Client-side filter by discord_id
          if (updatedQuote && updatedQuote.discord_id === discordIdRef.current) {
            console.log('[Realtime] Updated quote matches user, calling onUpdate')
            onUpdateRef.current?.(updatedQuote)
          }
        }
      )
      .subscribe((status, err) => {
        console.log('[Realtime] Subscription status:', status, err ? `Error: ${err.message}` : '')

        if (status === 'SUBSCRIBED') {
          console.log('[Realtime] Successfully connected to quote updates')
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

    // Cleanup on unmount or when dependencies change
    return () => {
      if (channelRef.current) {
        console.log('[Realtime] Unsubscribing from quote updates')
        setIsConnected(false)
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }
    }
  }, [discordId, enabled])

  // Manual reconnect function if needed
  const reconnect = useCallback(() => {
    if (channelRef.current) {
      console.log('[Realtime] Manually reconnecting...')
      channelRef.current.subscribe()
    }
  }, [])

  return { isConnected, reconnect }
}
