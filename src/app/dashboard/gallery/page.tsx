'use client'

import { useState, useEffect, useCallback } from 'react'
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
  Download
} from 'lucide-react'

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
    max: number
    remaining: number
  }
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
  const [quota, setQuota] = useState({ used: 0, max: 50, remaining: 50 })

  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [templateFilter, setTemplateFilter] = useState<string>('')
  const [animatedFilter, setAnimatedFilter] = useState<string>('')
  const [showFilters, setShowFilters] = useState(false)

  // Modal states
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<Quote | null>(null)
  const [deleting, setDeleting] = useState(false)

  const fetchQuotes = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString()
      })

      if (searchQuery) params.append('search', searchQuery)
      if (templateFilter) params.append('template', templateFilter)
      if (animatedFilter) params.append('animated', animatedFilter)

      const response = await fetch(`/api/gallery?${params}`)
      if (!response.ok) {
        throw new Error('Failed to fetch gallery')
      }

      const data: GalleryResponse = await response.json()
      setQuotes(data.quotes)
      setPagination(data.pagination)
      setQuota(data.quota)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load gallery')
    } finally {
      setLoading(false)
    }
  }, [pagination.page, pagination.limit, searchQuery, templateFilter, animatedFilter])

  useEffect(() => {
    fetchQuotes()
  }, [fetchQuotes])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const handleDelete = async (quote: Quote) => {
    setDeleting(true)
    try {
      const response = await fetch(`/api/gallery/${quote.id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete quote')
      }

      setDeleteConfirm(null)
      setSelectedQuote(null)
      fetchQuotes()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete quote')
    } finally {
      setDeleting(false)
    }
  }

  const clearFilters = () => {
    setSearchQuery('')
    setTemplateFilter('')
    setAnimatedFilter('')
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const hasActiveFilters = searchQuery || templateFilter || animatedFilter

  return (
    <div className="max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Quote Gallery</h1>
          <p className="text-dark-400 text-sm mt-1">
            {quota.used} / {quota.max} quotes used
          </p>
        </div>

        {/* Search */}
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
        </form>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="glass rounded-xl p-4 mb-6 animate-slide-down">
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

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="self-end px-3 py-2 text-sm text-dark-400 hover:text-white transition-colors"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>
      )}

      {/* Quota Warning */}
      {quota.remaining <= 5 && quota.remaining > 0 && (
        <div className="bg-warning/10 border border-warning/50 rounded-xl p-4 mb-6 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0" />
          <p className="text-sm text-warning">
            You&apos;re running low on storage! Only {quota.remaining} quote{quota.remaining !== 1 ? 's' : ''} remaining.
          </p>
        </div>
      )}

      {quota.remaining === 0 && (
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
                onClick={() => setSelectedQuote(quote)}
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
    </div>
  )
}

function QuoteCard({ quote, onClick }: { quote: Quote; onClick: () => void }) {
  const quoterName = quote.quoter_user_name || 'Unknown'
  const quotedName = quote.quoted_user_name || quote.author_name || 'Unknown'

  return (
    <button
      onClick={onClick}
      className="group glass rounded-xl overflow-hidden text-left hover:ring-2 hover:ring-brand-500/50 transition-all"
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
        {quote.animated && (
          <div className="absolute top-2 right-2 px-2 py-1 bg-brand-500 text-white text-xs font-medium rounded-md flex items-center gap-1">
            <Film className="w-3 h-3" />
            GIF
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        {/* Quoter (who created the quote) */}
        <div className="flex items-center gap-2 mb-2">
          {quote.quoter_user_avatar ? (
            <Image
              src={quote.quoter_user_avatar}
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

        <div className="flex items-center gap-3 text-xs text-dark-500">
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {new Date(quote.created_at).toLocaleDateString()}
          </span>
          <span className="px-1.5 py-0.5 bg-dark-800 rounded text-dark-400">
            {quote.template}
          </span>
        </div>
      </div>
    </button>
  )
}

function QuoteModal({
  quote,
  onClose,
  onDelete
}: {
  quote: Quote
  onClose: () => void
  onDelete: () => void
}) {
  const quoterName = quote.quoter_user_name || 'Unknown'
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
              {quote.quoter_user_avatar ? (
                <Image
                  src={quote.quoter_user_avatar}
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
