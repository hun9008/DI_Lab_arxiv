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
  github_url: string | null
  notion_url: string | null
  arxiv_url: string | null
  other_url: string | null
  added_by: string
  added_by_email: string | null
  created_at: string
  updated_at: string
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

function mapPaperRow(row: PaperRow): Paper {
  return {
    id: row.id,
    title: row.title,
    authors: parseJsonArray(row.authors),
    conference: row.conference,
    year: row.year,
    summary: row.summary,
    tags: parseJsonArray(row.tags),
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
    github_url: normalizeOptionalString(input.github_url),
    notion_url: normalizeOptionalString(input.notion_url),
    arxiv_url: normalizeOptionalString(input.arxiv_url),
    other_url: normalizeOptionalString(input.other_url),
    added_by: input.added_by.trim(),
    added_by_email: normalizeOptionalString(input.added_by_email),
  }
}

export async function listPapers() {
  const pool = getPool()
  const [rows] = await pool.query<PaperRow[]>(
    `SELECT
      id,
      title,
      authors,
      conference,
      year,
      summary,
      tags,
      github_url,
      notion_url,
      arxiv_url,
      other_url,
      added_by,
      added_by_email,
      created_at,
      updated_at
    FROM papers
    ORDER BY created_at DESC`
  )

  return rows.map(mapPaperRow)
}

export async function getPaperById(id: string) {
  const pool = getPool()
  const [rows] = await pool.query<PaperRow[]>(
    `SELECT
      id,
      title,
      authors,
      conference,
      year,
      summary,
      tags,
      github_url,
      notion_url,
      arxiv_url,
      other_url,
      added_by,
      added_by_email,
      created_at,
      updated_at
    FROM papers
    WHERE id = ?
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

  await pool.execute<ResultSetHeader>(
    `INSERT INTO papers (
      id,
      title,
      authors,
      conference,
      year,
      summary,
      tags,
      github_url,
      notion_url,
      arxiv_url,
      other_url,
      added_by,
      added_by_email
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      paper.title,
      paper.authors,
      paper.conference,
      paper.year,
      paper.summary,
      paper.tags,
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

  const [result] = await pool.execute<ResultSetHeader>(
    `UPDATE papers
    SET
      title = ?,
      authors = ?,
      conference = ?,
      year = ?,
      summary = ?,
      tags = ?,
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

export async function deletePaper(id: string) {
  const pool = getPool()
  const [result] = await pool.execute<ResultSetHeader>(
    "DELETE FROM papers WHERE id = ?",
    [id]
  )

  return result.affectedRows > 0
}
