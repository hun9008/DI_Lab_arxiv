"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface PaperDeleteButtonProps {
  paperId: string
  paperTitle: string
}

export function PaperDeleteButton({ paperId, paperTitle }: PaperDeleteButtonProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [confirmationText, setConfirmationText] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isConfirmed = confirmationText === "delete"

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen)

    if (!nextOpen) {
      setConfirmationText("")
      setError(null)
      setIsDeleting(false)
    }
  }

  const handleDelete = async () => {
    if (!isConfirmed || isDeleting) return

    setIsDeleting(true)
    setError(null)

    try {
      const response = await fetch(`/api/papers/${paperId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const data = await response.json().catch(() => null)
        throw new Error(data?.error || "Failed to delete paper")
      }

      setOpen(false)
      router.push("/")
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete paper")
      setIsDeleting(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogTrigger asChild>
        <button
          type="button"
          className="font-medium text-destructive hover:underline"
        >
          Delete this entry
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this paper?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently remove "{paperTitle}". Type `delete` below to confirm.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-3">
          <Input
            value={confirmationText}
            onChange={(e) => setConfirmationText(e.target.value)}
            placeholder='Type "delete" to confirm'
            autoFocus
          />
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <Button
            type="button"
            variant="destructive"
            disabled={!isConfirmed || isDeleting}
            onClick={handleDelete}
          >
            {isDeleting ? "Deleting..." : "Confirm Delete"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
