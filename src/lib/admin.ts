import { createServiceClient } from './supabase-server'
import { supabase } from './supabase'

// Admin user types
export interface AdminUser {
  id: string
  discordId: string
  role: 'admin' | 'super_admin'
  name: string | null
  createdBy: string | null
  createdAt: string
}

// Global feature flags types
export interface GlobalFeatureFlags {
  globalPremiumOverride: boolean | null
  globalAnimatedGifs: boolean | null
  globalPreview: boolean | null
  globalMultiMessage: boolean | null
  globalAvatarChoice: boolean | null
  globalPresets: boolean | null
  globalNoWatermark: boolean | null
  globalMaxGallerySize: number | null
  reason: string | null
  updatedBy: string | null
  updatedAt: string | null
}

// Database row types
interface AdminUserRow {
  id: string
  discord_id: string
  role: string
  name: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}

interface GlobalFlagsRow {
  id: string
  global_premium_override: boolean | null
  global_animated_gifs: boolean | null
  global_preview: boolean | null
  global_multi_message: boolean | null
  global_avatar_choice: boolean | null
  global_presets: boolean | null
  global_no_watermark: boolean | null
  global_max_gallery_size: number | null
  reason: string | null
  updated_by: string | null
  created_at: string
  updated_at: string
}

// ===========================================
// ADMIN USER FUNCTIONS
// ===========================================

// Check if a Discord ID is an admin (server-side)
export async function isAdminUser(discordId: string): Promise<boolean> {
  const supabase = createServiceClient()

  const { data, error } = await (supabase as any)
    .from('admin_users')
    .select('id')
    .eq('discord_id', discordId)
    .single()

  return !error && data !== null
}

// Check if current logged-in user is an admin (client-side compatible)
export async function checkCurrentUserIsAdmin(): Promise<{ isAdmin: boolean; discordId: string | null }> {
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    return { isAdmin: false, discordId: null }
  }

  // Get the user's Discord ID from their profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('discord_id')
    .eq('id', session.user.id)
    .single() as { data: { discord_id: string } | null; error: any }

  if (!profile?.discord_id) {
    return { isAdmin: false, discordId: null }
  }

  // Check admin status via API to use service role
  // This is a client-side function, so it makes an API call
  const response = await fetch('/api/admin/check', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ discordId: profile.discord_id })
  })

  if (!response.ok) {
    return { isAdmin: false, discordId: profile.discord_id }
  }

  const { isAdmin } = await response.json()
  return { isAdmin, discordId: profile.discord_id }
}

// Get admin user details
export async function getAdminUser(discordId: string): Promise<AdminUser | null> {
  const supabase = createServiceClient()

  const { data, error } = await supabase
    .from('admin_users')
    .select('*')
    .eq('discord_id', discordId)
    .single() as { data: AdminUserRow | null; error: any }

  if (error || !data) {
    return null
  }

  return {
    id: data.id,
    discordId: data.discord_id,
    role: data.role as 'admin' | 'super_admin',
    name: data.name,
    createdBy: data.created_by,
    createdAt: data.created_at
  }
}

// List all admin users
export async function listAdminUsers(): Promise<AdminUser[]> {
  const supabase = createServiceClient()

  const { data, error } = await (supabase as any)
    .from('admin_users')
    .select('*')
    .order('created_at', { ascending: false }) as { data: AdminUserRow[] | null; error: any }

  if (error || !data) {
    return []
  }

  return data.map(row => ({
    id: row.id,
    discordId: row.discord_id,
    role: row.role as 'admin' | 'super_admin',
    name: row.name,
    createdBy: row.created_by,
    createdAt: row.created_at
  }))
}

// Add an admin user
export async function addAdminUser(input: {
  discordId: string
  role?: 'admin' | 'super_admin'
  name?: string
  createdBy?: string
}): Promise<{ success: boolean; error?: string }> {
  const supabase = createServiceClient()

  const { error } = await (supabase as any)
    .from('admin_users')
    .insert({
      discord_id: input.discordId,
      role: input.role || 'admin',
      name: input.name || null,
      created_by: input.createdBy || null
    })

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true }
}

// Remove an admin user
export async function removeAdminUser(discordId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = createServiceClient()

  const { error } = await (supabase as any)
    .from('admin_users')
    .delete()
    .eq('discord_id', discordId)

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true }
}

// ===========================================
// GLOBAL FEATURE FLAGS FUNCTIONS
// ===========================================

const GLOBAL_FLAGS_ID = 'a0000000-0000-0000-0000-000000000001'

// Get global feature flags
export async function getGlobalFeatureFlags(): Promise<GlobalFeatureFlags> {
  const supabase = createServiceClient()

  const { data, error } = await supabase
    .from('global_feature_flags')
    .select('*')
    .eq('id', GLOBAL_FLAGS_ID)
    .single() as { data: GlobalFlagsRow | null; error: any }

  // Return defaults if no data
  if (error || !data) {
    return {
      globalPremiumOverride: null,
      globalAnimatedGifs: null,
      globalPreview: null,
      globalMultiMessage: null,
      globalAvatarChoice: null,
      globalPresets: null,
      globalNoWatermark: null,
      globalMaxGallerySize: null,
      reason: null,
      updatedBy: null,
      updatedAt: null
    }
  }

  return {
    globalPremiumOverride: data.global_premium_override,
    globalAnimatedGifs: data.global_animated_gifs,
    globalPreview: data.global_preview,
    globalMultiMessage: data.global_multi_message,
    globalAvatarChoice: data.global_avatar_choice,
    globalPresets: data.global_presets,
    globalNoWatermark: data.global_no_watermark,
    globalMaxGallerySize: data.global_max_gallery_size,
    reason: data.reason,
    updatedBy: data.updated_by,
    updatedAt: data.updated_at
  }
}

// Update global feature flags
export async function setGlobalFeatureFlags(input: {
  globalPremiumOverride?: boolean | null
  globalAnimatedGifs?: boolean | null
  globalPreview?: boolean | null
  globalMultiMessage?: boolean | null
  globalAvatarChoice?: boolean | null
  globalPresets?: boolean | null
  globalNoWatermark?: boolean | null
  globalMaxGallerySize?: number | null
  reason?: string | null
  updatedBy?: string | null
}): Promise<{ success: boolean; error?: string }> {
  const supabase = createServiceClient()

  const { error } = await (supabase as any)
    .from('global_feature_flags')
    .update({
      global_premium_override: input.globalPremiumOverride,
      global_animated_gifs: input.globalAnimatedGifs,
      global_preview: input.globalPreview,
      global_multi_message: input.globalMultiMessage,
      global_avatar_choice: input.globalAvatarChoice,
      global_presets: input.globalPresets,
      global_no_watermark: input.globalNoWatermark,
      global_max_gallery_size: input.globalMaxGallerySize,
      reason: input.reason,
      updated_by: input.updatedBy,
      updated_at: new Date().toISOString()
    })
    .eq('id', GLOBAL_FLAGS_ID)

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true }
}

// Reset all global feature flags to default (null)
export async function resetGlobalFeatureFlags(updatedBy?: string): Promise<{ success: boolean; error?: string }> {
  return setGlobalFeatureFlags({
    globalPremiumOverride: null,
    globalAnimatedGifs: null,
    globalPreview: null,
    globalMultiMessage: null,
    globalAvatarChoice: null,
    globalPresets: null,
    globalNoWatermark: null,
    globalMaxGallerySize: null,
    reason: 'Reset to defaults',
    updatedBy
  })
}
