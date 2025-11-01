import { createServerSupabaseClient } from "@/services/supabase/server"
import { canCreateQuestion } from "@/features/questions/permissions"
import { getCurrentUser } from "@/services/auth/server"
import { Loader2Icon } from "lucide-react"
import { notFound, redirect } from "next/navigation"
import { Suspense } from "react"
import { NewQuestionClientPage } from "./_NewQuestionClientPage"

export default async function QuestionsPage({
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

  if (!(await canCreateQuestion())) return redirect("/app/upgrade")

  const jobInfo = await getJobInfo(jobInfoId, user.id)
  if (jobInfo == null) return notFound()

  return <NewQuestionClientPage jobInfo={jobInfo} />
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
