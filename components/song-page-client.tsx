"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import {
  ChevronLeft, ChevronRight, Music2, ListMusic, Plus, Pencil, Trash2,
  Star, FileText, Guitar, MoreVertical, Check, X, ArrowLeft
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import useSWR, { mutate } from "swr"
import { fetchSongs, fetchRepertoires, swrKeys, updateSong, deleteSong, recordLastSeen } from "@/lib/api"
import {
  Song, Page, Repertoire,
} from "@/lib/api"
import { cn } from "@/lib/utils"

type SongPageClientProps = {
  song: Song
  fromRepertoire?: string
}

export function SongPageClient({ song: initialSong, fromRepertoire }: SongPageClientProps) {
  const router = useRouter()

  // Estado local do song (para CRUD de pages)
  const [song, setSong] = useState<Song>(initialSong)
  const [activePageId, setActivePageId] = useState<number | null>(null)
  const [editingPage, setEditingPage] = useState<Page | null>(null)
  const [isAddingPage, setIsAddingPage] = useState(false)
  const [newPage, setNewPage] = useState<Omit<Page, "id">>({
    type: "lyrics",
    title: "",
    content: "",
    isMain: false,
  })
  const [deleting, setDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [saving, setSaving] = useState(false)

  // Record last seen
  useEffect(() => {
    recordLastSeen(song.id, "song")
  }, [song.id])

  // Fetch all songs and repertoires for navigation context
  const { data: allSongs = [] } = useSWR(swrKeys.songs(), () => fetchSongs())
  const { data: allRepertoires = [] } = useSWR(swrKeys.repertoires(), () => fetchRepertoires())

  // Repertórios que contém essa música
  const songRepertoires: Repertoire[] = allRepertoires.filter((r) => r.songIds.includes(song.id))

  // Navegação anterior/próxima
  const navContext: Repertoire | null = fromRepertoire
    ? (allRepertoires.find((r) => r.id === fromRepertoire) ?? null)
    : null

  const songMap = new Map(allSongs.map((s) => [s.id, s]))
  const contextSongs: Song[] = navContext
    ? navContext.songIds.map((id) => songMap.get(id)).filter((s): s is Song => s !== undefined)
    : allSongs.filter((s) => s.artists.some((a) => song.artists.includes(a)))

  const currentIndex = contextSongs.findIndex((s) => s.id === song.id)
  const prevSong = currentIndex > 0 ? contextSongs[currentIndex - 1] : null
  const nextSong = currentIndex !== -1 && currentIndex < contextSongs.length - 1 ? contextSongs[currentIndex + 1] : null

  // Páginas principal de letra e acordes
  const mainLyrics = song.pages.find((p) => p.type === "lyrics" && p.isMain)
  const mainChords = song.pages.find((p) => p.type === "chords" && p.isMain)

  const activePage = activePageId != null ? song.pages.find((p) => p.id === activePageId) : null

  // Helper para persistir alterações de páginas
  async function persistPages(newPages: Page[]) {
    setSaving(true)
    try {
      await updateSong(song.id, { pages: newPages })
      await mutate(swrKeys.song(song.id))
    } catch (error) {
      console.error("Error saving pages:", error)
    } finally {
      setSaving(false)
    }
  }

  // Helpers CRUD
  async function handleDeletePage(pageId: number) {
    const newPages = song.pages.filter((p) => p.id !== pageId)
    setSong((prev) => ({ ...prev, pages: newPages }))
    if (activePageId === pageId) setActivePageId(null)
    await persistPages(newPages)
  }

  async function handleSaveEdit() {
    if (!editingPage) return
    const newPages = song.pages.map((p) => (p.id === editingPage.id ? editingPage : p))
    setSong((prev) => ({ ...prev, pages: newPages }))
    setEditingPage(null)
    await persistPages(newPages)
  }

  async function handleSetMain(pageId: number, type: "lyrics" | "chords") {
    const newPages = song.pages.map((p) =>
      p.type === type ? { ...p, isMain: p.id === pageId } : p
    )
    setSong((prev) => ({ ...prev, pages: newPages }))
    await persistPages(newPages)
  }

  async function handleAddPage() {
    const id = Math.max(0, ...song.pages.map((p) => p.id)) + 1
    const added: Page = { ...newPage, id }
    const newPages = [...song.pages, added]
    setSong((prev) => ({ ...prev, pages: newPages }))
    setNewPage({ type: "lyrics", title: "", content: "", isMain: false })
    setIsAddingPage(false)
    await persistPages(newPages)
  }

  async function handleDeleteSong() {
    setDeleting(true)
    try {
      await deleteSong(song.id)
      await mutate(swrKeys.songs())
      router.push("/")
    } catch (error) {
      console.error("Error deleting song:", error)
      setDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  const navHref = (s: typeof prevSong) => {
    if (!s) return "#"
    return fromRepertoire
      ? `/musicas/${s.id}?from=repertoire&repertoireId=${fromRepertoire}`
      : `/musicas/${s.id}`
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-6 flex flex-col gap-6">
        {/* Back + navigation arrows */}
        <div className="flex items-center justify-between">
          <Link href={fromRepertoire ? `/repertorios/${fromRepertoire}` : "/"}>
            <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground hover:text-foreground -ml-2">
              <ArrowLeft className="w-4 h-4" />
              {fromRepertoire ? "Voltar ao repertório" : "Voltar"}
            </Button>
          </Link>

          <div className="flex items-center gap-1">
            <Link href={navHref(prevSong)}>
              <Button
                variant="outline"
                size="icon"
                className="w-8 h-8"
                disabled={!prevSong}
                aria-label="Música anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
            </Link>
            <Link href={navHref(nextSong)}>
              <Button
                variant="outline"
                size="icon"
                className="w-8 h-8"
                disabled={!nextSong}
                aria-label="Próxima música"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Song Hero */}
        <div className="flex items-start gap-4 md:gap-6">
          <div className="relative shrink-0 w-20 h-20 md:w-28 md:h-28 rounded-xl overflow-hidden shadow-md bg-muted">
            {song.coverUrl ? (
              <Image
                src={song.coverUrl}
                alt={`Capa de ${song.title}`}
                fill
                className="object-cover"
                sizes="112px"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-primary/10">
                <Music2 className="w-10 h-10 text-primary/50" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl md:text-3xl font-bold text-foreground text-balance">{song.title}</h1>
            <p className="text-base text-muted-foreground mt-1">{song.artists.join(", ")}</p>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {song.genres.map((g) => (
                <span key={g} className="text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground font-medium">
                  {g}
                </span>
              ))}
            </div>
            <div className="flex gap-2 mt-3">
              <Link href={`/novo?tipo=musica&edit=${song.id}`}>
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

        {/* Main content: lyrics + chords */}
        {!activePage && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mainLyrics && (
              <ContentCard
                page={mainLyrics}
                onEdit={() => setEditingPage({ ...mainLyrics })}
                onDelete={() => handleDeletePage(mainLyrics.id)}
                onSetMain={() => handleSetMain(mainLyrics.id, "lyrics")}
                isMain
              />
            )}
            {mainChords && (
              <ContentCard
                page={mainChords}
                onEdit={() => setEditingPage({ ...mainChords })}
                onDelete={() => handleDeletePage(mainChords.id)}
                onSetMain={() => handleSetMain(mainChords.id, "chords")}
                isMain
              />
            )}
          </div>
        )}

        {/* Active non-main page view */}
        {activePage && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold text-foreground">{activePage.title}</h2>
              <Button variant="ghost" size="sm" className="text-muted-foreground gap-1" onClick={() => setActivePageId(null)}>
                <X className="w-4 h-4" />
                Fechar
              </Button>
            </div>
            <ContentCard
              page={activePage}
              onEdit={() => setEditingPage({ ...activePage })}
              onDelete={() => handleDeletePage(activePage.id)}
              onSetMain={() => handleSetMain(activePage.id, activePage.type)}
              isMain={activePage.isMain}
            />
          </div>
        )}

        {/* All pages list */}
        <section aria-labelledby="pages-heading">
          <div className="flex items-center justify-between mb-3">
            <h2 id="pages-heading" className="text-base font-semibold text-foreground flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              Páginas
            </h2>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs"
              onClick={() => setIsAddingPage(true)}
            >
              <Plus className="w-3.5 h-3.5" />
              Nova página
            </Button>
          </div>

          {/* Add page form */}
          {isAddingPage && (
            <div className="mb-3 p-4 rounded-xl border border-dashed border-primary/50 bg-primary/5 flex flex-col gap-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Título da página"
                  value={newPage.title}
                  onChange={(e) => setNewPage((p) => ({ ...p, title: e.target.value }))}
                  className="flex-1 h-9 px-3 rounded-md border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
                <select
                  value={newPage.type}
                  onChange={(e) => setNewPage((p) => ({ ...p, type: e.target.value as "lyrics" | "chords" }))}
                  className="h-9 px-2 rounded-md border border-border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                >
                  <option value="lyrics">Letra</option>
                  <option value="chords">Acordes</option>
                </select>
              </div>
              <textarea
                placeholder="Conteúdo..."
                value={newPage.content}
                onChange={(e) => setNewPage((p) => ({ ...p, content: e.target.value }))}
                rows={4}
                className="w-full px-3 py-2 rounded-md border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none font-mono"
              />
              <div className="flex items-center gap-2 justify-end">
                <Button variant="ghost" size="sm" onClick={() => setIsAddingPage(false)}>
                  Cancelar
                </Button>
                <Button size="sm" onClick={handleAddPage} disabled={!newPage.title.trim()}>
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Criar página
                </Button>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-2">
            {song.pages.length === 0 && (
              <p className="text-sm text-muted-foreground py-4 text-center">
                Nenhuma página criada ainda.
              </p>
            )}
            {song.pages.map((page) => (
              <PageListItem
                key={page.id}
                page={page}
                isActive={activePageId === page.id}
                onView={() => setActivePageId(activePageId === page.id ? null : page.id)}
                onEdit={() => setEditingPage({ ...page })}
                onDelete={() => handleDeletePage(page.id)}
                onSetMain={() => handleSetMain(page.id, page.type)}
              />
            ))}
          </div>
        </section>

        {/* Repertoires */}
        <section aria-labelledby="repertoires-heading">
          <div className="flex items-center justify-between mb-3">
            <h2 id="repertoires-heading" className="text-base font-semibold text-foreground flex items-center gap-2">
              <ListMusic className="w-4 h-4 text-primary" />
              Repertórios
            </h2>
            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
              <Plus className="w-3.5 h-3.5" />
              Adicionar a repertório
            </Button>
          </div>
          {songRepertoires.length === 0 ? (
            <p className="text-sm text-muted-foreground">Esta música não está em nenhum repertório.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {songRepertoires.map((rep) => (
                <Link key={rep.id} href={`/repertorios/${rep.id}`}>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border hover:border-primary/40 hover:bg-primary/5 transition-all duration-200 cursor-pointer">
                    <div className="relative shrink-0 w-10 h-10 rounded-lg overflow-hidden bg-muted">
                      <Image src={rep.coverUrl} alt="" fill className="object-cover" sizes="40px" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{rep.title}</p>
                      <p className="text-xs text-muted-foreground">@{rep.owner} &bull; {rep.songIds.length} músicas</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Edit page modal */}
      {editingPage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-card rounded-2xl border border-border shadow-2xl flex flex-col gap-4 p-6">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-foreground">Editar página</h3>
              <Button variant="ghost" size="icon" className="w-8 h-8" onClick={() => setEditingPage(null)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={editingPage.title}
                onChange={(e) => setEditingPage((p) => p ? { ...p, title: e.target.value } : p)}
                className="flex-1 h-9 px-3 rounded-md border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                placeholder="Título"
              />
              <select
                value={editingPage.type}
                onChange={(e) => setEditingPage((p) => p ? { ...p, type: e.target.value as "lyrics" | "chords" } : p)}
                className="h-9 px-2 rounded-md border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              >
                <option value="lyrics">Letra</option>
                <option value="chords">Acordes</option>
              </select>
            </div>
            <textarea
              value={editingPage.content}
              onChange={(e) => setEditingPage((p) => p ? { ...p, content: e.target.value } : p)}
              rows={8}
              className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none font-mono"
            />
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" size="sm" onClick={() => setEditingPage(null)}>Cancelar</Button>
              <Button size="sm" onClick={handleSaveEdit}>
                <Check className="w-3.5 h-3.5 mr-1" />
                Salvar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-card rounded-2xl border border-border shadow-2xl p-6">
            <h3 className="text-lg font-semibold text-foreground mb-2">Excluir música</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Tem certeza que deseja excluir <strong>{song.title}</strong>? Esta ação não pode ser desfeita.
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
                onClick={handleDeleteSong}
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

// Sub-componentes internos

function ContentCard({
  page,
  onEdit,
  onDelete,
  onSetMain,
  isMain,
}: {
  page: Page
  onEdit: () => void
  onDelete: () => void
  onSetMain: () => void
  isMain: boolean
}) {
  const isLyrics = page.type === "lyrics"
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/40">
        <div className="flex items-center gap-2">
          {isLyrics ? (
            <FileText className="w-4 h-4 text-primary" />
          ) : (
            <Guitar className="w-4 h-4 text-primary" />
          )}
          <span className="text-sm font-semibold text-foreground">{page.title}</span>
          {isMain && (
            <span className="flex items-center gap-0.5 text-[10px] font-medium text-amber-600 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400 px-1.5 py-0.5 rounded-full">
              <Star className="w-2.5 h-2.5" />
              Principal
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {!isMain && (
            <Button variant="ghost" size="icon" className="w-7 h-7 text-muted-foreground hover:text-amber-500" onClick={onSetMain} title="Marcar como principal">
              <Star className="w-3.5 h-3.5" />
            </Button>
          )}
          <Button variant="ghost" size="icon" className="w-7 h-7 text-muted-foreground hover:text-foreground" onClick={onEdit}>
            <Pencil className="w-3.5 h-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="w-7 h-7 text-muted-foreground hover:text-destructive" onClick={onDelete}>
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
      <pre className="px-4 py-4 text-sm text-foreground font-mono whitespace-pre-wrap leading-relaxed">
        {page.content}
      </pre>
    </div>
  )
}

function PageListItem({
  page,
  isActive,
  onView,
  onEdit,
  onDelete,
  onSetMain,
}: {
  page: Page
  isActive: boolean
  onView: () => void
  onEdit: () => void
  onDelete: () => void
  onSetMain: () => void
}) {
  const isLyrics = page.type === "lyrics"

  return (
    <div
      className={cn(
        "flex items-center gap-3 p-3 rounded-xl border transition-all duration-200",
        isActive
          ? "border-primary/50 bg-primary/5"
          : "border-border bg-card hover:border-primary/30"
      )}
    >
      <button
        className="flex items-center gap-3 flex-1 min-w-0 text-left"
        onClick={onView}
        aria-expanded={isActive}
      >
        <span className={cn(
          "shrink-0 flex items-center justify-center w-8 h-8 rounded-lg",
          isLyrics ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                   : "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
        )}>
          {isLyrics ? <FileText className="w-4 h-4" /> : <Guitar className="w-4 h-4" />}
        </span>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-medium text-foreground truncate">{page.title}</span>
            {page.isMain && (
              <Star className="w-3 h-3 text-amber-500 shrink-0" />
            )}
          </div>
          <span className="text-xs text-muted-foreground">
            {isLyrics ? "Letra" : "Acordes"}
          </span>
        </div>
      </button>
      <div className="flex items-center gap-0.5 shrink-0">
        {!page.isMain && (
          <Button variant="ghost" size="icon" className="w-7 h-7 text-muted-foreground hover:text-amber-500" onClick={onSetMain} title="Marcar como principal">
            <Star className="w-3.5 h-3.5" />
          </Button>
        )}
        <Button variant="ghost" size="icon" className="w-7 h-7 text-muted-foreground hover:text-foreground" onClick={onEdit}>
          <Pencil className="w-3.5 h-3.5" />
        </Button>
        <Button variant="ghost" size="icon" className="w-7 h-7 text-muted-foreground hover:text-destructive" onClick={onDelete}>
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  )
}
