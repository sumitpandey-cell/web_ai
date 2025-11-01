import { defineConfig } from "drizzle-kit"

const getDatabaseUrl = () => {
  const provider = process.env.DB_PROVIDER || "supabase"

  if (provider === "local") {
    return `postgres://${process.env.LOCAL_DB_USER}:${process.env.LOCAL_DB_PASSWORD}@${process.env.LOCAL_DB_HOST}:${process.env.LOCAL_DB_PORT}/${process.env.LOCAL_DB_NAME}`
  }

  return `postgres://${process.env.SUPABASE_DB_USER}:${process.env.SUPABASE_DB_PASSWORD}@${process.env.SUPABASE_DB_HOST}:${process.env.SUPABASE_DB_PORT}/${process.env.SUPABASE_DB_NAME}`
}

export default defineConfig({
  out: "./src/drizzle/migrations",
  schema: "./src/drizzle/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: getDatabaseUrl(),
  },
})
