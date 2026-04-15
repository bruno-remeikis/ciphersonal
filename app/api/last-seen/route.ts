import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export type LastSeenResolved = {
  id: string
  type: "song" | "artist" | "repertoire"
  label: string
  sublabel: string
  coverUrl: string
  href: string
}

export async function GET() {
  try {
    const lastSeenItems = await prisma.lastSeen.findMany({
      orderBy: { timestamp: "desc" },
      take: 10,
    })

    const resolved: LastSeenResolved[] = []

    for (const item of lastSeenItems) {
      try {
        if (item.type === "song") {
          const song = await prisma.song.findUnique({
            where: { id: item.itemId },
          })
          if (!song) continue
          resolved.push({
            id: item.itemId,
            type: "song",
            label: song.title,
            sublabel: song.artists[0],
            coverUrl: song.coverUrl,
            href: `/musicas/${song.id}`,
          })
        } else if (item.type === "artist") {
          const artist = await prisma.artist.findUnique({
            where: { id: item.itemId },
          })
          if (!artist) continue
          resolved.push({
            id: item.itemId,
            type: "artist",
            label: artist.name,
            sublabel: artist.genre,
            coverUrl: artist.avatarUrl,
            href: `/artistas/${artist.id}`,
          })
        } else if (item.type === "repertoire") {
          const rep = await prisma.repertoire.findUnique({
            where: { id: item.itemId },
          })
          if (!rep) continue
          resolved.push({
            id: item.itemId,
            type: "repertoire",
            label: rep.title,
            sublabel: `@${rep.owner}`,
            coverUrl: rep.coverUrl,
            href: `/repertorios/${rep.id}`,
          })
        }
      } catch {
        // Skip invalid items
        continue
      }
    }

    return NextResponse.json(resolved)
  } catch (error) {
    console.error("Error fetching last seen:", error)
    return NextResponse.json({ error: "Failed to fetch last seen" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { itemId, type } = body

    if (!itemId || !type) {
      return NextResponse.json({ error: "Missing itemId or type" }, { status: 400 })
    }

    // Check if there's already a record for this item
    const existing = await prisma.lastSeen.findFirst({
      where: { itemId, type },
    })

    if (existing) {
      // Update the timestamp
      await prisma.lastSeen.update({
        where: { id: existing.id },
        data: { timestamp: new Date() },
      })
    } else {
      // Create a new record
      await prisma.lastSeen.create({
        data: { itemId, type },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error recording last seen:", error)
    return NextResponse.json({ error: "Failed to record last seen" }, { status: 500 })
  }
}
