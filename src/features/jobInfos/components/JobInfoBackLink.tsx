import { BackLink } from "@/components/BackLink"
import { createServerSupabaseClient } from "@/services/supabase/server"
import { cn } from "@/lib/utils"
import { Suspense } from "react"

interface JobInfo {
  id: string
  name: string
  userId: string
}

export function JobInfoBackLink({
  jobInfoId,
  className,
}: {
  jobInfoId: string
  className?: string
}) {
  return (
    <BackLink
      href={`/app/job-infos/${jobInfoId}`}
      className={cn("mb-4", className)}
    >
      <Suspense fallback="Job Description">
        <JobName jobInfoId={jobInfoId} />
      </Suspense>
    </BackLink>
  )
}

async function JobName({ jobInfoId }: { jobInfoId: string }) {
  const jobInfo = await getJobInfo(jobInfoId)
  return jobInfo?.name ?? "Job Description"
}

async function getJobInfo(id: string) {
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase
    .from("job_info")
    .select("*")
    .eq("id", id)
    .single()

  return data as JobInfo | null
}
