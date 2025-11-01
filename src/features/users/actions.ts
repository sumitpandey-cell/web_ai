"use server"

import { cacheTag } from "next/dist/server/use-cache/cache-tag"
import { getUserIdTag } from "./dbCache"
import { createServerSupabaseClient } from "@/services/supabase/server"

export async function getUser(id: string) {
  "use cache"
  cacheTag(getUserIdTag(id))

  const supabase = await createServerSupabaseClient()

  // Get user from Supabase Auth instead of users table
  const {
    data: { user },
    error,
  } = await supabase.auth.admin.getUserById(id)

  if (error || !user) {
    return null
  }

  // Return user data in the expected format
  return {
    id: user.id,
    email: user.email || "",
    name: user.user_metadata?.full_name || user.email || "User",
    imageUrl: user.user_metadata?.avatar_url || "",
    createdAt: user.created_at,
    updatedAt: user.updated_at,
  }
}
