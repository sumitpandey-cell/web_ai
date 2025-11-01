import { dbInsert } from "@/lib/supabase/db"
import { revalidateQuestionCache } from "./dbCache"

export interface Question {
  id: string
  jobInfoId: string
  text: string
  difficulty: "easy" | "medium" | "hard"
  createdAt: string
  updatedAt: string
}

export async function insertQuestion(
  question: Omit<Question, "id" | "createdAt" | "updatedAt">
) {
  const result = await dbInsert<Omit<Question, "id" | "createdAt" | "updatedAt">>(
    "questions",
    question
  )

  revalidateQuestionCache({
    id: result.id,
    jobInfoId: result.jobInfoId,
  })

  return {
    id: result.id,
    jobInfoId: result.jobInfoId,
  }
}
