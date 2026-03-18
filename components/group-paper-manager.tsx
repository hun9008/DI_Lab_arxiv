"use client"

import { useState } from "react"
import { Minus, Plus } from "lucide-react"
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
import { GroupPaperRemover } from "@/components/group-paper-remover"

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
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false)

  return (
    <section>
      <div className="mb-2 flex items-center justify-between gap-3">
        <h2 className="font-serif text-lg font-semibold text-foreground border-b-2 border-primary pb-1 mb-0 flex-1">
          Group Papers
        </h2>
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" onClick={() => setIsRemoveDialogOpen(true)}>
            <Minus className="mr-2 h-4 w-4" />
            Remove Paper
          </Button>
          <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Paper
          </Button>
        </div>
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

      <Dialog open={isRemoveDialogOpen} onOpenChange={setIsRemoveDialogOpen}>
        <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>Remove Group Papers</DialogTitle>
            <DialogDescription>
              Search papers currently in {groupName} and remove the selected ones.
            </DialogDescription>
          </DialogHeader>
          <GroupPaperRemover
            groupId={groupId}
            groupName={groupName}
            papers={groupedPapers}
            onSuccess={() => setIsRemoveDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </section>
  )
}
