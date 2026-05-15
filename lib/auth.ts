import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { cookies } from "next/headers"

const SESSION_COOKIE_NAME = "session_id"
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000 // 7 days

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export async function createSession(userId: string): Promise<string> {
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS)
  
  const session = await prisma.session.create({
    data: {
      userId,
      expiresAt,
    },
  })

  return session.id
}

export async function setSessionCookie(sessionId: string) {
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE_NAME, sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: new Date(Date.now() + SESSION_DURATION_MS),
    path: "/",
  })
}

export async function getSessionCookie(): Promise<string | undefined> {
  const cookieStore = await cookies()
  return cookieStore.get(SESSION_COOKIE_NAME)?.value
}

export async function deleteSessionCookie() {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE_NAME)
}

export async function getCurrentUser() {
  const sessionId = await getSessionCookie()
  
  if (!sessionId) {
    return null
  }

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
  })

  if (!session || session.expiresAt < new Date()) {
    await deleteSessionCookie()
    if (session) {
      await prisma.session.delete({ where: { id: sessionId } })
    }
    return null
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      email: true,
      name: true,
    },
  })

  return user
}

export async function login(email: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { email },
  })

  if (!user) {
    return { error: "Email ou senha inválidos" }
  }

  const isValidPassword = await verifyPassword(password, user.password)

  if (!isValidPassword) {
    return { error: "Email ou senha inválidos" }
  }

  const sessionId = await createSession(user.id)
  await setSessionCookie(sessionId)

  return { 
    user: { 
      id: user.id, 
      email: user.email, 
      name: user.name 
    } 
  }
}

export async function logout() {
  const sessionId = await getSessionCookie()
  
  if (sessionId) {
    try {
      await prisma.session.delete({ where: { id: sessionId } })
    } catch {
      // Session might not exist, ignore
    }
  }
  
  await deleteSessionCookie()
}
