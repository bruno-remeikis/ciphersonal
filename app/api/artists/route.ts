import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get("q")?.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") ?? ""

  try {
    const artists = await prisma.artist.findMany({
      orderBy: { name: "asc" },
    })

    const filtered = q
      ? artists.filter(
        (a) =>
          a.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(q) ||
          a.genre.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(q)
      )
      : artists

    return NextResponse.json(filtered)
  } catch (error) {
    console.error("Error fetching artists:", error)
    return NextResponse.json({ error: "Failed to fetch artists" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const artist = await prisma.artist.create({
      data: {
        name: body.name,
        genre: body.genre,
        songCount: body.songCount || 0,
        avatarUrl: body.avatarUrl || "",
        verified: body.verified || false,
      },
    })

    return NextResponse.json(artist, { status: 201 })
  } catch (error) {
    console.error("Error creating artist:", error)
    return NextResponse.json({ error: "Failed to create artist" }, { status: 500 })
  }
}
