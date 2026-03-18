"use client"

import { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Paper } from "@/lib/types"
import { PaperItem } from "@/components/paper-item"
import { Input } from "@/components/ui/input"

interface PaperArchiveProps {
  papers: Paper[]
}

export function PaperArchive({ papers }: PaperArchiveProps) {
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedConference, setSelectedConference] = useState("")
  const [selectedYear, setSelectedYear] = useState("")
  const [selectedTag, setSelectedTag] = useState("")
  const [selectedSubmitter, setSelectedSubmitter] = useState("")
  const [selectedTagButton, setSelectedTagButton] = useState("")

  const conferences = useMemo(() => {
    const set = new Set<string>()
    papers.forEach((p) => p.conference && set.add(p.conference))
    return Array.from(set).sort()
  }, [papers])

  const tags = useMemo(() => {
    const set = new Set<string>()
    papers.forEach((p) => p.tags.forEach((t) => set.add(t)))
    return Array.from(set).sort()
  }, [papers])

  const years = useMemo(() => {
    const set = new Set<string>()
    papers.forEach((paper) => {
      if (paper.year) {
        set.add(String(paper.year))
      }
    })
    return Array.from(set).sort((a, b) => Number(b) - Number(a))
  }, [papers])

  useEffect(() => {
    setSearchQuery(searchParams.get("q") ?? "")
    setSelectedConference(searchParams.get("conference") ?? "")
    setSelectedYear(searchParams.get("year") ?? "")
    setSelectedTag(searchParams.get("tag") ?? "")
  }, [searchParams])

  const filteredPapers = useMemo(() => {
    return papers.filter((paper) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        const match =
          paper.title.toLowerCase().includes(q) ||
          paper.authors.some((a) => a.toLowerCase().includes(q)) ||
          paper.summary?.toLowerCase().includes(q) ||
          paper.tags.some((t) => t.toLowerCase().includes(q))
        if (!match) return false
      }
      if (selectedConference && paper.conference !== selectedConference) return false
      if (selectedYear && String(paper.year ?? "") !== selectedYear) return false
      if (selectedTag && !paper.tags.includes(selectedTag)) return false
      return true
    })
  }, [papers, searchQuery, selectedConference, selectedYear, selectedTag])

  const submitters = useMemo(() => {
    const set = new Set<string>()
    papers.forEach((paper) => {
      const submitter = paper.added_by.trim()
      if (submitter) {
        set.add(submitter)
      }
    })
    return Array.from(set).sort((a, b) => a.localeCompare(b, "ko"))
  }, [papers])

  const myPapers = useMemo(() => {
    if (!selectedSubmitter) return []
    return filteredPapers.filter(
      (p) => p.added_by.toLowerCase() === selectedSubmitter.toLowerCase()
    )
  }, [filteredPapers, selectedSubmitter])

  const taggedPapers = useMemo(() => {
    if (!selectedTagButton) return []
    return filteredPapers.filter((paper) =>
      paper.tags.some((tag) => tag.toLowerCase() === selectedTagButton.toLowerCase())
    )
  }, [filteredPapers, selectedTagButton])

  const clearFilters = () => {
    setSearchQuery("")
    setSelectedConference("")
    setSelectedYear("")
    setSelectedTag("")
  }

  const hasFilters = searchQuery || selectedConference || selectedYear || selectedTag

  return (
    <div className="space-y-6">
      {/* Search & Filters */}
      <div className="border border-border p-4 bg-card space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium shrink-0">Search:</span>
          <Input
            type="search"
            placeholder="Title, author, or keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
          />
        </div>
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Conference:</span>
            <select
              value={selectedConference}
              onChange={(e) => setSelectedConference(e.target.value)}
              className="border border-border rounded px-2 py-1 text-sm bg-background"
            >
              <option value="">All</option>
              {conferences.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Tag:</span>
            <select
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="border border-border rounded px-2 py-1 text-sm bg-background"
            >
              <option value="">All</option>
              {tags.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Year:</span>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="border border-border rounded px-2 py-1 text-sm bg-background"
            >
              <option value="">All</option>
              {years.map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="text-xs text-primary hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* My Papers Section */}
      {submitters.length > 0 && (
        <section>
          <h2 className="font-serif text-lg font-semibold text-foreground border-b-2 border-primary pb-1 mb-0">
            Member's Submissions
          </h2>
          <div className="border-x border-b border-border bg-card p-4 space-y-4">
            <div className="flex flex-wrap gap-2">
              {submitters.map((submitter) => {
                const isActive = submitter === selectedSubmitter
                return (
                  <button
                    key={submitter}
                    type="button"
                    onClick={() =>
                      setSelectedSubmitter((current) =>
                        current === submitter ? "" : submitter
                      )
                    }
                    className={`rounded border px-3 py-1.5 text-sm transition-colors ${
                      isActive
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-background text-foreground hover:border-primary hover:text-primary"
                    }`}
                  >
                    {submitter}
                  </button>
                )
              })}
            </div>

            {selectedSubmitter && (
              <div className="space-y-3">
                <h3 className="font-serif text-base font-semibold text-foreground">
                  "{selectedSubmitter}" Submissions
                </h3>
                {myPapers.length > 0 ? (
                  <div className="border border-border bg-card">
                    {myPapers.map((paper, i) => (
                      <PaperItem key={paper.id} paper={paper} index={i + 1} />
                    ))}
                  </div>
                ) : (
                  <div className="border border-border bg-background p-6 text-center text-sm text-muted-foreground">
                    No submissions found for {selectedSubmitter}.
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Tags Section */}
      {tags.length > 0 && (
        <section>
          <h2 className="font-serif text-lg font-semibold text-foreground border-b-2 border-primary pb-1 mb-0">
            Tags
          </h2>
          <div className="border-x border-b border-border bg-card p-4 space-y-4">
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => {
                const isActive = tag === selectedTagButton
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() =>
                      setSelectedTagButton((current) => (current === tag ? "" : tag))
                    }
                    className={`rounded border px-3 py-1.5 text-sm transition-colors ${
                      isActive
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-background text-foreground hover:border-primary hover:text-primary"
                    }`}
                  >
                    {tag}
                  </button>
                )
              })}
            </div>

            {selectedTagButton && (
              <div className="space-y-3">
                <h3 className="font-serif text-base font-semibold text-foreground">
                  "{selectedTagButton}" Papers
                </h3>
                {taggedPapers.length > 0 ? (
                  <div className="border border-border bg-card">
                    {taggedPapers.map((paper, i) => (
                      <PaperItem key={paper.id} paper={paper} index={i + 1} />
                    ))}
                  </div>
                ) : (
                  <div className="border border-border bg-background p-6 text-center text-sm text-muted-foreground">
                    No papers found for {selectedTagButton}.
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      )}

      {/* All Papers Section */}
      <section>
        <h2 className="font-serif text-lg font-semibold text-foreground border-b-2 border-primary pb-1 mb-0">
          All Papers ({filteredPapers.length})
        </h2>
        {filteredPapers.length > 0 ? (
          <div className="border-x border-b border-border bg-card">
            {filteredPapers.map((paper, i) => (
              <PaperItem key={paper.id} paper={paper} index={i + 1} />
            ))}
          </div>
        ) : (
          <div className="border-x border-b border-border bg-card p-8 text-center">
            <p className="text-muted-foreground">
              {hasFilters
                ? "No papers match your search criteria."
                : "No papers yet. Be the first to submit one!"}
            </p>
          </div>
        )}
      </section>

      {/* Stats */}
      <div className="text-xs text-muted-foreground text-center">
        Total: {papers.length} paper{papers.length !== 1 ? "s" : ""} in archive
      </div>
    </div>
  )
}
