import { createServerSupabaseClient } from "@/services/supabase/server"
import { canRunResumeAnalysis } from "@/features/resumeAnalyses/permissions"
import { PLAN_LIMIT_MESSAGE } from "@/lib/errorToast"
import { analyzeResumeForJob } from "@/services/ai/resumes/ai"
import { getCurrentUser } from "@/services/auth/server"
import { incrementFeatureUsage } from "@/lib/billing/subscription"

export async function POST(req: Request) {
  const user = await getCurrentUser()

  if (user == null) {
    return new Response("You are not logged in", { status: 401 })
  }

  const formData = await req.formData()
  const resumeFile = formData.get("resumeFile") as File
  const jobInfoId = formData.get("jobInfoId") as string

  if (!resumeFile || !jobInfoId) {
    return new Response("Invalid request", { status: 400 })
  }

  if (resumeFile.size > 10 * 1024 * 1024) {
    return new Response("File size exceeds 10MB limit", { status: 400 })
  }

  const allowedTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
  ]

  if (!allowedTypes.includes(resumeFile.type)) {
    return new Response("Please upload a PDF, Word document, or text file", {
      status: 400,
    })
  }

  const jobInfo = await getJobInfo(jobInfoId, user.id)
  if (jobInfo == null) {
    return new Response("You do not have permission to do this", {
      status: 403,
    })
  }

  if (!(await canRunResumeAnalysis())) {
    return new Response(PLAN_LIMIT_MESSAGE, { status: 403 })
  }

  // Track usage
  await incrementFeatureUsage(user.id, "resumeAnalyses")

  const res = await analyzeResumeForJob({
    resumeFile,
    jobInfo,
  })

  return res.toTextStreamResponse()
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
