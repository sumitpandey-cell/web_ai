import { getCurrentUser } from "@/services/auth/server"
import { createServerSupabaseClient } from "@/services/supabase/server"
import { stripe } from "@/services/stripe/server"
import { NextRequest, NextResponse } from "next/server"
import { env } from "@/data/env/server"

export async function POST(request: NextRequest) {
  try {
    const supabaseUser = await getCurrentUser()

    if (!supabaseUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = await createServerSupabaseClient()

    // Get user's subscription
    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("userId", supabaseUser.id)
      .single()

    if (!subscription) {
      return NextResponse.json(
        { error: "No subscription found" },
        { status: 404 }
      )
    }

    // Create billing portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: subscription.stripeCustomerId,
      return_url: `${request.headers.get("origin") || process.env.NEXT_PUBLIC_APP_URL}/app/billing`,
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error("Billing portal error:", error)
    return NextResponse.json(
      { error: "Failed to create billing portal session" },
      { status: 500 }
    )
  }
}
