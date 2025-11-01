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
    CLERK_SECRET_KEY: z.string().min(1),
    HUME_API_KEY: z.string().min(1),
    HUME_SECRET_KEY: z.string().min(1),
    GEMINI_API_KEY: z.string().min(1),
  },
  createFinalSchema: env => {
    return z.object(env).transform(val => {
      const provider = val.DB_PROVIDER || "supabase"

      let DATABASE_URL: string

      if (provider === "local") {
        if (!val.LOCAL_DB_USER || !val.LOCAL_DB_PASSWORD || !val.LOCAL_DB_HOST || !val.LOCAL_DB_PORT || !val.LOCAL_DB_NAME) {
          throw new Error("Local database credentials are missing. Please provide LOCAL_DB_* environment variables.")
        }
        DATABASE_URL = `postgres://${val.LOCAL_DB_USER}:${val.LOCAL_DB_PASSWORD}@${val.LOCAL_DB_HOST}:${val.LOCAL_DB_PORT}/${val.LOCAL_DB_NAME}`
      } else {
        if (!val.SUPABASE_DB_USER || !val.SUPABASE_DB_PASSWORD || !val.SUPABASE_DB_HOST || !val.SUPABASE_DB_PORT || !val.SUPABASE_DB_NAME) {
          throw new Error("Supabase database credentials are missing. Please provide SUPABASE_DB_* environment variables.")
        }
        // Supabase requires SSL connections
        DATABASE_URL = `postgres://${val.SUPABASE_DB_USER}:${val.SUPABASE_DB_PASSWORD}@${val.SUPABASE_DB_HOST}:${val.SUPABASE_DB_PORT}/${val.SUPABASE_DB_NAME}?sslmode=require`
      }

      const { DB_PROVIDER, SUPABASE_DB_PASSWORD, SUPABASE_DB_HOST, SUPABASE_DB_PORT, SUPABASE_DB_USER, SUPABASE_DB_NAME, LOCAL_DB_PASSWORD, LOCAL_DB_HOST, LOCAL_DB_PORT, LOCAL_DB_USER, LOCAL_DB_NAME, ...rest } = val

      return {
        ...rest,
        DATABASE_URL,
      }
    })
  },
  emptyStringAsUndefined: true,
  experimental__runtimeEnv: process.env,
})
