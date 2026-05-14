import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export type Genre = {
  name: string
  songCount: number
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get("q")?.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") ?? ""

  try {
    const songs = await prisma.song.findMany({
      select: { genres: true },
    })

    // Extrair e contar gêneros únicos
    const genreCountMap = new Map<string, number>()
    songs.forEach((song) => {
      song.genres.forEach((genre) => {
        genreCountMap.set(genre, (genreCountMap.get(genre) || 0) + 1)
      })
    })

    // Converter para array e ordenar por nome
    let genres: Genre[] = Array.from(genreCountMap.entries())
      .map(([name, songCount]) => ({ name, songCount }))
      .sort((a, b) => a.name.localeCompare(b.name))

    // Filtrar por query se fornecida
    if (q) {
      genres = genres.filter((g) =>
        g.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(q)
      )
    }

    return NextResponse.json(genres)
  } catch (error) {
    console.error("Error fetching genres:", error)
    return NextResponse.json({ error: "Failed to fetch genres" }, { status: 500 })
  }
}
