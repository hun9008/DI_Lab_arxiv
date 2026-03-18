import Link from "next/link"
import { Paper } from "@/lib/types"

interface PaperItemProps {
  paper: Paper
  index: number
}

export function PaperItem({ paper, index }: PaperItemProps) {
  const formattedDate = new Date(paper.created_at).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })

  const conferenceHref = paper.conference
    ? `/?conference=${encodeURIComponent(paper.conference)}`
    : null
  const yearHref = paper.year ? `/?year=${paper.year}` : null

  return (
    <div className="py-3 border-b border-border last:border-b-0">
      <div className="flex gap-3">
        <span className="text-xs text-muted-foreground font-mono shrink-0 pt-0.5 w-6">
          {index}.
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2 flex-wrap">
            <Link
              href={`/papers/${paper.id}`}
              className="font-serif text-primary hover:underline font-medium leading-snug"
            >
              {paper.title}
            </Link>
            {paper.github_url && (
              <a
                href={paper.github_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-accent hover:underline shrink-0"
              >
                [github]
              </a>
            )}
            {paper.notion_url && (
              <a
                href={paper.notion_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-accent hover:underline shrink-0"
              >
                [notion]
              </a>
            )}
            {paper.arxiv_url && (
              <a
                href={paper.arxiv_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-accent hover:underline shrink-0"
              >
                [arXiv]
              </a>
            )}
            {paper.other_url && (
              <a
                href={paper.other_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-accent hover:underline shrink-0"
              >
                [other]
              </a>
            )}
          </div>
          <p className="text-sm text-foreground mt-0.5">
            {paper.authors.join(", ")}
          </p>
          {paper.summary && (
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
              {paper.summary}
            </p>
          )}
          <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground flex-wrap">
            {(paper.conference || paper.year) && (
              <span className="font-medium">
                {paper.conference && (
                  conferenceHref ? (
                    <Link href={conferenceHref} className="hover:text-primary hover:underline">
                      {paper.conference}
                    </Link>
                  ) : (
                    paper.conference
                  )
                )}
                {paper.year && (
                  <>
                    {paper.conference ? " " : ""}
                    {yearHref ? (
                      <Link href={yearHref} className="hover:text-primary hover:underline">
                        {paper.year}
                      </Link>
                    ) : (
                      paper.year
                    )}
                  </>
                )}
              </span>
            )}
            {paper.tags.length > 0 && (
              <>
                <span className="text-border">|</span>
                {paper.tags.map((tag, i) => (
                  <span key={tag} className="text-muted-foreground">
                    <Link
                      href={`/?tag=${encodeURIComponent(tag)}`}
                      className="hover:text-primary hover:underline"
                    >
                      {tag}
                    </Link>
                    {i < paper.tags.length - 1 ? "," : ""}
                  </span>
                ))}
              </>
            )}
            <span className="text-border">|</span>
            <span>Added by {paper.added_by} on {formattedDate}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
