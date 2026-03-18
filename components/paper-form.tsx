"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Spinner } from "@/components/ui/spinner"
import { Paper, PaperFormData } from "@/lib/types"
import { getUserName, setUserName } from "@/lib/user-store"

interface PaperFormProps {
  paper?: Paper
  mode: "create" | "edit"
}

export function PaperForm({ paper, mode }: PaperFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState<PaperFormData>({
    title: paper?.title || "",
    authors: paper?.authors || [],
    conference: paper?.conference || "",
    year: paper?.year || new Date().getFullYear(),
    summary: paper?.summary || "",
    tags: paper?.tags || [],
    pdf_url: paper?.pdf_url || "",
    arxiv_url: paper?.arxiv_url || "",
    added_by: paper?.added_by || "",
    added_by_email: paper?.added_by_email || "",
  })

  const [authorInput, setAuthorInput] = useState("")
  const [tagInput, setTagInput] = useState("")

  useEffect(() => {
    if (mode === "create") {
      const storedName = getUserName()
      if (storedName) {
        setFormData((prev) => ({ ...prev, added_by: storedName }))
      }
    }
  }, [mode])

  const handleAddAuthor = () => {
    if (authorInput.trim() && !formData.authors.includes(authorInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        authors: [...prev.authors, authorInput.trim()],
      }))
      setAuthorInput("")
    }
  }

  const handleRemoveAuthor = (author: string) => {
    setFormData((prev) => ({
      ...prev,
      authors: prev.authors.filter((a) => a !== author),
    }))
  }

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }))
      setTagInput("")
    }
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

    // Save user name for future submissions
    setUserName(formData.added_by.trim())

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
            placeholder="Type author name and press Enter"
            className="flex-1"
          />
          <Button type="button" variant="outline" size="sm" onClick={handleAddAuthor}>
            Add
          </Button>
        </div>
        {formData.authors.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {formData.authors.map((author, i) => (
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
        <div className="flex gap-2">
          <Input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
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
          <label htmlFor="pdf_url" className="block text-sm font-medium text-foreground mb-1">
            PDF URL
          </label>
          <Input
            id="pdf_url"
            type="url"
            value={formData.pdf_url}
            onChange={(e) => setFormData((prev) => ({ ...prev, pdf_url: e.target.value }))}
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
