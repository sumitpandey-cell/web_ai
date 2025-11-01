import { dbInsert, dbUpdate } from "@/lib/supabase/db"
import { revalidateInterviewCache } from "./dbCache"

export interface Interview {
  id: string
  jobInfoId: string
  duration: string
  humeChatId?: string | null
  feedback?: string | null
  createdAt: string
  updatedAt: string
}

export async function insertInterview(
  interview: Omit<Interview, "id" | "createdAt" | "updatedAt">
) {
  const result = await dbInsert<Omit<Interview, "id" | "createdAt" | "updatedAt">>(
    "interviews",
    interview
  )

  revalidateInterviewCache({
    id: result.id,
    jobInfoId: result.jobInfoId,
  })

  return {
    id: result.id,
    jobInfoId: result.jobInfoId,
  }
}

export async function updateInterview(
  id: string,
  interview: Partial<Omit<Interview, "id" | "createdAt" | "updatedAt">>
) {
  const result = await dbUpdate<Omit<Interview, "id" | "createdAt" | "updatedAt">>("interviews", id, interview)

  revalidateInterviewCache({
    id,
    jobInfoId: result.jobInfoId,
  })

  return {
    id,
    jobInfoId: result.jobInfoId,
  }
}
