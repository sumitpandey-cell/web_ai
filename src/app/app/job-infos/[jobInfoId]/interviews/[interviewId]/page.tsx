import { BackLink } from "@/components/BackLink"
import { Skeleton, SkeletonButton } from "@/components/Skeleton"
import { SuspendedItem } from "@/components/SuspendedItem"
import { Button } from "@/components/ui/button"
import { createServerSupabaseClient } from "@/services/supabase/server"
import { formatDateTime } from "@/lib/formatters"
import { getCurrentUser } from "@/services/auth/server"
import { notFound } from "next/navigation"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog"
import { MarkdownRenderer } from "@/components/MarkdownRenderer"
import { Loader2Icon } from "lucide-react"
import { Suspense } from "react"
import { CondensedMessages } from "@/services/hume/components/CondensedMessages"
import { condenseChatMessages } from "@/services/hume/lib/condenseChatMessages"
import { fetchChatMessages } from "@/services/hume/lib/api"
import { ActionButton } from "@/components/ui/action-button"
import { generateInterviewFeedback } from "@/features/interviews/actions"

export default async function InterviewPage({
  params,
}: {
  params: Promise<{ jobInfoId: string; interviewId: string }>
}) {
  const { jobInfoId, interviewId } = await params

  const user = await getCurrentUser()
  if (user == null) return notFound()

  const interview = await getInterview(interviewId, user.id)
  if (interview == null) return notFound()

  return (
    <div className="container my-4 space-y-4">
      <BackLink href={`/app/job-infos/${jobInfoId}/interviews`}>
        All Interviews
      </BackLink>
      <div className="space-y-6">
        <div className="flex gap-2 justify-between">
          <div className="space-y-2 mb-6">
            <h1 className="text-3xl md:text-4xl">
              Interview: {formatDateTime(interview.createdAt)}
            </h1>
            <p className="text-muted-foreground">{interview.duration}</p>
          </div>
          {interview.feedback == null ? (
            <ActionButton
              action={generateInterviewFeedback.bind(null, interview.id)}
            >
              Generate Feedback
            </ActionButton>
          ) : (
            <Dialog>
              <DialogTrigger asChild>
                <Button>View Feedback</Button>
              </DialogTrigger>
              <DialogContent className="md:max-w-3xl lg:max-w-4xl max-h-[calc(100%-2rem)] overflow-y-auto flex flex-col">
                <DialogTitle>Feedback</DialogTitle>
                <MarkdownRenderer>{interview.feedback}</MarkdownRenderer>
              </DialogContent>
            </Dialog>
          )}
        </div>
        <Suspense
          fallback={<Loader2Icon className="animate-spin size-24 mx-auto" />}
        >
          <Messages interview={interview} />
        </Suspense>
      </div>
    </div>
  )
}

async function Messages({
  interview,
}: {
  interview: { humeChatId: string | null }
}) {
  const user = await getCurrentUser()
  if (user == null) return notFound()

  if (interview.humeChatId == null) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground">
        <p>No chat messages available yet. Start or complete an interview to view messages.</p>
      </div>
    )
  }

  const condensedMessages = condenseChatMessages(
    await fetchChatMessages(interview.humeChatId)
  )

  return (
    <CondensedMessages
      messages={condensedMessages}
      user={{
        name: user.user_metadata?.full_name || user.email || "User",
        imageUrl: user.user_metadata?.avatar_url || "",
      }}
      className="max-w-5xl mx-auto"
    />
  )
}

async function getInterview(id: string, userId: string) {
  const supabase = await createServerSupabaseClient()

  const { data: interview } = await supabase
    .from("interviews")
    .select("*")
    .eq("id", id)
    .single()

  if (interview == null) return null

  // Fetch the job info separately to verify ownership
  const { data: jobInfo } = await supabase
    .from("job_info")
    .select("id, userId")
    .eq("id", interview.jobInfoId)
    .single()

  if (jobInfo == null || jobInfo.userId !== userId) return null

  return interview as any
}
