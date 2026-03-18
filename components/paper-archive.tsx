"use client"

import { useState, useMemo, useEffect } from "react"
import { Paper } from "@/lib/types"
import { PaperItem } from "@/components/paper-item"
import { Input } from "@/components/ui/input"
import { getUserName, setUserName } from "@/lib/user-store"

interface PaperArchiveProps {
  papers: Paper[]
}

// Default demo user - in production, this would come from auth
const DEFAULT_USER = "김철수"

export function PaperArchive({ papers }: PaperArchiveProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedConference, setSelectedConference] = useState("")
  const [selectedTag, setSelectedTag] = useState("")
  const [currentUser, setCurrentUser] = useState<string>(DEFAULT_USER)

  useEffect(() => {
    const stored = getUserName()
    if (stored) {
      setCurrentUser(stored)
    } else {
      // Set default user for demo
      setUserName(DEFAULT_USER)
      setCurrentUser(DEFAULT_USER)
    }
  }, [])

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
      if (selectedTag && !paper.tags.includes(selectedTag)) return false
      return true
    })
  }, [papers, searchQuery, selectedConference, selectedTag])

  const myPapers = useMemo(() => {
    if (!currentUser) return []
    return filteredPapers.filter(
      (p) => p.added_by.toLowerCase() === currentUser.toLowerCase()
    )
  }, [filteredPapers, currentUser])

  const clearFilters = () => {
    setSearchQuery("")
    setSelectedConference("")
    setSelectedTag("")
  }

  const hasFilters = searchQuery || selectedConference || selectedTag

  const handleChangeUser = () => {
    const newName = window.prompt("Enter your name:", currentUser)
    if (newName && newName.trim()) {
      setUserName(newName.trim())
      setCurrentUser(newName.trim())
    }
  }

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
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="text-xs text-primary hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>
        <div className="text-xs text-muted-foreground pt-1 border-t border-border">
          Logged in as: <span className="font-medium text-foreground">{currentUser}</span>
          <button
            onClick={handleChangeUser}
            className="ml-2 text-primary hover:underline"
          >
            Change
          </button>
        </div>
      </div>

      {/* My Papers Section */}
      {currentUser && myPapers.length > 0 && (
        <section>
          <h2 className="font-serif text-lg font-semibold text-foreground border-b-2 border-primary pb-1 mb-0">
            My Submissions ({myPapers.length})
          </h2>
          <div className="border-x border-b border-border bg-card">
            {myPapers.map((paper, i) => (
              <PaperItem key={paper.id} paper={paper} index={i + 1} />
            ))}
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
