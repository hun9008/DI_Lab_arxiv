import { NextResponse } from "next/server"
import { getAuthSession } from "@/lib/auth"

type ArxivCandidate = {
  title: string
  authors: string[]
  arxivUrl: string | null
  conference: string | null
  year: number | null
  score: number
}

function decodeXml(value: string) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim()
}

function normalizeTitle(value: string) {
  return value
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim()
}

function scoreTitleMatch(query: string, candidate: string) {
  const normalizedQuery = normalizeTitle(query)
  const normalizedCandidate = normalizeTitle(candidate)

  if (!normalizedQuery || !normalizedCandidate) return 0
  if (normalizedQuery === normalizedCandidate) return 1000
  if (normalizedCandidate.includes(normalizedQuery)) return 800
  if (normalizedQuery.includes(normalizedCandidate)) return 700

  const queryTokens = normalizedQuery.split(" ")
  const candidateTokens = new Set(normalizedCandidate.split(" "))
  const overlap = queryTokens.filter((token) => candidateTokens.has(token)).length

  return overlap
}

function extractText(entry: string, tagName: string) {
  const escapedTagName = tagName.replace(":", "\\:")
  const match = entry.match(new RegExp(`<${escapedTagName}>([\\s\\S]*?)<\\/${escapedTagName}>`))
  return match ? decodeXml(match[1]) : null
}

function inferConference(value: string | null) {
  if (!value) return null

  const patterns = [
    "NeurIPS",
    "ICML",
    "ICLR",
    "CVPR",
    "ECCV",
    "ICCV",
    "ACL",
    "EMNLP",
    "NAACL",
    "COLING",
    "KDD",
    "WWW",
    "SIGIR",
    "CIKM",
    "WSDM",
    "AAAI",
    "IJCAI",
    "MM",
  ]

  const normalized = value.toUpperCase()

  for (const pattern of patterns) {
    if (normalized.includes(pattern.toUpperCase())) {
      return pattern
    }
  }

  return null
}

function parseArxivFeed(xml: string, titleQuery: string) {
  const entries = Array.from(xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g))

  const candidates: ArxivCandidate[] = entries
    .map((match) => {
      const entry = match[1]
      const authorMatches = Array.from(entry.matchAll(/<author>\s*<name>([\s\S]*?)<\/name>\s*<\/author>/g))

      const title = extractText(entry, "title") ?? ""
      const authors = authorMatches.map((authorMatch) => decodeXml(authorMatch[1]))
      const arxivUrl = extractText(entry, "id")
      const published = extractText(entry, "published")
      const journalRef = extractText(entry, "arxiv:journal_ref")
      const comment = extractText(entry, "arxiv:comment")
      const year = published ? new Date(published).getUTCFullYear() : null
      const conference = inferConference(journalRef) ?? inferConference(comment)
      const score = scoreTitleMatch(titleQuery, title)

      return {
        title,
        authors,
        arxivUrl,
        conference,
        year: Number.isFinite(year) ? year : null,
        score,
      }
    })
    .filter((candidate) => candidate.title && candidate.authors.length > 0)
    .sort((a, b) => b.score - a.score)

  return candidates[0] ?? null
}

export async function GET(request: Request) {
  try {
    const session = await getAuthSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const title = searchParams.get("title")?.trim()

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 })
    }

    const arxivUrl = new URL("https://export.arxiv.org/api/query")
    arxivUrl.searchParams.set("search_query", `ti:"${title}"`)
    arxivUrl.searchParams.set("start", "0")
    arxivUrl.searchParams.set("max_results", "5")

    const response = await fetch(arxivUrl.toString(), {
      headers: {
        "User-Agent": "LabPaperArchive/1.0 (paper info lookup)",
      },
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error(`arXiv lookup failed with status ${response.status}`)
    }

    const xml = await response.text()
    const bestMatch = parseArxivFeed(xml, title)

    if (!bestMatch || bestMatch.score <= 0) {
      return NextResponse.json({ error: "No matching arXiv paper found" }, { status: 404 })
    }

    return NextResponse.json({
      title: bestMatch.title,
      authors: bestMatch.authors,
      arxiv_url: bestMatch.arxivUrl,
      conference: bestMatch.conference,
      year: bestMatch.year,
    })
  } catch (error) {
    console.error("Error finding paper info from arXiv:", error)
    return NextResponse.json({ error: "Failed to find paper info" }, { status: 500 })
  }
}
