import { notFound } from "next/navigation"
import { GroupDeleteButton } from "@/components/group-delete-button"
import { GroupDownloadButton } from "@/components/group-download-button"
import { Header } from "@/components/header"
import { GroupPaperManager } from "@/components/group-paper-manager"
import { PaperArchive } from "@/components/paper-archive"
import { getPaperGroupById } from "@/lib/paper-groups"
import { listPapers, listPapersByGroupId } from "@/lib/papers"

export const dynamic = "force-dynamic"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function GroupPage({ params }: PageProps) {
  const { id } = await params
  const groupId = Number(id)

  if (!Number.isFinite(groupId)) {
    notFound()
  }

  const [group, papers, allPapers] = await Promise.all([
    getPaperGroupById(groupId),
    listPapersByGroupId(groupId),
    listPapers(),
  ])

  if (!group) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-background">
      <Header currentGroupName={group.name} />
      <main className="mx-auto max-w-4xl px-4 py-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Group Screenshot
            </p>
            <h1 className="font-serif text-2xl font-semibold text-foreground">
              {group.name}
            </h1>
          </div>
          <div className="text-sm text-muted-foreground">
            Pick from already submitted papers
          </div>
        </div>
        <GroupPaperManager
          groupId={group.id}
          groupName={group.name}
          allPapers={allPapers}
          groupedPapers={papers}
        />
        <PaperArchive
          papers={papers}
          groups={[]}
          showGroupsSection={false}
          showMemberSection={false}
          showSubmitterFilter={true}
          showAllPapersDownload={false}
          allPapersTitle={`${group.name} Group Papers`}
          allPapersActions={<GroupDownloadButton groupId={group.id} />}
        />
        <GroupDeleteButton groupId={group.id} groupName={group.name} />
      </main>
    </div>
  )
}
