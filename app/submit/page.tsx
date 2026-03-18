import { Header } from "@/components/header"
import { PaperForm } from "@/components/paper-form"

export default function SubmitPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-4xl px-4 py-6">
        <div className="border border-border bg-card">
          <div className="border-b border-border p-4">
            <h1 className="font-serif text-xl font-bold text-foreground">
              Submit a Paper
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Share a research paper with your lab colleagues
            </p>
          </div>
          <div className="p-4">
            <PaperForm mode="create" />
          </div>
        </div>
      </main>
    </div>
  )
}
