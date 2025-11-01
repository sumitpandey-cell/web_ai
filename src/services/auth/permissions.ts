import { createServerSupabaseClient } from "@/services/supabase/server"

export type Permission =
  | "create_interview"
  | "create_question"
  | "analyze_resume"

const PLAN_LIMITS = {
  free: {
    interviews_per_month: 1,
    questions_per_month: 5,
    resumes_per_month: 1,
  },
  pro: {
    interviews_per_month: -1, // unlimited
    questions_per_month: -1, // unlimited
    resumes_per_month: -1, // unlimited
  },
}

interface Subscription {
  id: string
  userId: string
  plan: "free" | "pro"
}

interface Usage {
  id: string
  subscriptionId: string
  userId: string
  interviewsCreated: string
  questionsGenerated: string
  resumeAnalysesCompleted: string
  periodStart: string
  periodEnd: string
}

/**
 * Check if user has permission to perform an action
 */
export async function hasPermission(userId: string, permission: Permission) {
  try {
    const supabase = await createServerSupabaseClient()

    // Get user's current subscription
    const { data: subscription, error: subError } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("userId", userId)
      .single()

    if (subError || !subscription) {
      // No subscription = free tier
      return checkFreePermission(userId, permission)
    }

    const limits = PLAN_LIMITS[(subscription as Subscription).plan]
    if (!limits) return false

    // Get current month usage
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)

    const { data: usage, error: usageError } = await supabase
      .from("usage")
      .select("*")
      .eq("subscriptionId", (subscription as Subscription).id)
      .single()

    let currentUsage = usage as Usage | null

    // If no usage record or period has passed, create new one
    if (!currentUsage || new Date(currentUsage.periodEnd) < now) {
      const { data: newUsage, error: insertError } = await supabase
        .from("usage")
        .insert({
          id: `usage_${userId}_${Date.now()}`,
          subscriptionId: (subscription as Subscription).id,
          userId,
          interviewsCreated: "0",
          questionsGenerated: "0",
          resumeAnalysesCompleted: "0",
          periodStart: monthStart.toISOString(),
          periodEnd: monthEnd.toISOString(),
        })
        .select()
        .single()

      if (insertError || !newUsage) {
        return false
      }
      currentUsage = newUsage as Usage
    }

    if (!currentUsage) return false

    // Check limits
    switch (permission) {
      case "create_interview":
        const limit = limits.interviews_per_month
        const interviews = parseInt(currentUsage.interviewsCreated.toString())
        return limit === -1 || interviews < limit

      case "create_question":
        const qLimit = limits.questions_per_month
        const questions = parseInt(currentUsage.questionsGenerated.toString())
        return qLimit === -1 || questions < qLimit

      case "analyze_resume":
        const rLimit = limits.resumes_per_month
        const resumes = parseInt(currentUsage.resumeAnalysesCompleted.toString())
        return rLimit === -1 || resumes < rLimit

      default:
        return false
    }
  } catch (error) {
    console.error("Permission check failed:", error)
    return false
  }
}

/**
 * Check permissions for free tier users (no subscription)
 */
async function checkFreePermission(
  userId: string,
  permission: Permission
): Promise<boolean> {
  const limits = PLAN_LIMITS.free

  // For free tier, check if they've used the API without subscription
  // This would typically track guest/unauthenticated usage
  switch (permission) {
    case "create_interview":
      return limits.interviews_per_month > 0
    case "create_question":
      return limits.questions_per_month > 0
    case "analyze_resume":
      return limits.resumes_per_month > 0
    default:
      return false
  }
}

/**
 * Record usage after a successful action
 */
export async function recordUsage(userId: string, permission: Permission) {
  try {
    const supabase = await createServerSupabaseClient()

    const { data: subscription, error: subError } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("userId", userId)
      .single()

    if (subError || !subscription) return

    const { data: usage, error: usageError } = await supabase
      .from("usage")
      .select("*")
      .eq("subscriptionId", (subscription as Subscription).id)
      .single()

    if (usageError || !usage) return

    const currentUsage = usage as Usage
    let updateData: Record<string, any> = {}

    switch (permission) {
      case "create_interview":
        updateData.interviewsCreated = (
          parseInt(currentUsage.interviewsCreated.toString()) + 1
        ).toString()
        break
      case "create_question":
        updateData.questionsGenerated = (
          parseInt(currentUsage.questionsGenerated.toString()) + 1
        ).toString()
        break
      case "analyze_resume":
        updateData.resumeAnalysesCompleted = (
          parseInt(currentUsage.resumeAnalysesCompleted.toString()) + 1
        ).toString()
        break
    }

    if (Object.keys(updateData).length > 0) {
      await supabase
        .from("usage")
        .update(updateData)
        .eq("id", currentUsage.id)
    }
  } catch (error) {
    console.error("Failed to record usage:", error)
  }
}
