"use server"

import { getCurrentUser } from "@/services/auth/server"
import { createServerSupabaseClient } from "@/services/supabase/server"
import { insertInterview, updateInterview as updateInterviewDb } from "./db"
import { canCreateInterview } from "./permissions"
import { PLAN_LIMIT_MESSAGE, RATE_LIMIT_MESSAGE } from "@/lib/errorToast"
import { env } from "@/data/env/server"
import arcjet, { tokenBucket, request } from "@arcjet/next"
import { generateAiInterviewFeedback } from "@/services/ai/interviews"

const aj = env.ARCJET_KEY
  ? arcjet({
      characteristics: ["userId"],
      key: env.ARCJET_KEY as string,
      rules: [
        tokenBucket({
          capacity: 12,
          refillRate: 4,
          interval: "1d",
          mode: "LIVE",
        }),
      ],
    })
  : null

export async function createInterview({
  jobInfoId,
}: {
  jobInfoId: string
}): Promise<{ error: true; message: string } | { error: false; id: string }> {
  const user = await getCurrentUser()
  if (user == null) {
    return {
      error: true,
      message: "You don't have permission to do this",
    }
  }

  if (!(await canCreateInterview())) {
    return {
      error: true,
      message: PLAN_LIMIT_MESSAGE,
    }
  }

  // Only apply rate limiting if Arcjet is configured
  if (aj != null) {
    const decision = await aj.protect(await request(), {
      userId: user.id,
      requested: 1,
    })

    if (decision.isDenied()) {
      return {
        error: true,
        message: RATE_LIMIT_MESSAGE,
      }
    }
  }

  const jobInfo = await getJobInfo(jobInfoId, user.id)
  if (jobInfo == null) {
    return {
      error: true,
      message: "You don't have permission to do this",
    }
  }

  const interview = await insertInterview({ jobInfoId, duration: "00:00:00" })
  console.log("Created interview with ID:", interview.id)

  return { error: false, id: interview.id }
}

export async function updateInterview(
  id: string,
  data: {
    humeChatId?: string
    duration?: string
  }
) {
  const user = await getCurrentUser()
  if (user == null) {
    return {
      error: true,
      message: "You don't have permission to do this",
    }
  }

  const interview = await getInterview(id, user.id)
  if (interview == null) {
    return {
      error: true,
      message: "You don't have permission to do this",
    }
  }

  await updateInterviewDb(id, data)

  return { error: false }
}

export async function generateInterviewFeedback(interviewId: string) {
  const user = await getCurrentUser()
  if (user == null) {
    return {
      error: true,
      message: "You don't have permission to do this",
    }
  }

  const interview = await getInterview(interviewId, user.id)
  if (interview == null) {
    return {
      error: true,
      message: "You don't have permission to do this",
    }
  }

  if (interview.humeChatId == null) {
    return {
      error: true,
      message: "Interview has not been completed yet",
    }
  }

  const feedback = await generateAiInterviewFeedback({
    humeChatId: interview.humeChatId,
    jobInfo: interview.jobInfo,
    userName: user.user_metadata?.full_name || user.email || "User",
  })

  if (feedback == null) {
    return {
      error: true,
      message: "Failed to generate feedback",
    }
  }

  await updateInterviewDb(interviewId, { feedback })

  return { error: false }
}

async function getJobInfo(id: string, userId: string) {
  const supabase = await createServerSupabaseClient()

  const { data } = await supabase
    .from("job_info")
    .select("*")
    .eq("id", id)
    .eq("userId", userId)
    .single()

  return data
}

async function getInterview(id: string, userId: string) {
  const supabase = await createServerSupabaseClient()

  const { data: interview } = await supabase
    .from("interviews")
    .select("*")
    .eq("id", id)
    .single()

  if (interview == null) return null

  const { data: jobInfo } = await supabase
    .from("job_info")
    .select("id, userId, description, title, experienceLevel")
    .eq("id", interview.jobInfoId)
    .single()

  if (jobInfo == null || jobInfo.userId !== userId) return null

  return {
    ...interview,
    jobInfo,
  }
}
