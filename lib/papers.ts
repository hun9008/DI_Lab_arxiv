import { randomUUID } from "node:crypto"
import { type ResultSetHeader, type RowDataPacket } from "mysql2"
import { getPool } from "@/lib/db"
import { type Paper, type PaperFormData } from "@/lib/types"

interface PaperRow extends RowDataPacket {
  id: string
  title: string
  authors: unknown
  conference: string | null
  year: number | null
  summary: string | null
  tags: unknown
  group_id: number | null
  group_name: string | null
  github_url: string | null
  notion_url: string | null
  arxiv_url: string | null
  other_url: string | null
  added_by: string
  added_by_email: string | null
  created_at: string
  updated_at: string
}

export class DuplicatePaperTitleError extends Error {
  constructor() {
    super("A paper with the same title already exists")
    this.name = "DuplicatePaperTitleError"
  }
}

function parseJsonArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => String(item))
  }

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value)
      return Array.isArray(parsed) ? parsed.map((item) => String(item)) : []
    } catch {
      return []
    }
  }

  if (value && typeof value === "object" && "toString" in value) {
    try {
      const parsed = JSON.parse(String(value))
      return Array.isArray(parsed) ? parsed.map((item) => String(item)) : []
    } catch {
      return []
    }
  }

  return []
}

function normalizeOptionalString(value: string | null | undefined) {
  const trimmed = value?.trim()
  return trimmed ? trimmed : null
}

async function hasDuplicateTitle(title: string, excludeId?: string) {
  const pool = getPool()
  const normalizedTitle = title.trim()

  const [rows] = await pool.query<Array<RowDataPacket & { id: string }>>(
    `SELECT id
    FROM papers
    WHERE LOWER(TRIM(title)) = LOWER(TRIM(?))
      ${excludeId ? "AND id <> ?" : ""}
    LIMIT 1`,
    excludeId ? [normalizedTitle, excludeId] : [normalizedTitle]
  )

  return rows.length > 0
}

function mapPaperRow(row: PaperRow): Paper {
  return {
    id: row.id,
    title: row.title,
    authors: parseJsonArray(row.authors),
    conference: row.conference,
    year: row.year,
    summary: row.summary,
    tags: parseJsonArray(row.tags),
    group_id: row.group_id,
    group_name: row.group_name,
    github_url: row.github_url,
    notion_url: row.notion_url,
    arxiv_url: row.arxiv_url,
    other_url: row.other_url,
    added_by: row.added_by,
    added_by_email: row.added_by_email,
    created_at: row.created_at,
    updated_at: row.updated_at,
  }
}

function toPaperParams(input: PaperFormData) {
  return {
    title: input.title.trim(),
    authors: JSON.stringify(input.authors.map((author) => author.trim()).filter(Boolean)),
    conference: normalizeOptionalString(input.conference),
    year: input.year,
    summary: normalizeOptionalString(input.summary),
    tags: JSON.stringify(input.tags.map((tag) => tag.trim()).filter(Boolean)),
    group_id: input.group_id,
    github_url: normalizeOptionalString(input.github_url),
    notion_url: normalizeOptionalString(input.notion_url),
    arxiv_url: normalizeOptionalString(input.arxiv_url),
    other_url: normalizeOptionalString(input.other_url),
    added_by: input.added_by.trim(),
    added_by_email: normalizeOptionalString(input.added_by_email),
  }
}

const paperSelect = `SELECT
  papers.id,
  papers.title,
  papers.authors,
  papers.conference,
  papers.year,
  papers.summary,
  papers.tags,
  papers.group_id,
  paper_groups.name AS group_name,
  papers.github_url,
  papers.notion_url,
  papers.arxiv_url,
  papers.other_url,
  papers.added_by,
  papers.added_by_email,
  papers.created_at,
  papers.updated_at
FROM papers
LEFT JOIN paper_groups
  ON paper_groups.id = papers.group_id`

export async function listPapers() {
  const pool = getPool()
  const [rows] = await pool.query<PaperRow[]>(
    `${paperSelect}
    ORDER BY papers.created_at DESC`
  )

  return rows.map(mapPaperRow)
}

export async function listSimilarPapers(paper: Paper, limit = 5) {
  if (paper.tags.length === 0) {
    return []
  }

  const allPapers = await listPapers()
  const targetTags = new Set(paper.tags.map((tag) => tag.toLowerCase()))

  return allPapers
    .filter((candidate) => candidate.id !== paper.id)
    .map((candidate) => {
      const overlapCount = candidate.tags.filter((tag) =>
        targetTags.has(tag.toLowerCase())
      ).length

      return {
        paper: candidate,
        overlapCount,
      }
    })
    .filter((candidate) => candidate.overlapCount > 0)
    .sort((a, b) => {
      if (b.overlapCount !== a.overlapCount) {
        return b.overlapCount - a.overlapCount
      }

      return (
        new Date(b.paper.created_at).getTime() - new Date(a.paper.created_at).getTime()
      )
    })
    .slice(0, limit)
    .map((candidate) => candidate.paper)
}

export async function listPapersByGroupId(groupId: number) {
  const pool = getPool()
  const [rows] = await pool.query<PaperRow[]>(
    `${paperSelect}
    WHERE papers.group_id = ?
    ORDER BY papers.created_at DESC`,
    [groupId]
  )

  return rows.map(mapPaperRow)
}

export async function getPaperById(id: string) {
  const pool = getPool()
  const [rows] = await pool.query<PaperRow[]>(
    `${paperSelect}
    WHERE papers.id = ?
    LIMIT 1`,
    [id]
  )

  const paper = rows[0]
  return paper ? mapPaperRow(paper) : null
}

export async function createPaper(input: PaperFormData) {
  const pool = getPool()
  const id = randomUUID()
  const paper = toPaperParams(input)

  if (await hasDuplicateTitle(paper.title)) {
    throw new DuplicatePaperTitleError()
  }

  await pool.execute<ResultSetHeader>(
    `INSERT INTO papers (
      id,
      title,
      authors,
      conference,
      year,
      summary,
      tags,
      group_id,
      github_url,
      notion_url,
      arxiv_url,
      other_url,
      added_by,
      added_by_email
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      paper.title,
      paper.authors,
      paper.conference,
      paper.year,
      paper.summary,
      paper.tags,
      paper.group_id,
      paper.github_url,
      paper.notion_url,
      paper.arxiv_url,
      paper.other_url,
      paper.added_by,
      paper.added_by_email,
    ]
  )

  return getPaperById(id)
}

export async function updatePaper(id: string, input: PaperFormData) {
  const pool = getPool()
  const paper = toPaperParams(input)

  if (await hasDuplicateTitle(paper.title, id)) {
    throw new DuplicatePaperTitleError()
  }

  const [result] = await pool.execute<ResultSetHeader>(
    `UPDATE papers
    SET
      title = ?,
      authors = ?,
      conference = ?,
      year = ?,
      summary = ?,
      tags = ?,
      group_id = ?,
      github_url = ?,
      notion_url = ?,
      arxiv_url = ?,
      other_url = ?,
      added_by = ?,
      added_by_email = ?
    WHERE id = ?`,
    [
      paper.title,
      paper.authors,
      paper.conference,
      paper.year,
      paper.summary,
      paper.tags,
      paper.group_id,
      paper.github_url,
      paper.notion_url,
      paper.arxiv_url,
      paper.other_url,
      paper.added_by,
      paper.added_by_email,
      id,
    ]
  )

  if (result.affectedRows === 0) {
    return null
  }

  return getPaperById(id)
}

export async function addPaperToGroup(id: string, groupId: number) {
  const pool = getPool()
  const [result] = await pool.execute<ResultSetHeader>(
    `UPDATE papers
    SET group_id = ?
    WHERE id = ?`,
    [groupId, id]
  )

  if (result.affectedRows === 0) {
    return null
  }

  return getPaperById(id)
}

export async function removePaperFromGroup(id: string, groupId: number) {
  const pool = getPool()
  const [result] = await pool.execute<ResultSetHeader>(
    `UPDATE papers
    SET group_id = NULL
    WHERE id = ? AND group_id = ?`,
    [id, groupId]
  )

  if (result.affectedRows === 0) {
    return null
  }

  return getPaperById(id)
}

export async function deletePaper(id: string) {
  const pool = getPool()
  const [result] = await pool.execute<ResultSetHeader>(
    "DELETE FROM papers WHERE id = ?",
    [id]
  )

  return result.affectedRows > 0
}
