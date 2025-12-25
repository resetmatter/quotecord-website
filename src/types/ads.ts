// Ad Types for multi-advertiser system with billing

export type BillingType = 'free' | 'prepaid' | 'unlimited'

export interface Ad {
  id: string
  text: string // Full ad text for classic/profile templates
  shortText: string // Short ad text for discord/embed templates
  name: string | null // Internal name for admin reference
  description: string | null // Optional description/caption for context

  // Vanity URL system
  handle: string | null // Vanity URL handle (e.g., "logitech" for quotecord.com/go/logitech)
  destinationUrl: string | null // Where the handle redirects to

  // Status
  enabled: boolean // Whether this ad is in rotation
  weight: number // Weight for random selection (higher = more impressions)

  // Scheduling
  priority: number // Legacy field
  startDate: string | null // When this ad should start showing
  endDate: string | null // When this ad should stop showing
  targetGuilds: string[] | null // Optional: only show to specific guilds

  // Tracking
  impressions: number // Number of times this ad was shown (quotes generated)
  clicks: number // Number of times the handle URL was visited
  galleryShares: number // Number of times shared from website gallery

  // Billing
  billingType: BillingType // 'free' | 'prepaid' | 'unlimited'
  costPerQuoteCents: number // Cost per quote generation in cents
  budgetCents: number // Total prepaid budget in cents
  spentCents: number // Amount spent so far in cents
  stripeCustomerId: string | null // Stripe customer ID for payments

  // Advertiser info
  advertiserName: string | null // Company/brand name
  advertiserEmail: string | null // Contact email
  advertiserNotes: string | null // Internal notes

  // Metadata
  createdBy: string | null
  updatedBy: string | null
  createdAt: string
  updatedAt: string
}

// Computed fields for display
export interface AdWithStats extends Ad {
  remainingBudgetCents: number // budget_cents - spent_cents
  remainingQuotes: number // Estimated quotes remaining based on cost
  ctr: number // Click-through rate as percentage
}

// Computed stats
export interface AdStats {
  impressions: number
  clicks: number
  ctr: number // Click-through rate as percentage
  clicksToday: number
  clicksThisWeek: number
  clicksThisMonth: number
  galleryShares: number
}

// What the bot receives from GET /api/bot/ads
export interface BotAdResponse {
  text: string // Full ad text for classic/profile templates
  shortText: string // Short ad text for discord/embed templates
  enabled: boolean // Global on/off switch
  description?: string // Optional description/caption
  handle?: string // The vanity handle
  url?: string // The tracking URL (quotecord.com/go/handle)
}

// Admin API request/response types
export interface CreateAdRequest {
  text: string
  shortText: string
  name?: string
  description?: string
  handle?: string
  destinationUrl?: string
  enabled?: boolean
  weight?: number
  startDate?: string
  endDate?: string
  targetGuilds?: string[]
  advertiserName?: string
  advertiserEmail?: string
  advertiserNotes?: string
  // Billing
  billingType?: BillingType
  costPerQuoteCents?: number
  budgetCents?: number
  createdBy?: string
}

export interface UpdateAdRequest {
  text?: string
  shortText?: string
  name?: string
  description?: string
  handle?: string
  destinationUrl?: string
  enabled?: boolean
  weight?: number
  startDate?: string
  endDate?: string
  targetGuilds?: string[]
  advertiserName?: string
  advertiserEmail?: string
  advertiserNotes?: string
  // Billing
  billingType?: BillingType
  costPerQuoteCents?: number
  budgetCents?: number
  updatedBy?: string
}

// Transaction types
export interface AdTransaction {
  id: string
  adId: string
  type: 'credit' | 'debit' | 'refund'
  amountCents: number
  balanceAfterCents: number
  description: string | null
  stripePaymentIntentId: string | null
  stripeInvoiceId: string | null
  quotesCount: number | null
  createdAt: string
  createdBy: string | null
}

// Gallery share tracking
export interface AdGalleryShare {
  id: string
  adId: string
  quoteId: string | null
  sharedAt: string
  shareType: string
  referrer: string | null
  userAgent: string | null
  ipHash: string | null
}
