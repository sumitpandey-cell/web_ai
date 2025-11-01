import { stripe } from "@/services/stripe/server"
import { createServerSupabaseClient } from "@/services/supabase/server"
import { NextRequest } from "next/server"
import { env } from "@/data/env/server"

interface StripeSubscription {
  id: string
  customer: string
  status: string
  metadata?: { userId?: string; plan?: string }
  current_period_start: number
  current_period_end: number
}

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get("stripe-signature")

  if (!signature) {
    return new Response("Missing signature", { status: 400 })
  }

  let event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error("Webhook signature verification failed:", err)
    return new Response("Invalid signature", { status: 400 })
  }

  try {
    const supabase = await createServerSupabaseClient()

    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as unknown as StripeSubscription
        const userId = subscription.metadata?.userId

        if (!userId) {
          console.warn("No userId in subscription metadata")
          break
        }

        await supabase.from("subscriptions").upsert({
          id: `sub_${userId}_${Date.now()}`,
          userId,
          stripeSubscriptionId: subscription.id,
          stripeCustomerId: subscription.customer,
          plan: subscription.metadata?.plan || "free",
          status: subscription.status,
          currentPeriodStart: new Date(subscription.current_period_start * 1000).toISOString(),
          currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
        }, {
          onConflict: "stripeSubscriptionId",
        })

        console.log(
          `Subscription ${event.type === "customer.subscription.created" ? "created" : "updated"}: ${subscription.id}`
        )
        break
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as unknown as StripeSubscription

        await supabase
          .from("subscriptions")
          .update({
            status: "canceled",
            canceledAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          })
          .eq("stripeSubscriptionId", subscription.id)

        console.log(`Subscription deleted: ${subscription.id}`)
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }
  } catch (error) {
    console.error("Error processing webhook:", error)
    return new Response("Error processing webhook", { status: 500 })
  }

  return new Response("Webhook received", { status: 200 })
}
