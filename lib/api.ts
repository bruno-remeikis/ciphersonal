import type { Song, Artist, Repertoire, Page } from "@/lib/data"

export type { Song, Artist, Repertoire, Page }

export type LastSeenResolved = {
  id: string
  type: "song" | "artist" | "repertoire"
  label: string
  sublabel: string
  coverUrl: string
  href: string
}

export type ArtistDetailResponse = {
  artist: Artist
  songs: Song[]
}

export type RepertoireDetailResponse = {
  repertoire: Repertoire
  songs: Song[]
}

const BASE = typeof window === "undefined" ? process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000" : ""

async function apiFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, { cache: "no-store" })
  if (!res.ok) throw new Error(`API error ${res.status} for ${path}`)
  return res.json() as Promise<T>
}

// Songs
export function fetchSongs(query?: string): Promise<Song[]> {
  const qs = query ? `?q=${encodeURIComponent(query)}` : ""
  return apiFetch<Song[]>(`/api/songs${qs}`)
}

export function fetchSong(id: string): Promise<Song> {
  return apiFetch<Song>(`/api/songs/${id}`)
}

// Artists
export function fetchArtists(query?: string): Promise<Artist[]> {
  const qs = query ? `?q=${encodeURIComponent(query)}` : ""
  return apiFetch<Artist[]>(`/api/artists${qs}`)
}

export function fetchArtistDetail(id: string): Promise<ArtistDetailResponse> {
  return apiFetch<ArtistDetailResponse>(`/api/artists/${id}`)
}

// Repertoires
export function fetchRepertoires(query?: string): Promise<Repertoire[]> {
  const qs = query ? `?q=${encodeURIComponent(query)}` : ""
  return apiFetch<Repertoire[]>(`/api/repertoires${qs}`)
}

export function fetchRepertoireDetail(id: string): Promise<RepertoireDetailResponse> {
  return apiFetch<RepertoireDetailResponse>(`/api/repertoires/${id}`)
}

// Last seen
export function fetchLastSeen(): Promise<LastSeenResolved[]> {
  return apiFetch<LastSeenResolved[]>(`/api/last-seen`)
}

export async function recordLastSeen(itemId: string, type: "song" | "artist" | "repertoire"): Promise<void> {
  await fetch(`${BASE}/api/last-seen`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ itemId, type }),
  })
}

// Create functions
export async function createSong(data: {
  title: string
  artists: string[]
  genres: string[]
  coverUrl?: string
}): Promise<Song> {
  const res = await fetch(`${BASE}/api/songs`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error(`Failed to create song: ${res.status}`)
  return res.json()
}

export async function createArtist(data: {
  name: string
  genre: string
  avatarUrl?: string
  verified?: boolean
}): Promise<Artist> {
  const res = await fetch(`${BASE}/api/artists`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error(`Failed to create artist: ${res.status}`)
  return res.json()
}

export async function createRepertoire(data: {
  title: string
  owner: string
  description: string
  isPublic?: boolean
  coverUrl?: string
}): Promise<Repertoire> {
  const res = await fetch(`${BASE}/api/repertoires`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error(`Failed to create repertoire: ${res.status}`)
  return res.json()
}

// Update functions
export async function updateSong(id: string, data: {
  title?: string
  artists?: string[]
  genres?: string[]
  coverUrl?: string
  pages?: Page[]
}): Promise<Song> {
  const res = await fetch(`${BASE}/api/songs/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error(`Failed to update song: ${res.status}`)
  return res.json()
}

export async function updateArtist(id: string, data: {
  name?: string
  genre?: string
  songCount?: number
  avatarUrl?: string
  verified?: boolean
}): Promise<Artist> {
  const res = await fetch(`${BASE}/api/artists/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error(`Failed to update artist: ${res.status}`)
  return res.json()
}

export async function updateRepertoire(id: string, data: {
  title?: string
  owner?: string
  songIds?: string[]
  description?: string
  coverUrl?: string
  isPublic?: boolean
}): Promise<Repertoire> {
  const res = await fetch(`${BASE}/api/repertoires/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error(`Failed to update repertoire: ${res.status}`)
  return res.json()
}

// Delete functions
export async function deleteSong(id: string): Promise<void> {
  const res = await fetch(`${BASE}/api/songs/${id}`, {
    method: "DELETE",
  })
  if (!res.ok) throw new Error(`Failed to delete song: ${res.status}`)
}

export async function deleteArtist(id: string): Promise<void> {
  const res = await fetch(`${BASE}/api/artists/${id}`, {
    method: "DELETE",
  })
  if (!res.ok) throw new Error(`Failed to delete artist: ${res.status}`)
}

export async function deleteRepertoire(id: string): Promise<void> {
  const res = await fetch(`${BASE}/api/repertoires/${id}`, {
    method: "DELETE",
  })
  if (!res.ok) throw new Error(`Failed to delete repertoire: ${res.status}`)
}

// SWR keys
export const swrKeys = {
  songs: (q?: string) => ["/api/songs", q] as const,
  artists: (q?: string) => ["/api/artists", q] as const,
  repertoires: (q?: string) => ["/api/repertoires", q] as const,
  lastSeen: ["/api/last-seen"] as const,
  song: (id: string) => [`/api/songs/${id}`] as const,
  artistDetail: (id: string) => [`/api/artists/${id}`] as const,
  repertoireDetail: (id: string) => [`/api/repertoires/${id}`] as const,
}
