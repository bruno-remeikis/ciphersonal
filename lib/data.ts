// Tipos principais - compatíveis com o schema do Prisma

// Estrutura do conteúdo lyrics2 (Letra com seções)
export type Lyrics2Section = {
  title: string
  content: string
}

export type Lyrics2OrderItem = {
  title: string
  expanded: boolean
  repetitions: number // Número de repetições (1 = uma vez, 2 = 2x, etc.)
}

export type Lyrics2Content = {
  sections: Lyrics2Section[]
  order: Lyrics2OrderItem[]
}

export type PageType = "lyrics" | "lyrics2" | "chords"

export type Page = {
  id: number
  type: PageType
  title: string
  content: string // Para lyrics e chords é string; para lyrics2 é JSON stringified de Lyrics2Content
  lyrics2Data?: Lyrics2Content // Campo dedicado para dados lyrics2 (usado internamente)
  isMain: boolean
}

// Helpers para lyrics2
export function parseLyrics2Content(content: string): Lyrics2Content | null {
  try {
    return JSON.parse(content) as Lyrics2Content
  } catch {
    return null
  }
}

export function stringifyLyrics2Content(content: Lyrics2Content): string {
  return JSON.stringify(content)
}

// Labels de exibição para tipos de página
export const pageTypeLabels: Record<PageType, string> = {
  lyrics: "Texto",
  lyrics2: "Letra",
  chords: "Acordes",
}

export type SongRepertoire = {
  id: string
  title: string
}

export type Song = {
  id: string
  title: string
  artists: string[]
  genres: string[]
  coverUrl: string
  pages: Page[]
  repertoires?: SongRepertoire[]
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
