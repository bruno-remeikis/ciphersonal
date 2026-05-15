import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser, hashPassword, verifyPassword } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Senha atual é obrigatória"),
  newPassword: z.string().min(6, "A nova senha deve ter no mínimo 6 caracteres"),
  confirmPassword: z.string().min(1, "Confirmação de senha é obrigatória"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
})

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
    const validation = passwordSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      )
    }

    const { currentPassword, newPassword } = validation.data

    // Get user with password
    const userData = await prisma.user.findUnique({
      where: { id: user.id },
      select: { password: true },
    })

    if (!userData) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      )
    }

    // Verify current password
    const isValidPassword = await verifyPassword(currentPassword, userData.password)
    
    if (!isValidPassword) {
      return NextResponse.json(
        { error: "Senha atual incorreta" },
        { status: 400 }
      )
    }

    // Hash new password and update
    const hashedPassword = await hashPassword(newPassword)
    
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    })

    return NextResponse.json({ message: "Senha alterada com sucesso" })
  } catch (error) {
    console.error("Error changing password:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
