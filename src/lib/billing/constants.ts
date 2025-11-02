/**
 * Billing Plans and Feature Limits
 */

export type PlanType = "free" | "pro" | "pro_max"

export interface PlanFeatures {
  interviews: number | "unlimited"
  questions: number | "unlimited"
  resumeAnalyses: number | "unlimited"
  features: string[]
}

export interface Plan {
  type: PlanType
  name: string
  description: string
  price: number
  priceDisplay: string
  period: string
  stripePriceId?: string
  features: PlanFeatures
  recommended?: boolean
}

export const PLANS: Record<PlanType, Plan> = {
  free: {
    type: "free",
    name: "Free",
    description: "Perfect for getting started",
    price: 0,
    priceDisplay: "₹0",
    period: "forever",
    features: {
      interviews: 1,
      questions: 5,
      resumeAnalyses: 1,
      features: [
        "1 interview per month",
        "5 questions per month",
        "1 resume analysis per month",
        "Basic feedback",
        "Community support",
      ],
    },
  },
  pro: {
    type: "pro",
    name: "Pro",
    description: "For professionals and active job seekers",
    price: 99, // in cents for Stripe
    priceDisplay: "₹199",
    period: "per month",
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID || "price_1QY4R4JgNV8kZ8gQ",
    recommended: true,
    features: {
      interviews: 5,
      questions: 10,
      resumeAnalyses: 5,
      features: [
      "5 interviews per month",
      "10 questions per month",
      "5 resume analyses per month",
      "Advanced AI feedback",
      "Priority email support",
      "Cancel anytime",
      "API access",
      ],
    },
    },
    pro_max: {
    type: "pro_max",
    name: "Pro Max",
    description: "For interview experts and intensive prep",
    price: 499, // in cents for Stripe
    priceDisplay: "₹499",
    period: "per month",
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRO_MAX_PRICE_ID || "price_1QY4R4JgNV8kZ8gQ",
    features: {
      interviews: "unlimited",
      questions: "unlimited",
      resumeAnalyses: "unlimited",
      features: [
        "Everything in Pro",
        "Unlimited interviews",
        "Unlimited questions",
        "Unlimited resume analyses",
        "Expert AI feedback with personalized insights",
        "24/7 priority phone & email support",
        "Custom interview scenarios",
        "Performance analytics & reports",
        "Dedicated account manager",
        "Advanced API access with webhooks",
        "Batch analysis capabilities",
      ],
    },
  },
}

export const PLANS_LIST: Plan[] = [PLANS.free, PLANS.pro, PLANS.pro_max]

/**
 * Get plan by type
 */
export function getPlan(planType: PlanType): Plan {
  return PLANS[planType]
}

/**
 * Check if plan is free
 */
export function isFreeplan(planType: PlanType): boolean {
  return planType === "free"
}

/**
 * Check if plan is pro or higher
 */
export function isProOrHigher(planType: PlanType): boolean {
  return planType === "pro" || planType === "pro_max"
}

/**
 * Check if plan is pro max
 */
export function isProMax(planType: PlanType): boolean {
  return planType === "pro_max"
}

/**
 * Get feature limit for a plan
 */
export function getFeatureLimit(
  planType: PlanType,
  feature: "interviews" | "questions" | "resumeAnalyses"
): number | "unlimited" {
  return PLANS[planType].features[feature]
}

/**
 * Check if limit is reached
 */
export function isLimitReached(
  current: number,
  limit: number | "unlimited"
): boolean {
  if (limit === "unlimited") return false
  return current >= limit
}
