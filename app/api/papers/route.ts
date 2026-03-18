import { createPaper, listPapers } from "@/lib/papers"
import { type PaperFormData } from "@/lib/types"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const papers = await listPapers()
    return NextResponse.json(papers)
  } catch (error) {
    console.error("Error fetching papers:", error)
    return NextResponse.json({ error: "Failed to fetch papers" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as PaperFormData
    const paper = await createPaper(body)

    if (!paper) {
      return NextResponse.json({ error: "Failed to create paper" }, { status: 500 })
    }

    return NextResponse.json(paper, { status: 201 })
  } catch (error) {
    console.error("Error creating paper:", error)
    return NextResponse.json({ error: "Failed to create paper" }, { status: 500 })
  }
}
