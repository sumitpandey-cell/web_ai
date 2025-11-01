import { createServerSupabaseClient } from "@/services/supabase/server"
import { cache } from "react"

export const getCurrentUser = cache(async () => {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return user
})

export async function getCurrentUserOrRedirect() {
  const user = await getCurrentUser()

  if (!user) {
    throw new Error("Unauthorized - please sign in")
  }

  return user
}
