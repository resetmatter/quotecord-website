// Ad Types

export interface Ad {
  id: string
  text: string // Full ad text for classic/profile templates
  shortText: string // Short ad text for discord/embed templates
  name: string | null // Internal name for admin reference
  description: string | null // Optional description/caption for context
  url: string | null // Optional URL for the ad destination
  enabled: boolean // Global on/off switch
  isActive: boolean // Which ad is currently being served
  priority: number // Higher priority shown first
  startDate: string | null // When this ad should start showing
  endDate: string | null // When this ad should stop showing
  targetGuilds: string[] | null // Optional: only show to specific guilds
  impressions: number // Number of times this ad has been shown
  createdBy: string | null
  updatedBy: string | null
  createdAt: string
  updatedAt: string
}

// What the bot receives from GET /api/bot/ads
export interface BotAdResponse {
  text: string // Full ad text for classic/profile templates
  shortText: string // Short ad text for discord/embed templates
  enabled: boolean // Global on/off switch
  description?: string // Optional description/caption
  url?: string // Optional URL
  // Future fields:
  // priority?: number
  // startDate?: string
  // endDate?: string
  // targetGuilds?: string[]
}

// Admin API request/response types
export interface CreateAdRequest {
  text: string
  shortText: string
  name?: string
  description?: string
  url?: string
  enabled?: boolean
  isActive?: boolean
  priority?: number
  startDate?: string
  endDate?: string
  targetGuilds?: string[]
  createdBy?: string
}

export interface UpdateAdRequest {
  text?: string
  shortText?: string
  name?: string
  description?: string
  url?: string
  enabled?: boolean
  isActive?: boolean
  priority?: number
  startDate?: string
  endDate?: string
  targetGuilds?: string[]
  updatedBy?: string
}
