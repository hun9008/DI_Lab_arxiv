import { type RowDataPacket } from "mysql2"
import { getPool } from "@/lib/db"

interface GoogleOAuthAllowlistRow extends RowDataPacket {
  id: number
  google_email: string
  google_sub: string | null
  display_name: string | null
}

export interface AllowedGoogleUser {
  id: number
  email: string
  googleSub: string | null
  displayName: string | null
}

export async function getAllowedGoogleUserByEmail(email: string) {
  const pool = getPool()
  const [rows] = await pool.query<GoogleOAuthAllowlistRow[]>(
    `SELECT id, google_email, google_sub, display_name
     FROM google_oauth_allowlist
     WHERE LOWER(google_email) = LOWER(?)
     LIMIT 1`,
    [email]
  )

  const row = rows[0]
  if (!row) return null

  return {
    id: row.id,
    email: row.google_email,
    googleSub: row.google_sub,
    displayName: row.display_name,
  } satisfies AllowedGoogleUser
}

export async function updateAllowedGoogleUserSub(id: number, googleSub: string) {
  const pool = getPool()
  await pool.execute(
    `UPDATE google_oauth_allowlist
     SET google_sub = ?
     WHERE id = ?`,
    [googleSub, id]
  )
}
