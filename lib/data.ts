// Tipos principais - compatíveis com o schema do Prisma
export type Page = {
  id: number
  type: "lyrics" | "chords"
  title: string
  content: string
  isMain: boolean
}

export type Song = {
  id: string
  title: string
  artists: string[]
  genres: string[]
  coverUrl: string
  pages: Page[]
  createdAt?: Date
  updatedAt?: Date
}

export type Artist = {
  id: string
  name: string
  genre: string
  songCount: number
  avatarUrl: string
  verified: boolean
  createdAt?: Date
  updatedAt?: Date
}

export type Repertoire = {
  id: string
  title: string
  owner: string
  songIds: string[]
  description: string
  coverUrl: string
  isPublic: boolean
  createdAt?: Date
  updatedAt?: Date
}

export type LastSeenItem = {
  id: string
  itemId: string
  type: "song" | "artist" | "repertoire"
  timestamp: Date
}

// Helpers
export function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`
  return n.toString()
}
