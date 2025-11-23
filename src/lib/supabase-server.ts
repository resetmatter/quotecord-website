import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'

// Server-side Supabase client with service role
export function createServiceClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}
