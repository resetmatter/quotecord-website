'use client'

import { useEffect, useRef, useCallback } from 'react'
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

/**
 * Hook for subscribing to real-time quote updates via Supabase
 *
 * Subscribes to INSERT, DELETE, and UPDATE events on the quote_gallery table
 * filtered by the user's discord_id
 */
export function useRealtimeQuotes({
  discordId,
  onInsert,
  onDelete,
  onUpdate,
  enabled = true
}: UseRealtimeQuotesOptions) {
  const channelRef = useRef<RealtimeChannel | null>(null)

  // Store callbacks in refs to avoid re-subscribing when they change
  const onInsertRef = useRef(onInsert)
  const onDeleteRef = useRef(onDelete)
  const onUpdateRef = useRef(onUpdate)

  // Update refs when callbacks change
  useEffect(() => {
    onInsertRef.current = onInsert
    onDeleteRef.current = onDelete
    onUpdateRef.current = onUpdate
  }, [onInsert, onDelete, onUpdate])

  useEffect(() => {
    if (!enabled || !discordId) {
      return
    }

    // Create a unique channel name for this user
    const channelName = `quotes-${discordId}-${Date.now()}`

    // Subscribe to real-time changes on quote_gallery table
    const channel = supabase
      .channel(channelName)
      .on<RealtimeQuote>(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'quote_gallery',
          filter: `discord_id=eq.${discordId}`
        },
        (payload: RealtimePostgresChangesPayload<RealtimeQuote>) => {
          if (payload.new && onInsertRef.current) {
            onInsertRef.current(payload.new as RealtimeQuote)
          }
        }
      )
      .on<RealtimeQuote>(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'quote_gallery',
          filter: `discord_id=eq.${discordId}`
        },
        (payload: RealtimePostgresChangesPayload<RealtimeQuote>) => {
          if (payload.old && onDeleteRef.current) {
            // For DELETE, the old record contains the deleted row's data
            onDeleteRef.current((payload.old as RealtimeQuote).id)
          }
        }
      )
      .on<RealtimeQuote>(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'quote_gallery',
          filter: `discord_id=eq.${discordId}`
        },
        (payload: RealtimePostgresChangesPayload<RealtimeQuote>) => {
          if (payload.new && onUpdateRef.current) {
            onUpdateRef.current(payload.new as RealtimeQuote)
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('[Realtime] Connected to quote updates')
        } else if (status === 'CHANNEL_ERROR') {
          console.error('[Realtime] Failed to connect to quote updates')
        }
      })

    channelRef.current = channel

    // Cleanup on unmount or when dependencies change
    return () => {
      if (channelRef.current) {
        console.log('[Realtime] Unsubscribing from quote updates')
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }
    }
  }, [discordId, enabled])

  // Manual reconnect function if needed
  const reconnect = useCallback(() => {
    if (channelRef.current) {
      channelRef.current.subscribe()
    }
  }, [])

  return { reconnect }
}
