"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import {
  ArrowLeft, Globe, Lock, Pencil, Trash2,
  GripVertical, PlusCircle, X, Check, Music
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Repertoire, Song, updateRepertoire, deleteRepertoire, recordLastSeen } from "@/lib/api"
import useSWR, { mutate } from "swr"
import { fetchSongs, swrKeys } from "@/lib/api"

type RepertoirePageClientProps = {
  repertoire: Repertoire
  initialSongs: Song[]
}

export function RepertoirePageClient({ repertoire: initial, initialSongs }: RepertoirePageClientProps) {
  const router = useRouter()
  const [songIds, setSongIds] = useState<string[]>(initial.songIds)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [deleting, setDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [saving, setSaving] = useState(false)

  // Record last seen
  useEffect(() => {
    recordLastSeen(initial.id, "repertoire")
  }, [initial.id])

  // Fetch all songs for the "add" dialog
  const { data: allSongs = [] } = useSWR(swrKeys.songs(), () => fetchSongs())

  // Map current order using initialSongs as base, then allSongs as fallback
  const allSongsMap = new Map<string, Song>(
    [...initialSongs, ...allSongs].map((s) => [s.id, s])
  )
  const currentSongs: Song[] = songIds
    .map((id) => allSongsMap.get(id))
    .filter((s): s is Song => s !== undefined)

  // Songs not yet in repertoire
  const availableSongs = allSongs.filter((s) => !songIds.includes(s.id))
  const filteredAvailable = searchQuery.trim()
    ? availableSongs.filter((s) =>
        s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.artists.some((a) => a.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : availableSongs

  // Persist song changes to database
  async function persistSongIds(newIds: string[]) {
    setSaving(true)
    try {
      await updateRepertoire(initial.id, { songIds: newIds })
      await mutate(swrKeys.repertoireDetail(initial.id))
    } catch (error) {
      console.error("Error saving repertoire:", error)
    } finally {
      setSaving(false)
    }
  }

  function moveUp(index: number) {
    if (index === 0) return
    const newIds = [...songIds]
    ;[newIds[index - 1], newIds[index]] = [newIds[index], newIds[index - 1]]
    setSongIds(newIds)
    persistSongIds(newIds)
  }

  function moveDown(index: number) {
    if (index === songIds.length - 1) return
    const newIds = [...songIds]
    ;[newIds[index], newIds[index + 1]] = [newIds[index + 1], newIds[index]]
    setSongIds(newIds)
    persistSongIds(newIds)
  }

  function removeSong(songId: string) {
    const newIds = songIds.filter((id) => id !== songId)
    setSongIds(newIds)
    persistSongIds(newIds)
  }

  function addSong(songId: string) {
    const newIds = [...songIds, songId]
    setSongIds(newIds)
    persistSongIds(newIds)
  }

  async function handleDeleteRepertoire() {
    setDeleting(true)
    try {
      await deleteRepertoire(initial.id)
      await mutate(swrKeys.repertoires())
      router.push("/")
    } catch (error) {
      console.error("Error deleting repertoire:", error)
      setDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

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

        {/* Hero */}
        <div className="flex items-start gap-4 md:gap-6">
          <div className="relative shrink-0 w-20 h-20 md:w-28 md:h-28 rounded-xl overflow-hidden shadow-md bg-muted">
            {initial.coverUrl ? (
              <Image
                src={initial.coverUrl}
                alt={`Capa de ${initial.title}`}
                fill
                className="object-cover"
                sizes="112px"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-primary/10">
                <Music className="w-10 h-10 text-primary/50" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0 pt-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl md:text-3xl font-bold text-foreground text-balance">{initial.title}</h1>
              <span className={`flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                initial.isPublic ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                                 : "bg-secondary text-secondary-foreground"
              }`}>
                {initial.isPublic ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                {initial.isPublic ? "Público" : "Privado"}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-1 leading-relaxed line-clamp-2">{initial.description}</p>
            <p className="text-xs text-muted-foreground mt-1">
              por <span className="text-primary font-medium">@{initial.owner}</span>
            </p>
            <div className="flex gap-2 mt-3">
              <Link href={`/novo?tipo=repertorio&edit=${initial.id}`}>
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

        {/* Songs list */}
        <section aria-labelledby="rep-songs-heading">
          <div className="flex items-center justify-between mb-4">
            <h2 id="rep-songs-heading" className="text-base md:text-lg font-bold text-foreground flex items-center gap-2">
              <Music className="w-4 h-4 text-primary" />
              Músicas ({songIds.length})
            </h2>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs"
              onClick={() => setShowAddDialog(true)}
            >
              <PlusCircle className="w-3.5 h-3.5" />
              Adicionar música
            </Button>
          </div>

          {songIds.length === 0 ? (
            <div className="py-12 flex flex-col items-center gap-3 text-center">
              <Music className="w-10 h-10 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">
                Este repertório ainda não tem músicas.
              </p>
              <Button variant="outline" size="sm" onClick={() => setShowAddDialog(true)}>
                <PlusCircle className="w-4 h-4 mr-1.5" />
                Adicionar a primeira música
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {currentSongs.map((song, index) => (
                <SongRepertoireRow
                  key={song.id}
                  song={song}
                  index={index}
                  total={currentSongs.length}
                  repertoireId={initial.id}
                  onMoveUp={() => moveUp(index)}
                  onMoveDown={() => moveDown(index)}
                  onRemove={() => removeSong(song.id)}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Add song dialog */}
      {showAddDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md bg-card rounded-2xl border border-border shadow-2xl flex flex-col max-h-[80vh]">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
              <h3 className="font-semibold text-foreground">Adicionar música</h3>
              <Button variant="ghost" size="icon" className="w-8 h-8" onClick={() => { setShowAddDialog(false); setSearchQuery("") }}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="px-4 py-3 shrink-0">
              <input
                type="text"
                placeholder="Buscar músicas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="w-full h-9 px-3 rounded-md border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
            <div className="overflow-y-auto flex-1 px-4 pb-4">
              {filteredAvailable.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  {availableSongs.length === 0 ? "Todas as músicas já estão no repertório." : "Nenhuma música encontrada."}
                </p>
              ) : (
                <div className="flex flex-col gap-2">
                  {filteredAvailable.map((song) => (
                    <div
                      key={song.id}
                      className="flex items-center gap-3 p-2.5 rounded-lg border border-border hover:border-primary/40 hover:bg-primary/5 transition-all"
                    >
                      <div className="relative shrink-0 w-10 h-10 rounded-md overflow-hidden bg-muted">
                        <Image src={song.coverUrl} alt="" fill className="object-cover" sizes="40px" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{song.title}</p>
                        <p className="text-xs text-muted-foreground truncate">{song.artists[0]}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="shrink-0 gap-1 text-xs"
                        onClick={() => addSong(song.id)}
                      >
                        <Check className="w-3.5 h-3.5" />
                        Adicionar
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-card rounded-2xl border border-border shadow-2xl p-6">
            <h3 className="text-lg font-semibold text-foreground mb-2">Excluir repertório</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Tem certeza que deseja excluir <strong>{initial.title}</strong>? Esta ação não pode ser desfeita.
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
                onClick={handleDeleteRepertoire}
                disabled={deleting}
              >
                {deleting ? "Excluindo..." : "Excluir"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Saving indicator */}
      {saving && (
        <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg shadow-lg">
          <span className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          <span className="text-sm text-foreground">Salvando...</span>
        </div>
      )}

      <Footer />
    </div>
  )
}

function SongRepertoireRow({
  song,
  index,
  total,
  repertoireId,
  onMoveUp,
  onMoveDown,
  onRemove,
}: {
  song: Song
  index: number
  total: number
  repertoireId: string
  onMoveUp: () => void
  onMoveDown: () => void
  onRemove: () => void
}) {
  return (
    <div className="flex items-center gap-2 p-3 rounded-xl bg-card border border-border hover:border-primary/30 transition-colors group">
      {/* Position */}
      <span className="shrink-0 w-5 text-center text-xs font-bold text-muted-foreground select-none">
        {index + 1}
      </span>

      {/* Cover */}
      <Link href={`/musicas/${song.id}?from=repertoire&repertoireId=${repertoireId}`} className="shrink-0">
        <div className="relative w-11 h-11 rounded-lg overflow-hidden bg-muted">
          <Image src={song.coverUrl} alt={`Capa de ${song.title}`} fill className="object-cover" sizes="44px" />
        </div>
      </Link>

      {/* Info */}
      <Link href={`/musicas/${song.id}?from=repertoire&repertoireId=${repertoireId}`} className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
          {song.title}
        </p>
        <p className="text-xs text-muted-foreground truncate">{song.artists[0]}</p>
      </Link>

      {/* Reorder + remove */}
      <div className="flex items-center gap-0.5 shrink-0">
        <Button
          variant="ghost"
          size="icon"
          className="w-7 h-7 text-muted-foreground hover:text-foreground"
          onClick={onMoveUp}
          disabled={index === 0}
          aria-label="Mover para cima"
        >
          <ChevronUp className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="w-7 h-7 text-muted-foreground hover:text-foreground"
          onClick={onMoveDown}
          disabled={index === total - 1}
          aria-label="Mover para baixo"
        >
          <ChevronDown className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="w-7 h-7 text-muted-foreground hover:text-destructive"
          onClick={onRemove}
          aria-label="Remover do repertório"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
