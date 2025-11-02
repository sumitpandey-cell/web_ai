import { createServerSupabaseClient } from "@/services/supabase/server"
import { getCurrentUser } from "@/services/auth/server"
import { getUserPlan, getUserSubscription, upsertUserSubscription } from "@/lib/billing/subscription"
import { canUserCreateInterview } from "@/lib/billing/permissions"

export async function canCreateInterview(): Promise<{
  allowed: boolean
  reason?: string
  limitExceeded?: boolean
}> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return {
        allowed: false,
        reason: "You must be logged in to create an interview",
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
        plan_id: (freePlan as any).id,
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
    const currentUsage = subscription.interviews_used || 0

    // Check if user can create interview based on their plan and usage
    const result = canUserCreateInterview((plan as any) || "free", currentUsage)

    return result
  } catch (error) {
    console.error("Error checking interview creation permission:", error)
    return {
      allowed: false,
      reason: "An error occurred while checking your permissions",
    }
  }
}
