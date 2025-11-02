import { createServerSupabaseClient } from "@/services/supabase/server"
import { questionDifficulties } from "@/lib/db/types"
import { insertQuestion } from "@/features/questions/db"
import { canCreateQuestion } from "@/features/questions/permissions"
import { PLAN_LIMIT_MESSAGE } from "@/lib/errorToast"
import { generateAiQuestion } from "@/services/ai/questions"
import { getCurrentUser } from "@/services/auth/server"
import { incrementFeatureUsage } from "@/lib/billing/subscription"
import { createDataStreamResponse } from "ai"
import z from "zod"

const schema = z.object({
  prompt: z.enum(questionDifficulties),
  jobInfoId: z.string().min(1),
})

export async function POST(req: Request) {
  const body = await req.json()
  const result = schema.safeParse(body)

  if (!result.success) {
    return new Response("Error generating your question", { status: 400 })
  }

  const { prompt: difficulty, jobInfoId } = result.data
  const supabaseUser = await getCurrentUser()

  if (supabaseUser == null) {
    return new Response("You are not logged in", { status: 401 })
  }

  if (!(await canCreateQuestion())) {
    return new Response(PLAN_LIMIT_MESSAGE, { status: 403 })
  }

  const jobInfo = await getJobInfo(jobInfoId, supabaseUser.id)
  if (jobInfo == null) {
    return new Response("You do not have permission to do this", {
      status: 403,
    })
  }

  const previousQuestions = await getQuestions(jobInfoId)

  return createDataStreamResponse({
    execute: async dataStream => {
      const res = generateAiQuestion({
        previousQuestions,
        jobInfo,
        difficulty,
        onFinish: async question => {
          const { id } = await insertQuestion({
            text: question,
            jobInfoId,
            difficulty,
          })

          // Track usage
          await incrementFeatureUsage(supabaseUser.id, "questions")

          dataStream.writeData({ questionId: id })
        },
      })
      res.mergeIntoDataStream(dataStream, { sendUsage: false })
    },
  })
}

async function getQuestions(jobInfoId: string) {
  const supabase = await createServerSupabaseClient()

  const { data: questions } = await supabase
    .from("questions")
    .select("*")
    .eq("jobInfoId", jobInfoId)
    .order("createdAt", { ascending: true })

  return questions || []
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
