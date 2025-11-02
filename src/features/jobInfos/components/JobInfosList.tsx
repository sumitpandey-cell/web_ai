import { getAllUserJobInfos } from "../actions"
import { JobProfileCard } from "./JobProfileCard"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus } from "lucide-react"

export async function JobInfosList({ onDelete }: { onDelete?: () => void }) {
  const result = await getAllUserJobInfos()

  if (result.error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">{result.message}</p>
      </div>
    )
  }

  const jobInfos = result.jobInfos

  if (jobInfos.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-semibold mb-2">No Job Profiles Yet</h3>
        <p className="text-muted-foreground mb-6">
          Create your first job profile to get started with AI-powered interview
          practice.
        </p>
        <Link href="/app?showForm=true">
          <Button size="lg">
            <Plus className="w-4 h-4 mr-2" />
            Create First Job Profile
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
        {jobInfos.map((jobInfo) => (
          <JobProfileCard
            key={jobInfo.id}
            id={jobInfo.id}
            name={jobInfo.name}
            title={jobInfo.title}
            experienceLevel={jobInfo.experienceLevel}
            description={jobInfo.description}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  )
}
