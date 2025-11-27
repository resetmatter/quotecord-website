'use client'

import { useEffect, useRef, useCallback, useState } from 'react'

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
  enabled?: boolean
  pollInterval?: number
}

interface UseRealtimeQuotesReturn {
  isConnected: boolean
  reconnect: () => void
}

/**
 * Hook for detecting quote changes via smart polling
 *
 * Polls the server periodically to check for new quotes.
 * Only polls when the tab is visible to save resources.
 */
export function useRealtimeQuotes({
  discordId,
  onInsert,
  onDelete,
  enabled = true,
  pollInterval = 5000 // 5 seconds - responsive but not too aggressive
}: UseRealtimeQuotesOptions): UseRealtimeQuotesReturn {
  const [isConnected, setIsConnected] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const isVisibleRef = useRef(true)
  const knownQuoteIdsRef = useRef<Set<string>>(new Set())
  const lastQuoteCountRef = useRef<number>(0)
  const isFirstFetchRef = useRef(true)

  // Store callbacks in refs
  const onInsertRef = useRef(onInsert)
  const onDeleteRef = useRef(onDelete)

  useEffect(() => {
    onInsertRef.current = onInsert
    onDeleteRef.current = onDelete
  }, [onInsert, onDelete])

  const checkForUpdates = useCallback(async () => {
    if (!discordId || !isVisibleRef.current) return

    try {
      // Fetch latest quotes (first page, sorted by newest)
      const response = await fetch('/api/gallery?page=1&limit=20&sortBy=created_at&sortDir=desc')
      if (!response.ok) return

      const data = await response.json()
      const serverQuotes: RealtimeQuote[] = data.quotes || []
      const serverQuoteCount = data.quota?.used ?? 0

      // On first fetch, just initialize our tracking state
      if (isFirstFetchRef.current) {
        knownQuoteIdsRef.current = new Set(serverQuotes.map(q => q.id))
        lastQuoteCountRef.current = serverQuoteCount
        isFirstFetchRef.current = false
        setIsConnected(true)
        console.log('[Polling] Initialized with', serverQuotes.length, 'quotes')
        return
      }

      // Detect new quotes (in server response but not in our known set)
      const newQuotes = serverQuotes.filter(q => !knownQuoteIdsRef.current.has(q.id))

      // Detect if quotes were deleted (count decreased)
      const quotesDeleted = serverQuoteCount < lastQuoteCountRef.current

      // Handle new quotes
      if (newQuotes.length > 0) {
        console.log('[Polling] Found', newQuotes.length, 'new quote(s)')
        // Call onInsert for each new quote (newest first)
        for (const quote of newQuotes) {
          onInsertRef.current?.(quote)
          knownQuoteIdsRef.current.add(quote.id)
        }
      }

      // Handle deletions - we can't know exactly which were deleted,
      // but the gallery page handles this via optimistic updates
      if (quotesDeleted) {
        console.log('[Polling] Quote count decreased from', lastQuoteCountRef.current, 'to', serverQuoteCount)
        // Update our known IDs to match server
        knownQuoteIdsRef.current = new Set(serverQuotes.map(q => q.id))
      }

      lastQuoteCountRef.current = serverQuoteCount
    } catch (err) {
      console.error('[Polling] Error checking for updates:', err)
    }
  }, [discordId])

  // Handle visibility change - check immediately when tab becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      const wasHidden = !isVisibleRef.current
      isVisibleRef.current = document.visibilityState === 'visible'

      if (isVisibleRef.current && wasHidden && enabled && discordId) {
        console.log('[Polling] Tab became visible, checking for updates')
        checkForUpdates()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [checkForUpdates, enabled, discordId])

  // Set up polling interval
  useEffect(() => {
    if (!enabled || !discordId) {
      setIsConnected(false)
      isFirstFetchRef.current = true
      knownQuoteIdsRef.current.clear()
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      return
    }

    console.log('[Polling] Starting with interval:', pollInterval, 'ms')

    // Initial check after a short delay (let the main fetch complete first)
    const initialTimeout = setTimeout(() => {
      checkForUpdates()
    }, 1500)

    // Set up regular polling
    intervalRef.current = setInterval(() => {
      if (isVisibleRef.current) {
        checkForUpdates()
      }
    }, pollInterval)

    return () => {
      clearTimeout(initialTimeout)
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      setIsConnected(false)
    }
  }, [enabled, discordId, pollInterval, checkForUpdates])

  const reconnect = useCallback(() => {
    console.log('[Polling] Manual refresh triggered')
    checkForUpdates()
  }, [checkForUpdates])

  return { isConnected, reconnect }
}
