"use client"

import { useMemo, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Search } from "lucide-react"
import { type Paper } from "@/lib/types"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface GroupPaperPickerProps {
  groupId: number
  groupName: string
  papers: Paper[]
  onSuccess?: () => void
}

export function GroupPaperPicker({
  groupId,
  groupName,
  papers,
  onSuccess,
}: GroupPaperPickerProps) {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [pendingPaperId, setPendingPaperId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const candidatePapers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    return papers
      .filter((paper) => paper.group_id !== groupId)
      .filter((paper) => {
        if (!normalizedQuery) return true

        return (
          paper.title.toLowerCase().includes(normalizedQuery) ||
          paper.authors.some((author) => author.toLowerCase().includes(normalizedQuery)) ||
          paper.tags.some((tag) => tag.toLowerCase().includes(normalizedQuery)) ||
          paper.summary?.toLowerCase().includes(normalizedQuery)
        )
      })
  }, [groupId, papers, query])

  const handleAttachPaper = (paperId: string) => {
    setError(null)
    setPendingPaperId(paperId)

    startTransition(async () => {
      try {
        const response = await fetch(`/api/paper-groups/${groupId}/papers`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paperId }),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || "Failed to attach paper to group")
        }

        router.refresh()
        onSuccess?.()
      } catch (attachError) {
        setError(
          attachError instanceof Error
            ? attachError.message
            : "Failed to attach paper to group"
        )
      } finally {
        setPendingPaperId(null)
      }
    })
  }

  return (
    <section>
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Search papers to add into ${groupName}`}
            className="flex-1"
          />
        </div>

        {error && (
          <div className="rounded border border-destructive bg-destructive/5 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        )}

        {candidatePapers.length > 0 ? (
          <div className="space-y-3">
            {candidatePapers.map((paper) => {
              const isAttaching = isPending && pendingPaperId === paper.id

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
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      {paper.group_name && (
                        <span className="rounded border border-border px-2 py-0.5">
                          Current group: {paper.group_name}
                        </span>
                      )}
                      {paper.tags.map((tag) => (
                        <span
                          key={`${paper.id}-${tag}`}
                          className="rounded border border-border px-2 py-0.5"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isAttaching}
                    onClick={() => handleAttachPaper(paper.id)}
                    className="shrink-0"
                  >
                    {isAttaching ? "Adding..." : "Add to Group"}
                  </Button>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="rounded border border-border bg-background p-6 text-center text-sm text-muted-foreground">
            No submitted papers match your search.
          </div>
        )}
      </div>
    </section>
  )
}
