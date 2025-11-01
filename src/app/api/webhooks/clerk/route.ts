import { NextRequest } from "next/server"

/**
 * Webhook endpoint disabled - users are now synced directly to database
 * when they first authenticate via getCurrentUser() in Clerk provider
 */
export async function POST(request: NextRequest) {
  // Webhook disabled - user sync happens on authentication instead
  return new Response("Webhook disabled - user sync via authentication", { status: 200 })
}
