import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  
  try {
    const repertoire = await prisma.repertoire.findUnique({
      where: { id },
    })
    
    if (!repertoire) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    // Busca as músicas do repertório
    const songs = repertoire.songIds.length > 0
      ? await prisma.song.findMany({
          where: { id: { in: repertoire.songIds } },
        })
      : []

    return NextResponse.json({
      repertoire,
      songs,
    })
  } catch (error) {
    console.error("Error fetching repertoire:", error)
    return NextResponse.json({ error: "Invalid ID format" }, { status: 400 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  
  try {
    const body = await request.json()
    
    const repertoire = await prisma.repertoire.update({
      where: { id },
      data: {
        title: body.title,
        owner: body.owner,
        songIds: body.songIds,
        description: body.description,
        coverUrl: body.coverUrl,
        isPublic: body.isPublic,
      },
    })
    
    return NextResponse.json(repertoire)
  } catch (error) {
    console.error("Error updating repertoire:", error)
    return NextResponse.json({ error: "Failed to update repertoire" }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  
  try {
    await prisma.repertoire.delete({
      where: { id },
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting repertoire:", error)
    return NextResponse.json({ error: "Failed to delete repertoire" }, { status: 500 })
  }
}
