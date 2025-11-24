import { createServiceClient } from './supabase-server'
import { createHash } from 'crypto'

// Verify bot API key from Authorization header
export async function verifyBotApiKey(request: Request): Promise<boolean> {
  const authHeader = request.headers.get('Authorization')

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false
  }

  const apiKey = authHeader.substring(7) // Remove 'Bearer ' prefix

  // Check against environment variable first (simple mode)
  if (process.env.BOT_API_KEY && apiKey === process.env.BOT_API_KEY) {
    return true
  }

  // Check against database (advanced mode with multiple keys)
  const supabase = createServiceClient()
  const keyHash = createHash('sha256').update(apiKey).digest('hex')

  const { data, error } = await supabase
    .from('bot_api_keys')
    .select('id, is_active')
    .eq('key_hash', keyHash)
    .eq('is_active', true)
    .single()

  if (error || !data) {
    return false
  }

  // Update last used timestamp
  await supabase
    .from('bot_api_keys')
    .update({ last_used_at: new Date().toISOString() })
    .eq('id', data.id)

  return true
}

// Premium feature definitions
export const PREMIUM_FEATURES = {
  animatedGifs: {
    name: 'Animated GIFs',
    requiresPremium: true,
    description: 'Create animated GIF quotes from animated avatars'
  },
  preview: {
    name: 'Preview',
    requiresPremium: true,
    description: 'Preview quotes before posting to channel'
  },
  multiMessage: {
    name: 'Multi-Message Quotes',
    requiresPremium: true,
    description: 'Combine up to 5 messages in one quote'
  },
  avatarChoice: {
    name: 'Avatar Selection',
    requiresPremium: true,
    description: 'Choose between server and default avatar'
  },
  presets: {
    name: 'Save Presets',
    requiresPremium: true,
    description: 'Save up to 10 custom style presets'
  },
  noWatermark: {
    name: 'No Watermark',
    requiresPremium: true,
    description: 'Remove watermark from generated quotes'
  },
  galleryStorage: {
    name: 'Gallery Storage',
    requiresPremium: false, // Available to all, but with different limits
    description: 'Store generated memes in your gallery'
  }
} as const

export type FeatureKey = keyof typeof PREMIUM_FEATURES
