import { NextResponse } from "next/server"
import { createPaperGroup, listPaperGroups } from "@/lib/paper-groups"

export async function GET() {
  try {
    const groups = await listPaperGroups()
    return NextResponse.json(groups)
  } catch (error) {
    console.error("Error fetching paper groups:", error)
    return NextResponse.json({ error: "Failed to fetch groups" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { name?: string }
    const name = body.name?.trim()

    if (!name) {
      return NextResponse.json({ error: "Group name is required" }, { status: 400 })
    }

    const group = await createPaperGroup(name)

    if (!group) {
      return NextResponse.json({ error: "Failed to create group" }, { status: 500 })
    }

    return NextResponse.json(group, { status: 201 })
  } catch (error) {
    console.error("Error creating paper group:", error)
    return NextResponse.json({ error: "Failed to create group" }, { status: 500 })
  }
}
