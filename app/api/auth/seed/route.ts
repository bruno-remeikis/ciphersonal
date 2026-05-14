import { NextResponse } from "next/server"
import { MongoClient } from "mongodb"
import bcrypt from "bcryptjs"

export async function POST() {
  const uri = process.env.DATABASE_URL

  if (!uri) {
    return NextResponse.json(
      { error: "DATABASE_URL não está configurada" },
      { status: 500 }
    )
  }

  const client = new MongoClient(uri)

  try {
    await client.connect()
    const db = client.db()
    const usersCollection = db.collection("users")

    // Check if test user already exists
    const existingUser = await usersCollection.findOne({ email: "teste@exemplo.com" })

    if (existingUser) {
      return NextResponse.json({
        message: "Usuário de teste já existe",
        email: "teste@exemplo.com",
        password: "senha123",
      })
    }

    // Create test user
    const hashedPassword = await bcrypt.hash("senha123", 12)

    await usersCollection.insertOne({
      email: "teste@exemplo.com",
      password: hashedPassword,
      name: "Usuário Teste",
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    return NextResponse.json({
      message: "Usuário de teste criado com sucesso!",
      email: "teste@exemplo.com",
      password: "senha123",
    })
  } catch (error) {
    console.error("Erro ao criar usuário:", error)
    return NextResponse.json(
      { error: "Erro ao criar usuário de teste", details: String(error) },
      { status: 500 }
    )
  } finally {
    await client.close()
  }
}
