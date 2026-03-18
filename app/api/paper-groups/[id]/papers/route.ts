import { NextResponse } from "next/server"
import { getAuthSession } from "@/lib/auth"
import { addPaperToGroup, getPaperById, removePaperFromGroup } from "@/lib/papers"
import { getPaperGroupById } from "@/lib/paper-groups"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAuthSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const groupId = Number(id)

    if (!Number.isFinite(groupId)) {
      return NextResponse.json({ error: "Invalid group id" }, { status: 400 })
    }

    const body = (await request.json()) as { paperId?: string }
    const paperId = body.paperId?.trim()

    if (!paperId) {
      return NextResponse.json({ error: "Paper id is required" }, { status: 400 })
    }

    const [group, paper] = await Promise.all([
      getPaperGroupById(groupId),
      getPaperById(paperId),
    ])

    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 })
    }

    if (!paper) {
      return NextResponse.json({ error: "Paper not found" }, { status: 404 })
    }

    const updatedPaper = await addPaperToGroup(paperId, groupId)

    if (!updatedPaper) {
      return NextResponse.json({ error: "Failed to add paper to group" }, { status: 500 })
    }

    return NextResponse.json(updatedPaper)
  } catch (error) {
    console.error("Error attaching paper to group:", error)
    return NextResponse.json(
      { error: "Failed to add paper to group" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAuthSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const groupId = Number(id)

    if (!Number.isFinite(groupId)) {
      return NextResponse.json({ error: "Invalid group id" }, { status: 400 })
    }

    const body = (await request.json()) as { paperId?: string }
    const paperId = body.paperId?.trim()

    if (!paperId) {
      return NextResponse.json({ error: "Paper id is required" }, { status: 400 })
    }

    const [group, paper] = await Promise.all([
      getPaperGroupById(groupId),
      getPaperById(paperId),
    ])

    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 })
    }

    if (!paper) {
      return NextResponse.json({ error: "Paper not found" }, { status: 404 })
    }

    const updatedPaper = await removePaperFromGroup(paperId, groupId)

    if (!updatedPaper) {
      return NextResponse.json(
        { error: "Paper is not attached to this group" },
        { status: 400 }
      )
    }

    return NextResponse.json(updatedPaper)
  } catch (error) {
    console.error("Error removing paper from group:", error)
    return NextResponse.json(
      { error: "Failed to remove paper from group" },
      { status: 500 }
    )
  }
}
