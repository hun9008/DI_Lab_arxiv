import { Header } from "@/components/header"
import { PaperDeleteButton } from "@/components/paper-delete-button"
import { getPaperById } from "@/lib/papers"
import { notFound } from "next/navigation"
import Link from "next/link"

export const dynamic = "force-dynamic"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function PaperDetailPage({ params }: PageProps) {
  const { id } = await params
  const paper = await getPaperById(id)

  if (!paper) {
    notFound()
  }

  const p = paper
  const scholarSearchUrl = `https://scholar.google.com/scholar?q=${encodeURIComponent(p.title)}`

  const submittedDate = new Date(p.created_at).toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-4xl px-4 py-6">
        <div className="mb-4">
          <Link
            href="/"
            className="text-sm text-primary hover:underline"
          >
            &larr; Back to list
          </Link>
        </div>

        <article className="border border-border bg-card">
          {/* Title Section */}
          <div className="border-b border-border p-4">
            <h1 className="font-serif text-xl font-bold leading-snug mb-2">
              <a
                href={scholarSearchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground hover:text-primary hover:underline"
              >
                {p.title}
              </a>
            </h1>
            <p className="text-sm text-foreground">
              {p.authors.join(", ")}
            </p>
          </div>

          {/* Links Section */}
          <div className="border-b border-border p-4 flex flex-wrap gap-4 text-sm">
            {p.github_url && (
              <a
                href={p.github_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline font-medium"
              >
                View GitHub
              </a>
            )}
            {p.notion_url && (
              <a
                href={p.notion_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline font-medium"
              >
                Open Notion
              </a>
            )}
            {p.arxiv_url && (
              <a
                href={p.arxiv_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline font-medium"
              >
                View on arXiv
              </a>
            )}
            {p.other_url && (
              <a
                href={p.other_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline font-medium"
              >
                Open Other Link
              </a>
            )}
            <Link
              href={`/papers/${id}/edit`}
              className="text-primary hover:underline font-medium"
            >
              Edit this entry
            </Link>
            <PaperDeleteButton paperId={id} paperTitle={p.title} />
          </div>

          {/* Abstract/Summary */}
          {p.summary && (
            <div className="border-b border-border p-4">
              <h2 className="font-serif font-semibold text-foreground mb-2">Abstract</h2>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {p.summary}
              </p>
            </div>
          )}

          {/* Metadata */}
          <div className="p-4 space-y-3 text-sm">
            {p.conference && (
              <div className="flex">
                <span className="text-muted-foreground w-28 shrink-0">Conference:</span>
                <span className="text-foreground font-medium">
                  {p.conference}{p.year ? ` (${p.year})` : ""}
                </span>
              </div>
            )}
            {!p.conference && p.year && (
              <div className="flex">
                <span className="text-muted-foreground w-28 shrink-0">Year:</span>
                <span className="text-foreground">{p.year}</span>
              </div>
            )}
            {p.tags.length > 0 && (
              <div className="flex">
                <span className="text-muted-foreground w-28 shrink-0">Subjects:</span>
                <span className="text-foreground">{p.tags.join(", ")}</span>
              </div>
            )}
            <div className="flex">
              <span className="text-muted-foreground w-28 shrink-0">Submitted by:</span>
              <span className="text-foreground">
                {p.added_by}
                {p.added_by_email && ` (${p.added_by_email})`}
              </span>
            </div>
            <div className="flex">
              <span className="text-muted-foreground w-28 shrink-0">Submission:</span>
              <span className="text-foreground">{submittedDate}</span>
            </div>
          </div>
        </article>

        {/* Submission Info */}
        <div className="mt-4 text-xs text-muted-foreground text-center">
          Paper ID: {p.id}
        </div>
      </main>
    </div>
  )
}
