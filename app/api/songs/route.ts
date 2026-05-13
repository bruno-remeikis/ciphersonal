import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get("q")?.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") ?? ""
  const genre = searchParams.get("genre") ?? ""

  try {
    const [songs, repertoires] = await Promise.all([
      prisma.song.findMany({
        orderBy: { createdAt: "desc" },
      }),
      prisma.repertoire.findMany({
        select: { id: true, title: true, songIds: true },
      }),
    ])

    // Mapear songId -> lista de repertórios
    const songRepertoiresMap = new Map<string, { id: string; title: string }[]>()
    for (const rep of repertoires) {
      for (const songId of rep.songIds) {
        const existing = songRepertoiresMap.get(songId) || []
        existing.push({ id: rep.id, title: rep.title })
        songRepertoiresMap.set(songId, existing)
      }
    }

    // Adicionar repertórios às músicas
    let enrichedSongs = songs.map((song) => ({
      ...song,
      repertoires: songRepertoiresMap.get(song.id) || [],
    }))

    // Filtrar por gênero se especificado
    if (genre) {
      enrichedSongs = enrichedSongs.filter((s) =>
        s.genres.some((g: string) => g.toLowerCase() === genre.toLowerCase())
      )
    }

    // Filtrar por query de pesquisa
    if (q) {
      enrichedSongs = enrichedSongs.filter(
        (s) =>
          s.title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(q) ||
          s.artists.some((a: string) =>
            a.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(q)
          ) ||
          s.genres.some((g: string) =>
            g.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(q)
          )
      )
    }

    return NextResponse.json(enrichedSongs)
  } catch (error) {
    console.error("Error fetching songs:", error)
    return NextResponse.json({ error: "Failed to fetch songs" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const song = await prisma.song.create({
      data: {
        title: body.title,
        artists: body.artists,
        genres: body.genres,
        coverUrl: body.coverUrl || "",
        pages: body.pages || [],
      },
    })
    
    return NextResponse.json(song, { status: 201 })
  } catch (error) {
    console.error("Error creating song:", error)
    return NextResponse.json({ error: "Failed to create song" }, { status: 500 })
  }
}
