import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { DEFAULT_SETTINGS } from "@/lib/settings"
import { z } from "zod"

const settingsSchema = z.object({
  showRepertoiresInSongCard: z.boolean().optional(),
  sheetFontSize: z.number().min(10).max(32).optional(),
})

export async function GET() {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      )
    }

    const userData = await prisma.user.findUnique({
      where: { id: user.id },
      select: { settings: true },
    })

    return NextResponse.json({ 
      settings: userData?.settings || DEFAULT_SETTINGS 
    })
  } catch (error) {
    console.error("Error fetching settings:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validation = settingsSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      )
    }

    // Get current settings
    const userData = await prisma.user.findUnique({
      where: { id: user.id },
      select: { settings: true },
    })

    const currentSettings = userData?.settings || DEFAULT_SETTINGS

    // Merge with new settings
    const updatedSettings = {
      showRepertoiresInSongCard: validation.data.showRepertoiresInSongCard ?? currentSettings.showRepertoiresInSongCard,
      sheetFontSize: validation.data.sheetFontSize ?? currentSettings.sheetFontSize,
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { settings: updatedSettings },
    })

    return NextResponse.json({ settings: updatedSettings })
  } catch (error) {
    console.error("Error updating settings:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
