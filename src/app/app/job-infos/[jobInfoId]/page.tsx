import { BackLink } from "@/components/BackLink"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { createServerSupabaseClient } from "@/services/supabase/server"
import { formatExperienceLevel } from "@/features/jobInfos/lib/formatters"
import { getCurrentUser } from "@/services/auth/server"
import { 
  ArrowRightIcon, 
  BookOpen,
  Mic,
  FileText,
  Edit3,
  Zap,
  Target,
  BarChart3,
  Brain,
  Shield,
  Settings
} from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"

const options = [
  {
    label: "Answer Technical Questions",
    description:
      "Challenge yourself with practice questions tailored to your job description.",
    href: "questions",
    icon: BookOpen,
    color: "from-blue-500 to-cyan-500",
    gradient: "bg-gradient-to-br from-blue-500/10 to-cyan-500/10",
    lightColor: "text-blue-600 dark:text-blue-400",
  },
  {
    label: "Practice Interviewing",
    description: "Simulate a real interview with AI-powered mock interviews.",
    href: "interviews",
    icon: Mic,
    color: "from-purple-500 to-pink-500",
    gradient: "bg-gradient-to-br from-purple-500/10 to-pink-500/10",
    lightColor: "text-purple-600 dark:text-purple-400",
  },
  {
    label: "Refine Your Resume",
    description:
      "Get expert feedback on your resume and improve your chances of landing an interview.",
    href: "resume",
    icon: FileText,
    color: "from-orange-500 to-red-500",
    gradient: "bg-gradient-to-br from-orange-500/10 to-red-500/10",
    lightColor: "text-orange-600 dark:text-orange-400",
  },
  {
    label: "Update Job Description",
    description: "This should only be used for minor updates.",
    href: "edit",
    icon: Edit3,
    color: "from-green-500 to-emerald-500",
    gradient: "bg-gradient-to-br from-green-500/10 to-emerald-500/10",
    lightColor: "text-green-600 dark:text-green-400",
  },
]

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const stats = [
  {
    label: "Questions Available",
    value: "50+",
    icon: Brain,
    color: "bg-blue-500/20",
    textColor: "text-blue-600 dark:text-blue-400",
  },
  {
    label: "Interview Rounds",
    value: "Unlimited",
    icon: Target,
    color: "bg-purple-500/20",
    textColor: "text-purple-600 dark:text-purple-400",
  },
  {
    label: "Skill Level",
    value: formatExperienceLevel("mid-level"),
    icon: Zap,
    color: "bg-yellow-500/20",
    textColor: "text-yellow-600 dark:text-yellow-400",
  },
  {
    label: "Progress Tracked",
    value: "100%",
    icon: BarChart3,
    color: "bg-green-500/20",
    textColor: "text-green-600 dark:text-green-400",
  },
]

export default async function JobInfoPage({
  params,
}: {
  params: Promise<{ jobInfoId: string }>
}) {
  const { jobInfoId } = await params

  const user = await getCurrentUser()
  if (user == null) {
    return notFound()
  }

  const jobInfo = await getJobInfo(jobInfoId, user.id)
  if (jobInfo == null) {
    return notFound()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      <div className="container my-8 space-y-8 max-w-7xl">
        {/* Navigation */}
        <div className="flex items-center justify-between">
          <BackLink href="/app">Back to Dashboard</BackLink>
          <Link href={`/app/job-infos/${jobInfoId}/edit`}>
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Edit Job Profile
            </Button>
          </Link>
        </div>

        {/* Header Section with Enhanced Design */}
        <div className="space-y-6">
          {/* Main Header Card */}
          <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 via-accent/5 to-background p-8 md:p-12">
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-primary/10 to-accent/5 rounded-full -mr-48 -mt-48 blur-3xl" />
            
            <div className="relative space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-3">
                  <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
                    {jobInfo.name}
                  </h1>
                  <p className="text-lg text-foreground/70 max-w-2xl">
                    {jobInfo.description}
                  </p>
                </div>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-2 pt-4">
                <Badge className="bg-primary/20 text-primary hover:bg-primary/30 border-primary/30">
                  <Target className="w-3 h-3 mr-1" />
                  {formatExperienceLevel(jobInfo.experienceLevel)}
                </Badge>
                {jobInfo.title && (
                  <Badge className="bg-accent/20 text-accent hover:bg-accent/30 border-accent/30">
                    <Zap className="w-3 h-3 mr-1" />
                    {jobInfo.title}
                  </Badge>
                )}
                <Badge className="bg-secondary/20 text-secondary hover:bg-secondary/30 border-secondary/30">
                  <Shield className="w-3 h-3 mr-1" />
                  Active
                </Badge>
              </div>
            </div>
          </div>

          {/* Stats Section */}
          
          {/* Main Features Grid */}
          <div>
            <div className="mb-6">
              <h2 className="text-2xl md:text-3xl font-bold">Start Practicing</h2>
              <p className="text-muted-foreground mt-1">
                Choose an activity to begin your interview preparation
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {options.map((option) => {
                const Icon = option.icon
                return (
                  <Link
                    key={option.href}
                    href={`/app/job-infos/${jobInfoId}/${option.href}`}
                    className="group"
                  >
                    <Card className={`h-full overflow-hidden border-primary/10 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 cursor-pointer ${option.gradient}`}>
                      
                      <CardHeader className="relative">
                        <div className="flex items-start justify-between gap-4">
                          <div className="space-y-1 flex-1">
                            <CardTitle className="text-xl group-hover:text-primary transition-colors">
                              {option.label}
                            </CardTitle>
                            <CardDescription className="text-sm">
                              {option.description}
                            </CardDescription>
                          </div>
                          <div className={`p-2 rounded-lg ${option.gradient} group-hover:scale-110 transition-transform duration-300`}>
                            <Icon className={`w-6 h-6 ${option.lightColor}`} />
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent className="relative">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-muted-foreground group-hover:text-primary transition-colors">
                            Click to start
                          </span>
                          <ArrowRightIcon className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-all duration-300 group-hover:translate-x-1" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
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
