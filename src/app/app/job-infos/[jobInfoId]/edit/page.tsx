import { Card, CardContent } from "@/components/ui/card"
import { createServerSupabaseClient } from "@/services/supabase/server"
import { JobInfoBackLink } from "@/features/jobInfos/components/JobInfoBackLink"
import { JobInfoForm } from "@/features/jobInfos/components/JobInfoForm"
import { getCurrentUser } from "@/services/auth/server"
import { Loader2 } from "lucide-react"
import { notFound } from "next/navigation"
import { Suspense } from "react"

export default async function JobInfoNewPage({
  params,
}: {
  params: Promise<{ jobInfoId: string }>
}) {
  const { jobInfoId } = await params

  return (
    <div className="container my-4 max-w-5xl space-y-4">
      <JobInfoBackLink jobInfoId={jobInfoId} />

      <h1 className="text-3xl md:text-4xl">Edit Job Description</h1>

      <Card>
        <CardContent>
          <Suspense
            fallback={<Loader2 className="size-24 animate-spin mx-auto" />}
          >
            <SuspendedForm jobInfoId={jobInfoId} />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  )
}

async function SuspendedForm({ jobInfoId }: { jobInfoId: string }) {
  const user = await getCurrentUser()
  if (user == null) return notFound()

  const jobInfo = await getJobInfo(jobInfoId, user.id)
  if (jobInfo == null) return notFound()

  return <JobInfoForm jobInfo={jobInfo} />
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
