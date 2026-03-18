import { NextResponse } from "next/server"
import { getAuthSession } from "@/lib/auth"
import { listPapers } from "@/lib/papers"

function escapeCsvValue(value: string | number | null | undefined) {
  const normalized = value == null ? "" : String(value)
  return `"${normalized.replace(/"/g, '""')}"`
}

function toCsvRow(values: Array<string | number | null | undefined>) {
  return values.map(escapeCsvValue).join(",")
}

export async function GET(request: Request) {
  try {
    const session = await getAuthSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const searchQuery = searchParams.get("q")?.trim().toLowerCase() ?? ""
    const selectedConference = searchParams.get("conference")?.trim() ?? ""
    const selectedYear = searchParams.get("year")?.trim() ?? ""
    const selectedTags = searchParams
      .getAll("tag")
      .map((tag) => tag.trim())
      .filter(Boolean)
    const selectedSubmitter = searchParams.get("added_by")?.trim().toLowerCase() ?? ""

    const papers = await listPapers()
    const filteredPapers = papers.filter((paper) => {
      if (searchQuery) {
        const matchesSearch =
          paper.title.toLowerCase().includes(searchQuery) ||
          paper.authors.some((author) => author.toLowerCase().includes(searchQuery)) ||
          paper.summary?.toLowerCase().includes(searchQuery) ||
          paper.tags.some((tag) => tag.toLowerCase().includes(searchQuery))

        if (!matchesSearch) return false
      }

      if (selectedConference && paper.conference !== selectedConference) return false
      if (selectedYear && String(paper.year ?? "") !== selectedYear) return false
      if (selectedTags.length > 0) {
        const hasAllSelectedTags = selectedTags.every((selectedTag) =>
          paper.tags.some((tag) => tag.toLowerCase() === selectedTag.toLowerCase())
        )
        if (!hasAllSelectedTags) return false
      }
      if (selectedSubmitter && paper.added_by.toLowerCase() !== selectedSubmitter) return false

      return true
    })

    const csvLines = [
      toCsvRow([
        "title",
        "authors",
        "conference",
        "year",
        "summary",
        "tags",
        "group",
        "github_url",
        "notion_url",
        "arxiv_url",
        "other_url",
      ]),
      ...filteredPapers.map((paper) =>
        toCsvRow([
          paper.title,
          paper.authors.join(", "),
          paper.conference,
          paper.year,
          paper.summary,
          paper.tags.join(", "),
          paper.group_name,
          paper.github_url,
          paper.notion_url,
          paper.arxiv_url,
          paper.other_url,
        ])
      ),
    ]

    return new NextResponse(`${csvLines.join("\n")}\n`, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="all-papers.csv"',
        "Cache-Control": "no-store",
      },
    })
  } catch (error) {
    console.error("Error downloading papers as CSV:", error)
    return NextResponse.json({ error: "Failed to download papers" }, { status: 500 })
  }
}
