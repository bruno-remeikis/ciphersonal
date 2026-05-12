"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import useSWR from "swr"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { SongCard } from "@/components/song-card"
import { fetchSongsByGenre, swrKeys } from "@/lib/api"
import type { Song } from "@/lib/api"
import { Search, X, Tag, Loader2, ArrowLeft, Music2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const PAGE_SIZE = 12

type GenrePageClientProps = {
  genreName: string
  initialQuery?: string
}

export function GenrePageClient({ genreName, initialQuery = "" }: GenrePageClientProps) {
  const [query, setQuery] = useState(initialQuery)
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery)
  const [displayCount, setDisplayCount] = useState(PAGE_SIZE)
  const loadMoreRef = useRef<HTMLDivElement>(null)

  // Debounce query
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300)
    return () => clearTimeout(timer)
  }, [query])

  // Fetch songs by genre
  const { data: songs, isLoading } = useSWR(
    swrKeys.songsByGenre(genreName, debouncedQuery),
    () => fetchSongsByGenre(genreName, debouncedQuery)
  )

  const filteredSongs: Song[] = songs ?? []
  const displayedSongs = filteredSongs.slice(0, displayCount)
  const hasMore = displayCount < filteredSongs.length

  // Reset display count when query changes
  useEffect(() => {
    setDisplayCount(PAGE_SIZE)
  }, [debouncedQuery])

  // Infinite scroll
  const loadMore = useCallback(() => {
    if (hasMore && !isLoading) {
      setDisplayCount((prev) => prev + PAGE_SIZE)
    }
  }, [hasMore, isLoading])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore()
        }
      },
      { threshold: 0.1 }
    )

    const currentRef = loadMoreRef.current
    if (currentRef) {
      observer.observe(currentRef)
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef)
      }
    }
  }, [loadMore])

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6 flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/generos">
              <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground hover:text-foreground -ml-2">
                <ArrowLeft className="w-4 h-4" />
                Gêneros
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 text-primary">
                <Tag className="w-5 h-5" />
              </span>
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-foreground">{genreName}</h1>
                <p className="text-sm text-muted-foreground">
                  {filteredSongs.length} {filteredSongs.length === 1 ? "música" : "músicas"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar músicas neste gênero..."
            className="w-full h-10 pl-9 pr-9 rounded-lg bg-card text-foreground placeholder:text-muted-foreground text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="py-12 flex items-center justify-center gap-3 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm">Carregando...</span>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && filteredSongs.length === 0 && (
          <div className="py-12 flex flex-col items-center gap-3 text-center">
            <Music2 className="w-12 h-12 text-muted-foreground" />
            <h2 className="text-lg font-semibold text-foreground">Nenhuma música encontrada</h2>
            <p className="text-sm text-muted-foreground max-w-sm">
              Não há músicas cadastradas neste gênero{query ? " com este termo de busca" : ""}.
            </p>
          </div>
        )}

        {/* Songs grid */}
        {!isLoading && filteredSongs.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {displayedSongs.map((song) => (
              <SongCard key={song.id} song={song} />
            ))}
          </div>
        )}

        {/* Load more trigger */}
        {hasMore && (
          <div ref={loadMoreRef} className="py-8 flex items-center justify-center">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        )}

        {/* End message */}
        {!hasMore && filteredSongs.length > 0 && (
          <p className="py-4 text-center text-sm text-muted-foreground">
            Mostrando todas as {filteredSongs.length} músicas
          </p>
        )}
      </main>

      <Footer />
    </div>
  )
}
