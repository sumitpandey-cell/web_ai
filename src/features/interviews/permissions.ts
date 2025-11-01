import { createServerSupabaseClient } from "@/services/supabase/server"
import { getCurrentUser } from "@/services/auth/server"

export async function canCreateInterview() {
  try {
    const user = await getCurrentUser()
    if (!user) return false

    // Check if user has interview creation permission
    // This will check their subscription plan
    const supabase = await createServerSupabaseClient()
    const interviewCount = await getInterviewCount(user.id)

    // Get user's subscription to determine limit
    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("plan")
      .eq("userId", user.id)
      .single()

    const plan = subscription?.plan || "free"

    if (plan === "pro") {
      return true // Pro users have unlimited interviews
    }

    // Free tier users can create 1 interview per month
    // For now, we'll just check if they have any interviews created today
    // In production, you'd want proper monthly tracking
    return interviewCount < 1
  } catch (error) {
    console.error("Error checking interview creation permission:", error)
    return false
  }
}

async function getInterviewCount(userId: string) {
  try {
    const supabase = await createServerSupabaseClient()

    // Count interviews where the user owns the job info AND has humeChatId (completed)
    const { data: interviews, error } = await supabase
      .from("interviews")
      .select("id, jobInfo:job_info(userId)")
      .not("humeChatId", "is", null)

    if (error) {
      console.error("Error fetching interview count:", error)
      return 0
    }

    // Filter by userId since we can't do complex joins with Supabase PostgREST
    const userInterviews = (interviews as Array<{ jobInfo?: Array<{ userId: string }> }>)?.filter(
      interview => interview.jobInfo?.[0]?.userId === userId
    ) || []

    return userInterviews.length
  } catch (error) {
    console.error("Error getting interview count:", error)
    return 0
  }
}
