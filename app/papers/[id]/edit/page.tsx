import { Header } from "@/components/header"
import { PaperForm } from "@/components/paper-form"
import { getPaperById } from "@/lib/papers"
import { notFound } from "next/navigation"
import Link from "next/link"

export const dynamic = "force-dynamic"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditPaperPage({ params }: PageProps) {
  const { id } = await params
  const paper = await getPaperById(id)

  if (!paper) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-4xl px-4 py-6">
        <div className="mb-4">
          <Link
            href={`/papers/${id}`}
            className="text-sm text-primary hover:underline"
          >
            &larr; Back to paper
          </Link>
        </div>

        <div className="border border-border bg-card">
          <div className="border-b border-border p-4">
            <h1 className="font-serif text-xl font-bold text-foreground">
              Edit Paper
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Update the paper information
            </p>
          </div>
          <div className="p-4">
            <PaperForm paper={paper} mode="edit" />
          </div>
        </div>
      </main>
    </div>
  )
}
