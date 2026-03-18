import { Header } from "@/components/header"
import { PaperArchive } from "@/components/paper-archive"
import { listPaperGroups } from "@/lib/paper-groups"
import { type Paper, type PaperGroup } from "@/lib/types"
import { listPapers } from "@/lib/papers"

export const dynamic = "force-dynamic"

export default async function HomePage() {
  let papers: Paper[] = []
  let groups: PaperGroup[] = []

  try {
    ;[papers, groups] = await Promise.all([listPapers(), listPaperGroups()])
  } catch (err) {
    console.error("Exception fetching papers:", err)
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-4xl px-4 py-6">
        <PaperArchive papers={papers} groups={groups} />
      </main>
    </div>
  )
}
