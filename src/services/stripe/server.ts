import { env } from "@/data/env/server"
import Stripe from "stripe"
import { updateUserPlan, getUserPlan } from "@/lib/billing/subscription"
import type { PlanType } from "@/lib/billing/constants"

if (!env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not configured")
}

export const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-10-29.clover",
})

// Map Stripe product IDs to plan types
const STRIPE_PRICE_TO_PLAN: Record<string, PlanType> = {
  [process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID || "price_1QY4R4JgNV8kZ8gQ"]: "pro",
  [process.env.NEXT_PUBLIC_STRIPE_PRO_MAX_PRICE_ID || "price_pro_max"]: "pro_max",
}

/**
 * Creates or retrieves a Stripe customer for a user
 */
export async function getOrCreateStripeCustomer(
  userId: string,
  email: string,
  name?: string
) {
  // Search for existing customer
  const customers = await stripe.customers.search({
    query: `metadata["userId"]:"${userId}"`,
  })

  if (customers.data.length > 0) {
    return customers.data[0]
  }

  // Create new customer
  return stripe.customers.create({
    email,
    name,
    metadata: {
      userId,
    },
  })
}

/**
 * Creates a checkout session for subscription
 */
export async function createCheckoutSession(
  customerId: string,
  priceId: string,
  successUrl: string,
  cancelUrl: string
) {
  return stripe.checkout.sessions.create({
    customer: customerId,
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: "subscription",
    success_url: successUrl,
    cancel_url: cancelUrl,
    automatic_tax: {
      enabled: true,
    },
  })
}

/**
 * Gets subscription details
 */
export async function getSubscription(subscriptionId: string) {
  return stripe.subscriptions.retrieve(subscriptionId)
}

/**
 * Gets customer's active subscription
 */
export async function getCustomerSubscription(customerId: string) {
  const subscriptions = await stripe.subscriptions.list({
    customer: customerId,
    status: "active",
    limit: 1,
  })

  return subscriptions.data[0] || null
}

/**
 * Cancels a subscription
 */
export async function cancelSubscription(subscriptionId: string) {
  return stripe.subscriptions.cancel(subscriptionId)
}

/**
 * Cancels a user's subscription by customer ID
 */
export async function cancelCustomerSubscription(customerId: string) {
  const subscription = await getCustomerSubscription(customerId)
  if (subscription) {
    return stripe.subscriptions.cancel(subscription.id)
  }
  return null
}

/**
 * Get plan type from Stripe price ID
 */
export function getPlanFromStripePrice(priceId: string): PlanType | null {
  return STRIPE_PRICE_TO_PLAN[priceId] || null
}

/**
 * Handle subscription created/updated webhook
 */
export async function handleSubscriptionEvent(
  subscriptionData: Stripe.Subscription,
  userId: string
) {
  try {
    // Get the price ID from the subscription
    const priceId = subscriptionData.items.data[0]?.price.id
    const plan = priceId ? getPlanFromStripePrice(priceId) : null

    if (!plan) {
      console.error("Could not determine plan from Stripe subscription")
      return
    }

    // Update user's plan in database
    await updateUserPlan(userId, plan)

    console.log(`Updated user ${userId} to plan: ${plan}`)
  } catch (error) {
    console.error("Error handling subscription event:", error)
    throw error
  }
}

/**
 * Handle subscription deleted/canceled webhook
 */
export async function handleSubscriptionCanceled(userId: string) {
  try {
    // Revert user to free plan
    await updateUserPlan(userId, "free")
    console.log(`Reverted user ${userId} to free plan`)
  } catch (error) {
    console.error("Error handling subscription cancellation:", error)
    throw error
  }
}
