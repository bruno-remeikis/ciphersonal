"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import {
  ChevronLeft, ChevronRight, ListMusic, Plus, Pencil, Trash2,
  Star, FileText, Guitar, Check, X, ArrowLeft,
  Music, MicVocal
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import useSWR, { mutate } from "swr"
import { fetchSongs, fetchRepertoires, swrKeys, updateSong, deleteSong, recordLastSeen } from "@/lib/api"
import {
  Song, Page, Repertoire, PageType, pageTypeLabels,
  parseLyrics2Content, stringifyLyrics2Content, Lyrics2Content, Lyrics2OrderItem
} from "@/lib/api"
import { cn } from "@/lib/utils"
import { useSettings } from "@/components/settings-provider"
import { Lyrics2Display } from "@/components/lyrics2-display"
import { Lyrics2Editor } from "@/components/lyrics2-editor"

type SongPageClientProps = {
  song: Song
  fromRepertoire?: string
}

export function SongPageClient({ song: initialSong, fromRepertoire }: SongPageClientProps) {
  const router = useRouter()
  const { settings } = useSettings()

  // Estado local do song (para CRUD de pages)
  const [song, setSong] = useState<Song>(initialSong)
  const [activePageId, setActivePageId] = useState<number | null>(null)
  const [editingPage, setEditingPage] = useState<Page | null>(null)
  const [isAddingPage, setIsAddingPage] = useState(false)
  const [newPage, setNewPage] = useState<Omit<Page, "id">>({
    type: "lyrics" as PageType,
    title: "",
    content: "",
    isMain: false,
  })
  const [newLyrics2Content, setNewLyrics2Content] = useState<Lyrics2Content>({
    sections: [],
    order: []
  })
  const [editingLyrics2Content, setEditingLyrics2Content] = useState<Lyrics2Content>({
    sections: [],
    order: []
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

  // Páginas principal de letra (texto), lyrics2 e acordes
  const mainLyrics = song.pages.find((p) => p.type === "lyrics" && p.isMain)
  const mainLyrics2 = song.pages.find((p) => p.type === "lyrics2" && p.isMain)
  const mainChords = song.pages.find((p) => p.type === "chords" && p.isMain)

  // Handler para atualizar order do lyrics2 (estado de expandido/colapsado)
  async function handleLyrics2OrderUpdate(pageId: number, newOrder: Lyrics2OrderItem[]) {
    const page = song.pages.find(p => p.id === pageId)
    if (!page || page.type !== "lyrics2") return
    
    const parsed = parseLyrics2Content(page.content)
    if (!parsed) return
    
    const updatedContent: Lyrics2Content = { ...parsed, order: newOrder }
    const newPages = song.pages.map(p => 
      p.id === pageId ? { ...p, content: JSON.stringify(updatedContent) } : p
    )
    
    setSong(prev => ({ ...prev, pages: newPages }))
    await persistPages(newPages)
  }

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

  // Helper para iniciar edição de uma página
  function startEditingPage(page: Page) {
    setEditingPage({ ...page })
    if (page.type === "lyrics2") {
      const parsed = parseLyrics2Content(page.content)
      if (parsed) {
        setEditingLyrics2Content(parsed)
      }
    }
  }

  async function handleSaveEdit() {
    if (!editingPage) return
    
    // Para lyrics2, salva o JSON stringified do conteúdo
    const contentToSave = editingPage.type === "lyrics2" 
      ? stringifyLyrics2Content(editingLyrics2Content)
      : editingPage.content
    
    const pageToSave = { ...editingPage, content: contentToSave }
    const newPages = song.pages.map((p) => (p.id === editingPage.id ? pageToSave : p))
    setSong((prev) => ({ ...prev, pages: newPages }))
    setEditingPage(null)
    setEditingLyrics2Content({ sections: [], order: [] })
    await persistPages(newPages)
  }

  async function handleSetMain(pageId: number, type: PageType) {
    const newPages = song.pages.map((p) =>
      p.type === type ? { ...p, isMain: p.id === pageId } : p
    )
    setSong((prev) => ({ ...prev, pages: newPages }))
    await persistPages(newPages)
  }

  async function handleAddPage() {
    const id = Math.max(0, ...song.pages.map((p) => p.id)) + 1
    
    // Para lyrics2, o content é o JSON stringified do Lyrics2Content
    const content = newPage.type === "lyrics2" 
      ? stringifyLyrics2Content(newLyrics2Content)
      : newPage.content
    
    const added: Page = { ...newPage, id, content }
    const newPages = [...song.pages, added]
    setSong((prev) => ({ ...prev, pages: newPages }))
    setNewPage({ type: "lyrics" as PageType, title: "", content: "", isMain: false })
    setNewLyrics2Content({ sections: [], order: [] })
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
                <Music className="w-10 h-10 text-primary/50" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl md:text-3xl font-bold text-foreground text-balance">{song.title}</h1>
            <div className="flex flex-wrap items-center gap-x-1 mt-1">
              {song.artists.map((artist, index) => (
                <span key={artist} className="inline-flex items-center">
                  <Link
                    href={`/artistas?q=${encodeURIComponent(artist)}`}
                    className="text-base text-muted-foreground hover:text-primary hover:underline transition-colors"
                  >
                    {artist}
                  </Link>
                  {index < song.artists.length - 1 && (
                    <span className="text-muted-foreground">,</span>
                  )}
                </span>
              ))}
            </div>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {song.genres.map((g) => (
                <Link
                  key={g}
                  href={`/generos/${encodeURIComponent(g)}`}
                  className="text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground font-medium hover:bg-primary/10 hover:text-primary transition-colors"
                >
                  {g}
                </Link>
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

        {/* Main content: lyrics + lyrics2 + chords */}
        {!activePage && (
          <div className="flex flex-col gap-4">
            {/* Row 1: Chords + Lyrics (Texto) */}
            {(mainChords || mainLyrics) && (
              <div className="flex flex-col md:flex-row gap-4">
                {/* Chords - appears first on mobile, shrinks to content on desktop */}
                {mainChords && (
                  <div className="md:shrink-0 md:w-auto md:max-w-[50%]">
                    <ContentCard
                      page={mainChords}
                      onEdit={() => startEditingPage(mainChords)}
                      onDelete={() => handleDeletePage(mainChords.id)}
                      onSetMain={() => handleSetMain(mainChords.id, "chords")}
                      isMain
                      fontSize={settings.sheetFontSize}
                      fitContent
                    />
                  </div>
                )}
                {/* Lyrics (Texto) - takes remaining space */}
                {mainLyrics && (
                  <div className="flex-1 min-w-0">
                    <ContentCard
                      page={mainLyrics}
                      onEdit={() => startEditingPage(mainLyrics)}
                      onDelete={() => handleDeletePage(mainLyrics.id)}
                      onSetMain={() => handleSetMain(mainLyrics.id, "lyrics")}
                      isMain
                      fontSize={settings.sheetFontSize}
                    />
                  </div>
                )}
              </div>
            )}
            
            {/* Row 2: Lyrics2 (Letra com seções) */}
            {mainLyrics2 && (
              <Lyrics2Card
                page={mainLyrics2}
                onEdit={() => startEditingPage(mainLyrics2)}
                onDelete={() => handleDeletePage(mainLyrics2.id)}
                onSetMain={() => handleSetMain(mainLyrics2.id, "lyrics2")}
                onOrderUpdate={(newOrder) => handleLyrics2OrderUpdate(mainLyrics2.id, newOrder)}
                isMain
                fontSize={settings.sheetFontSize}
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
            {activePage.type === "lyrics2" ? (
              <Lyrics2Card
                page={activePage}
                onEdit={() => startEditingPage(activePage)}
                onDelete={() => handleDeletePage(activePage.id)}
                onSetMain={() => handleSetMain(activePage.id, "lyrics2")}
                onOrderUpdate={(newOrder) => handleLyrics2OrderUpdate(activePage.id, newOrder)}
                isMain={activePage.isMain}
                fontSize={settings.sheetFontSize}
              />
            ) : (
              <ContentCard
                page={activePage}
                onEdit={() => startEditingPage(activePage)}
                onDelete={() => handleDeletePage(activePage.id)}
                onSetMain={() => handleSetMain(activePage.id, activePage.type)}
                isMain={activePage.isMain}
                fontSize={settings.sheetFontSize}
              />
            )}
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
                  onChange={(e) => setNewPage((p) => ({ ...p, type: e.target.value as PageType }))}
                  className="h-9 px-2 rounded-md border border-border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                >
                  <option value="lyrics">Texto</option>
                  <option value="lyrics2">Letra</option>
                  <option value="chords">Acordes</option>
                </select>
              </div>
              
              {/* Editor de conteúdo - muda conforme o tipo */}
              {newPage.type === "lyrics2" ? (
                <div className="border border-border rounded-lg p-3 bg-card">
                  <Lyrics2Editor 
                    content={newLyrics2Content}
                    onChange={setNewLyrics2Content}
                  />
                </div>
              ) : (
                <textarea
                  placeholder="Conteúdo..."
                  value={newPage.content}
                  onChange={(e) => setNewPage((p) => ({ ...p, content: e.target.value }))}
                  rows={4}
                  className="w-full px-3 py-2 rounded-md border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none font-mono"
                />
              )}
              
              <div className="flex items-center gap-2 justify-end">
                <Button variant="ghost" size="sm" onClick={() => {
                  setIsAddingPage(false)
                  setNewLyrics2Content({ sections: [], order: [] })
                }}>
                  Cancelar
                </Button>
                <Button 
                  size="sm" 
                  onClick={handleAddPage} 
                  disabled={!newPage.title.trim() || (newPage.type === "lyrics2" && newLyrics2Content.sections.length === 0)}
                >
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
                onEdit={() => startEditingPage(page)}
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
                      {rep.coverUrl ? (
                        <Image src={rep.coverUrl} alt="" fill className="object-cover" sizes="40px" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-primary/10">
                          <ListMusic className="w-5 h-5 text-primary/50" />
                        </div>
                      )}
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
                onChange={(e) => setEditingPage((p) => p ? { ...p, type: e.target.value as PageType } : p)}
                className="h-9 px-2 rounded-md border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              >
                <option value="lyrics">Texto</option>
                <option value="lyrics2">Letra</option>
                <option value="chords">Acordes</option>
              </select>
            </div>
            
            {/* Editor de conteúdo - muda conforme o tipo */}
            {editingPage.type === "lyrics2" ? (
              <div className="border border-border rounded-lg p-3 bg-background max-h-96 overflow-y-auto">
                <Lyrics2Editor 
                  content={editingLyrics2Content}
                  onChange={setEditingLyrics2Content}
                />
              </div>
            ) : (
              <textarea
                value={editingPage.content}
                onChange={(e) => setEditingPage((p) => p ? { ...p, content: e.target.value } : p)}
                rows={8}
                className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none font-mono"
              />
            )}
            
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" size="sm" onClick={() => {
                setEditingPage(null)
                setEditingLyrics2Content({ sections: [], order: [] })
              }}>Cancelar</Button>
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
  fontSize = 14,
  fitContent = false,
}: {
  page: Page
  onEdit: () => void
  onDelete: () => void
  onSetMain: () => void
  isMain: boolean
  fontSize?: number
  fitContent?: boolean
}) {
  const getIcon = () => {
    switch (page.type) {
      case "lyrics": return <FileText className="w-4 h-4 text-primary" />
      case "lyrics2": return <MicVocal className="w-4 h-4 text-primary" />
      case "chords": return <Guitar className="w-4 h-4 text-primary" />
    }
  }
  
  return (
    <div className={`rounded-xl border border-border bg-card overflow-hidden ${fitContent ? "h-fit" : ""}`}>
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/40">
        <div className="flex items-center gap-2">
          {getIcon()}
          <span className="text-sm font-semibold text-foreground">{page.title}</span>
          <span className="text-xs text-muted-foreground">({pageTypeLabels[page.type]})</span>
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
      <pre 
        className={`px-4 py-4 text-foreground font-mono whitespace-pre-wrap leading-relaxed ${fitContent ? "w-fit" : ""}`}
        style={{ fontSize: `${fontSize}px` }}
      >
        {page.content}
      </pre>
    </div>
  )
}

function Lyrics2Card({
  page,
  onEdit,
  onDelete,
  onSetMain,
  onOrderUpdate,
  isMain,
  fontSize = 14,
}: {
  page: Page
  onEdit: () => void
  onDelete: () => void
  onSetMain: () => void
  onOrderUpdate: (newOrder: Lyrics2OrderItem[]) => void
  isMain: boolean
  fontSize?: number
}) {
  const parsedContent = parseLyrics2Content(page.content)
  
  if (!parsedContent) {
    return (
      <div className="rounded-xl border border-border bg-card p-4">
        <p className="text-sm text-muted-foreground">Conteúdo inválido para este tipo de página.</p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/40">
        <div className="flex items-center gap-2">
          <MicVocal className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">{page.title}</span>
          <span className="text-xs text-muted-foreground">(Letra)</span>
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
      <div className="p-4">
        <Lyrics2Display 
          content={parsedContent} 
          fontSize={fontSize}
          onOrderUpdate={onOrderUpdate}
        />
      </div>
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
  const getIconAndStyle = () => {
    switch (page.type) {
      case "lyrics": 
        return {
          icon: <FileText className="w-4 h-4" />,
          style: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
        }
      case "lyrics2":
        return {
          icon: <MicVocal className="w-4 h-4" />,
          style: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"
        }
      case "chords":
        return {
          icon: <Guitar className="w-4 h-4" />,
          style: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
        }
    }
  }
  
  const { icon, style } = getIconAndStyle()

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
        <span className={cn("shrink-0 flex items-center justify-center w-8 h-8 rounded-lg", style)}>
          {icon}
        </span>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-medium text-foreground truncate">{page.title}</span>
            {page.isMain && (
              <Star className="w-3 h-3 text-amber-500 shrink-0" />
            )}
          </div>
          <span className="text-xs text-muted-foreground">
            {pageTypeLabels[page.type]}
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

// type SongCoverImageProps = Omit<ImageProps, 'src' | 'alt'> & {
//   coverUrl?: string
//   songTitle: string
// }

// function SongCoverImage({ coverUrl, songTitle, ...props }: SongCoverImageProps) {
//   if (coverUrl) {
//     return (
//       <Image
//         {...props}
//         src={coverUrl}
//         alt={`Capa de ${songTitle}`}
//       />
//     )
//   }
    
//   return (
//     <div className="w-full h-full flex items-center justify-center bg-primary/10">
//       <Music2 className="w-10 h-10 text-primary/50" />
//     </div>
//   )
// }
