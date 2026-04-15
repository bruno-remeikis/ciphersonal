"use client"

import { useState } from "react"
import useSWR from "swr"
import { SongCard } from "@/components/song-card"
import { ArtistCard } from "@/components/artist-card"
import { RepertoireCard } from "@/components/repertoire-card"
import { Pagination } from "@/components/pagination"
import { fetchSongs, fetchArtists, fetchRepertoires, swrKeys } from "@/lib/api"
import type { Song, Artist, Repertoire } from "@/lib/api"
import { FilterType } from "@/components/search-bar"
import { Music2, Users, ListMusic, SearchX, PlusCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const PAGE_SIZE = 6

type ResultsSectionProps = {
  query: string
  filter: FilterType
}

export function ResultsSection({ query, filter }: ResultsSectionProps) {
  const [songPage, setSongPage] = useState(1)
  const [artistPage, setArtistPage] = useState(1)
  const [repertoirePage, setRepertoirePage] = useState(1)

  const showSongs = filter === "todos" || filter === "musicas"
  const showArtists = filter === "todos" || filter === "artistas"
  const showRepertoires = filter === "todos" || filter === "repertorios"

  const { data: songs, isLoading: loadingSongs } = useSWR(
    showSongs ? swrKeys.songs(query) : null,
    () => fetchSongs(query)
  )

  const { data: artists, isLoading: loadingArtists } = useSWR(
    showArtists ? swrKeys.artists(query) : null,
    () => fetchArtists(query)
  )

  const { data: repertoires, isLoading: loadingRepertoires } = useSWR(
    showRepertoires ? swrKeys.repertoires(query) : null,
    () => fetchRepertoires(query)
  )

  const isLoading =
    (showSongs && loadingSongs) ||
    (showArtists && loadingArtists) ||
    (showRepertoires && loadingRepertoires)

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 flex items-center justify-center gap-3 text-muted-foreground">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span className="text-sm">Carregando...</span>
      </div>
    )
  }

  const filteredSongs: Song[] = songs ?? []
  const filteredArtists: Artist[] = artists ?? []
  const filteredRepertoires: Repertoire[] = repertoires ?? []

  const hasResults =
    (showSongs && filteredSongs.length > 0) ||
    (showArtists && filteredArtists.length > 0) ||
    (showRepertoires && filteredRepertoires.length > 0)

  // Paginação
  const pagedSongs = filteredSongs.slice((songPage - 1) * PAGE_SIZE, songPage * PAGE_SIZE)
  const pagedArtists = filteredArtists.slice((artistPage - 1) * PAGE_SIZE, artistPage * PAGE_SIZE)
  const pagedRepertoires = filteredRepertoires.slice((repertoirePage - 1) * PAGE_SIZE, repertoirePage * PAGE_SIZE)

  const songTotalPages = Math.ceil(filteredSongs.length / PAGE_SIZE)
  const artistTotalPages = Math.ceil(filteredArtists.length / PAGE_SIZE)
  const repertoireTotalPages = Math.ceil(filteredRepertoires.length / PAGE_SIZE)

  if (!hasResults) {
    return (
      <section className="max-w-7xl mx-auto px-4 py-16 flex flex-col items-center gap-4 text-center" aria-live="polite">
        <SearchX className="w-12 h-12 text-muted-foreground" />
        <h2 className="text-lg font-semibold text-foreground">Nenhum resultado encontrado</h2>
        <p className="text-sm text-muted-foreground max-w-sm text-pretty">
          Tente buscar por outro nome, artista ou gênero musical.
        </p>
      </section>
    )
  }

  return (
    <main className="max-w-7xl mx-auto px-4 py-8 flex flex-col gap-10" aria-live="polite">
      {/* Músicas */}
      {showSongs && filteredSongs.length > 0 && (
        <section aria-labelledby="songs-heading">
          <SectionHeader
            icon={<Music2 className="w-5 h-5" />}
            title="Músicas"
            count={filteredSongs.length}
            addHref="/novo?tipo=musica"
          />
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
            {pagedSongs.map((song) => (
              <SongCard key={song.id} song={song} />
            ))}
          </div>
          <Pagination
            currentPage={songPage}
            totalPages={songTotalPages}
            onPageChange={(p) => setSongPage(p)}
          />
        </section>
      )}

      {/* Artistas */}
      {showArtists && filteredArtists.length > 0 && (
        <section aria-labelledby="artists-heading">
          <SectionHeader
            icon={<Users className="w-5 h-5" />}
            title="Artistas"
            count={filteredArtists.length}
            addHref="/novo?tipo=artista"
          />
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {pagedArtists.map((artist) => (
              <ArtistCard key={artist.id} artist={artist} />
            ))}
          </div>
          <Pagination
            currentPage={artistPage}
            totalPages={artistTotalPages}
            onPageChange={(p) => setArtistPage(p)}
          />
        </section>
      )}

      {/* Repertórios */}
      {showRepertoires && filteredRepertoires.length > 0 && (
        <section aria-labelledby="repertoires-heading">
          <SectionHeader
            icon={<ListMusic className="w-5 h-5" />}
            title="Repertórios"
            count={filteredRepertoires.length}
            addHref="/novo?tipo=repertorio"
          />
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {pagedRepertoires.map((rep) => (
              <RepertoireCard key={rep.id} repertoire={rep} />
            ))}
          </div>
          <Pagination
            currentPage={repertoirePage}
            totalPages={repertoireTotalPages}
            onPageChange={(p) => setRepertoirePage(p)}
          />
        </section>
      )}
    </main>
  )
}

function SectionHeader({
  icon,
  title,
  count,
  addHref,
}: {
  icon: React.ReactNode
  title: string
  count: number
  addHref: string
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary">
          {icon}
        </span>
        <h2 id={`${title.toLowerCase()}-heading`} className="text-base md:text-lg font-bold text-foreground">
          {title}
        </h2>
        <span className="text-sm text-muted-foreground font-medium">
          {count} {count === 1 ? "resultado" : "resultados"}
        </span>
      </div>
      <Link href={addHref}>
        <Button variant="outline" size="sm" className="gap-1.5 text-foreground border-border text-xs">
          <PlusCircle className="w-3.5 h-3.5" />
          Adicionar
        </Button>
      </Link>
    </div>
  )
}
