'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import {
  Users,
  Search,
  Crown,
  User,
  Clock,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  AlertTriangle,
  X,
  ExternalLink,
  Flag,
  CreditCard,
  Images
} from 'lucide-react'

interface Member {
  id: string
  discordId: string
  discordUsername: string | null
  discordAvatar: string | null
  email: string | null
  createdAt: string
  updatedAt: string
  subscription: {
    tier: string
    status: string
    currentPeriodEnd: string | null
  } | null
  hasFeatureFlag: boolean
  featureFlag: {
    premiumOverride: boolean | null
    reason: string | null
    expiresAt: string | null
  } | null
  isPremium: boolean
  premiumSource: 'subscription' | 'flag' | 'none'
  quoteCount: number
}

interface MembersResponse {
  members: Member[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export default function MembersAdminPage() {
  const router = useRouter()
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const limit = 20

  // API Key helpers
  const getApiKey = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('adminApiKey') || ''
    }
    return ''
  }

  const setApiKey = (key: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('adminApiKey', key)
    }
  }

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery)
      setPage(1) // Reset to first page on new search
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  // Fetch members
  const fetchMembers = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      })
      if (debouncedSearch) {
        params.set('search', debouncedSearch)
      }

      const response = await fetch(`/api/admin/members?${params}`, {
        headers: {
          'Authorization': `Bearer ${getApiKey()}`
        }
      })

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Unauthorized - please check your API key')
        }
        throw new Error('Failed to fetch members')
      }

      const data: MembersResponse = await response.json()
      setMembers(data.members)
      setTotalPages(data.totalPages)
      setTotal(data.total)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch members')
    } finally {
      setLoading(false)
    }
  }, [page, debouncedSearch])

  useEffect(() => {
    fetchMembers()
  }, [fetchMembers])

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getPremiumBadge = (member: Member) => {
    if (!member.isPremium) return null

    if (member.premiumSource === 'flag') {
      return (
        <span className="flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400">
          <Flag className="w-3 h-3" />
          Override
        </span>
      )
    }
    return (
      <span className="flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-pro-gold/20 text-pro-gold">
        <Crown className="w-3 h-3" />
        Pro
      </span>
    )
  }

  return (
    <div className="max-w-6xl">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-500/20 flex items-center justify-center">
            <Users className="w-5 h-5 text-brand-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Members</h1>
            <p className="text-sm text-dark-400">View and manage all user accounts</p>
          </div>
        </div>
        <div className="text-sm text-dark-500">
          {total > 0 && `${total.toLocaleString()} total members`}
        </div>
      </div>

      {/* API Key Input */}
      <div className="glass rounded-xl p-4 mb-6">
        <label className="block text-xs text-dark-500 mb-2">Admin API Key</label>
        <input
          type="password"
          placeholder="Enter your BOT_API_KEY or ADMIN_API_KEY"
          defaultValue={getApiKey()}
          onChange={(e) => setApiKey(e.target.value)}
          className="w-full px-4 py-2.5 bg-dark-800 border border-dark-700 rounded-xl text-sm focus:outline-none focus:border-brand-500 transition-colors"
        />
        <p className="text-xs text-dark-500 mt-2">This key is stored locally and used for API authentication</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-error/10 border border-error/50 rounded-xl p-4 mb-6 flex items-center gap-3 animate-slide-down">
          <AlertTriangle className="w-5 h-5 text-error flex-shrink-0" />
          <p className="text-sm text-error">{error}</p>
          <button onClick={() => setError(null)} className="ml-auto p-1 hover:bg-dark-800 rounded-lg transition-colors">
            <X className="w-4 h-4 text-dark-400" />
          </button>
        </div>
      )}

      {/* Search and Actions */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
          <input
            type="text"
            placeholder="Search by Discord ID, username, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-dark-800/50 border border-dark-700 rounded-xl text-sm focus:outline-none focus:border-brand-500 transition-colors"
          />
        </div>
        <button
          onClick={fetchMembers}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 bg-dark-800 hover:bg-dark-700 rounded-xl border border-dark-700 transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Members List */}
      <div className="glass rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
          </div>
        ) : members.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-dark-600 mx-auto mb-3" />
            <p className="text-dark-400">
              {debouncedSearch ? 'No members match your search' : 'No members found'}
            </p>
            <p className="text-sm text-dark-500 mt-1">
              {debouncedSearch ? 'Try a different search term' : 'Members will appear here once users sign up'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-dark-800">
            {members.map((member) => (
              <div
                key={member.id}
                className="p-4 sm:p-5 hover:bg-dark-800/30 transition-colors cursor-pointer"
                onClick={() => router.push(`/dashboard/admin/members/${member.discordId}`)}
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  {/* User Info */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {member.discordAvatar ? (
                      <Image
                        src={member.discordAvatar}
                        alt={member.discordUsername || 'User'}
                        width={40}
                        height={40}
                        className="rounded-full flex-shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-brand-500/20 flex items-center justify-center flex-shrink-0">
                        <User className="w-5 h-5 text-brand-400" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium truncate">
                          {member.discordUsername || 'Unknown User'}
                        </span>
                        {getPremiumBadge(member)}
                        {member.hasFeatureFlag && !member.isPremium && (
                          <span className="flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-dark-700 text-dark-300">
                            <Flag className="w-3 h-3" />
                            Has Flags
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-dark-500 mt-1">
                        <code className="font-mono bg-dark-800 px-1.5 py-0.5 rounded">
                          {member.discordId}
                        </code>
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex flex-wrap items-center gap-4 text-xs text-dark-500">
                    <div className="flex items-center gap-1.5" title="Quotes saved">
                      <Images className="w-3.5 h-3.5" />
                      <span>{member.quoteCount}</span>
                    </div>
                    {member.subscription && (
                      <div className="flex items-center gap-1.5" title="Subscription status">
                        <CreditCard className="w-3.5 h-3.5" />
                        <span className="capitalize">{member.subscription.status}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5" title="Account created">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{formatDate(member.createdAt)}</span>
                    </div>
                  </div>

                  {/* Arrow */}
                  <ExternalLink className="w-4 h-4 text-dark-500 flex-shrink-0" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <p className="text-sm text-dark-500">
            Page {page} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1 || loading}
              className="flex items-center gap-1 px-3 py-2 bg-dark-800 hover:bg-dark-700 rounded-lg border border-dark-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || loading}
              className="flex items-center gap-1 px-3 py-2 bg-dark-800 hover:bg-dark-700 rounded-lg border border-dark-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
