"use server"

import z from "zod"
import { jobInfoSchema } from "./schemas"
import { getCurrentUser } from "@/services/auth/server"
import { insertJobInfo, updateJobInfo as updateJobInfoDb, deleteJobInfo as deleteJobInfoDb, getUserJobInfos } from "./db"
import { redirect } from "next/navigation"
import { createServerSupabaseClient } from "@/services/supabase/server"

export async function createJobInfo(unsafeData: z.infer<typeof jobInfoSchema>) {
  const supabaseUser = await getCurrentUser()
  if (supabaseUser == null) {
    return {
      error: true,
      message: "You don't have permission to do this",
    }
  }

  const { success, data } = jobInfoSchema.safeParse(unsafeData)
  if (!success) {
    return {
      error: true,
      message: "Invalid job data",
    }
  }

  try {
    const jobInfo = await insertJobInfo({ ...data, userId: supabaseUser.id })
    redirect(`/app/job-infos/${jobInfo.id}`)
  } catch (error) {
    // Re-throw redirect errors so they work properly
    if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
      throw error
    }
    console.error("Error creating job info:", error)
    const errorMessage = error instanceof Error ? error.message : "Failed to create job info"
    return {
      error: true,
      message: errorMessage,
    }
  }
}

export async function updateJobInfo(
  id: string,
  unsafeData: z.infer<typeof jobInfoSchema>
) {
  const supabaseUser = await getCurrentUser()
  if (supabaseUser == null) {
    return {
      error: true,
      message: "You don't have permission to do this",
    }
  }

  const { success, data } = jobInfoSchema.safeParse(unsafeData)
  if (!success) {
    return {
      error: true,
      message: "Invalid job data",
    }
  }

  const existingJobInfo = await getJobInfo(id, supabaseUser.id)
  if (existingJobInfo == null) {
    return {
      error: true,
      message: "You don't have permission to do this",
    }
  }

  try {
    const jobInfo = await updateJobInfoDb(id, data)
    redirect(`/app/job-infos/${jobInfo.id}`)
  } catch (error) {
    // Re-throw redirect errors so they work properly
    if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
      throw error
    }
    console.error("Error updating job info:", error)
    const errorMessage = error instanceof Error ? error.message : "Failed to update job info"
    return {
      error: true,
      message: errorMessage,
    }
  }
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

export async function deleteJobInfo(id: string) {
  const supabaseUser = await getCurrentUser()
  if (supabaseUser == null) {
    return {
      error: true,
      message: "You don't have permission to do this",
    }
  }

  try {
    const existingJobInfo = await getJobInfo(id, supabaseUser.id)
    if (existingJobInfo == null) {
      return {
        error: true,
        message: "Job profile not found or you don't have permission",
      }
    }

    await deleteJobInfoDb(id, supabaseUser.id)
    return { error: false, message: "Job profile deleted successfully" }
  } catch (error) {
    console.error("Error deleting job info:", error)
    const errorMessage = error instanceof Error ? error.message : "Failed to delete job info"
    return {
      error: true,
      message: errorMessage,
    }
  }
}

export async function getAllUserJobInfos() {
  const supabaseUser = await getCurrentUser()
  if (supabaseUser == null) {
    return {
      error: true,
      jobInfos: [],
      message: "You must be logged in",
    }
  }

  try {
    const jobInfos = await getUserJobInfos(supabaseUser.id)
    return { error: false, jobInfos, message: "" }
  } catch (error) {
    console.error("Error fetching job infos:", error)
    const errorMessage = error instanceof Error ? error.message : "Failed to fetch job infos"
    return {
      error: true,
      jobInfos: [],
      message: errorMessage,
    }
  }
}
