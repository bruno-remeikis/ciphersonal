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

    // Busca músicas que contenham o nome do artista e todos os repertórios
    const [songs, repertoires] = await Promise.all([
      prisma.song.findMany(),
      prisma.repertoire.findMany({
        select: { id: true, title: true, songIds: true },
      }),
    ])

    // Criar mapa de songId -> repertórios
    const songRepertoiresMap = new Map<string, { id: string; title: string }[]>()
    for (const rep of repertoires) {
      for (const songId of rep.songIds) {
        const existing = songRepertoiresMap.get(songId) || []
        existing.push({ id: rep.id, title: rep.title })
        songRepertoiresMap.set(songId, existing)
      }
    }

    const artistSongs = songs
      .filter((s) =>
        s.artists.some((name: string) =>
          name.toLowerCase().includes(artist.name.toLowerCase())
        )
      )
      .map((song) => ({
        ...song,
        repertoires: songRepertoiresMap.get(song.id) || [],
      }))

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
