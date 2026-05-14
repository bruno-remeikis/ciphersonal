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

    // Busca as músicas do repertório e todos os repertórios
    const [songs, allRepertoires] = await Promise.all([
      repertoire.songIds.length > 0
        ? prisma.song.findMany({
            where: { id: { in: repertoire.songIds } },
          })
        : Promise.resolve([]),
      prisma.repertoire.findMany({
        select: { id: true, title: true, songIds: true },
      }),
    ])

    // Criar mapa de songId -> repertórios
    const songRepertoiresMap = new Map<string, { id: string; title: string }[]>()
    for (const rep of allRepertoires) {
      for (const songId of rep.songIds) {
        const existing = songRepertoiresMap.get(songId) || []
        existing.push({ id: rep.id, title: rep.title })
        songRepertoiresMap.set(songId, existing)
      }
    }

    // Adicionar repertórios a cada música
    const songsWithRepertoires = songs.map((song) => ({
      ...song,
      repertoires: songRepertoiresMap.get(song.id) || [],
    }))

    return NextResponse.json({
      repertoire,
      songs: songsWithRepertoires,
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
