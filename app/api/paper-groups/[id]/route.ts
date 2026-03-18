import { NextResponse } from "next/server"
import { getAuthSession } from "@/lib/auth"
import { deletePaperGroup, getPaperGroupById } from "@/lib/paper-groups"

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

    const group = await getPaperGroupById(groupId)

    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 })
    }

    const deleted = await deletePaperGroup(groupId)

    if (!deleted) {
      return NextResponse.json({ error: "Failed to delete group" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting group:", error)
    return NextResponse.json({ error: "Failed to delete group" }, { status: 500 })
  }
}
