export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          discord_id: string
          discord_username: string | null
          discord_avatar: string | null
          email: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          discord_id: string
          discord_username?: string | null
          discord_avatar?: string | null
          email?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          discord_id?: string
          discord_username?: string | null
          discord_avatar?: string | null
          email?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          discord_id: string
          tier: string
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          current_period_start: string | null
          current_period_end: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          discord_id: string
          tier?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          current_period_start?: string | null
          current_period_end?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          discord_id?: string
          tier?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          current_period_start?: string | null
          current_period_end?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      presets: {
        Row: {
          id: string
          user_id: string
          name: string
          template: string
          font: string
          theme: string
          orientation: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          template: string
          font: string
          theme: string
          orientation?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          template?: string
          font?: string
          theme?: string
          orientation?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      quotes: {
        Row: {
          id: string
          user_id: string | null
          discord_id: string
          guild_id: string | null
          template: string
          font: string
          theme: string
          orientation: string | null
          animated: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          discord_id: string
          guild_id?: string | null
          template: string
          font: string
          theme: string
          orientation?: string | null
          animated?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          discord_id?: string
          guild_id?: string | null
          template?: string
          font?: string
          theme?: string
          orientation?: string | null
          animated?: boolean
          created_at?: string
        }
      }
      quote_gallery: {
        Row: {
          id: string
          user_id: string | null
          discord_id: string
          file_path: string
          file_name: string
          file_size: number | null
          mime_type: string
          template: string
          font: string
          theme: string
          orientation: string | null
          animated: boolean
          quote_text: string | null
          author_name: string | null
          guild_id: string | null
          public_url: string | null
          privacy_mode: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          discord_id: string
          file_path: string
          file_name: string
          file_size?: number | null
          mime_type: string
          template: string
          font: string
          theme: string
          orientation?: string | null
          animated?: boolean
          quote_text?: string | null
          author_name?: string | null
          guild_id?: string | null
          public_url?: string | null
          privacy_mode?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          discord_id?: string
          file_path?: string
          file_name?: string
          file_size?: number | null
          mime_type?: string
          template?: string
          font?: string
          theme?: string
          orientation?: string | null
          animated?: boolean
          quote_text?: string | null
          author_name?: string | null
          guild_id?: string | null
          public_url?: string | null
          privacy_mode?: string | null
          created_at?: string
        }
      }
      bot_api_keys: {
        Row: {
          id: string
          key_hash: string
          name: string
          is_active: boolean
          last_used_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          key_hash: string
          name: string
          is_active?: boolean
          last_used_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          key_hash?: string
          name?: string
          is_active?: boolean
          last_used_at?: string | null
          created_at?: string
        }
      }
      feature_flags: {
        Row: {
          id: string
          discord_id: string
          premium_override: boolean | null
          override_animated_gifs: boolean | null
          override_preview: boolean | null
          override_multi_message: boolean | null
          override_avatar_choice: boolean | null
          override_presets: boolean | null
          override_no_watermark: boolean | null
          override_max_gallery_size: number | null
          reason: string | null
          created_by: string | null
          expires_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          discord_id: string
          premium_override?: boolean | null
          override_animated_gifs?: boolean | null
          override_preview?: boolean | null
          override_multi_message?: boolean | null
          override_avatar_choice?: boolean | null
          override_presets?: boolean | null
          override_no_watermark?: boolean | null
          override_max_gallery_size?: number | null
          reason?: string | null
          created_by?: string | null
          expires_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          discord_id?: string
          premium_override?: boolean | null
          override_animated_gifs?: boolean | null
          override_preview?: boolean | null
          override_multi_message?: boolean | null
          override_avatar_choice?: boolean | null
          override_presets?: boolean | null
          override_no_watermark?: boolean | null
          override_max_gallery_size?: number | null
          reason?: string | null
          created_by?: string | null
          expires_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      ads: {
        Row: {
          id: string
          text: string
          short_text: string
          name: string | null
          description: string | null
          url: string | null
          enabled: boolean
          is_active: boolean
          priority: number
          start_date: string | null
          end_date: string | null
          target_guilds: string[] | null
          impressions: number
          created_by: string | null
          updated_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          text: string
          short_text: string
          name?: string | null
          description?: string | null
          url?: string | null
          enabled?: boolean
          is_active?: boolean
          priority?: number
          start_date?: string | null
          end_date?: string | null
          target_guilds?: string[] | null
          impressions?: number
          created_by?: string | null
          updated_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          text?: string
          short_text?: string
          name?: string | null
          description?: string | null
          url?: string | null
          enabled?: boolean
          is_active?: boolean
          priority?: number
          start_date?: string | null
          end_date?: string | null
          target_guilds?: string[] | null
          impressions?: number
          created_by?: string | null
          updated_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_premium_user: {
        Args: { discord_user_id: string }
        Returns: boolean
      }
      get_subscription_by_discord_id: {
        Args: { discord_user_id: string }
        Returns: {
          tier: string
          status: string
          current_period_end: string | null
        }[]
      }
      get_user_quote_count: {
        Args: { discord_user_id: string }
        Returns: number
      }
      check_storage_quota: {
        Args: { discord_user_id: string }
        Returns: boolean
      }
      get_feature_flags: {
        Args: { discord_user_id: string }
        Returns: {
          premium_override: boolean | null
          override_animated_gifs: boolean | null
          override_preview: boolean | null
          override_multi_message: boolean | null
          override_avatar_choice: boolean | null
          override_presets: boolean | null
          override_no_watermark: boolean | null
          override_max_gallery_size: number | null
          reason: string | null
          expires_at: string | null
        }[]
      }
      get_active_ad: {
        Args: Record<string, never>
        Returns: {
          id: string
          text: string
          short_text: string
          name: string | null
          description: string | null
          url: string | null
          enabled: boolean
          priority: number
        }[]
      }
      increment_ad_impressions: {
        Args: { ad_id: string }
        Returns: void
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
