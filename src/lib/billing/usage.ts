/**
 * Usage tracking utilities
 */

import { getUserSubscription, incrementFeatureUsage } from "./subscription"
import { getFeatureLimit } from "./constants"
import { createServerSupabaseClient } from "@/services/supabase/server"
import type { PlanType } from "./constants"

export interface UsageStatus {
  feature: "interviews" | "questions" | "resumeAnalyses"
  planType: PlanType
  current: number
  limit: number | "unlimited"
  remaining: number | "unlimited"
  isExceeded: boolean
  percentageUsed: number
}

/**
 * Get plan type from subscription plan_id
 */
async function getPlanTypeFromSubscription(planId: string): Promise<PlanType> {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: plan } = await supabase
      .from("plans")
      .select("plan")
      .eq("id", planId)
      .single()

    return ((plan as any)?.plan || "free") as PlanType
  } catch (error) {
    console.error("Error fetching plan type:", error)
    return "free"
  }
}

/**
 * Get usage status for a specific feature
 */
export async function getUsageStatus(
  userId: string,
  feature: "interviews" | "questions" | "resumeAnalyses"
): Promise<UsageStatus | null> {
  const subscription = await getUserSubscription(userId)
  if (!subscription) {
    return null
  }

  const usageMap = {
    interviews: subscription.interviews_used || 0,
    questions: subscription.questions_used || 0,
    resumeAnalyses: subscription.resume_analyses_used || 0,
  }

  const planType = await getPlanTypeFromSubscription(subscription.plan_id)
  const currentUsage = usageMap[feature]
  const limit = getFeatureLimit(planType, feature)
  const isExceeded = limit !== "unlimited" && currentUsage >= limit

  let remaining: number | "unlimited" = "unlimited"
  let percentageUsed = 0

  if (limit !== "unlimited") {
    remaining = Math.max(0, limit - currentUsage)
    percentageUsed = Math.round((currentUsage / limit) * 100)
  }

  return {
    feature,
    planType,
    current: currentUsage,
    limit,
    remaining,
    isExceeded,
    percentageUsed,
  }
}

/**
 * Get all usage statuses
 */
export async function getAllUsageStatus(userId: string): Promise<{
  interviews: UsageStatus
  questions: UsageStatus
  resumeAnalyses: UsageStatus
} | null> {
  const interviews = await getUsageStatus(userId, "interviews")
  const questions = await getUsageStatus(userId, "questions")
  const resumeAnalyses = await getUsageStatus(userId, "resumeAnalyses")

  if (!interviews || !questions || !resumeAnalyses) {
    return null
  }

  return {
    interviews,
    questions,
    resumeAnalyses,
  }
}

/**
 * Track feature usage and check if limit exceeded
 */
export async function trackFeatureUsage(
  userId: string,
  feature: "interviews" | "questions" | "resumeAnalyses"
): Promise<{
  success: boolean
  limitExceeded: boolean
  newUsage: number
  limit: number | "unlimited"
  message?: string
}> {
  try {
    const subscription = await getUserSubscription(userId)
    if (!subscription) {
      return {
        success: false,
        limitExceeded: false,
        newUsage: 0,
        limit: "unlimited",
        message: "Subscription not found",
      }
    }

    const planType = await getPlanTypeFromSubscription(subscription.plan_id)
    const limit = getFeatureLimit(planType, feature)

    const usageMap = {
      interviews: subscription.interviews_used || 0,
      questions: subscription.questions_used || 0,
      resumeAnalyses: subscription.resume_analyses_used || 0,
    }

    const currentUsage = usageMap[feature]

    // Check if already exceeded limit
    if (limit !== "unlimited" && currentUsage >= limit) {
      return {
        success: false,
        limitExceeded: true,
        newUsage: currentUsage,
        limit,
        message: `You have reached your limit of ${limit} ${feature} for this month`,
      }
    }

    // Increment usage
    const updated = await incrementFeatureUsage(userId, feature)
    if (!updated) {
      return {
        success: false,
        limitExceeded: false,
        newUsage: currentUsage,
        limit,
        message: "Failed to update usage",
      }
    }

    const newUsage = usageMap[feature] + 1

    return {
      success: true,
      limitExceeded: false,
      newUsage,
      limit,
    }
  } catch (error) {
    console.error("Error tracking feature usage:", error)
    return {
      success: false,
      limitExceeded: false,
      newUsage: 0,
      limit: "unlimited",
      message: "Error tracking usage",
    }
  }
}

/**
 * Format usage for display
 */
export function formatUsageDisplay(usage: UsageStatus): string {
  if (usage.limit === "unlimited") {
    return "Unlimited"
  }

  if (usage.isExceeded) {
    return `${usage.current}/${usage.limit} (Limit Exceeded)`
  }

  return `${usage.current}/${usage.limit}`
}

/**
 * Get usage warning level
 */
export function getUsageWarningLevel(usage: UsageStatus): "none" | "warning" | "critical" {
  if (usage.limit === "unlimited") {
    return "none"
  }

  if (usage.isExceeded) {
    return "critical"
  }

  if (usage.percentageUsed >= 80) {
    return "warning"
  }

  return "none"
}
