"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
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

interface GroupDeleteButtonProps {
  groupId: number
  groupName: string
}

export function GroupDeleteButton({
  groupId,
  groupName,
}: GroupDeleteButtonProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [confirmationText, setConfirmationText] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

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

    setError(null)
    setIsDeleting(true)

    try {
      const response = await fetch(`/api/paper-groups/${groupId}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete group")
      }

      setOpen(false)
      router.push("/")
      router.refresh()
    } catch (deleteError) {
      setError(
        deleteError instanceof Error ? deleteError.message : "Failed to delete group"
      )
      setIsDeleting(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <div className="mt-8 border-t border-border pt-6">
        <div className="flex justify-end">
          <AlertDialogTrigger asChild>
            <Button
              type="button"
              variant="outline"
              className="border-destructive text-destructive hover:bg-destructive/5 hover:text-destructive"
            >
              Delete Group
            </Button>
          </AlertDialogTrigger>
        </div>
      </div>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this group?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently remove "{groupName}". Papers in this group will remain, but their group assignment will be cleared. Type `delete` below to confirm.
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
