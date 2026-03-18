-- Papers table for research paper archive
CREATE TABLE IF NOT EXISTS papers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  authors TEXT[] NOT NULL DEFAULT '{}',
  conference TEXT,
  year INTEGER,
  summary TEXT,
  tags TEXT[] DEFAULT '{}',
  pdf_url TEXT,
  arxiv_url TEXT,
  added_by TEXT NOT NULL,
  added_by_email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for better search performance
CREATE INDEX IF NOT EXISTS idx_papers_title ON papers USING gin(to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS idx_papers_tags ON papers USING gin(tags);
CREATE INDEX IF NOT EXISTS idx_papers_conference ON papers(conference);
CREATE INDEX IF NOT EXISTS idx_papers_year ON papers(year);
CREATE INDEX IF NOT EXISTS idx_papers_created_at ON papers(created_at DESC);

-- Enable Row Level Security
ALTER TABLE papers ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view papers" ON papers;
DROP POLICY IF EXISTS "Anyone can add papers" ON papers;
DROP POLICY IF EXISTS "Anyone can update papers" ON papers;
DROP POLICY IF EXISTS "Anyone can delete papers" ON papers;

-- Allow anyone to read papers (public archive)
CREATE POLICY "Anyone can view papers" ON papers FOR SELECT USING (true);

-- Allow anyone to insert papers (for simplicity, can be restricted later)
CREATE POLICY "Anyone can add papers" ON papers FOR INSERT WITH CHECK (true);

-- Allow anyone to update papers (can be restricted to owner later)
CREATE POLICY "Anyone can update papers" ON papers FOR UPDATE USING (true);

-- Allow anyone to delete papers (can be restricted to owner later)
CREATE POLICY "Anyone can delete papers" ON papers FOR DELETE USING (true);
