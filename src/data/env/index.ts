import { createEnv } from "@t3-oss/env-nextjs"
import z from "zod"

export const env = createEnv({
  server: {
    DB_PROVIDER: z.enum(["supabase", "local"]).default("supabase").optional(),
    SUPABASE_DB_PASSWORD: z.string().min(1).optional(),
    SUPABASE_DB_HOST: z.string().min(1).optional(),
    SUPABASE_DB_PORT: z.string().min(1).optional(),
    SUPABASE_DB_USER: z.string().min(1).optional(),
    SUPABASE_DB_NAME: z.string().min(1).optional(),
    LOCAL_DB_PASSWORD: z.string().min(1).optional(),
    LOCAL_DB_HOST: z.string().min(1).optional(),
    LOCAL_DB_PORT: z.string().min(1).optional(),
    LOCAL_DB_USER: z.string().min(1).optional(),
    LOCAL_DB_NAME: z.string().min(1).optional(),
    ARCJET_KEY: z.string().min(1).optional(),
    SUPABASE_JWT_SECRET: z.string().min(1).optional(),
    STRIPE_SECRET_KEY: z.string().min(1).optional(),
    STRIPE_WEBHOOK_SECRET: z.string().min(1).optional(),
    HUME_API_KEY: z.string().min(1).optional(),
    HUME_SECRET_KEY: z.string().min(1).optional(),
    GEMINI_API_KEY: z.string().min(1).optional(),
  },
  client: {
    NEXT_PUBLIC_SUPABASE_URL: z.string().min(1).optional(),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1).optional(),
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().min(1).optional(),
    NEXT_PUBLIC_HUME_CONFIG_ID: z.string().min(1).optional(),
  },
  emptyStringAsUndefined: true,
  experimental__runtimeEnv: {
    // Server vars
    DB_PROVIDER: process.env.DB_PROVIDER,
    SUPABASE_DB_PASSWORD: process.env.SUPABASE_DB_PASSWORD,
    SUPABASE_DB_HOST: process.env.SUPABASE_DB_HOST,
    SUPABASE_DB_PORT: process.env.SUPABASE_DB_PORT,
    SUPABASE_DB_USER: process.env.SUPABASE_DB_USER,
    SUPABASE_DB_NAME: process.env.SUPABASE_DB_NAME,
    LOCAL_DB_PASSWORD: process.env.LOCAL_DB_PASSWORD,
    LOCAL_DB_HOST: process.env.LOCAL_DB_HOST,
    LOCAL_DB_PORT: process.env.LOCAL_DB_PORT,
    LOCAL_DB_USER: process.env.LOCAL_DB_USER,
    LOCAL_DB_NAME: process.env.LOCAL_DB_NAME,
    ARCJET_KEY: process.env.ARCJET_KEY,
    SUPABASE_JWT_SECRET: process.env.SUPABASE_JWT_SECRET,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    HUME_API_KEY: process.env.HUME_API_KEY,
    HUME_SECRET_KEY: process.env.HUME_SECRET_KEY,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    // Client vars
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    NEXT_PUBLIC_HUME_CONFIG_ID: process.env.NEXT_PUBLIC_HUME_CONFIG_ID,
  } as Record<string, string | undefined>,
})

// Helper function to build DATABASE_URL from environment variables
export function getDatabaseUrl() {
  const provider = process.env.DB_PROVIDER || "supabase"

  if (provider === "local") {
    const user = process.env.LOCAL_DB_USER
    const password = process.env.LOCAL_DB_PASSWORD
    const host = process.env.LOCAL_DB_HOST
    const port = process.env.LOCAL_DB_PORT
    const database = process.env.LOCAL_DB_NAME

    if (!user || !password || !host || !port || !database) {
      throw new Error("Local database credentials are missing. Please provide LOCAL_DB_* environment variables.")
    }

    return `postgres://${user}:${password}@${host}:${port}/${database}`
  } else {
    const user = process.env.SUPABASE_DB_USER
    const password = process.env.SUPABASE_DB_PASSWORD
    const host = process.env.SUPABASE_DB_HOST
    const port = process.env.SUPABASE_DB_PORT
    const database = process.env.SUPABASE_DB_NAME

    if (!user || !password || !host || !port || !database) {
      throw new Error("Supabase database credentials are missing. Please provide SUPABASE_DB_* environment variables.")
    }

    // Supabase requires SSL connections
    return `postgres://${user}:${password}@${host}:${port}/${database}?sslmode=require`
  }
}
