"use client"

import { useMemo, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Search } from "lucide-react"
import { type Paper } from "@/lib/types"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface GroupPaperRemoverProps {
  groupId: number
  groupName: string
  papers: Paper[]
  onSuccess?: () => void
}

export function GroupPaperRemover({
  groupId,
  groupName,
  papers,
  onSuccess,
}: GroupPaperRemoverProps) {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [pendingPaperId, setPendingPaperId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const candidatePapers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    return papers.filter((paper) => {
      if (!normalizedQuery) return true

      return (
        paper.title.toLowerCase().includes(normalizedQuery) ||
        paper.authors.some((author) => author.toLowerCase().includes(normalizedQuery)) ||
        paper.tags.some((tag) => tag.toLowerCase().includes(normalizedQuery)) ||
        paper.summary?.toLowerCase().includes(normalizedQuery)
      )
    })
  }, [papers, query])

  const handleRemovePaper = (paperId: string) => {
    setError(null)
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
        onSuccess?.()
      } catch (removeError) {
        setError(
          removeError instanceof Error
            ? removeError.message
            : "Failed to remove paper from group"
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
            placeholder={`Search papers to remove from ${groupName}`}
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
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
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
            No grouped papers match your search.
          </div>
        )}
      </div>
    </section>
  )
}
