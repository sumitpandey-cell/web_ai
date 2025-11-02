/**
 * GET /api/billing/usage
 * Returns current plan and usage statistics for the authenticated user
 */

import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/services/supabase/server"
import { getUserSubscription, getUserPlan } from "@/lib/billing/subscription"
import { getAllUsageStatus } from "@/lib/billing/usage"

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient()
    
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const userId = user.id

    // Get user's subscription and usage
    const subscription = await getUserSubscription(userId)
    const userPlan = await getUserPlan(userId)

    if (!subscription) {
      return NextResponse.json(
        { error: "Subscription not found" },
        { status: 404 }
      )
    }

    // Get usage status for all features
    const usageStatus = await getAllUsageStatus(userId)

    if (!usageStatus) {
      return NextResponse.json(
        { error: "Usage status not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      interviews: usageStatus.interviews,
      questions: usageStatus.questions,
      resumeAnalyses: usageStatus.resumeAnalyses,
      currentPlan: userPlan,
      subscription: {
        status: subscription.status,
        isActive: subscription.status === "active",
      },
    })
  } catch (error) {
    console.error("Error fetching usage:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
