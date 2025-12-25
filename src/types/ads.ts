// Simple Ad Types for bot ad management

export interface Ad {
  id: string
  text: string // Full ad text for classic/profile templates
  shortText: string // Short ad text for discord/embed templates
  description: string | null // Discord subtext (1-2 sentences, shows below quote)
  name: string | null // Internal name for admin reference
  enabled: boolean // Whether this ad is in rotation
  weight: number // Weight for rotation (higher = shows more often)
  createdAt: string
  updatedAt: string
}

// What the bot receives from GET /api/bot/ads
export interface BotAdResponse {
  text: string
  shortText: string
  description: string | null // Discord subtext
  enabled: boolean
}
