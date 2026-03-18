import { NextResponse } from "next/server"
import { getAuthSession } from "@/lib/auth"
import { getPaperGroupById } from "@/lib/paper-groups"
import { listPapersByGroupId } from "@/lib/papers"

interface RouteContext {
  params: Promise<{ id: string }>
}

function escapeCsvValue(value: string | number | null | undefined) {
  const normalized = value == null ? "" : String(value)
  return `"${normalized.replace(/"/g, '""')}"`
}

function toCsvRow(values: Array<string | number | null | undefined>) {
  return values.map(escapeCsvValue).join(",")
}

function toFileName(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "group-papers"
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    const session = await getAuthSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await context.params
    const groupId = Number(id)

    if (!Number.isFinite(groupId)) {
      return NextResponse.json({ error: "Invalid group id" }, { status: 400 })
    }

    const group = await getPaperGroupById(groupId)

    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 })
    }

    const papers = await listPapersByGroupId(groupId)
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
      ...papers.map((paper) =>
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
        "Content-Disposition": `attachment; filename="${toFileName(group.name)}-papers.csv"`,
        "Cache-Control": "no-store",
      },
    })
  } catch (error) {
    console.error("Error downloading group papers as CSV:", error)
    return NextResponse.json({ error: "Failed to download group papers" }, { status: 500 })
  }
}
