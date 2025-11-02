/**
 * Subscription database operations
 */

import { createServerSupabaseClient } from "@/services/supabase/server"

export interface SubscriptionRecord {
  id: string
  user_id: string
  plan_id: string
  start_date: string
  end_date: string
  billing_cycle: string
  currency: string
  price: string
  stripe_subscription_id?: string | null
  stripe_customer_id?: string | null
  status: "active" | "canceled" | "past_due"
  auto_renew: boolean
  // Usage tracking fields
  interviews_used: number
  questions_used: number
  resume_analyses_used: number
  created_at: string
  updated_at: string
}

/**
 * Get user's subscription
 */
export async function getUserSubscription(userId: string): Promise<SubscriptionRecord | null> {
  const supabase = await createServerSupabaseClient()

  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", userId)
    .single()

  if (error && error.code !== "PGRST116") {
    console.error("Error fetching subscription:", error)
    return null
  }

  return data as SubscriptionRecord | null
}

/**
 * Create or update user subscription
 */
export async function upsertUserSubscription(
  userId: string,
  data: Partial<Omit<SubscriptionRecord, "id" | "user_id" | "created_at" | "updated_at">>
): Promise<SubscriptionRecord | null> {
  const supabase = await createServerSupabaseClient()

  // First try to get existing subscription
  const existing = await getUserSubscription(userId)

  if (existing) {
    // Update existing
    const { data: updated, error } = await supabase
      .from("subscriptions")
      .update({
        ...data,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId)
      .select()
      .single()

    if (error) {
      console.error("Error updating subscription:", error)
      return null
    }

    return updated as SubscriptionRecord
  } else {
    // Create new - need plan_id for the plans table
    const { data: created, error } = await supabase
      .from("subscriptions")
      .insert([
        {
          id: `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          user_id: userId,
          status: "active",
          auto_renew: true,
          ...data,
        },
      ])
      .select()
      .single()

    if (error) {
      console.error("Error creating subscription:", error)
      return null
    }

    return created as SubscriptionRecord
  }
}

/**
 * Get user's current plan type
 */
export async function getUserPlan(userId: string): Promise<string | null> {
  const supabase = await createServerSupabaseClient()
  const subscription = await getUserSubscription(userId)
  
  if (!subscription || !subscription.plan_id) {
    return null
  }

  // Fetch the plan details to get the plan type
  const { data: plan } = await supabase
    .from("plans")
    .select("plan")
    .eq("id", subscription.plan_id)
    .single()

  return (plan as any)?.plan || null
}

/**
 * Update user's plan by plan type (e.g., "free", "pro")
 */
export async function updateUserPlan(userId: string, planType: string): Promise<SubscriptionRecord | null> {
  const supabase = await createServerSupabaseClient()
  
  // First, find the plan ID based on the plan type
  const { data: plan } = await supabase
    .from("plans")
    .select("id")
    .eq("plan", planType)
    .single()

  if (!plan) {
    console.error(`Plan type '${planType}' not found`)
    return null
  }

  return upsertUserSubscription(userId, { plan_id: (plan as any).id })
}

/**
 * Cancel user's subscription
 */
export async function cancelUserSubscription(userId: string): Promise<SubscriptionRecord | null> {
  const supabase = await createServerSupabaseClient()

  const { data, error } = await supabase
    .from("subscriptions")
    .update({
      status: "canceled",
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId)
    .select()
    .single()

  if (error) {
    console.error("Error canceling subscription:", error)
    return null
  }

  return data as SubscriptionRecord
}

/**
 * Get subscription status
 */
export async function getSubscriptionStatus(
  userId: string
): Promise<{
  planId: string | null
  status: "active" | "canceled" | "past_due"
  isActive: boolean
}> {
  const subscription = await getUserSubscription(userId)

  if (!subscription) {
    return {
      planId: null,
      status: "active",
      isActive: true,
    }
  }

  return {
    planId: subscription.plan_id,
    status: subscription.status,
    isActive: subscription.status === "active",
  }
}

/**
 * Increment usage counter for a feature
 */
export async function incrementFeatureUsage(
  userId: string,
  feature: "interviews" | "questions" | "resumeAnalyses"
): Promise<SubscriptionRecord | null> {
  const supabase = await createServerSupabaseClient()

  const subscription = await getUserSubscription(userId)
  if (!subscription) {
    return null
  }

  const fieldMap = {
    interviews: "interviews_used",
    questions: "questions_used",
    resumeAnalyses: "resume_analyses_used",
  } as const

  const field = fieldMap[feature]
  const currentValue = subscription[field as keyof SubscriptionRecord] as number

  const { data, error } = await supabase
    .from("subscriptions")
    .update({
      [field]: (currentValue || 0) + 1,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId)
    .select()
    .single()

  if (error) {
    console.error(`Error incrementing ${feature} usage:`, error)
    return null
  }

  return data as SubscriptionRecord
}

/**
 * Get current usage for all features
 */
export async function getUserUsage(userId: string): Promise<{
  interviews_used: number
  questions_used: number
  resume_analyses_used: number
} | null> {
  const subscription = await getUserSubscription(userId)
  if (!subscription) {
    return null
  }

  return {
    interviews_used: subscription.interviews_used || 0,
    questions_used: subscription.questions_used || 0,
    resume_analyses_used: subscription.resume_analyses_used || 0,
  }
}

/**
 * Reset usage counters (call at start of each billing period)
 */
export async function resetUsageCounters(userId: string): Promise<SubscriptionRecord | null> {
  const supabase = await createServerSupabaseClient()

  const { data, error } = await supabase
    .from("subscriptions")
    .update({
      interviews_used: 0,
      questions_used: 0,
      resume_analyses_used: 0,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId)
    .select()
    .single()

  if (error) {
    console.error("Error resetting usage counters:", error)
    return null
  }

  return data as SubscriptionRecord
}
