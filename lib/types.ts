export interface Paper {
  id: string
  title: string
  authors: string[]
  conference: string | null
  year: number | null
  summary: string | null
  tags: string[]
  github_url: string | null
  notion_url: string | null
  arxiv_url: string | null
  other_url: string | null
  added_by: string
  added_by_email: string | null
  created_at: string
  updated_at: string
}

export interface PaperFormData {
  title: string
  authors: string[]
  conference: string
  year: number | null
  summary: string
  tags: string[]
  github_url: string
  notion_url: string
  arxiv_url: string
  other_url: string
  added_by: string
  added_by_email: string
}
