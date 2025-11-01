import { env } from "@/data/env/server"
import { drizzle } from "drizzle-orm/node-postgres"
import * as schema from "@/drizzle/schema"

/**
 * Database instance using the DATABASE_URL from environment
 * Automatically switches between Supabase and Local PostgreSQL
 * based on DB_PROVIDER setting in .env
 */
export const db = drizzle(env.DATABASE_URL, { schema })
