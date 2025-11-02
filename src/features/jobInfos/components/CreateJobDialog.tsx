"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { JobInfoForm } from "./JobInfoForm"

export function CreateJobDialog() {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg">
          <Plus className="w-4 h-4 mr-2" />
          Create New Job Profile
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Job Profile</DialogTitle>
          <DialogDescription>
            Enter information about the job position you want to practice for.
            Be as specific as possible for better results.
          </DialogDescription>
        </DialogHeader>
        <JobInfoForm onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  )
}
