import { deletePaper, getPaperById, updatePaper } from "@/lib/papers"
import { type PaperFormData } from "@/lib/types"
import { NextResponse } from "next/server"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    const paper = await getPaperById(id)

    if (!paper) {
      return NextResponse.json({ error: "Paper not found" }, { status: 404 })
    }

    return NextResponse.json(paper)
  } catch (error) {
    console.error("Error fetching paper:", error)
    return NextResponse.json({ error: "Failed to fetch paper" }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const body = (await request.json()) as PaperFormData
    const paper = await updatePaper(id, body)

    if (!paper) {
      return NextResponse.json({ error: "Paper not found" }, { status: 404 })
    }

    return NextResponse.json(paper)
  } catch (error) {
    console.error("Error updating paper:", error)
    return NextResponse.json({ error: "Failed to update paper" }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    const deleted = await deletePaper(id)

    if (!deleted) {
      return NextResponse.json({ error: "Paper not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting paper:", error)
    return NextResponse.json({ error: "Failed to delete paper" }, { status: 500 })
  }
}
