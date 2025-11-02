/**
 * API endpoint to select a plan (especially for free plan)
 * POST /api/billing/select-plan
 */

import { auth } from "@clerk/nextjs/server"
import { upsertUserSubscription } from "@/lib/billing/subscription"
import { createServerSupabaseClient } from "@/services/supabase/server"
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

    // Get plan ID from plan type
    const supabase = await createServerSupabaseClient()
    const { data: planData } = await supabase
      .from("plans")
      .select("id")
      .eq("plan", plan)
      .single()

    if (!planData) {
      return new Response(JSON.stringify({ error: "Plan not found" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Update subscription with selected plan
    const subscription = await upsertUserSubscription(userId, {
      plan_id: (planData as { id: string }).id,
      status: "active",
      stripe_subscription_id: null,
      stripe_customer_id: null,
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
