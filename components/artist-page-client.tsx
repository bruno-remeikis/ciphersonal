"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, BadgeCheck, Music, Pencil, PlusCircle, Trash2, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { SongCard } from "@/components/song-card"
import { Pagination } from "@/components/pagination"
import { Artist, Song, deleteArtist, swrKeys, recordLastSeen } from "@/lib/api"
import { mutate } from "swr"

const PAGE_SIZE = 8

type ArtistPageClientProps = {
  artist: Artist
  initialSongs: Song[]
}

export function ArtistPageClient({ artist, initialSongs }: ArtistPageClientProps) {
  const router = useRouter()
  const [page, setPage] = useState(1)
  const [deleting, setDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // Record last seen
  useEffect(() => {
    recordLastSeen(artist.id, "artist")
  }, [artist.id])

  async function handleDelete() {
    setDeleting(true)
    try {
      await deleteArtist(artist.id)
      await mutate(swrKeys.artists())
      router.push("/")
    } catch (error) {
      console.error("Error deleting artist:", error)
      setDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  const artistSongs = initialSongs
  const totalPages = Math.ceil(artistSongs.length / PAGE_SIZE)
  const pagedSongs = artistSongs.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-6 flex flex-col gap-6">
        {/* Back */}
        <Link href="/">
          <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground hover:text-foreground -ml-2">
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Button>
        </Link>

        {/* Artist Hero */}
        <div className="flex items-start gap-5 md:gap-8">
          <div className="relative shrink-0 w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden ring-4 ring-border shadow-lg bg-muted">
            {artist.avatarUrl ? (
              <Image
                src={artist.avatarUrl}
                alt={`Foto de ${artist.name}`}
                fill
                className="object-cover"
                sizes="128px"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-primary/10">
                <User className="w-12 h-12 text-primary/50" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0 pt-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl md:text-3xl font-bold text-foreground text-balance">{artist.name}</h1>
              {artist.verified && (
                <BadgeCheck className="w-6 h-6 text-primary shrink-0" aria-label="Artista verificado" />
              )}
            </div>
            <p className="text-muted-foreground mt-1">{artist.genre}</p>
            <div className="flex items-center gap-4 mt-3">
              <div className="flex items-center gap-1.5 text-primary">
                <Music className="w-4 h-4" />
                <span className="font-bold">{artist.songCount}</span>
                <span className="text-muted-foreground text-sm">cifras</span>
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              <Link href={`/novo?tipo=artista&edit=${artist.id}`}>
                <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                  <Pencil className="w-3.5 h-3.5" />
                  Editar
                </Button>
              </Link>
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-1.5 text-xs text-destructive hover:text-destructive border-destructive/30 hover:bg-destructive/5"
                onClick={() => setShowDeleteConfirm(true)}
              >
                <Trash2 className="w-3.5 h-3.5" />
                Excluir
              </Button>
            </div>
          </div>
        </div>

        {/* Songs */}
        <section aria-labelledby="artist-songs-heading">
          <div className="flex items-center justify-between mb-4">
            <h2 id="artist-songs-heading" className="text-base md:text-lg font-bold text-foreground flex items-center gap-2">
              <Music className="w-4 h-4 text-primary" />
              Músicas ({artistSongs.length})
            </h2>
            <Link href="/novo?tipo=musica">
              <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                <PlusCircle className="w-3.5 h-3.5" />
                Adicionar
              </Button>
            </Link>
          </div>

          {artistSongs.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              Nenhuma música cadastrada para este artista.
            </p>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {pagedSongs.map((song) => (
                  <SongCard key={song.id} song={song} />
                ))}
              </div>
              <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
            </>
          )}
        </section>
      </main>

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-card rounded-2xl border border-border shadow-2xl p-6">
            <h3 className="text-lg font-semibold text-foreground mb-2">Excluir artista</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Tem certeza que deseja excluir <strong>{artist.name}</strong>? Esta ação não pode ser desfeita.
            </p>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="flex-1" 
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
              >
                Cancelar
              </Button>
              <Button 
                variant="destructive" 
                className="flex-1"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? "Excluindo..." : "Excluir"}
              </Button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}
