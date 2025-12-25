// Simple Ad Types for bot ad management

export interface Ad {
  id: string
  text: string // Full ad text for classic/profile templates
  shortText: string // Short ad text for discord/embed templates
  name: string | null // Internal name for admin reference
  enabled: boolean // Whether this ad can be selected
  isActive: boolean // The currently active ad shown to users
  createdAt: string
  updatedAt: string
}

// What the bot receives from GET /api/bot/ads
export interface BotAdResponse {
  text: string
  shortText: string
  enabled: boolean
}
