import { createServerSupabaseClient } from "@/services/supabase/server"
import type { PostgrestError } from "@supabase/supabase-js"

export interface DatabaseError {
  code?: string
  message: string
  details?: string | null
  hint?: string | null
}

/**
 * Helper function to handle database errors
 */
function handleDbError(error: unknown): DatabaseError {
  // Handle Supabase PostgrestError
  if (error && typeof error === "object" && "message" in error) {
    const postgrestError = error as PostgrestError
    const message = postgrestError.message || "Unknown database error"
    const hint = postgrestError.hint as string | null
    const details = postgrestError.details as string | null
    const code = postgrestError.code as string | undefined

    console.error("Database error details:", { message, code, details, hint })

    return {
      message,
      code,
      details,
      hint,
    }
  }

  // Handle standard Error
  if (error instanceof Error) {
    console.error("Error instance:", error.message)
    return {
      message: error.message,
      code: "UNKNOWN_ERROR",
      details: null,
      hint: null,
    }
  }

  // Handle string errors
  if (typeof error === "string") {
    console.error("String error:", error)
    return {
      message: error,
      code: "UNKNOWN_ERROR",
      details: null,
      hint: null,
    }
  }

  console.error("Unknown error type:", error)
  return {
    message: "An unknown database error occurred",
    code: "UNKNOWN_ERROR",
    details: null,
    hint: null,
  }
}

/**
 * Generic insert function
 */
export async function dbInsert<T extends Record<string, any>>(
  table: string,
  data: T
): Promise<T & { id: string }> {
  const supabase = await createServerSupabaseClient()

  const { data: result, error } = await supabase
    .from(table)
    .insert([data])
    .select()
    .single()

  if (error) {
    const dbError = handleDbError(error)
    throw new Error(dbError.message)
  }

  return result as T & { id: string }
}

/**
 * Generic update function
 */
export async function dbUpdate<T extends Record<string, any>>(
  table: string,
  id: string,
  data: Partial<T>
): Promise<T> {
  const supabase = await createServerSupabaseClient()

  const { data: result, error } = await supabase
    .from(table)
    .update(data)
    .eq("id", id)
    .select()
    .single()

  if (error) {
    const dbError = handleDbError(error)
    throw new Error(dbError.message)
  }

  return result as T
}

/**
 * Generic delete function
 */
export async function dbDelete(table: string, id: string): Promise<void> {
  const supabase = await createServerSupabaseClient()

  const { error } = await supabase.from(table).delete().eq("id", id)

  if (error) {
    const dbError = handleDbError(error)
    throw new Error(dbError.message)
  }
}

/**
 * Generic select single record function
 */
export async function dbSelectSingle<T extends Record<string, any>>(
  table: string,
  id: string
): Promise<T | null> {
  const supabase = await createServerSupabaseClient()

  const { data, error } = await supabase
    .from(table)
    .select("*")
    .eq("id", id)
    .single()

  if (error && error.code !== "PGRST116") {
    const dbError = handleDbError(error)
    throw new Error(dbError.message)
  }

  return (data as T) || null
}

/**
 * Generic select multiple records function with optional where conditions
 */
export async function dbSelectMany<T extends Record<string, any>>(
  table: string,
  options?: {
    where?: Record<string, any>
    orderBy?: { column: string; ascending?: boolean }
    limit?: number
  }
): Promise<T[]> {
  const supabase = await createServerSupabaseClient()

  let query = supabase.from(table).select("*")

  // Add where conditions
  if (options?.where) {
    for (const [key, value] of Object.entries(options.where)) {
      if (Array.isArray(value)) {
        query = query.in(key, value)
      } else {
        query = query.eq(key, value)
      }
    }
  }

  // Add ordering
  if (options?.orderBy) {
    query = query.order(options.orderBy.column, {
      ascending: options.orderBy.ascending !== false,
    })
  }

  // Add limit
  if (options?.limit) {
    query = query.limit(options.limit)
  }

  const { data, error } = await query

  if (error) {
    const dbError = handleDbError(error)
    throw new Error(dbError.message)
  }

  return (data as T[]) || []
}

/**
 * Upsert function for insert or update
 */
export async function dbUpsert<T extends Record<string, any>>(
  table: string,
  data: T,
  onConflict: string
): Promise<T> {
  const supabase = await createServerSupabaseClient()

  const { data: result, error } = await supabase
    .from(table)
    .upsert([data], {
      onConflict,
    })
    .select()
    .single()

  if (error) {
    const dbError = handleDbError(error)
    throw new Error(dbError.message)
  }

  return result as T
}

/**
 * Execute a raw query (use with caution)
 */
export async function dbRawQuery<T extends Record<string, any>>(
  query: string,
  params?: any[]
): Promise<T[]> {
  const supabase = await createServerSupabaseClient()

  const { data, error } = await supabase.rpc("execute_query", {
    query,
    params: params || [],
  })

  if (error) {
    throw handleDbError(error)
  }

  return (data as T[]) || []
}
