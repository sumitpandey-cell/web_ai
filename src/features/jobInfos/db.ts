import { dbInsert, dbUpdate } from "@/lib/supabase/db"
import { createServerSupabaseClient } from "@/services/supabase/server"
import { revalidateJobInfoCache } from "./dbCache"

export interface JobInfo {
  id: string
  title: string
  name: string
  experienceLevel: "junior" | "mid-level" | "senior"
  description: string
  userId: string
  createdAt: string
  updatedAt: string
}

export async function insertJobInfo(jobInfo: Omit<JobInfo, "id" | "createdAt" | "updatedAt">) {
  console.log("Inserting job info:", jobInfo)
  try {
    const result = await dbInsert<Omit<JobInfo, "id" | "createdAt" | "updatedAt">>("job_info", jobInfo)
    console.log("Successfully inserted job info:", result)

    revalidateJobInfoCache({ id: result.id, userId: result.userId })

    return result as JobInfo
  } catch (error) {
    console.error("Failed to insert job info:", error)
    throw error
  }
}

export async function updateJobInfo(
  id: string,
  jobInfo: Partial<Omit<JobInfo, "id" | "createdAt" | "updatedAt">>
) {
  const result = await dbUpdate<JobInfo>("job_info", id, jobInfo)

  revalidateJobInfoCache({ id: result.id, userId: result.userId })

  return result
}
