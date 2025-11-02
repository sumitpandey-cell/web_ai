/**
 * Usage Display Component - Shows current plan usage and limits
 */

"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, TrendingUp, Zap } from "lucide-react"
import type { UsageStatus } from "@/lib/billing/usage"
import { getUsageWarningLevel, formatUsageDisplay } from "@/lib/billing/usage"

interface UsageDisplayProps {
  interviews: UsageStatus
  questions: UsageStatus
  resumeAnalyses: UsageStatus
  currentPlan: string
}

export function UsageDisplay({
  interviews,
  questions,
  resumeAnalyses,
  currentPlan,
}: UsageDisplayProps) {
  const usageStats = [
    {
      title: "Interviews",
      icon: "🎤",
      usage: interviews,
      description: "Monthly interview limit",
    },
    {
      title: "Questions",
      icon: "❓",
      usage: questions,
      description: "Monthly question limit",
    },
    {
      title: "Resume Analyses",
      icon: "📄",
      usage: resumeAnalyses,
      description: "Monthly analysis limit",
    },
  ]

  const anyLimitExceeded = [interviews, questions, resumeAnalyses].some(
    (usage) => usage.isExceeded
  )
  const anyCritical = [interviews, questions, resumeAnalyses].some(
    (usage) => getUsageWarningLevel(usage) === "critical"
  )
  const anyWarning = [interviews, questions, resumeAnalyses].some(
    (usage) => getUsageWarningLevel(usage) === "warning"
  )

  return (
    <div className="space-y-6">
      {/* Alert if any limit exceeded */}
      {anyCritical && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            You have exceeded the limit on your {currentPlan.toUpperCase()} plan. Upgrade to continue
            using all features without restrictions.
          </AlertDescription>
        </Alert>
      )}

      {!anyCritical && anyWarning && (
        <Alert className="bg-yellow-50 border-yellow-200">
          <TrendingUp className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            You're using most of your plan's allowance. Consider upgrading to avoid hitting limits.
          </AlertDescription>
        </Alert>
      )}

      {/* Current Plan Banner */}
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                Current Plan
              </CardTitle>
              <CardDescription>You are on the {currentPlan} plan</CardDescription>
            </div>
            <Badge variant="outline" className="text-lg px-3 py-1">
              {currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Usage Cards Grid */}
      <div className="grid md:grid-cols-3 gap-6">
        {usageStats.map(({ title, icon, usage, description }) => {
          const warningLevel = getUsageWarningLevel(usage)
          const isExceeded = usage.isExceeded

          return (
            <Card
            
              key={title}
              className={`transition-all duration-200 ${
                isExceeded
                  ? "border-red-200 bg-black-50"
                  : warningLevel === "warning"
                    ? "border-yellow-200 bg-yellow-50"
                    : ""
              }`}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{icon}</span>
                    <div>
                      <CardTitle className="text-base">{title}</CardTitle>
                      <CardDescription className="text-xs">
                        {description}
                      </CardDescription>
                    </div>
                  </div>
                  {isExceeded && (
                    <Badge variant="destructive" className="ml-auto">
                      Exceeded
                    </Badge>
                  )}
                  {!isExceeded && warningLevel === "warning" && (
                    <Badge variant="outline" className="ml-auto bg-yellow-100 text-yellow-800">
                      {Math.round(usage.percentageUsed)}%
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">
                      {formatUsageDisplay(usage)}
                    </span>
                    {usage.limit !== "unlimited" && (
                      <span className="text-xs text-muted-foreground">
                        {usage.percentageUsed}% used
                      </span>
                    )}
                  </div>
                  {usage.limit !== "unlimited" ? (
                    <Progress
                      value={Math.min(usage.percentageUsed, 100)}
                      className={`h-2 ${
                        isExceeded ? "bg-red-100" : warningLevel === "warning" ? "bg-yellow-100" : ""
                      }`}
                    />
                  ) : (
                    <div className="h-2 rounded-full bg-gradient-to-r from-blue-200 to-blue-100" />
                  )}
                </div>

                {usage.limit !== "unlimited" && (
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t bg-">
                    <div>
                      <p className="text-xs text-muted-foreground">Used</p>
                      <p className="text-sm font-semibold">{usage.current}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Remaining</p>
                      <p className="text-sm font-semibold">
                        {typeof usage.remaining === "number" ? usage.remaining : "∞"}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
