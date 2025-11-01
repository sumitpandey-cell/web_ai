"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { BackLink } from "@/components/BackLink"
import { useSearchParams } from "next/navigation"

const PRICING_PLANS = [
  {
    name: "Free",
    description: "Perfect for getting started",
    price: "$0",
    period: "forever",
    features: [
      "1 interview per month",
      "5 questions per month",
      "1 resume analysis per month",
      "Basic feedback",
    ],
    recommended: false,
    current: true,
  },
  {
    name: "Pro",
    description: "Unlimited everything",
    price: "$29",
    period: "per month",
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID || "price_1QY4R4JgNV8kZ8gQ",
    features: [
      "Unlimited interviews",
      "Unlimited questions",
      "Unlimited resume analyses",
      "Advanced AI feedback",
      "Priority support",
      "Cancel anytime",
    ],
    recommended: true,
  },
]

export default function UpgradePage() {
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const isCanceled = searchParams.get("canceled") === "true"

  async function handleCheckout(stripePriceId: string) {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId: stripePriceId }),
      })

      if (!response.ok) {
        throw new Error("Failed to create checkout session")
      }

      const { url } = await response.json()
      window.location.href = url
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container py-12">
      <div className="mb-8">
        <BackLink href="/app">Dashboard</BackLink>
      </div>

      <div className="max-w-5xl mx-auto space-y-8">
        <Alert variant="warning">
          <AlertTriangle />
          <AlertDescription>
            You have reached the limit of your current plan. Upgrade to Pro to continue using all features.
          </AlertDescription>
        </Alert>

        {isCanceled && (
          <Alert className="bg-blue-50 border-blue-200">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              Checkout was canceled. Feel free to try again anytime.
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div>
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h1>
            <p className="text-xl text-muted-foreground">
              Choose the plan that fits your interview prep needs
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {PRICING_PLANS.map((plan) => (
              <Card
                key={plan.name}
                className={`relative ${
                  plan.recommended ? "border-2 border-primary shadow-lg" : ""
                }`}
              >
                {plan.recommended && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold">
                      Most Popular
                    </span>
                  </div>
                )}

                <CardHeader>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                  <div>
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground ml-2">
                      {plan.period}
                    </span>
                  </div>

                  <ul className="space-y-3">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-3">
                        <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {plan.stripePriceId ? (
                    <Button
                      onClick={() => handleCheckout(plan.stripePriceId!)}
                      disabled={loading}
                      className="w-full"
                      size="lg"
                      variant={plan.recommended ? "default" : "outline"}
                    >
                      {loading ? "Processing..." : "Upgrade to Pro"}
                    </Button>
                  ) : (
                    <Button
                      asChild
                      className="w-full"
                      size="lg"
                      variant="outline"
                    >
                      <Link href="/app">Current Plan</Link>
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-12 text-center text-muted-foreground">
            <p>
              All plans include a{" "}
              <span className="font-semibold">7-day free trial</span> of Pro.
              Cancel anytime.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
