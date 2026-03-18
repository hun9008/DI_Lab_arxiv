import { type ResultSetHeader, type RowDataPacket } from "mysql2"
import { getPool } from "@/lib/db"
import { type PaperGroup } from "@/lib/types"

interface PaperGroupRow extends RowDataPacket {
  id: number
  name: string
  created_at: string
}

function mapPaperGroupRow(row: PaperGroupRow): PaperGroup {
  return {
    id: row.id,
    name: row.name,
    created_at: row.created_at,
  }
}

export async function listPaperGroups() {
  const pool = getPool()
  const [rows] = await pool.query<PaperGroupRow[]>(
    `SELECT id, name, created_at
    FROM paper_groups
    ORDER BY created_at ASC, name ASC`
  )

  return rows.map(mapPaperGroupRow)
}

export async function getPaperGroupById(id: number) {
  const pool = getPool()
  const [rows] = await pool.query<PaperGroupRow[]>(
    `SELECT id, name, created_at
    FROM paper_groups
    WHERE id = ?
    LIMIT 1`,
    [id]
  )

  const group = rows[0]
  return group ? mapPaperGroupRow(group) : null
}

export async function createPaperGroup(name: string) {
  const trimmedName = name.trim()
  const pool = getPool()

  const [result] = await pool.execute<ResultSetHeader>(
    "INSERT INTO paper_groups (name) VALUES (?)",
    [trimmedName]
  )

  return getPaperGroupById(result.insertId)
}

export async function deletePaperGroup(id: number) {
  const pool = getPool()
  const connection = await pool.getConnection()

  try {
    await connection.beginTransaction()

    await connection.execute(
      `UPDATE papers
      SET group_id = NULL
      WHERE group_id = ?`,
      [id]
    )

    const [result] = await connection.execute<ResultSetHeader>(
      "DELETE FROM paper_groups WHERE id = ?",
      [id]
    )

    await connection.commit()

    return result.affectedRows > 0
  } catch (error) {
    await connection.rollback()
    throw error
  } finally {
    connection.release()
  }
}
