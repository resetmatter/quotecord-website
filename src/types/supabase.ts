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
    }
  }
}
