import { getCurrentUser } from "@/services/auth/server"
import { getOrCreateStripeCustomer, createCheckoutSession } from "@/services/stripe/server"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const supabaseUser = await getCurrentUser()

    if (!supabaseUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { priceId } = await request.json()

    if (!priceId) {
      return NextResponse.json(
        { error: "Price ID is required" },
        { status: 400 }
      )
    }

    // Get user email and name from Supabase Auth user
    const userEmail = supabaseUser.email || ""
    const userName = supabaseUser.user_metadata?.full_name || supabaseUser.email || "User"

    // Get or create Stripe customer
    const customer = await getOrCreateStripeCustomer(
      supabaseUser.id,
      userEmail,
      userName
    )

    // Get the app URL for success/cancel URLs
    const baseUrl = request.headers.get("origin") || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

    // Create checkout session
    const session = await createCheckoutSession(
      customer.id,
      priceId,
      `${baseUrl}/app/billing?success=true`,
      `${baseUrl}/app/upgrade?canceled=true`
    )

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error("Checkout error:", error)
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    )
  }
}
