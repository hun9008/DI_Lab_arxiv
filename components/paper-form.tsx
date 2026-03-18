"use client"

import { useEffect, useMemo, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Spinner } from "@/components/ui/spinner"
import { Paper, PaperFormData, PaperGroup } from "@/lib/types"

interface PaperFormProps {
  paper?: Paper
  mode: "create" | "edit"
}

function normalizeText(value: string) {
  return value.trim().toLowerCase()
}

function looksLikeInitials(value: string) {
  const compact = value.replace(/\s+/g, "")
  return /^(?:[A-Za-z]\.?|-)+(?:\.)?$/.test(compact) && compact.length <= 10
}

function parseAuthorInput(value: string) {
  const normalized = value
    .replace(/\s*&\s*/g, ", ")
    .replace(/\s+and\s+/gi, ", ")
    .trim()

  if (!normalized) return []

  const citationTokens = normalized
    .split(",")
    .map((token) => token.trim().replace(/^&\s*/, ""))
    .filter(Boolean)

  const isCitationStyle =
    citationTokens.length >= 2 &&
    citationTokens.length % 2 === 0 &&
    citationTokens.every((token, index) => index % 2 === 0 || looksLikeInitials(token))

  if (isCitationStyle) {
    const authors: string[] = []

    for (let i = 0; i < citationTokens.length; i += 2) {
      authors.push(`${citationTokens[i]}, ${citationTokens[i + 1]}`)
    }

    return authors
  }

  return normalized
    .split(/[,;\n]+/)
    .map((token) => token.trim().replace(/^&\s*/, ""))
    .filter(Boolean)
}

export function PaperForm({ paper, mode }: PaperFormProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session } = useSession()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState<PaperFormData>({
    title: paper?.title || "",
    authors: paper?.authors || [],
    conference: paper?.conference || "",
    year: paper?.year || new Date().getFullYear(),
    summary: paper?.summary || "",
    tags: paper?.tags || [],
    group_id: paper?.group_id || null,
    github_url: paper?.github_url || "",
    notion_url: paper?.notion_url || "",
    arxiv_url: paper?.arxiv_url || "",
    other_url: paper?.other_url || "",
    added_by: paper?.added_by || "",
    added_by_email: paper?.added_by_email || "",
  })

  const [authorInput, setAuthorInput] = useState("")
  const [tagInput, setTagInput] = useState("")
  const [existingTags, setExistingTags] = useState<string[]>([])
  const [groups, setGroups] = useState<PaperGroup[]>([])
  const [isTagInputFocused, setIsTagInputFocused] = useState(false)

  useEffect(() => {
    let isCancelled = false

    async function loadReferenceData() {
      try {
        const [papersResponse, groupsResponse] = await Promise.all([
          fetch("/api/papers"),
          fetch("/api/paper-groups"),
        ])

        if (!papersResponse.ok || !groupsResponse.ok) return

        const papers = (await papersResponse.json()) as Paper[]
        const fetchedGroups = (await groupsResponse.json()) as PaperGroup[]
        const tagMap = new Map<string, string>()

        papers.forEach((entry) => {
          entry.tags.forEach((tag) => {
            const trimmed = tag.trim()
            const key = normalizeText(trimmed)
            if (trimmed && !tagMap.has(key)) {
              tagMap.set(key, trimmed)
            }
          })
        })

        if (!isCancelled) {
          setExistingTags(
            Array.from(tagMap.values()).sort((a, b) => a.localeCompare(b, "en", { sensitivity: "base" }))
          )
          setGroups(fetchedGroups)
        }
      } catch {
        if (!isCancelled) {
          setExistingTags([])
          setGroups([])
        }
      }
    }

    loadReferenceData()

    return () => {
      isCancelled = true
    }
  }, [])

  useEffect(() => {
    if (mode !== "create") return

    const groupIdFromQuery = searchParams.get("groupId")
    if (!groupIdFromQuery) return

    const parsedGroupId = Number(groupIdFromQuery)
    if (!Number.isFinite(parsedGroupId)) return

    setFormData((prev) => ({
      ...prev,
      group_id: prev.group_id ?? parsedGroupId,
    }))
  }, [mode, searchParams])

  useEffect(() => {
    if (mode !== "create") return

    const sessionName = session?.user?.displayName || session?.user?.name || ""
    const sessionEmail = session?.user?.email || ""

    setFormData((prev) => ({
      ...prev,
      added_by: prev.added_by || sessionName,
      added_by_email: prev.added_by_email || sessionEmail,
    }))
  }, [mode, session?.user?.displayName, session?.user?.email, session?.user?.name])

  const filteredTagSuggestions = useMemo(() => {
    const query = normalizeText(tagInput)

    return existingTags.filter((tag) => {
      const tagKey = normalizeText(tag)
      const alreadyAdded = formData.tags.some((selectedTag) => normalizeText(selectedTag) === tagKey)
      if (alreadyAdded) return false
      if (!query) return true
      return tagKey.includes(query)
    })
  }, [existingTags, formData.tags, tagInput])

  const handleAddAuthor = () => {
    const parsedAuthors = parseAuthorInput(authorInput)
    if (parsedAuthors.length === 0) return

    setFormData((prev) => {
      const existingAuthorKeys = new Set(prev.authors.map((author) => normalizeText(author)))
      const nextAuthors = [...prev.authors]

      parsedAuthors.forEach((author) => {
        const key = normalizeText(author)
        if (key && !existingAuthorKeys.has(key)) {
          existingAuthorKeys.add(key)
          nextAuthors.push(author)
        }
      })

      return {
        ...prev,
        authors: nextAuthors,
      }
    })
    setAuthorInput("")
  }

  const handleRemoveAuthor = (author: string) => {
    setFormData((prev) => ({
      ...prev,
      authors: prev.authors.filter((a) => a !== author),
    }))
  }

  const handleAddTag = () => {
    const rawTag = tagInput.trim()
    if (!rawTag) return

    const existingTagMatch = existingTags.find(
      (tag) => normalizeText(tag) === normalizeText(rawTag)
    )
    const normalizedTag = existingTagMatch || rawTag

    setFormData((prev) => {
      const alreadyExists = prev.tags.some(
        (tag) => normalizeText(tag) === normalizeText(normalizedTag)
      )

      if (alreadyExists) {
        return prev
      }

      return {
        ...prev,
        tags: [...prev.tags, normalizedTag],
      }
    })
    setTagInput("")
  }

  const handleRemoveTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    if (!formData.title.trim()) {
      setError("Title is required")
      setIsSubmitting(false)
      return
    }

    if (formData.authors.length === 0) {
      setError("At least one author is required")
      setIsSubmitting(false)
      return
    }

    if (!formData.added_by.trim()) {
      setError("Your name is required")
      setIsSubmitting(false)
      return
    }

    try {
      const url = mode === "create" ? "/api/papers" : `/api/papers/${paper?.id}`
      const method = mode === "create" ? "POST" : "PUT"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to save paper")
      }

      const savedPaper = await response.json()
      router.push(`/papers/${savedPaper.id}`)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="border border-destructive bg-destructive/5 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Title */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-foreground mb-1">
          Title <span className="text-destructive">*</span>
        </label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
          placeholder="Enter paper title"
        />
      </div>

      {/* Authors */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1">
          Authors <span className="text-destructive">*</span>
        </label>
        <div className="flex gap-2">
          <Input
            value={authorInput}
            onChange={(e) => setAuthorInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                handleAddAuthor()
              }
            }}
            placeholder="Type authors and press Enter"
            className="flex-1"
          />
          <Button type="button" variant="outline" size="sm" onClick={handleAddAuthor}>
            Add
          </Button>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          You can add one author or paste a citation-style list like `Kim, S., Kang, H., & Park, C.`
        </p>
        {formData.authors.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {formData.authors.map((author) => (
              <span
                key={author}
                className="inline-flex items-center gap-1 bg-secondary text-secondary-foreground text-sm px-2 py-0.5 rounded"
              >
                {author}
                <button
                  type="button"
                  onClick={() => handleRemoveAuthor(author)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  x
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Conference & Year */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="conference" className="block text-sm font-medium text-foreground mb-1">
            Conference / Venue
          </label>
          <Input
            id="conference"
            value={formData.conference}
            onChange={(e) => setFormData((prev) => ({ ...prev, conference: e.target.value }))}
            placeholder="e.g., NeurIPS, CVPR"
          />
        </div>
        <div>
          <label htmlFor="year" className="block text-sm font-medium text-foreground mb-1">
            Year
          </label>
          <Input
            id="year"
            type="number"
            value={formData.year || ""}
            onChange={(e) => setFormData((prev) => ({ 
              ...prev, 
              year: e.target.value ? parseInt(e.target.value) : null 
            }))}
            placeholder="2024"
          />
        </div>
      </div>

      <div>
        <label htmlFor="group_id" className="block text-sm font-medium text-foreground mb-1">
          Group
        </label>
        <select
          id="group_id"
          value={formData.group_id ?? ""}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              group_id: e.target.value ? Number(e.target.value) : null,
            }))
          }
          className="w-full rounded border border-border bg-background px-3 py-2 text-sm"
        >
          <option value="">No group</option>
          {groups.map((group) => (
            <option key={group.id} value={group.id}>
              {group.name}
            </option>
          ))}
        </select>
      </div>

      {/* Abstract */}
      <div>
        <label htmlFor="summary" className="block text-sm font-medium text-foreground mb-1">
          Abstract / Summary
        </label>
        <Textarea
          id="summary"
          value={formData.summary}
          onChange={(e) => setFormData((prev) => ({ ...prev, summary: e.target.value }))}
          placeholder="Enter the paper's abstract or a brief summary"
          rows={5}
        />
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1">
          Tags / Subjects
        </label>
        <div className="relative">
          <div className="flex gap-2">
            <Input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onFocus={() => setIsTagInputFocused(true)}
              onBlur={() => {
                window.setTimeout(() => setIsTagInputFocused(false), 120)
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  handleAddTag()
                }
              }}
              placeholder="e.g., LLM, Vision, RL"
              className="flex-1"
            />
            <Button type="button" variant="outline" size="sm" onClick={handleAddTag}>
              Add
            </Button>
          </div>
          {isTagInputFocused && filteredTagSuggestions.length > 0 && (
            <div className="absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded border border-border bg-background shadow-sm">
              {filteredTagSuggestions.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault()
                    setTagInput(tag)
                    setIsTagInputFocused(false)
                  }}
                  className="block w-full px-3 py-2 text-left text-sm text-foreground hover:bg-accent/10"
                >
                  {tag}
                </button>
              ))}
            </div>
          )}
        </div>
        {formData.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {formData.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 border border-border text-sm px-2 py-0.5 rounded"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  x
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Links */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="github_url" className="block text-sm font-medium text-foreground mb-1">
            GitHub URL
          </label>
          <Input
            id="github_url"
            type="url"
            value={formData.github_url}
            onChange={(e) => setFormData((prev) => ({ ...prev, github_url: e.target.value }))}
            placeholder="https://github.com/..."
          />
        </div>
        <div>
          <label htmlFor="notion_url" className="block text-sm font-medium text-foreground mb-1">
            Notion URL
          </label>
          <Input
            id="notion_url"
            type="url"
            value={formData.notion_url}
            onChange={(e) => setFormData((prev) => ({ ...prev, notion_url: e.target.value }))}
            placeholder="https://www.notion.so/..."
          />
        </div>
        <div>
          <label htmlFor="arxiv_url" className="block text-sm font-medium text-foreground mb-1">
            arXiv URL
          </label>
          <Input
            id="arxiv_url"
            type="url"
            value={formData.arxiv_url}
            onChange={(e) => setFormData((prev) => ({ ...prev, arxiv_url: e.target.value }))}
            placeholder="https://arxiv.org/abs/..."
          />
        </div>
        <div>
          <label htmlFor="other_url" className="block text-sm font-medium text-foreground mb-1">
            Other URL
          </label>
          <Input
            id="other_url"
            type="url"
            value={formData.other_url}
            onChange={(e) => setFormData((prev) => ({ ...prev, other_url: e.target.value }))}
            placeholder="https://..."
          />
        </div>
      </div>

      {/* Submitter Info */}
      <div className="border-t border-border pt-4 mt-4">
        <h3 className="text-sm font-medium text-foreground mb-3">Submitted by</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="added_by" className="block text-sm font-medium text-foreground mb-1">
              Your Name <span className="text-destructive">*</span>
            </label>
            <Input
              id="added_by"
              value={formData.added_by}
              onChange={(e) => setFormData((prev) => ({ ...prev, added_by: e.target.value }))}
              placeholder="Your name"
            />
          </div>
          <div>
            <label htmlFor="added_by_email" className="block text-sm font-medium text-foreground mb-1">
              Email (optional)
            </label>
            <Input
              id="added_by_email"
              type="email"
              value={formData.added_by_email}
              onChange={(e) => setFormData((prev) => ({ ...prev, added_by_email: e.target.value }))}
              placeholder="your@email.com"
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-4 border-t border-border">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Spinner className="mr-2 h-4 w-4" />
              {mode === "create" ? "Submitting..." : "Saving..."}
            </>
          ) : (
            mode === "create" ? "Submit Paper" : "Save Changes"
          )}
        </Button>
      </div>
    </form>
  )
}
