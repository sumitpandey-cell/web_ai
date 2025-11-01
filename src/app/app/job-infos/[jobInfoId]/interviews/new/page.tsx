import { createServerSupabaseClient } from "@/services/supabase/server"
import { getCurrentUser } from "@/services/auth/server"
import { Loader2Icon } from "lucide-react"
import { notFound, redirect } from "next/navigation"
import { Suspense } from "react"
import { fetchAccessToken } from "hume"
import { env } from "@/data/env/server"
import { VoiceProvider } from "@humeai/voice-react"
import { StartCall } from "./_StartCall"
import { canCreateInterview } from "@/features/interviews/permissions"

export default async function NewInterviewPage({
  params,
}: {
  params: Promise<{ jobInfoId: string }>
}) {
  const { jobInfoId } = await params
  return (
    <Suspense
      fallback={
        <div className="h-screen-header flex items-center justify-center">
          <Loader2Icon className="animate-spin size-24" />
        </div>
      }
    >
      <SuspendedComponent jobInfoId={jobInfoId} />
    </Suspense>
  )
}

async function SuspendedComponent({ jobInfoId }: { jobInfoId: string }) {
  const user = await getCurrentUser()
  if (user == null) return redirect("/sign-in")

  if (!(await canCreateInterview())) return redirect("/app/upgrade")

  const jobInfo = await getJobInfo(jobInfoId, user.id)
  if (jobInfo == null) return notFound()

  const accessToken = await fetchAccessToken({
    apiKey: env.HUME_API_KEY!,
    secretKey: env.HUME_SECRET_KEY!,
  })

  // Get user details from Supabase Auth instead of users table
  const userName = user.user_metadata?.full_name || user.email || "User"
  const userImageUrl = user.user_metadata?.avatar_url || ""

  return (
    <VoiceProvider>
      <StartCall
        jobInfo={jobInfo}
        user={{
          name: userName,
          imageUrl: userImageUrl,
        }}
        accessToken={accessToken}
      />
    </VoiceProvider>
  )
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
