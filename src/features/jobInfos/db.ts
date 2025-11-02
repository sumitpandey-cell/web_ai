import { dbInsert, dbUpdate, dbSelectMany, dbDelete } from "@/lib/supabase/db"
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
  const result = await dbUpdate<Omit<JobInfo, "id" | "createdAt" | "updatedAt">>("job_info", id, jobInfo)

  revalidateJobInfoCache({ id, userId: result.userId })

  return result as unknown as JobInfo
}

export async function getUserJobInfos(userId: string) {
  const results = await dbSelectMany<Record<string, any>>("job_info", {
    where: { userId },
    orderBy: { column: "createdAt", ascending: false },
  })

  return results as JobInfo[]
}

export async function deleteJobInfo(id: string, userId: string) {
  await dbDelete("job_info", id)

  revalidateJobInfoCache({ id, userId })
}
