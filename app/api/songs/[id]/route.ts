import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  
  try {
    const [song, repertoires] = await Promise.all([
      prisma.song.findUnique({
        where: { id },
      }),
      prisma.repertoire.findMany({
        where: { songIds: { has: id } },
        select: { id: true, title: true },
      }),
    ])
    
    if (!song) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }
    
    return NextResponse.json({
      ...song,
      repertoires,
    })
  } catch (error) {
    console.error("Error fetching song:", error)
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
    
    const song = await prisma.song.update({
      where: { id },
      data: {
        title: body.title,
        artists: body.artists,
        genres: body.genres,
        coverUrl: body.coverUrl,
        pages: body.pages,
      },
    })
    
    return NextResponse.json(song)
  } catch (error) {
    console.error("Error updating song:", error)
    return NextResponse.json({ error: "Failed to update song" }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  
  try {
    await prisma.song.delete({
      where: { id },
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting song:", error)
    return NextResponse.json({ error: "Failed to delete song" }, { status: 500 })
  }
}
