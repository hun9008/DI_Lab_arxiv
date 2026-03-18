"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Plus } from "lucide-react"
import { type Paper } from "@/lib/types"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { GroupPaperPicker } from "@/components/group-paper-picker"

interface GroupPaperManagerProps {
  groupId: number
  groupName: string
  allPapers: Paper[]
  groupedPapers: Paper[]
}

export function GroupPaperManager({
  groupId,
  groupName,
  allPapers,
  groupedPapers,
}: GroupPaperManagerProps) {
  const router = useRouter()
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [pendingPaperId, setPendingPaperId] = useState<string | null>(null)
  const [removeError, setRemoveError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleRemovePaper = (paperId: string) => {
    setRemoveError(null)
    setPendingPaperId(paperId)

    startTransition(async () => {
      try {
        const response = await fetch(`/api/paper-groups/${groupId}/papers`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paperId }),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || "Failed to remove paper from group")
        }

        router.refresh()
      } catch (error) {
        setRemoveError(
          error instanceof Error ? error.message : "Failed to remove paper from group"
        )
      } finally {
        setPendingPaperId(null)
      }
    })
  }

  return (
    <section>
      <div className="mb-2 flex items-center justify-between gap-3">
        <h2 className="font-serif text-lg font-semibold text-foreground border-b-2 border-primary pb-1 mb-0 flex-1">
          Group Papers
        </h2>
        <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Paper
        </Button>
      </div>

      <div className="border-x border-b border-border bg-card p-4 space-y-4">
        {removeError && (
          <div className="rounded border border-destructive bg-destructive/5 px-3 py-2 text-sm text-destructive">
            {removeError}
          </div>
        )}

        {groupedPapers.length > 0 ? (
          <div className="space-y-3">
            {groupedPapers.map((paper) => {
              const isRemoving = isPending && pendingPaperId === paper.id

              return (
                <div
                  key={paper.id}
                  className="flex flex-col gap-3 rounded border border-border bg-background p-4 sm:flex-row sm:items-start sm:justify-between"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-foreground">{paper.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {paper.authors.join(", ")}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isRemoving}
                    onClick={() => handleRemovePaper(paper.id)}
                    className="shrink-0"
                  >
                    {isRemoving ? "Removing..." : "Remove from Group"}
                  </Button>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="rounded border border-border bg-background p-6 text-center text-sm text-muted-foreground">
            No papers in this group yet.
          </div>
        )}
      </div>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>Add Existing Papers</DialogTitle>
            <DialogDescription>
              Search submitted papers and add them into {groupName}.
            </DialogDescription>
          </DialogHeader>
          <GroupPaperPicker
            groupId={groupId}
            groupName={groupName}
            papers={allPapers}
            onSuccess={() => setIsAddDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </section>
  )
}
