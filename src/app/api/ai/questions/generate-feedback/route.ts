import { createServerSupabaseClient } from "@/services/supabase/server"
import { generateAiQuestionFeedback } from "@/services/ai/questions"
import { getCurrentUser } from "@/services/auth/server"
import z from "zod"

const schema = z.object({
  prompt: z.string().min(1),
  questionId: z.string().min(1),
})

export async function POST(req: Request) {
  const body = await req.json()
  const result = schema.safeParse(body)

  if (!result.success) {
    return new Response("Error generating your feedback", { status: 400 })
  }

  const { prompt: answer, questionId } = result.data
  const user = await getCurrentUser()

  if (user == null) {
    return new Response("You are not logged in", { status: 401 })
  }

  const question = await getQuestion(questionId, user.id)
  if (question == null) {
    return new Response("You do not have permission to do this", {
      status: 403,
    })
  }

  const res = generateAiQuestionFeedback({
    question: question.text,
    answer,
  })

  return res.toDataStreamResponse({ sendUsage: false })
}

async function getQuestion(id: string, userId: string) {
  const supabase = await createServerSupabaseClient()

  const { data: question } = await supabase
    .from("questions")
    .select("*, jobInfo:job_info(id, userId)")
    .eq("id", id)
    .single()

  if (question == null) return null

  const jobInfo = (question as { jobInfo: { id: string; userId: string } }).jobInfo

  if (jobInfo.userId !== userId) return null

  return question
}
