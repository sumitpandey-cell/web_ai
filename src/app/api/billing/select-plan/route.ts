/**
 * API endpoint to select a plan (especially for free plan)
 * POST /api/billing/select-plan
 */

import { auth } from "@clerk/nextjs/server"
import { upsertUserSubscription } from "@/lib/billing/subscription"
import type { PlanType } from "@/lib/billing/constants"

export async function POST(request: Request) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      })
    }

    const { plan } = await request.json() as { plan: PlanType }

    console.log("Requested plan:", plan)

    if (!plan) {
      return new Response(JSON.stringify({ error: "Plan is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    if (!["free", "pro", "pro_max"].includes(plan)) {
      return new Response(JSON.stringify({ error: "Invalid plan type" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Update subscription with selected plan
    const subscription = await upsertUserSubscription(userId, {
      plan,
      status: "active",
      stripeSubscriptionId: null,
      stripeCustomerId: null,
      canceledAt: null,
    })

    if (!subscription) {
      return new Response(
        JSON.stringify({ error: "Failed to update subscription" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      )
    }

    return new Response(JSON.stringify({ success: true, subscription }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    console.error("Select plan error:", error)
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
