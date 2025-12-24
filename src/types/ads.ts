// Ad Types for multi-advertiser system

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
  impressions: number // Number of times this ad was shown
  clicks: number // Number of times the handle URL was visited

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

// Computed stats
export interface AdStats {
  impressions: number
  clicks: number
  ctr: number // Click-through rate as percentage
  clicksToday: number
  clicksThisWeek: number
  clicksThisMonth: number
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
  updatedBy?: string
}
