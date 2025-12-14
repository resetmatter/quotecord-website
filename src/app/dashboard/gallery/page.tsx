'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Image from 'next/image'
import {
  Search,
  Filter,
  Trash2,
  X,
  ChevronLeft,
  ChevronRight,
  Calendar,
  ImageIcon,
  Film,
  User,
  MessageSquareQuote,
  Loader2,
  AlertTriangle,
  ExternalLink,
  Download,
  ChevronDown,
  Check,
  Users,
  ArrowUp,
  ArrowDown,
  Wifi,
  WifiOff,
  CheckSquare,
  Square,
  XCircle,
  Share2,
  Copy,
  Link2
} from 'lucide-react'
import { useRealtimeQuotes, RealtimeQuote } from '@/hooks/useRealtimeQuotes'

interface Quote {
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

interface UserProfile {
  discordId: string
  username: string | null
  avatar: string | null
}

interface QuotedUser {
  quoted_user_id: string
  quoted_user_name: string | null
  quoted_user_avatar: string | null
}

interface GalleryResponse {
  quotes: Quote[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  quota: {
    used: number
    max: number | null
    remaining: number | null
    isUnlimited: boolean
  }
  userProfile?: UserProfile
  quotedUsers?: QuotedUser[]
}

interface QuotedUserStats {
  quoted_user_id: string
  quoted_user_name: string | null
  quoted_user_avatar: string | null
  quote_count: number
  latest_quote_at: string
}

const TEMPLATES = ['Classic', 'Discord Screenshot', 'Profile Background']

export default function GalleryPage() {
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0
  })
  const [quota, setQuota] = useState<{ used: number; max: number | null; remaining: number | null; isUnlimited: boolean }>({ used: 0, max: 50, remaining: 50, isUnlimited: false })
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)

  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [templateFilter, setTemplateFilter] = useState<string>('')
  const [animatedFilter, setAnimatedFilter] = useState<string>('')
  const [quotedUserFilter, setQuotedUserFilter] = useState<string>('')
  const [showFilters, setShowFilters] = useState(true)

  // Sorting
  const [sortBy, setSortBy] = useState<string>('created_at')
  const [sortDir, setSortDir] = useState<string>('desc')

  // Quoted users for filter
  const [quotedUsers, setQuotedUsers] = useState<QuotedUserStats[]>([])
  const [quotedUsersLoading, setQuotedUsersLoading] = useState(false)
  const [userSearchQuery, setUserSearchQuery] = useState('')
  const [showUserDropdown, setShowUserDropdown] = useState(false)
  const userDropdownRef = useRef<HTMLDivElement>(null)

  // Modal states
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<Quote | null>(null)
  const [deleting, setDeleting] = useState(false)

  // Selection mode state
  const [selectionMode, setSelectionMode] = useState(false)
  const [selectedQuotes, setSelectedQuotes] = useState<Set<string>>(new Set())
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false)
  const [bulkDeleting, setBulkDeleting] = useState(false)

  // Real-time state
  const [newQuoteIds, setNewQuoteIds] = useState<Set<string>>(new Set())

  // Track pending deletions to avoid double-counting with realtime events
  // Using a ref to avoid stale closure issues in callbacks
  const pendingDeletionsRef = useRef<Set<string>>(new Set())

  // Real-time quote updates
  const handleRealtimeInsert = useCallback((newQuote: RealtimeQuote) => {
    // Only add to view if on first page with default sorting (newest first) and no filters
    const isOnFirstPage = pagination.page === 1
    const isDefaultSort = sortBy === 'created_at' && sortDir === 'desc'
    const hasNoFilters = !searchQuery && !templateFilter && !animatedFilter && !quotedUserFilter

    if (isOnFirstPage && isDefaultSort && hasNoFilters) {
      // Add to beginning of list
      setQuotes(prev => {
        // Avoid duplicates
        if (prev.some(q => q.id === newQuote.id)) return prev
        return [newQuote as Quote, ...prev]
      })
      // Mark as new for animation
      setNewQuoteIds(prev => new Set(prev).add(newQuote.id))
      // Remove highlight after animation
      setTimeout(() => {
        setNewQuoteIds(prev => {
          const next = new Set(prev)
          next.delete(newQuote.id)
          return next
        })
      }, 3000)
    }
    // Update quota (only decrement remaining if not unlimited)
    setQuota(prev => ({
      ...prev,
      used: prev.used + 1,
      remaining: prev.isUnlimited || prev.remaining === null ? prev.remaining : Math.max(0, prev.remaining - 1)
    }))
    // Refresh quoted users list
    fetchQuotedUsers()
  }, [pagination.page, sortBy, sortDir, searchQuery, templateFilter, animatedFilter, quotedUserFilter])

  const handleRealtimeDelete = useCallback((deletedId: string) => {
    // Check if this deletion was initiated locally (optimistic update already applied)
    // If so, just clean up and skip the quota update to avoid double-decrementing
    if (pendingDeletionsRef.current.has(deletedId)) {
      pendingDeletionsRef.current.delete(deletedId)
      // Still close modals if needed, but don't update quota again
      setSelectedQuote(prev => prev?.id === deletedId ? null : prev)
      setDeleteConfirm(prev => prev?.id === deletedId ? null : prev)
      return
    }

    // This is a delete from another session/device - apply full update
    // Remove from current view
    setQuotes(prev => prev.filter(q => q.id !== deletedId))
    // Update quota (only increment remaining if not unlimited)
    setQuota(prev => ({
      ...prev,
      used: Math.max(0, prev.used - 1),
      remaining: prev.isUnlimited || prev.remaining === null ? prev.remaining : prev.remaining + 1
    }))
    // Close modals if the deleted quote was open
    setSelectedQuote(prev => prev?.id === deletedId ? null : prev)
    setDeleteConfirm(prev => prev?.id === deletedId ? null : prev)
  }, [])

  // Initialize real-time subscription
  const { isConnected: realtimeConnected } = useRealtimeQuotes({
    discordId: userProfile?.discordId ?? null,
    onInsert: handleRealtimeInsert,
    onDelete: handleRealtimeDelete,
    enabled: !!userProfile?.discordId
  })

  const fetchQuotes = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        sortBy,
        sortDir
      })

      if (searchQuery) params.append('search', searchQuery)
      if (templateFilter) params.append('template', templateFilter)
      if (animatedFilter) params.append('animated', animatedFilter)
      if (quotedUserFilter) params.append('quotedUserId', quotedUserFilter)

      const response = await fetch(`/api/gallery?${params}`)
      if (!response.ok) {
        throw new Error('Failed to fetch gallery')
      }

      const data: GalleryResponse = await response.json()
      setQuotes(data.quotes)
      setPagination(data.pagination)
      setQuota(data.quota)
      if (data.userProfile) setUserProfile(data.userProfile)
      // Quoted users are fetched separately via fetchQuotedUsers for better stats
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load gallery')
    } finally {
      setLoading(false)
    }
  }, [pagination.page, pagination.limit, searchQuery, templateFilter, animatedFilter, quotedUserFilter, sortBy, sortDir])

  useEffect(() => {
    fetchQuotes()
  }, [fetchQuotes])

  // Fetch quoted users when filter panel opens or search changes
  const fetchQuotedUsers = useCallback(async () => {
    setQuotedUsersLoading(true)
    try {
      const params = new URLSearchParams()
      if (userSearchQuery) params.append('search', userSearchQuery)
      params.append('limit', '100')

      const response = await fetch(`/api/gallery/quoted-users?${params}`)
      if (response.ok) {
        const data = await response.json()
        setQuotedUsers(data.quotedUsers || [])
      }
    } catch (err) {
      console.error('Failed to fetch quoted users:', err)
    } finally {
      setQuotedUsersLoading(false)
    }
  }, [userSearchQuery])

  useEffect(() => {
    if (showFilters) {
      fetchQuotedUsers()
    }
  }, [showFilters, fetchQuotedUsers])

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setShowUserDropdown(false)
      }
    }
    if (showUserDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showUserDropdown])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const handleDelete = async (quote: Quote) => {
    setDeleting(true)

    // Register this as a pending deletion to prevent double-decrementing
    // when the realtime event fires after optimistic update
    pendingDeletionsRef.current.add(quote.id)

    // Optimistic update: remove from UI immediately
    const previousQuotes = quotes
    const previousQuota = quota
    setQuotes(prev => prev.filter(q => q.id !== quote.id))
    setQuota(prev => ({
      ...prev,
      used: Math.max(0, prev.used - 1),
      remaining: prev.isUnlimited || prev.remaining === null ? prev.remaining : prev.remaining + 1
    }))
    setDeleteConfirm(null)
    setSelectedQuote(null)

    try {
      const response = await fetch(`/api/gallery/${quote.id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete quote')
      }
      // Success - the real-time handler will fire but will skip quota update
      // since this ID is in pendingDeletionsRef
    } catch (err) {
      // Rollback on error - also remove from pending deletions
      pendingDeletionsRef.current.delete(quote.id)
      setQuotes(previousQuotes)
      setQuota(previousQuota)
      setError(err instanceof Error ? err.message : 'Failed to delete quote')
    } finally {
      setDeleting(false)
    }
  }

  const handleBulkDelete = async () => {
    if (selectedQuotes.size === 0) return

    setBulkDeleting(true)
    const quoteIdsToDelete = Array.from(selectedQuotes)

    // Register all as pending deletions to prevent double-decrementing
    // when the realtime events fire after optimistic update
    for (const id of quoteIdsToDelete) {
      pendingDeletionsRef.current.add(id)
    }

    // Optimistic update: remove selected quotes from UI immediately
    const previousQuotes = quotes
    const previousQuota = quota
    const deleteCount = quoteIdsToDelete.length

    setQuotes(prev => prev.filter(q => !selectedQuotes.has(q.id)))
    setQuota(prev => ({
      ...prev,
      used: Math.max(0, prev.used - deleteCount),
      remaining: prev.isUnlimited || prev.remaining === null ? prev.remaining : prev.remaining + deleteCount
    }))
    setBulkDeleteConfirm(false)
    setSelectedQuotes(new Set())
    setSelectionMode(false)

    try {
      const response = await fetch('/api/gallery/bulk-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quoteIds: quoteIdsToDelete })
      })

      if (!response.ok) {
        throw new Error('Failed to delete quotes')
      }
      // Success - realtime handlers will fire but will skip quota updates
      // since these IDs are in pendingDeletionsRef
    } catch (err) {
      // Rollback on error - also remove from pending deletions
      for (const id of quoteIdsToDelete) {
        pendingDeletionsRef.current.delete(id)
      }
      setQuotes(previousQuotes)
      setQuota(previousQuota)
      setSelectedQuotes(new Set(quoteIdsToDelete))
      setSelectionMode(true)
      setError(err instanceof Error ? err.message : 'Failed to delete quotes')
    } finally {
      setBulkDeleting(false)
    }
  }

  const toggleQuoteSelection = (quoteId: string) => {
    setSelectedQuotes(prev => {
      const next = new Set(prev)
      if (next.has(quoteId)) {
        next.delete(quoteId)
      } else {
        next.add(quoteId)
      }
      return next
    })
  }

  const selectAllOnPage = () => {
    setSelectedQuotes(new Set(quotes.map(q => q.id)))
  }

  const clearSelection = () => {
    setSelectedQuotes(new Set())
  }

  const exitSelectionMode = () => {
    setSelectionMode(false)
    setSelectedQuotes(new Set())
  }

  const clearFilters = () => {
    setSearchQuery('')
    setTemplateFilter('')
    setAnimatedFilter('')
    setQuotedUserFilter('')
    setUserSearchQuery('')
    setSortBy('created_at')
    setSortDir('desc')
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const hasActiveFilters = searchQuery || templateFilter || animatedFilter || quotedUserFilter
  const hasNonDefaultSort = sortBy !== 'created_at' || sortDir !== 'desc'

  // Get selected user info for display
  const selectedUser = quotedUsers.find(u => u.quoted_user_id === quotedUserFilter)

  // Filter users by search
  const filteredUsers = quotedUsers.filter(u =>
    !userSearchQuery || u.quoted_user_name?.toLowerCase().includes(userSearchQuery.toLowerCase())
  )

  return (
    <div className="max-w-6xl">
      {/* Sticky Header */}
      <div className="sticky top-0 z-30 bg-dark-900/95 backdrop-blur-sm -mx-4 px-4 pt-4 pb-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">Quote Gallery</h1>
              {realtimeConnected && (
                <div className="flex items-center gap-1.5 px-2 py-1 bg-success/10 border border-success/30 rounded-full" title="Real-time updates active">
                  <Wifi className="w-3 h-3 text-success" />
                  <span className="text-xs text-success font-medium">Live</span>
                </div>
              )}
            </div>
            <p className="text-dark-400 text-sm mt-1">
              {quota.isUnlimited
                ? `${quota.used} quotes (Unlimited storage)`
                : `${quota.used} / ${quota.max} quotes used`}
            </p>
          </div>

          {/* Search and Selection Toggle */}
          <div className="flex items-center gap-2">
            {selectionMode ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={selectAllOnPage}
                  className="px-3 py-2 bg-dark-800/50 border border-dark-700 rounded-xl text-sm hover:bg-dark-700 transition-colors"
                >
                  Select All
                </button>
                {selectedQuotes.size > 0 && (
                  <button
                    type="button"
                    onClick={clearSelection}
                    className="px-3 py-2 bg-dark-800/50 border border-dark-700 rounded-xl text-sm hover:bg-dark-700 transition-colors"
                  >
                    Clear
                  </button>
                )}
                <button
                  type="button"
                  onClick={exitSelectionMode}
                  className="p-2 rounded-xl border border-dark-700 bg-dark-800/50 text-dark-400 hover:text-white hover:bg-dark-700 transition-colors"
                  title="Exit selection mode"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <form onSubmit={handleSearch} className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
                  <input
                    type="text"
                    placeholder="Search quotes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 bg-dark-800/50 border border-dark-700 rounded-xl text-sm focus:outline-none focus:border-brand-500 w-full sm:w-64"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setShowFilters(!showFilters)}
                  className={`p-2 rounded-xl border transition-all ${
                    showFilters || hasActiveFilters
                      ? 'bg-brand-500 border-brand-500 text-white'
                      : 'bg-dark-800/50 border-dark-700 text-dark-400 hover:text-white'
                  }`}
                >
                  <Filter className="w-5 h-5" />
                </button>
                {quotes.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setSelectionMode(true)}
                    className="p-2 rounded-xl border border-dark-700 bg-dark-800/50 text-dark-400 hover:text-white hover:bg-dark-700 transition-colors"
                    title="Select multiple quotes"
                  >
                    <CheckSquare className="w-5 h-5" />
                  </button>
                )}
              </form>
            )}
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="glass rounded-xl p-4 mb-2 animate-slide-down relative z-20">
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="block text-xs text-dark-500 mb-1">Template</label>
              <select
                value={templateFilter}
                onChange={(e) => {
                  setTemplateFilter(e.target.value)
                  setPagination(prev => ({ ...prev, page: 1 }))
                }}
                className="px-3 py-2 bg-dark-800 border border-dark-700 rounded-lg text-sm focus:outline-none focus:border-brand-500"
              >
                <option value="">All Templates</option>
                {TEMPLATES.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs text-dark-500 mb-1">Type</label>
              <select
                value={animatedFilter}
                onChange={(e) => {
                  setAnimatedFilter(e.target.value)
                  setPagination(prev => ({ ...prev, page: 1 }))
                }}
                className="px-3 py-2 bg-dark-800 border border-dark-700 rounded-lg text-sm focus:outline-none focus:border-brand-500"
              >
                <option value="">All Types</option>
                <option value="false">Static (PNG)</option>
                <option value="true">Animated (GIF)</option>
              </select>
            </div>

            {/* Sort Options */}
            <div>
              <label className="block text-xs text-dark-500 mb-1">Sort By</label>
              <div className="flex gap-1">
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value)
                    setPagination(prev => ({ ...prev, page: 1 }))
                  }}
                  className="px-3 py-2 bg-dark-800 border border-dark-700 rounded-lg text-sm focus:outline-none focus:border-brand-500"
                >
                  <option value="created_at">Date</option>
                  <option value="quoted_user_name">Quoted User</option>
                </select>
                <button
                  onClick={() => {
                    setSortDir(sortDir === 'desc' ? 'asc' : 'desc')
                    setPagination(prev => ({ ...prev, page: 1 }))
                  }}
                  className="p-2 bg-dark-800 border border-dark-700 rounded-lg hover:bg-dark-700 transition-colors"
                  title={sortDir === 'desc' ? 'Descending' : 'Ascending'}
                >
                  {sortDir === 'desc' ? (
                    <ArrowDown className="w-4 h-4" />
                  ) : (
                    <ArrowUp className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Quoted User Filter - Searchable Dropdown */}
            <div className="relative" ref={userDropdownRef}>
              <label className="block text-xs text-dark-500 mb-1">Quoted Person</label>
              <button
                type="button"
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center gap-2 px-3 py-2 bg-dark-800 border border-dark-700 rounded-lg text-sm focus:outline-none focus:border-brand-500 min-w-[180px]"
              >
                {selectedUser ? (
                  <>
                    {selectedUser.quoted_user_avatar ? (
                      <Image
                        src={selectedUser.quoted_user_avatar}
                        alt={selectedUser.quoted_user_name || 'User'}
                        width={20}
                        height={20}
                        className="rounded-full"
                      />
                    ) : (
                      <div className="w-5 h-5 bg-dark-700 rounded-full flex items-center justify-center">
                        <User className="w-3 h-3 text-dark-500" />
                      </div>
                    )}
                    <span className="truncate">{selectedUser.quoted_user_name || 'Unknown'}</span>
                    <span className="text-dark-500 text-xs">({selectedUser.quote_count})</span>
                  </>
                ) : (
                  <>
                    <Users className="w-4 h-4 text-dark-500" />
                    <span className="text-dark-400">All People</span>
                  </>
                )}
                <ChevronDown className="w-4 h-4 text-dark-500 ml-auto" />
              </button>

              {/* Dropdown Panel */}
              {showUserDropdown && (
                <div className="absolute z-[100] top-full left-0 mt-1 w-72 bg-dark-800 border border-dark-700 rounded-xl shadow-xl overflow-hidden">
                  {/* Search Input */}
                  <div className="p-2 border-b border-dark-700">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
                      <input
                        type="text"
                        placeholder="Search people..."
                        value={userSearchQuery}
                        onChange={(e) => setUserSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-dark-900 border border-dark-700 rounded-lg text-sm focus:outline-none focus:border-brand-500"
                        autoFocus
                      />
                    </div>
                  </div>

                  {/* User List */}
                  <div className="max-h-64 overflow-y-auto">
                    {quotedUsersLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-5 h-5 animate-spin text-brand-500" />
                      </div>
                    ) : (
                      <>
                        {/* All People Option */}
                        <button
                          type="button"
                          onClick={() => {
                            setQuotedUserFilter('')
                            setShowUserDropdown(false)
                            setPagination(prev => ({ ...prev, page: 1 }))
                          }}
                          className={`w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-dark-700 transition-colors ${
                            !quotedUserFilter ? 'bg-brand-500/10' : ''
                          }`}
                        >
                          <Users className="w-5 h-5 text-dark-400" />
                          <span className="flex-1">All People</span>
                          {!quotedUserFilter && <Check className="w-4 h-4 text-brand-500" />}
                        </button>

                        {filteredUsers.length === 0 && userSearchQuery && (
                          <div className="px-3 py-4 text-center text-dark-500 text-sm">
                            No people found matching &quot;{userSearchQuery}&quot;
                          </div>
                        )}

                        {/* Top Quoted Section */}
                        {filteredUsers.length > 0 && !userSearchQuery && (
                          <div className="px-3 py-1.5 text-xs text-dark-500 bg-dark-900/50">
                            Most Quoted
                          </div>
                        )}

                        {filteredUsers.slice(0, 5).map(user => (
                          <button
                            key={user.quoted_user_id}
                            type="button"
                            onClick={() => {
                              setQuotedUserFilter(user.quoted_user_id)
                              setShowUserDropdown(false)
                              setUserSearchQuery('')
                              setPagination(prev => ({ ...prev, page: 1 }))
                            }}
                            className={`w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-dark-700 transition-colors ${
                              quotedUserFilter === user.quoted_user_id ? 'bg-brand-500/10' : ''
                            }`}
                          >
                            {user.quoted_user_avatar ? (
                              <Image
                                src={user.quoted_user_avatar}
                                alt={user.quoted_user_name || 'User'}
                                width={24}
                                height={24}
                                className="rounded-full"
                              />
                            ) : (
                              <div className="w-6 h-6 bg-dark-700 rounded-full flex items-center justify-center">
                                <User className="w-3 h-3 text-dark-500" />
                              </div>
                            )}
                            <span className="flex-1 truncate">{user.quoted_user_name || 'Unknown User'}</span>
                            <span className="text-xs text-dark-500 bg-dark-700 px-1.5 py-0.5 rounded">
                              {user.quote_count}
                            </span>
                            {quotedUserFilter === user.quoted_user_id && (
                              <Check className="w-4 h-4 text-brand-500" />
                            )}
                          </button>
                        ))}

                        {/* Others Section */}
                        {filteredUsers.length > 5 && !userSearchQuery && (
                          <>
                            <div className="px-3 py-1.5 text-xs text-dark-500 bg-dark-900/50">
                              Others ({filteredUsers.length - 5} more)
                            </div>
                            {filteredUsers.slice(5).map(user => (
                              <button
                                key={user.quoted_user_id}
                                type="button"
                                onClick={() => {
                                  setQuotedUserFilter(user.quoted_user_id)
                                  setShowUserDropdown(false)
                                  setUserSearchQuery('')
                                  setPagination(prev => ({ ...prev, page: 1 }))
                                }}
                                className={`w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-dark-700 transition-colors ${
                                  quotedUserFilter === user.quoted_user_id ? 'bg-brand-500/10' : ''
                                }`}
                              >
                                {user.quoted_user_avatar ? (
                                  <Image
                                    src={user.quoted_user_avatar}
                                    alt={user.quoted_user_name || 'User'}
                                    width={24}
                                    height={24}
                                    className="rounded-full"
                                  />
                                ) : (
                                  <div className="w-6 h-6 bg-dark-700 rounded-full flex items-center justify-center">
                                    <User className="w-3 h-3 text-dark-500" />
                                  </div>
                                )}
                                <span className="flex-1 truncate">{user.quoted_user_name || 'Unknown User'}</span>
                                <span className="text-xs text-dark-500 bg-dark-700 px-1.5 py-0.5 rounded">
                                  {user.quote_count}
                                </span>
                                {quotedUserFilter === user.quoted_user_id && (
                                  <Check className="w-4 h-4 text-brand-500" />
                                )}
                              </button>
                            ))}
                          </>
                        )}

                        {/* Show filtered results when searching */}
                        {userSearchQuery && filteredUsers.slice(5).map(user => (
                          <button
                            key={user.quoted_user_id}
                            type="button"
                            onClick={() => {
                              setQuotedUserFilter(user.quoted_user_id)
                              setShowUserDropdown(false)
                              setUserSearchQuery('')
                              setPagination(prev => ({ ...prev, page: 1 }))
                            }}
                            className={`w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-dark-700 transition-colors ${
                              quotedUserFilter === user.quoted_user_id ? 'bg-brand-500/10' : ''
                            }`}
                          >
                            {user.quoted_user_avatar ? (
                              <Image
                                src={user.quoted_user_avatar}
                                alt={user.quoted_user_name || 'User'}
                                width={24}
                                height={24}
                                className="rounded-full"
                              />
                            ) : (
                              <div className="w-6 h-6 bg-dark-700 rounded-full flex items-center justify-center">
                                <User className="w-3 h-3 text-dark-500" />
                              </div>
                            )}
                            <span className="flex-1 truncate">{user.quoted_user_name || 'Unknown User'}</span>
                            <span className="text-xs text-dark-500 bg-dark-700 px-1.5 py-0.5 rounded">
                              {user.quote_count}
                            </span>
                            {quotedUserFilter === user.quoted_user_id && (
                              <Check className="w-4 h-4 text-brand-500" />
                            )}
                          </button>
                        ))}
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>

            {(hasActiveFilters || hasNonDefaultSort) && (
              <button
                onClick={clearFilters}
                className="self-end px-3 py-2 text-sm text-dark-400 hover:text-white transition-colors"
              >
                Clear all
              </button>
            )}
          </div>
          </div>
        )}
      </div>

      {/* Quota Warning - only show for users with limited quota */}
      {!quota.isUnlimited && quota.remaining !== null && quota.remaining <= 5 && quota.remaining > 0 && (
        <div className="bg-warning/10 border border-warning/50 rounded-xl p-4 mb-6 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0" />
          <p className="text-sm text-warning">
            You&apos;re running low on storage! Only {quota.remaining} quote{quota.remaining !== 1 ? 's' : ''} remaining.
          </p>
        </div>
      )}

      {!quota.isUnlimited && quota.remaining === 0 && (
        <div className="bg-error/10 border border-error/50 rounded-xl p-4 mb-6 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-error flex-shrink-0" />
          <p className="text-sm text-error">
            You&apos;ve reached your storage limit. Delete some quotes or upgrade to Pro for more storage.
          </p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="glass rounded-xl p-8 text-center">
          <AlertTriangle className="w-12 h-12 text-error mx-auto mb-4" />
          <h3 className="font-semibold mb-2">Failed to load gallery</h3>
          <p className="text-dark-400 text-sm mb-4">{error}</p>
          <button
            onClick={fetchQuotes}
            className="px-4 py-2 bg-brand-500 hover:bg-brand-600 rounded-xl text-sm font-medium transition-colors"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && quotes.length === 0 && (
        <div className="glass rounded-xl p-12 text-center">
          <ImageIcon className="w-16 h-16 text-dark-600 mx-auto mb-4" />
          <h3 className="font-semibold text-lg mb-2">
            {hasActiveFilters ? 'No quotes match your filters' : 'No quotes yet'}
          </h3>
          <p className="text-dark-400 text-sm max-w-md mx-auto">
            {hasActiveFilters
              ? 'Try adjusting your filters or search query.'
              : 'Use the /quote command in Discord to create your first quote!'}
          </p>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="mt-4 px-4 py-2 text-brand-400 hover:text-brand-300 text-sm font-medium transition-colors"
            >
              Clear all filters
            </button>
          )}
        </div>
      )}

      {/* Quote Grid */}
      {!loading && !error && quotes.length > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {quotes.map(quote => (
              <QuoteCard
                key={quote.id}
                quote={quote}
                userProfile={userProfile}
                onClick={() => selectionMode ? toggleQuoteSelection(quote.id) : setSelectedQuote(quote)}
                onDelete={() => setDeleteConfirm(quote)}
                isNew={newQuoteIds.has(quote.id)}
                selectionMode={selectionMode}
                isSelected={selectedQuotes.has(quote.id)}
                onToggleSelect={() => toggleQuoteSelection(quote.id)}
              />
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                disabled={pagination.page === 1}
                className="p-2 rounded-lg bg-dark-800/50 border border-dark-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-dark-800 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <span className="px-4 py-2 text-sm text-dark-400">
                Page {pagination.page} of {pagination.totalPages}
              </span>

              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                disabled={pagination.page === pagination.totalPages}
                className="p-2 rounded-lg bg-dark-800/50 border border-dark-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-dark-800 transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </>
      )}

      {/* Quote Preview Modal */}
      {selectedQuote && (
        <QuoteModal
          quote={selectedQuote}
          userProfile={userProfile}
          onClose={() => setSelectedQuote(null)}
          onDelete={() => setDeleteConfirm(selectedQuote)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <DeleteConfirmModal
          quote={deleteConfirm}
          deleting={deleting}
          onConfirm={() => handleDelete(deleteConfirm)}
          onCancel={() => setDeleteConfirm(null)}
        />
      )}

      {/* Bulk Delete Confirmation Modal */}
      {bulkDeleteConfirm && (
        <BulkDeleteConfirmModal
          count={selectedQuotes.size}
          deleting={bulkDeleting}
          onConfirm={handleBulkDelete}
          onCancel={() => setBulkDeleteConfirm(false)}
        />
      )}

      {/* Selection Action Bar */}
      {selectionMode && selectedQuotes.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-slide-up">
          <div className="glass rounded-2xl px-6 py-4 flex items-center gap-4 shadow-xl border border-dark-600">
            <div className="flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-brand-400" />
              <span className="font-medium">
                {selectedQuotes.size} selected
              </span>
            </div>
            <div className="w-px h-6 bg-dark-600" />
            <button
              onClick={() => setBulkDeleteConfirm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-error hover:bg-error/90 rounded-xl font-medium transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Delete Selected
            </button>
            <button
              onClick={exitSelectionMode}
              className="p-2 text-dark-400 hover:text-white hover:bg-dark-700 rounded-lg transition-colors"
              title="Cancel"
            >
              <XCircle className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function QuoteCard({
  quote,
  userProfile,
  onClick,
  onDelete,
  isNew = false,
  selectionMode = false,
  isSelected = false,
  onToggleSelect
}: {
  quote: Quote
  userProfile: UserProfile | null
  onClick: () => void
  onDelete: () => void
  isNew?: boolean
  selectionMode?: boolean
  isSelected?: boolean
  onToggleSelect?: () => void
}) {
  const [showShareMenu, setShowShareMenu] = useState(false)

  // Use quote's quoter info, fallback to user's profile (since this is their gallery)
  const quoterName = quote.quoter_user_name || userProfile?.username || 'Unknown'
  const quoterAvatar = quote.quoter_user_avatar || userProfile?.avatar
  const quotedName = quote.quoted_user_name || quote.author_name || 'Unknown'

  const handleActionClick = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation()
    action()
  }

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onToggleSelect?.()
  }

  const getDownloadFilename = () => {
    const ext = quote.animated ? 'gif' : 'png'
    if (quote.quote_text) {
      // Take first ~40 chars of quote, sanitize for filename
      const sanitized = quote.quote_text
        .slice(0, 40)
        .replace(/[^a-zA-Z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .toLowerCase()
      if (sanitized) {
        return `${sanitized}.${ext}`
      }
    }
    // Fallback to quoted user name or original filename
    if (quote.quoted_user_name) {
      const sanitized = quote.quoted_user_name.replace(/[^a-zA-Z0-9-]/g, '').toLowerCase()
      return `quote-${sanitized}.${ext}`
    }
    return quote.file_name
  }

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      const response = await fetch(quote.public_url)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = getDownloadFilename()
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Download failed:', err)
    }
  }

  return (
    <button
      onClick={onClick}
      className={`group glass rounded-xl overflow-hidden text-left transition-all ${
        isNew ? 'ring-2 ring-success/50 animate-pulse-once' : ''
      } ${
        selectionMode && isSelected
          ? 'ring-2 ring-brand-500 bg-brand-500/10'
          : 'hover:ring-2 hover:ring-brand-500/50'
      } ${
        selectionMode ? 'cursor-pointer' : ''
      }`}
    >
      {/* Image */}
      <div className="relative aspect-video bg-dark-800">
        <Image
          src={quote.public_url}
          alt={quote.quote_text || 'Quote'}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        {/* Selection checkbox */}
        {selectionMode && (
          <div
            onClick={handleCheckboxClick}
            className={`absolute top-2 left-2 w-6 h-6 rounded-md flex items-center justify-center transition-all cursor-pointer ${
              isSelected
                ? 'bg-brand-500 text-white'
                : 'bg-dark-900/80 border border-dark-600 text-dark-400 hover:border-brand-500'
            }`}
          >
            {isSelected ? (
              <Check className="w-4 h-4" />
            ) : (
              <Square className="w-4 h-4" />
            )}
          </div>
        )}
        {quote.animated && (
          <div className={`absolute top-2 ${selectionMode ? 'right-2' : 'right-2'} px-2 py-1 bg-brand-500 text-white text-xs font-medium rounded-md flex items-center gap-1`}>
            <Film className="w-3 h-3" />
            GIF
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        {/* Quoter (who created the quote) */}
        <div className="flex items-center gap-2 mb-2">
          {quoterAvatar ? (
            <Image
              src={quoterAvatar}
              alt={quoterName}
              width={24}
              height={24}
              className="rounded-full"
            />
          ) : (
            <div className="w-6 h-6 bg-brand-500/20 rounded-full flex items-center justify-center">
              <User className="w-3 h-3 text-brand-400" />
            </div>
          )}
          <span className="text-sm font-medium truncate">{quoterName}</span>
        </div>

        {/* Quote text with quoted user */}
        {quote.quote_text && (
          <p className="text-dark-400 text-sm line-clamp-2 mb-2">
            &ldquo;{quote.quote_text}&rdquo;
          </p>
        )}

        {/* Quoted user (who was quoted) */}
        <div className="flex items-center gap-1.5 mb-2 text-xs text-dark-500">
          <MessageSquareQuote className="w-3 h-3" />
          <span>Quoting</span>
          {quote.quoted_user_avatar ? (
            <Image
              src={quote.quoted_user_avatar}
              alt={quotedName}
              width={16}
              height={16}
              className="rounded-full"
            />
          ) : (
            <div className="w-4 h-4 bg-dark-700 rounded-full flex items-center justify-center">
              <User className="w-2 h-2 text-dark-500" />
            </div>
          )}
          <span className="font-medium text-dark-400 truncate">{quotedName}</span>
        </div>

        <div className="flex items-center justify-between text-xs text-dark-500">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {new Date(quote.created_at).toLocaleDateString()}
            </span>
            <span className="px-1.5 py-0.5 bg-dark-800 rounded text-dark-400">
              {quote.template}
            </span>
          </div>

          {/* Quick action buttons */}
          <div className="flex items-center gap-1">
            {quote.message_url && (
              <a
                href={quote.message_url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="p-1.5 text-dark-500 hover:text-brand-400 hover:bg-brand-500/10 rounded-md transition-colors"
                title="Jump to message"
              >
                <MessageSquareQuote className="w-3.5 h-3.5" />
              </a>
            )}
            <div className="relative">
              <span
                role="button"
                tabIndex={0}
                onClick={(e) => { e.stopPropagation(); setShowShareMenu(!showShareMenu) }}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.stopPropagation(); setShowShareMenu(!showShareMenu) } }}
                className="p-1.5 text-dark-500 hover:text-brand-400 hover:bg-brand-500/10 rounded-md transition-colors cursor-pointer"
                title="Share"
              >
                <Share2 className="w-3.5 h-3.5" />
              </span>
              {showShareMenu && (
                <ShareMenu
                  url={quote.public_url}
                  title={quote.quote_text || undefined}
                  onClose={() => setShowShareMenu(false)}
                  position="top"
                />
              )}
            </div>
            <a
              href={quote.public_url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="p-1.5 text-dark-500 hover:text-white hover:bg-dark-700 rounded-md transition-colors"
              title="Open in new tab"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <span
              role="button"
              tabIndex={0}
              onClick={handleDownload}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleDownload(e as unknown as React.MouseEvent) }}
              className="p-1.5 text-dark-500 hover:text-white hover:bg-dark-700 rounded-md transition-colors cursor-pointer"
              title="Download"
            >
              <Download className="w-3.5 h-3.5" />
            </span>
            <span
              role="button"
              tabIndex={0}
              onClick={(e) => handleActionClick(e, onDelete)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleActionClick(e as unknown as React.MouseEvent, onDelete) }}
              className="p-1.5 text-dark-500 hover:text-error hover:bg-error/10 rounded-md transition-colors cursor-pointer"
              title="Delete"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      </div>
    </button>
  )
}

function QuoteModal({
  quote,
  userProfile,
  onClose,
  onDelete
}: {
  quote: Quote
  userProfile: UserProfile | null
  onClose: () => void
  onDelete: () => void
}) {
  const [showShareMenu, setShowShareMenu] = useState(false)

  // Use quote's quoter info, fallback to user's profile (since this is their gallery)
  const quoterName = quote.quoter_user_name || userProfile?.username || 'Unknown'
  const quoterAvatar = quote.quoter_user_avatar || userProfile?.avatar
  const quotedName = quote.quoted_user_name || quote.author_name || 'Unknown'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative glass rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-auto animate-scale-in">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-dark-400 hover:text-white hover:bg-dark-800 rounded-lg transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Image */}
        <div className="relative aspect-video bg-dark-900">
          <Image
            src={quote.public_url}
            alt={quote.quote_text || 'Quote'}
            fill
            className="object-contain"
            sizes="(max-width: 768px) 100vw, 768px"
          />
        </div>

        {/* Details */}
        <div className="p-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            {/* Quoter info (who created this quote) */}
            <div className="flex items-center gap-3">
              {quoterAvatar ? (
                <Image
                  src={quoterAvatar}
                  alt={quoterName}
                  width={48}
                  height={48}
                  className="rounded-full"
                />
              ) : (
                <div className="w-12 h-12 bg-brand-500/20 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-brand-400" />
                </div>
              )}
              <div>
                <h3 className="font-semibold">{quoterName}</h3>
                <p className="text-xs text-dark-500">Created this quote</p>
              </div>
            </div>

            <div className="flex gap-2">
              {quote.message_url && (
                <a
                  href={quote.message_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-dark-400 hover:text-brand-400 hover:bg-brand-500/10 rounded-lg transition-colors"
                  title="Jump to original message"
                >
                  <MessageSquareQuote className="w-5 h-5" />
                </a>
              )}
              <div className="relative">
                <button
                  onClick={() => setShowShareMenu(!showShareMenu)}
                  className="p-2 text-dark-400 hover:text-brand-400 hover:bg-brand-500/10 rounded-lg transition-colors"
                  title="Share"
                >
                  <Share2 className="w-5 h-5" />
                </button>
                {showShareMenu && (
                  <ShareMenu
                    url={quote.public_url}
                    title={quote.quote_text || undefined}
                    onClose={() => setShowShareMenu(false)}
                  />
                )}
              </div>
              <a
                href={quote.public_url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-dark-400 hover:text-white hover:bg-dark-800 rounded-lg transition-colors"
                title="Open in new tab"
              >
                <ExternalLink className="w-5 h-5" />
              </a>
              <a
                href={quote.public_url}
                download={quote.file_name}
                className="p-2 text-dark-400 hover:text-white hover:bg-dark-800 rounded-lg transition-colors"
                title="Download"
              >
                <Download className="w-5 h-5" />
              </a>
              <button
                onClick={onDelete}
                className="p-2 text-dark-400 hover:text-error hover:bg-error/10 rounded-lg transition-colors"
                title="Delete"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quoted user info (who was quoted) */}
          <div className="mb-4 p-4 bg-dark-800/50 rounded-xl">
            <div className="flex items-center gap-2 mb-2 text-xs text-dark-500">
              <MessageSquareQuote className="w-4 h-4 text-brand-400" />
              <span>Quoting</span>
            </div>
            <div className="flex items-center gap-3">
              {quote.quoted_user_avatar ? (
                <Image
                  src={quote.quoted_user_avatar}
                  alt={quotedName}
                  width={32}
                  height={32}
                  className="rounded-full"
                />
              ) : (
                <div className="w-8 h-8 bg-dark-700 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-dark-500" />
                </div>
              )}
              <div>
                <p className="font-medium text-dark-200">{quotedName}</p>
                {quote.quoted_user_id && (
                  <p className="text-xs text-dark-500">ID: {quote.quoted_user_id}</p>
                )}
              </div>
            </div>
            {quote.quote_text && (
              <p className="text-dark-300 mt-3 pl-11">&ldquo;{quote.quote_text}&rdquo;</p>
            )}
            {/* Jump to original message link(s) */}
            {(quote.message_url || (quote.message_urls && quote.message_urls.length > 0)) && (
              <div className="mt-3 pt-3 border-t border-dark-700">
                {quote.message_urls && quote.message_urls.length > 1 ? (
                  <div className="flex flex-wrap gap-2">
                    {quote.message_urls.map((url, index) => (
                      <a
                        key={index}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-dark-700 hover:bg-dark-600 rounded-lg text-xs text-brand-400 hover:text-brand-300 transition-colors"
                      >
                        <ExternalLink className="w-3 h-3" />
                        Message {index + 1}
                      </a>
                    ))}
                  </div>
                ) : (
                  <a
                    href={quote.message_url || quote.message_urls?.[0]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm text-brand-400 hover:text-brand-300 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Jump to original message
                  </a>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-dark-500 mb-1">Template</p>
              <p className="font-medium">{quote.template}</p>
            </div>
            <div>
              <p className="text-dark-500 mb-1">Theme</p>
              <p className="font-medium capitalize">{quote.theme}</p>
            </div>
            <div>
              <p className="text-dark-500 mb-1">Type</p>
              <p className="font-medium">{quote.animated ? 'Animated GIF' : 'Static PNG'}</p>
            </div>
            <div>
              <p className="text-dark-500 mb-1">Created</p>
              <p className="font-medium">{new Date(quote.created_at).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function DeleteConfirmModal({
  quote,
  deleting,
  onConfirm,
  onCancel
}: {
  quote: Quote
  deleting: boolean
  onConfirm: () => void
  onCancel: () => void
}) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onCancel} />

      {/* Modal */}
      <div className="relative glass rounded-2xl max-w-md w-full p-6 animate-scale-in">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 bg-error/20 rounded-full flex items-center justify-center flex-shrink-0">
            <Trash2 className="w-6 h-6 text-error" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Delete Quote?</h3>
            <p className="text-dark-400 text-sm">This action cannot be undone.</p>
          </div>
        </div>

        {/* Preview */}
        <div className="relative aspect-video bg-dark-800 rounded-xl overflow-hidden mb-6">
          <Image
            src={quote.public_url}
            alt="Quote to delete"
            fill
            className="object-cover"
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={deleting}
            className="flex-1 px-4 py-2.5 bg-dark-800 hover:bg-dark-700 rounded-xl font-medium transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={deleting}
            className="flex-1 px-4 py-2.5 bg-error hover:bg-error/90 rounded-xl font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {deleting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Deleting...
              </>
            ) : (
              'Delete'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

function BulkDeleteConfirmModal({
  count,
  deleting,
  onConfirm,
  onCancel
}: {
  count: number
  deleting: boolean
  onConfirm: () => void
  onCancel: () => void
}) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onCancel} />

      {/* Modal */}
      <div className="relative glass rounded-2xl max-w-md w-full p-6 animate-scale-in">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 bg-error/20 rounded-full flex items-center justify-center flex-shrink-0">
            <Trash2 className="w-6 h-6 text-error" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Delete {count} Quote{count !== 1 ? 's' : ''}?</h3>
            <p className="text-dark-400 text-sm">This action cannot be undone.</p>
          </div>
        </div>

        {/* Warning message */}
        <div className="bg-error/10 border border-error/30 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-error flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="text-error font-medium mb-1">Warning</p>
              <p className="text-dark-300">
                You are about to permanently delete <span className="font-semibold text-white">{count}</span> quote{count !== 1 ? 's' : ''}.
                This will remove them from your gallery and free up your storage quota.
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={deleting}
            className="flex-1 px-4 py-2.5 bg-dark-800 hover:bg-dark-700 rounded-xl font-medium transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={deleting}
            className="flex-1 px-4 py-2.5 bg-error hover:bg-error/90 rounded-xl font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {deleting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                Delete {count} Quote{count !== 1 ? 's' : ''}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

function ShareMenu({
  url,
  title,
  onClose,
  position = 'bottom'
}: {
  url: string
  title?: string
  onClose: () => void
  position?: 'bottom' | 'top'
}) {
  const [copied, setCopied] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const shareToTwitter = () => {
    const text = title ? `Check out this quote: "${title}"` : 'Check out this quote!'
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      '_blank',
      'width=550,height=420'
    )
    onClose()
  }

  const shareToReddit = () => {
    const postTitle = title ? `Quote: "${title}"` : 'Check out this quote!'
    window.open(
      `https://reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(postTitle)}`,
      '_blank'
    )
    onClose()
  }

  const nativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title || 'Quote',
          url: url
        })
        onClose()
      } catch (err) {
        // User cancelled or error
        console.error('Share failed:', err)
      }
    }
  }

  return (
    <div
      ref={menuRef}
      className={`absolute ${position === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'} right-0 z-50 w-48 bg-dark-800 border border-dark-700 rounded-xl shadow-xl overflow-hidden animate-scale-in`}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="p-1">
        <button
          onClick={handleCopyLink}
          className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-dark-700 rounded-lg transition-colors text-sm"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-success" />
              <span className="text-success">Copied!</span>
            </>
          ) : (
            <>
              <Link2 className="w-4 h-4 text-dark-400" />
              <span>Copy link</span>
            </>
          )}
        </button>

        {typeof navigator !== 'undefined' && 'share' in navigator && (
          <button
            onClick={nativeShare}
            className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-dark-700 rounded-lg transition-colors text-sm"
          >
            <Share2 className="w-4 h-4 text-dark-400" />
            <span>Share...</span>
          </button>
        )}

        <div className="h-px bg-dark-700 my-1" />

        <button
          onClick={shareToTwitter}
          className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-dark-700 rounded-lg transition-colors text-sm"
        >
          <svg className="w-4 h-4 text-dark-400" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
          <span>Share to X</span>
        </button>

        <button
          onClick={shareToReddit}
          className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-dark-700 rounded-lg transition-colors text-sm"
        >
          <svg className="w-4 h-4 text-dark-400" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" />
          </svg>
          <span>Share to Reddit</span>
        </button>
      </div>
    </div>
  )
}
