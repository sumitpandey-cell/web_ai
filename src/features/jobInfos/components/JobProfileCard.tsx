"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Pencil, Trash2, ArrowRight } from "lucide-react"
import { formatExperienceLevel } from "../lib/formatters"
import { deleteJobInfo } from "../actions"
import { toast } from "sonner"
import { LoadingSwap } from "@/components/ui/loading-swap"

interface JobProfileCardProps {
  id: string
  name: string
  title: string
  experienceLevel: "junior" | "mid-level" | "senior"
  description: string
  onDelete?: () => void
}

export function JobProfileCard({
  id,
  name,
  title,
  experienceLevel,
  description,
  onDelete,
}: JobProfileCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const result = await deleteJobInfo(id)
      if (result.error) {
        toast.error(result.message)
      } else {
        toast.success("Job profile deleted successfully")
        onDelete?.()
      }
    } catch {
      toast.error("Failed to delete job profile")
    } finally {
      setIsDeleting(false)
      setShowDeleteDialog(false)
    }
  }

  const truncatedDescription =
    description.length > 150 ? description.substring(0, 150) + "..." : description

  return (
    <>
      <Card className="hover:shadow-md transition-shadow duration-200 group">
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <CardTitle className="text-xl">{name}</CardTitle>
              {title && (
                <p className="text-sm text-muted-foreground mt-1">{title}</p>
              )}
            </div>
            <Badge variant="outline">
              {formatExperienceLevel(experienceLevel)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-foreground/80 line-clamp-3">
            {truncatedDescription}
          </p>

          <div className="flex gap-2 pt-2">
            <Link href={`/app/job-infos/${id}`} className="flex-1">
              <Button variant="outline" className="w-full group-hover:border-primary/50">
                <ArrowRight className="w-4 h-4 mr-2" />
                View
              </Button>
            </Link>

            <Link href={`/app/job-infos/${id}?edit=true`}>
              <Button
                variant="outline"
                size="icon"
                className="group-hover:border-primary/50"
              >
                <Pencil className="w-4 h-4" />
              </Button>
            </Link>

            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowDeleteDialog(true)}
              className="hover:border-destructive/50 hover:text-destructive"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Job Profile</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the job profile &quot;{name}&quot;? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              <LoadingSwap isLoading={isDeleting}>
                Delete
              </LoadingSwap>
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
