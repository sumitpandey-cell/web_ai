import { createServerSupabaseClient } from "@/services/supabase/server"
import { getCurrentUser } from "@/services/auth/server"
import { getUserPlan, getUserSubscription, upsertUserSubscription } from "@/lib/billing/subscription"
import { canUserAnalyzeResume } from "@/lib/billing/permissions"
import type { PlanType } from "@/lib/billing/constants"

export async function canRunResumeAnalysis(): Promise<{
  allowed: boolean
  reason?: string
  limitExceeded?: boolean
}> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return {
        allowed: false,
        reason: "You must be logged in to analyze a resume",
      }
    }

    const supabase = await createServerSupabaseClient()

    // Get user's subscription, create if doesn't exist
    let subscription = await getUserSubscription(user.id)
    if (!subscription) {
      // Get the free plan ID
      const { data: freePlan } = await supabase
        .from("plans")
        .select("id")
        .eq("plan", "free")
        .single()

      if (!freePlan) {
        return {
          allowed: false,
          reason: "Free plan not found in system",
        }
      }

      // Create default subscription for new user
      subscription = await upsertUserSubscription(user.id, {
        plan_id: (freePlan as { id: string }).id,
        status: "active",
      })
    }

    if (!subscription) {
      return {
        allowed: false,
        reason: "Failed to create subscription record",
      }
    }

    // Get user's plan
    const plan = await getUserPlan(user.id)

    // Get current usage from subscription record
    const currentUsage = subscription.resume_analyses_used || 0

    // Check if user can analyze resume based on their plan and usage
    const result = canUserAnalyzeResume((plan as PlanType) || "free", currentUsage)
    console.log("Resume analysis permission result:", result)

    return result
  } catch (error) {
    console.error("Error checking resume analysis permission:", error)
    return {
      allowed: false,
      reason: "An error occurred while checking your permissions",
    }
  }
}
