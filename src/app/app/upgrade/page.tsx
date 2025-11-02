"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2, AlertTriangle, Zap } from "lucide-react"
import Link from "next/link"
import { BackLink } from "@/components/BackLink"
import { useSearchParams } from "next/navigation"
import { PLANS_LIST } from "@/lib/billing/constants"
import { UsageDisplay } from "@/components/UsageDisplay"
import type { UsageStatus } from "@/lib/billing/usage"
import { Skeleton } from "@/components/Skeleton"

export default function UpgradePage() {
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [usageLoading, setUsageLoading] = useState(true)
  const [usageData, setUsageData] = useState<{
    interviews: UsageStatus
    questions: UsageStatus
    resumeAnalyses: UsageStatus
    currentPlan: string
  } | null>(null)
  const isCanceled = searchParams.get("canceled") === "true"

  useEffect(() => {
    async function fetchUsage() {
      try {
        setUsageLoading(true)
        const response = await fetch("/api/billing/usage")
        if (response.ok) {
          const data = await response.json()
          setUsageData(data)
        }
      } catch (err) {
        console.error("Failed to fetch usage:", err)
      } finally {
        setUsageLoading(false)
      }
    }

    fetchUsage()
  }, [])

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

  async function handleSelectFreePlan() {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/billing/select-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: "free" }),
      })
      console.log("Select free plan response:", response)
      if (!response.ok) {
        throw new Error("Failed to select free plan")
      }

      // Refresh usage data and redirect
      window.location.href = "/app"
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

      <div className="max-w-6xl mx-auto space-y-8">
        {/* Usage Display Section */}
        {usageLoading ? (
          <div className="space-y-4 text-black">
            <Skeleton className="h-32" />
            <div className="grid md:grid-cols-3 gap-6">
              <Skeleton className="h-64" />
              <Skeleton className="h-64" />
              <Skeleton className="h-64" />
            </div>
          </div>
        ) : (
          usageData && (
            <UsageDisplay
              interviews={usageData.interviews}
              questions={usageData.questions}
              resumeAnalyses={usageData.resumeAnalyses}
              currentPlan={usageData.currentPlan}
            />
          )
        )}

        <Alert variant="warning">
          <AlertTriangle />
          <AlertDescription>
            Upgrade your plan to get unlimited access to all features and remove usage limits.
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
            <h1 className="text-4xl font-bold mb-4">Choose Your Perfect Plan</h1>
            <p className="text-xl text-muted-foreground">
              Select the plan that fits your interview prep needs
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {PLANS_LIST.map((plan) => (
              <Card
                key={plan.type}
                className={`relative flex flex-col transition-all duration-200 ${
                  plan.recommended
                    ? "md:scale-105 border-2 border-primary shadow-xl"
                    : "hover:shadow-lg"
                }`}
              >
                {plan.recommended && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-1.5 rounded-full">
                      <Zap className="h-4 w-4" />
                      <span className="text-sm font-semibold">Most Popular</span>
                    </div>
                  </div>
                )}

                <CardHeader>
                  
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription className="text-base">{plan.description}</CardDescription>
                </CardHeader>

                <CardContent className="flex-1 space-y-6 flex flex-col">
                  <div className="space-y-1">
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl font-bold">{plan.priceDisplay}</span>
                      <span className="text-muted-foreground text-sm">
                        {plan.period}
                      </span>
                    </div>
                    {plan.type !== "free" && (
                      <p className="text-xs text-muted-foreground">
                        Cancel anytime, no commitment
                      </p>
                    )}
                  </div>

                  <ul className="space-y-3 flex-1">
                    {plan.features.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-auto pt-6 space-y-3">
                    {plan.stripePriceId ? (
                      <>
                        <Button
                          onClick={() => handleCheckout(plan.stripePriceId!)}
                          disabled={loading}
                          className="w-full"
                          size="lg"
                          variant={plan.recommended ? "default" : "outline"}
                        >
                          {loading ? "Processing..." : `Upgrade to ${plan.name}`}
                        </Button>
                        <p className="text-xs text-center text-muted-foreground">
                          Start with 7-day free trial
                        </p>
                      </>
                    ) : plan.type === "free" ? (
                      <>
                        <Button
                          onClick={() => handleSelectFreePlan()}
                          disabled={loading}
                          className="w-full"
                          size="lg"
                          variant="outline"
                        >
                          {loading ? "Processing..." : "Select Free Plan"}
                        </Button>
                        <p className="text-xs text-center text-muted-foreground">
                          Start free, upgrade anytime
                        </p>
                      </>
                    ) : (
                      <Button
                        asChild
                        className="w-full"
                        size="lg"
                        variant="outline"
                      >
                        <Link href="/app">Your Current Plan</Link>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Comparison Table */}
          <div className="mt-16 space-y-6">
            <h2 className="text-2xl font-bold text-center mb-8">Feature Comparison</h2>
            
            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold">Feature</th>
                    {PLANS_LIST.map((plan) => (
                      <th
                        key={plan.type}
                        className={`px-4 py-3 text-center font-semibold ${
                          plan.recommended ? "bg-primary/5" : ""
                        }`}
                      >
                        {plan.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t">
                    <td className="px-4 py-3 font-medium">Interviews</td>
                    {PLANS_LIST.map((plan) => (
                      <td
                        key={plan.type}
                        className={`px-4 py-3 text-center ${
                          plan.recommended ? "bg-primary/5" : ""
                        }`}
                      >
                        {plan.features.interviews === "unlimited"
                          ? "Unlimited"
                          : plan.features.interviews}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-t bg-muted/30">
                    <td className="px-4 py-3 font-medium">Questions</td>
                    {PLANS_LIST.map((plan) => (
                      <td
                        key={plan.type}
                        className={`px-4 py-3 text-center ${
                          plan.recommended ? "bg-primary/5" : ""
                        }`}
                      >
                        {plan.features.questions === "unlimited"
                          ? "Unlimited"
                          : plan.features.questions}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-t">
                    <td className="px-4 py-3 font-medium">Resume Analyses</td>
                    {PLANS_LIST.map((plan) => (
                      <td
                        key={plan.type}
                        className={`px-4 py-3 text-center ${
                          plan.recommended ? "bg-primary/5" : ""
                        }`}
                      >
                        {plan.features.resumeAnalyses === "unlimited"
                          ? "Unlimited"
                          : plan.features.resumeAnalyses}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-t bg-muted/30">
                    <td className="px-4 py-3 font-medium">Support</td>
                    {PLANS_LIST.map((plan) => (
                      <td
                        key={plan.type}
                        className={`px-4 py-3 text-center ${
                          plan.recommended ? "bg-primary/5" : ""
                        }`}
                      >
                        {plan.type === "free" && "Community"}
                        {plan.type === "pro" && "Email"}
                        {plan.type === "pro_max" && "24/7 Phone & Email"}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-12 text-center space-y-4">
            <p className="text-muted-foreground text-sm">
              Have questions?{" "}
              <a href="mailto:support@example.com" className="text-primary hover:underline">
                Contact our support team
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
