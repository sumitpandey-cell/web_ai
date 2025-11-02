/**
 * Plan Permissions - Check what features a user can access based on their plan
 */

import type { PlanType } from "./constants"
import { getPlan, isLimitReached } from "./constants"

export interface PlanPermissions {
  canCreateInterview: boolean
  canCreateQuestion: boolean
  canAnalyzeResume: boolean
  interviewLimit: number | "unlimited"
  questionLimit: number | "unlimited"
  resumeAnalysisLimit: number | "unlimited"
}

/**
 * Get all permissions for a plan
 */
export function getPlanPermissions(planType: PlanType): PlanPermissions {
  const plan = getPlan(planType)

  return {
    canCreateInterview: true,
    canCreateQuestion: true,
    canAnalyzeResume: true,
    interviewLimit: plan.features.interviews,
    questionLimit: plan.features.questions,
    resumeAnalysisLimit: plan.features.resumeAnalyses,
  }
}

/**
 * Check if user can create interviews
 */
export function canUserCreateInterview(
  planType: PlanType,
  currentCount: number
): {
  allowed: boolean
  reason?: string
  limitExceeded?: boolean
} {
  const plan = getPlan(planType)
  const limit = plan.features.interviews

  if (isLimitReached(currentCount, limit)) {
    return {
      allowed: false,
      limitExceeded: true,
      reason: `You have reached your ${limit === "unlimited" ? "daily" : "monthly"} interview limit. Upgrade your plan to create more interviews.`,
    }
  }

  return { allowed: true }
}

/**
 * Check if user can create questions
 */
export function canUserCreateQuestion(
  planType: PlanType,
  currentCount: number
): {
  allowed: boolean
  reason?: string
  limitExceeded?: boolean
} {
  const plan = getPlan(planType)
  const limit = plan.features.questions

  if (isLimitReached(currentCount, limit)) {
    return {
      allowed: false,
      limitExceeded: true,
      reason: `You have reached your ${limit === "unlimited" ? "daily" : "monthly"} question limit. Upgrade your plan to create more questions.`,
    }
  }

  return { allowed: true }
}

/**
 * Check if user can analyze resumes
 */
export function canUserAnalyzeResume(
  planType: PlanType,
  currentCount: number
): {
  allowed: boolean
  reason?: string
  limitExceeded?: boolean
} {
  const plan = getPlan(planType)
  console.log("Plan in permission check:", plan)
  const limit = plan.features.resumeAnalyses
  console.log("Resume analysis limit:", limit)

  if (isLimitReached(currentCount, limit)) {
    return {
      allowed: false,
      limitExceeded: true,
      reason: `You have reached your ${limit === "unlimited" ? "daily" : "monthly"} resume analysis limit. Upgrade your plan to analyze more resumes.`,
    }
  }

  return { allowed: true }
}

/**
 * Get remaining quota for a feature
 */
export function getRemainingQuota(
  planType: PlanType,
  feature: "interviews" | "questions" | "resumeAnalyses",
  currentCount: number
): {
  remaining: number | "unlimited"
  limit: number | "unlimited"
} {
  const plan = getPlan(planType)
  const limit = plan.features[feature]

  if (limit === "unlimited") {
    return { remaining: "unlimited", limit: "unlimited" }
  }

  return {
    remaining: Math.max(0, limit - currentCount),
    limit,
  }
}

/**
 * Format quota message for UI
 */
export function formatQuotaMessage(
  remaining: number | "unlimited",
  limit: number | "unlimited",
  featureName: string
): string {
  if (remaining === "unlimited" && limit === "unlimited") {
    return `Unlimited ${featureName} available`
  }

  if (typeof remaining === "number" && typeof limit === "number") {
    return `${remaining} of ${limit} ${featureName} remaining this month`
  }

  return `${featureName} available`
}

/**
 * Check if usage has exceeded plan limit
 */
export function hasUsageExceeded(
  planType: PlanType,
  currentUsage: number,
  feature: "interviews" | "questions" | "resumeAnalyses"
): boolean {
  const plan = getPlan(planType)
  const limit = plan.features[feature]

  if (limit === "unlimited") {
    return false
  }

  return currentUsage >= limit
}
