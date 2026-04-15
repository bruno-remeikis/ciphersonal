import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  
  try {
    const artist = await prisma.artist.findUnique({
      where: { id },
    })
    
    if (!artist) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    // Busca músicas que contenham o nome do artista
    const songs = await prisma.song.findMany()
    const artistSongs = songs.filter((s) =>
      s.artists.some((name: string) =>
        name.toLowerCase().includes(artist.name.toLowerCase())
      )
    )

    return NextResponse.json({
      artist,
      songs: artistSongs,
    })
  } catch (error) {
    console.error("Error fetching artist:", error)
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
    
    const artist = await prisma.artist.update({
      where: { id },
      data: {
        name: body.name,
        genre: body.genre,
        songCount: body.songCount,
        avatarUrl: body.avatarUrl,
        verified: body.verified,
      },
    })
    
    return NextResponse.json(artist)
  } catch (error) {
    console.error("Error updating artist:", error)
    return NextResponse.json({ error: "Failed to update artist" }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  
  try {
    await prisma.artist.delete({
      where: { id },
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting artist:", error)
    return NextResponse.json({ error: "Failed to delete artist" }, { status: 500 })
  }
}
