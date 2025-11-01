import { env } from "@/data/env/client"
import { createBrowserClient } from "@supabase/ssr"

export function createClient() {
  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase URL and/or anon key are missing from environment")
  }

  return createBrowserClient(supabaseUrl, supabaseKey)
}
