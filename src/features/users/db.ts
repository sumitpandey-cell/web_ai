import { revalidateUserCache } from "./dbCache"

export interface User {
  id: string
  name: string
  email: string
  imageUrl: string
  createdAt: string
  updatedAt: string
}

/**
 * User data is now stored in Supabase Auth.
 * This function is deprecated and kept for compatibility.
 * Users are automatically managed by Supabase Auth.
 */
export async function upsertUser(user: Omit<User, "updatedAt">) {
  // User management is now handled through Supabase Auth
  // No need to sync to a separate table
  revalidateUserCache(user.id)
}

/**
 * User deletion is now handled through Supabase Auth.
 * This function is deprecated and kept for compatibility.
 */
export async function deleteUser(id: string) {
  // User deletion is now handled through Supabase Auth
  revalidateUserCache(id)
}
