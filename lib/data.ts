// Tipos principais - compatíveis com o schema do Prisma

// Cores pré-definidas para seções
export const SECTION_COLORS = [
  { id: "blue", name: "Azul", bg: "bg-blue-50 dark:bg-blue-950/30", border: "border-blue-200 dark:border-blue-800", text: "text-blue-900 dark:text-blue-100", badge: "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300", dot: "bg-blue-500" },
  { id: "amber", name: "Âmbar", bg: "bg-amber-50 dark:bg-amber-950/30", border: "border-amber-200 dark:border-amber-800", text: "text-amber-900 dark:text-amber-100", badge: "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300", dot: "bg-amber-500" },
  { id: "purple", name: "Roxo", bg: "bg-purple-50 dark:bg-purple-950/30", border: "border-purple-200 dark:border-purple-800", text: "text-purple-900 dark:text-purple-100", badge: "bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300", dot: "bg-purple-500" },
  { id: "emerald", name: "Esmeralda", bg: "bg-emerald-50 dark:bg-emerald-950/30", border: "border-emerald-200 dark:border-emerald-800", text: "text-emerald-900 dark:text-emerald-100", badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300", dot: "bg-emerald-500" },
  { id: "rose", name: "Rosa", bg: "bg-rose-50 dark:bg-rose-950/30", border: "border-rose-200 dark:border-rose-800", text: "text-rose-900 dark:text-rose-100", badge: "bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300", dot: "bg-rose-500" },
  { id: "slate", name: "Cinza", bg: "bg-slate-50 dark:bg-slate-950/30", border: "border-slate-200 dark:border-slate-800", text: "text-slate-900 dark:text-slate-100", badge: "bg-slate-100 text-slate-700 dark:bg-slate-900/50 dark:text-slate-300", dot: "bg-slate-500" },
  { id: "cyan", name: "Ciano", bg: "bg-cyan-50 dark:bg-cyan-950/30", border: "border-cyan-200 dark:border-cyan-800", text: "text-cyan-900 dark:text-cyan-100", badge: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/50 dark:text-cyan-300", dot: "bg-cyan-500" },
  { id: "orange", name: "Laranja", bg: "bg-orange-50 dark:bg-orange-950/30", border: "border-orange-200 dark:border-orange-800", text: "text-orange-900 dark:text-orange-100", badge: "bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300", dot: "bg-orange-500" },
] as const

export type SectionColorId = typeof SECTION_COLORS[number]["id"]

export function getSectionColorById(colorId?: string) {
  return SECTION_COLORS.find(c => c.id === colorId) || SECTION_COLORS[0]
}

// Estrutura do conteúdo lyrics2 (Letra com seções)
export type Lyrics2Section = {
  title: string
  content: string
  colorId?: SectionColorId // ID da cor (opcional, usa padrão baseado no índice se não definido)
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
