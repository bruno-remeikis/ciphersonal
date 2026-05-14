const { MongoClient } = require("mongodb")
const bcrypt = require("bcryptjs")

async function seedUsers() {
  const uri = process.env.DATABASE_URL
  if (!uri) {
    console.error("DATABASE_URL não definida")
    process.exit(1)
  }

  const client = new MongoClient(uri)

  try {
    await client.connect()
    console.log("Conectado ao MongoDB")

    const db = client.db()
    const usersCollection = db.collection("users")

    // Check if test user already exists
    const existingUser = await usersCollection.findOne({ email: "teste@exemplo.com" })
    
    if (existingUser) {
      console.log("Usuário de teste já existe")
      return
    }

    // Create test user with hashed password
    const hashedPassword = await bcrypt.hash("senha123", 12)
    
    const testUser = {
      email: "teste@exemplo.com",
      password: hashedPassword,
      name: "Usuário Teste",
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    await usersCollection.insertOne(testUser)
    console.log("Usuário de teste criado com sucesso!")
    console.log("Email: teste@exemplo.com")
    console.log("Senha: senha123")
  } catch (error) {
    console.error("Erro ao criar usuário:", error)
  } finally {
    await client.close()
    console.log("Conexão fechada")
  }
}

seedUsers()
