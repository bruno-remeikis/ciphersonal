"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft, Music2, Users, ListMusic, Plus, X, Globe, Lock, Check
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { cn } from "@/lib/utils"
import useSWR, { mutate } from "swr"
import { 
  fetchArtists, fetchSongs, swrKeys, 
  createSong, createArtist, createRepertoire,
  updateSong, updateArtist, updateRepertoire,
  fetchSong, fetchArtistDetail, fetchRepertoireDetail,
  type Artist, type Song
} from "@/lib/api"

type TipoItem = "musica" | "artista" | "repertorio"

type NewItemPageClientProps = {
  initialTipo?: string
  editId?: string
}

const tipoOptions: { value: TipoItem; label: string; icon: React.ReactNode }[] = [
  { value: "musica", label: "Música", icon: <Music2 className="w-5 h-5" /> },
  { value: "artista", label: "Artista", icon: <Users className="w-5 h-5" /> },
  { value: "repertorio", label: "Repertório", icon: <ListMusic className="w-5 h-5" /> },
]

function toTipo(s?: string): TipoItem {
  if (s === "artista" || s === "repertorio") return s
  return "musica"
}

export function NewItemPageClient({ initialTipo, editId }: NewItemPageClientProps) {
  const router = useRouter()
  const [tipo, setTipo] = useState<TipoItem>(toTipo(initialTipo))
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(Boolean(editId))

  // Fetch data from API to power suggestions
  const { data: allArtists = [] } = useSWR(swrKeys.artists(), () => fetchArtists())
  const { data: allSongs = [] } = useSWR(swrKeys.songs(), () => fetchSongs())

  // Song form state
  const [songTitle, setSongTitle] = useState("")
  const [songArtists, setSongArtists] = useState<string[]>([""])
  const [songGenres, setSongGenres] = useState<string[]>([""])
  const [songCover, setSongCover] = useState("")

  // Artist form state
  const [artistName, setArtistName] = useState("")
  const [artistGenre, setArtistGenre] = useState("")
  const [artistAvatar, setArtistAvatar] = useState("")
  const [artistVerified, setArtistVerified] = useState(false)

  // Repertoire form state
  const [repTitle, setRepTitle] = useState("")
  const [repOwner, setRepOwner] = useState("")
  const [repDesc, setRepDesc] = useState("")
  const [repPublic, setRepPublic] = useState(true)
  const [repCover, setRepCover] = useState("")

  const isEditing = Boolean(editId)

  // Load existing data when editing
  useEffect(() => {
    if (!editId) return

    async function loadEditData() {
      setLoading(true)
      try {
        if (tipo === "musica") {
          const song = await fetchSong(editId)
          setSongTitle(song.title)
          setSongArtists(song.artists.length > 0 ? song.artists : [""])
          setSongGenres(song.genres.length > 0 ? song.genres : [""])
          setSongCover(song.coverUrl || "")
        } else if (tipo === "artista") {
          const data = await fetchArtistDetail(editId)
          const artist = data.artist
          setArtistName(artist.name)
          setArtistGenre(artist.genre)
          setArtistAvatar(artist.avatarUrl || "")
          setArtistVerified(artist.verified)
        } else if (tipo === "repertorio") {
          const data = await fetchRepertoireDetail(editId)
          const rep = data.repertoire
          setRepTitle(rep.title)
          setRepOwner(rep.owner)
          setRepDesc(rep.description)
          setRepPublic(rep.isPublic)
          setRepCover(rep.coverUrl || "")
        }
      } catch (err) {
        console.error("Error loading edit data:", err)
        setError("Erro ao carregar dados para edição")
      } finally {
        setLoading(false)
      }
    }

    loadEditData()
  }, [editId, tipo])

  function resetSongForm() {
    setSongTitle("")
    setSongArtists([""])
    setSongGenres([""])
    setSongCover("")
  }

  function resetArtistForm() {
    setArtistName("")
    setArtistGenre("")
    setArtistAvatar("")
    setArtistVerified(false)
  }

  function resetRepertoireForm() {
    setRepTitle("")
    setRepOwner("")
    setRepDesc("")
    setRepPublic(true)
    setRepCover("")
  }

  async function handleSave() {
    setError(null)
    setSaving(true)

    try {
      if (tipo === "musica") {
        const filteredArtists = songArtists.filter((a) => a.trim() !== "")
        const filteredGenres = songGenres.filter((g) => g.trim() !== "")

        if (!songTitle.trim()) {
          throw new Error("O título da música é obrigatório")
        }
        if (filteredArtists.length === 0) {
          throw new Error("Pelo menos um artista é obrigatório")
        }
        if (filteredGenres.length === 0) {
          throw new Error("Pelo menos um gênero é obrigatório")
        }

        const songData = {
          title: songTitle.trim(),
          artists: filteredArtists,
          genres: filteredGenres,
          coverUrl: songCover.trim() || undefined,
        }

        if (isEditing && editId) {
          await updateSong(editId, songData)
          await mutate(swrKeys.song(editId))
          await mutate(swrKeys.songs())
          router.push(`/musicas/${editId}`)
          return
        } else {
          await createSong(songData)
          await mutate(swrKeys.songs())
          resetSongForm()
        }
      } else if (tipo === "artista") {
        if (!artistName.trim()) {
          throw new Error("O nome do artista é obrigatório")
        }
        if (!artistGenre.trim()) {
          throw new Error("O gênero musical é obrigatório")
        }

        const artistData = {
          name: artistName.trim(),
          genre: artistGenre.trim(),
          avatarUrl: artistAvatar.trim() || undefined,
          verified: artistVerified,
        }

        if (isEditing && editId) {
          await updateArtist(editId, artistData)
          await mutate(swrKeys.artistDetail(editId))
          await mutate(swrKeys.artists())
          router.push(`/artistas/${editId}`)
          return
        } else {
          await createArtist(artistData)
          await mutate(swrKeys.artists())
          resetArtistForm()
        }
      } else if (tipo === "repertorio") {
        if (!repTitle.trim()) {
          throw new Error("O nome do repertório é obrigatório")
        }
        if (!repOwner.trim()) {
          throw new Error("O criador é obrigatório")
        }

        const repData = {
          title: repTitle.trim(),
          owner: repOwner.trim(),
          description: repDesc.trim(),
          isPublic: repPublic,
          coverUrl: repCover.trim() || undefined,
        }

        if (isEditing && editId) {
          await updateRepertoire(editId, repData)
          await mutate(swrKeys.repertoireDetail(editId))
          await mutate(swrKeys.repertoires())
          router.push(`/repertorios/${editId}`)
          return
        } else {
          await createRepertoire(repData)
          await mutate(swrKeys.repertoires())
          resetRepertoireForm()
        }
      }

      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar")
    } finally {
      setSaving(false)
    }
  }

  function addArtistField() {
    setSongArtists((prev) => [...prev, ""])
  }
  function removeArtistField(i: number) {
    setSongArtists((prev) => prev.filter((_, idx) => idx !== i))
  }
  function updateArtistField(i: number, val: string) {
    setSongArtists((prev) => prev.map((a, idx) => (idx === i ? val : a)))
  }

  function addGenreField() {
    setSongGenres((prev) => [...prev, ""])
  }
  function removeGenreField(i: number) {
    setSongGenres((prev) => prev.filter((_, idx) => idx !== i))
  }
  function updateGenreField(i: number, val: string) {
    setSongGenres((prev) => prev.map((g, idx) => (idx === i ? val : g)))
  }

  const currentTipo = tipoOptions.find((t) => t.value === tipo)!

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6 flex flex-col gap-6">
        {/* Back */}
        <Link href="/">
          <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground hover:text-foreground -ml-2">
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Button>
        </Link>

        {/* Page title */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {isEditing ? "Editar" : "Adicionar"} {currentTipo.label}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isEditing
              ? `Altere os dados do(a) ${currentTipo.label.toLowerCase()} abaixo.`
              : `Preencha os campos para cadastrar um(a) novo(a) ${currentTipo.label.toLowerCase()}.`}
          </p>
        </div>

        {/* Type switcher (only for new items) */}
        {!isEditing && (
          <div
            className="flex rounded-xl border border-border overflow-hidden bg-muted/50 p-1 gap-1"
            role="group"
            aria-label="Tipo de item"
          >
            {tipoOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setTipo(opt.value)}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200",
                  tipo === opt.value
                    ? "bg-card text-foreground shadow-sm border border-border"
                    : "text-muted-foreground hover:text-foreground"
                )}
                aria-pressed={tipo === opt.value}
              >
                {opt.icon}
                <span className="hidden sm:inline">{opt.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* Forms */}
        <div className="flex flex-col gap-5 bg-card rounded-2xl border border-border p-5 md:p-6">
          {loading ? (
            <div className="py-12 flex flex-col items-center gap-3">
              <span className="w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
              <p className="text-sm text-muted-foreground">Carregando dados...</p>
            </div>
          ) : tipo === "musica" && (
            <SongForm
              title={songTitle}
              onTitleChange={setSongTitle}
              artists={songArtists}
              onAddArtist={addArtistField}
              onRemoveArtist={removeArtistField}
              onUpdateArtist={updateArtistField}
              genres={songGenres}
              onAddGenre={addGenreField}
              onRemoveGenre={removeGenreField}
              onUpdateGenre={updateGenreField}
              cover={songCover}
              onCoverChange={setSongCover}
              artistSuggestions={allArtists}
            />
          )}

          {!loading && tipo === "artista" && (
            <ArtistForm
              name={artistName}
              onNameChange={setArtistName}
              genre={artistGenre}
              onGenreChange={setArtistGenre}
              avatar={artistAvatar}
              onAvatarChange={setArtistAvatar}
              verified={artistVerified}
              onVerifiedChange={setArtistVerified}
            />
          )}

          {!loading && tipo === "repertorio" && (
            <RepertoireForm
              title={repTitle}
              onTitleChange={setRepTitle}
              owner={repOwner}
              onOwnerChange={setRepOwner}
              description={repDesc}
              onDescriptionChange={setRepDesc}
              isPublic={repPublic}
              onPublicChange={setRepPublic}
              cover={repCover}
              onCoverChange={setRepCover}
            />
          )}

          {!loading && error && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
              {error}
            </div>
          )}

          {!loading && (
          <div className="flex gap-2 pt-2 border-t border-border">
            <Link href="/" className="flex-1">
              <Button variant="outline" className="w-full" disabled={saving}>
                Cancelar
              </Button>
            </Link>
            <Button 
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90" 
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? (
                <>
                  <span className="w-4 h-4 mr-1.5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Salvando...
                </>
              ) : saved ? (
                <>
                  <Check className="w-4 h-4 mr-1.5" />
                  Salvo!
                </>
              ) : (
                isEditing ? "Salvar alterações" : `Criar ${currentTipo.label}`
              )}
            </Button>
          </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}

// Sub-forms

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-sm font-medium text-foreground mb-1.5">
      {children}
      {required && <span className="text-destructive ml-0.5">*</span>}
    </label>
  )
}

function TextInput({
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  type?: string
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition"
    />
  )
}

function MultiValueField({
  label,
  values,
  placeholder,
  onAdd,
  onRemove,
  onUpdate,
  suggestions = [],
}: {
  label: string
  values: string[]
  placeholder: string
  onAdd: () => void
  onRemove: (i: number) => void
  onUpdate: (i: number, v: string) => void
  suggestions?: string[]
}) {
  return (
    <div>
      <FieldLabel required>{label}</FieldLabel>
      <div className="flex flex-col gap-2">
        {values.map((val, i) => (
          <div key={i} className="flex gap-2">
            <div className="flex-1 relative">
              <input
                type="text"
                value={val}
                onChange={(e) => onUpdate(i, e.target.value)}
                placeholder={placeholder}
                list={`suggestions-${label}-${i}`}
                className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition"
              />
              {suggestions.length > 0 && (
                <datalist id={`suggestions-${label}-${i}`}>
                  {suggestions.map((s) => (
                    <option key={s} value={s} />
                  ))}
                </datalist>
              )}
            </div>
            {values.length > 1 && (
              <Button
                variant="ghost"
                size="icon"
                className="w-10 h-10 shrink-0 text-muted-foreground hover:text-destructive"
                onClick={() => onRemove(i)}
                aria-label={`Remover ${label}`}
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        ))}
        <Button
          variant="outline"
          size="sm"
          className="w-fit gap-1.5 text-xs"
          onClick={onAdd}
        >
          <Plus className="w-3.5 h-3.5" />
          Adicionar {label.toLowerCase()}
        </Button>
      </div>
    </div>
  )
}

function SongForm({
  title, onTitleChange,
  artists, onAddArtist, onRemoveArtist, onUpdateArtist,
  genres, onAddGenre, onRemoveGenre, onUpdateGenre,
  cover, onCoverChange,
  artistSuggestions,
}: {
  title: string; onTitleChange: (v: string) => void
  artists: string[]; onAddArtist: () => void; onRemoveArtist: (i: number) => void; onUpdateArtist: (i: number, v: string) => void
  genres: string[]; onAddGenre: () => void; onRemoveGenre: (i: number) => void; onUpdateGenre: (i: number, v: string) => void
  cover: string; onCoverChange: (v: string) => void
  artistSuggestions: Artist[]
}) {
  const existingGenres = Array.from(
    new Set(artistSuggestions.flatMap((a) => a.genre ? [a.genre] : []))
  ).slice(0, 10)

  return (
    <>
      <div>
        <FieldLabel required>Título da música</FieldLabel>
        <TextInput value={title} onChange={onTitleChange} placeholder="Ex: Evidências" />
      </div>
      <MultiValueField
        label="Artistas"
        values={artists}
        placeholder="Ex: Chitãozinho & Xororó"
        onAdd={onAddArtist}
        onRemove={onRemoveArtist}
        onUpdate={onUpdateArtist}
        suggestions={artistSuggestions.map((a) => a.name)}
      />
      <MultiValueField
        label="Gêneros"
        values={genres}
        placeholder="Ex: Sertanejo"
        onAdd={onAddGenre}
        onRemove={onRemoveGenre}
        onUpdate={onUpdateGenre}
        suggestions={existingGenres}
      />
      <div>
        <FieldLabel>URL da capa</FieldLabel>
        <TextInput value={cover} onChange={onCoverChange} placeholder="https://..." type="url" />
        <p className="mt-1 text-xs text-muted-foreground">Link de imagem para a capa da música (opcional)</p>
      </div>
    </>
  )
}

function ArtistForm({
  name, onNameChange,
  genre, onGenreChange,
  avatar, onAvatarChange,
  verified, onVerifiedChange,
}: {
  name: string; onNameChange: (v: string) => void
  genre: string; onGenreChange: (v: string) => void
  avatar: string; onAvatarChange: (v: string) => void
  verified: boolean; onVerifiedChange: (v: boolean) => void
}) {
  return (
    <>
      <div>
        <FieldLabel required>Nome do artista</FieldLabel>
        <TextInput value={name} onChange={onNameChange} placeholder="Ex: Legião Urbana" />
      </div>
      <div>
        <FieldLabel required>Gênero musical</FieldLabel>
        <TextInput value={genre} onChange={onGenreChange} placeholder="Ex: Rock" />
      </div>
      <div>
        <FieldLabel>URL do avatar</FieldLabel>
        <TextInput value={avatar} onChange={onAvatarChange} placeholder="https://..." type="url" />
        <p className="mt-1 text-xs text-muted-foreground">Link de imagem para a foto do artista (opcional)</p>
      </div>
      <div>
        <FieldLabel>Artista verificado</FieldLabel>
        <button
          type="button"
          onClick={() => onVerifiedChange(!verified)}
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-all",
            verified
              ? "border-primary/50 bg-primary/10 text-primary"
              : "border-border bg-background text-muted-foreground"
          )}
          aria-pressed={verified}
        >
          <span className={cn(
            "w-4 h-4 rounded flex items-center justify-center border transition-colors",
            verified ? "bg-primary border-primary" : "border-border"
          )}>
            {verified && <Check className="w-2.5 h-2.5 text-primary-foreground" />}
          </span>
          Marcar como verificado
        </button>
      </div>
    </>
  )
}

function RepertoireForm({
  title, onTitleChange,
  owner, onOwnerChange,
  description, onDescriptionChange,
  isPublic, onPublicChange,
  cover, onCoverChange,
}: {
  title: string; onTitleChange: (v: string) => void
  owner: string; onOwnerChange: (v: string) => void
  description: string; onDescriptionChange: (v: string) => void
  isPublic: boolean; onPublicChange: (v: boolean) => void
  cover: string; onCoverChange: (v: string) => void
}) {
  return (
    <>
      <div>
        <FieldLabel required>Nome do repertório</FieldLabel>
        <TextInput value={title} onChange={onTitleChange} placeholder="Ex: Clássicos do Rock" />
      </div>
      <div>
        <FieldLabel required>Criador</FieldLabel>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm select-none">@</span>
          <input
            type="text"
            value={owner}
            onChange={(e) => onOwnerChange(e.target.value)}
            placeholder="nome_usuario"
            className="w-full h-10 pl-7 pr-3 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition"
          />
        </div>
      </div>
      <div>
        <FieldLabel>Descrição</FieldLabel>
        <textarea
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder="Uma breve descrição do repertório..."
          rows={3}
          className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition resize-none leading-relaxed"
        />
      </div>
      <div>
        <FieldLabel>Visibilidade</FieldLabel>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onPublicChange(true)}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border text-sm font-medium transition-all",
              isPublic
                ? "border-emerald-500/50 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400"
                : "border-border bg-background text-muted-foreground hover:bg-muted"
            )}
            aria-pressed={isPublic}
          >
            <Globe className="w-4 h-4" />
            Público
          </button>
          <button
            type="button"
            onClick={() => onPublicChange(false)}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border text-sm font-medium transition-all",
              !isPublic
                ? "border-primary/50 bg-primary/10 text-primary"
                : "border-border bg-background text-muted-foreground hover:bg-muted"
            )}
            aria-pressed={!isPublic}
          >
            <Lock className="w-4 h-4" />
            Privado
          </button>
        </div>
      </div>
      <div>
        <FieldLabel>URL da capa</FieldLabel>
        <TextInput value={cover} onChange={onCoverChange} placeholder="https://..." type="url" />
        <p className="mt-1 text-xs text-muted-foreground">Link de imagem para a capa do repertório (opcional)</p>
      </div>
    </>
  )
}
