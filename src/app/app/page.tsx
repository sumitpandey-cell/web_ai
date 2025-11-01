import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { JobInfoForm } from "@/features/jobInfos/components/JobInfoForm"
import { getCurrentUser } from "@/services/auth/server"
import { ArrowRightIcon, PlusIcon } from "lucide-react"
import Link from "next/link"
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

  // Start with empty state - user can create first job
  return (
    <div className="container my-4 max-w-5xl">
      <h1 className="text-3xl md:text-4xl lg:text-5xl mb-4">
        Welcome to ManavAI, {supabaseUser.email}
      </h1>
      <p className="text-muted-foreground mb-8">
        To get started, enter information about the type of job you are wanting
        to apply for. This can be specific information copied directly from a
        job listing or general information such as the tech stack you want to
        work in. The more specific you are in the description the closer the
        test interviews will be to the real thing.
      </p>
      <Card>
        <CardContent>
          <JobInfoForm />
        </CardContent>
      </Card>
    </div>
  )
}
