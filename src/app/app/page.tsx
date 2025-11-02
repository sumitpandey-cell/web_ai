import {
  JobInfoForm
} from "@/features/jobInfos/components/JobInfoForm"
import { JobInfosList } from "@/features/jobInfos/components/JobInfosList"
import { CreateJobDialog } from "@/features/jobInfos/components/CreateJobDialog"
import { getCurrentUser } from "@/services/auth/server"
import { redirect } from "next/navigation"
import { Suspense } from "react"

export default function AppPage() {
  return (
    <Suspense fallback={<div className="container my-4">Loading...</div>}>
      <JobInfos />
    </Suspense>
  )
}

async function JobInfos() {
  const supabaseUser = await getCurrentUser()
  if (!supabaseUser) {
    return redirect("/sign-in")
  }

  // Start with job list view
  return (
    <div className="container my-8 max-w-7xl">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-2">
            Welcome to ManavAI, {supabaseUser.email}
          </h1>
          <p className="text-muted-foreground">
            Manage your job profiles and practice for interviews
          </p>
        </div>
        <CreateJobDialog />
      </div>

      <Suspense fallback={<div>Loading your job profiles...</div>}>
        <JobInfosList />
      </Suspense>
    </div>
  )
}
