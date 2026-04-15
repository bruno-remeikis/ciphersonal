import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get("q")?.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") ?? ""

  try {
    const repertoires = await prisma.repertoire.findMany({
      orderBy: { createdAt: "desc" },
    })

    const filtered = q
      ? repertoires.filter(
          (r) =>
            r.title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(q) ||
            r.owner.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(q) ||
            r.description.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(q)
        )
      : repertoires

    return NextResponse.json(filtered)
  } catch (error) {
    console.error("Error fetching repertoires:", error)
    return NextResponse.json({ error: "Failed to fetch repertoires" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const repertoire = await prisma.repertoire.create({
      data: {
        title: body.title,
        owner: body.owner,
        songIds: body.songIds || [],
        description: body.description || "",
        coverUrl: body.coverUrl || "",
        isPublic: body.isPublic ?? true,
      },
    })
    
    return NextResponse.json(repertoire, { status: 201 })
  } catch (error) {
    console.error("Error creating repertoire:", error)
    return NextResponse.json({ error: "Failed to create repertoire" }, { status: 500 })
  }
}
