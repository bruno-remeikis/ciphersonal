"use client"

import { useEffect, useState } from "react"
import { Sparkles, X, Check, RefreshCw, Music, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createSong, suggestSongsWithAI, updateRepertoire, type SongSuggestion } from "@/lib/api"
import { mutate } from "swr"
import { swrKeys } from "@/lib/api"

type AiSuggestSongsModalProps = {
  open: boolean
  onClose: () => void
  repertoireId: string
  currentSongIds: string[]
  onSongAdded: (songId: string) => void
}

type SuggestionState = SongSuggestion & {
  status: "pending" | "adding" | "added" | "error"
}

export function AiSuggestSongsModal({
  open,
  onClose,
  repertoireId,
  currentSongIds,
  onSongAdded,
}: AiSuggestSongsModalProps) {
  const [suggestions, setSuggestions] = useState<SuggestionState[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [seenKeys, setSeenKeys] = useState<string[]>([])
  const [addedSongIds, setAddedSongIds] = useState<string[]>([])

  function keyFor(s: SongSuggestion) {
    return `${s.title} - ${s.artists.join(", ")}`
  }

  async function loadSuggestions(excludeKeys: string[]) {
    setLoading(true)
    setError(null)
    try {
      const results = await suggestSongsWithAI(excludeKeys, currentSongIds)
      setSuggestions(results.map((s) => ({ ...s, status: "pending" as const })))
      setSeenKeys((prev) => Array.from(new Set([...prev, ...results.map(keyFor)])))
    } catch (err) {
      console.error("[v0] Error loading AI suggestions:", err)
      setError("Não foi possível buscar sugestões agora. Tente novamente.")
      setSuggestions([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (open) {
      setSuggestions([])
      setSeenKeys([])
      setAddedSongIds([])
      setError(null)
      loadSuggestions([])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  async function handleAccept(index: number) {
    const suggestion = suggestions[index]
    if (!suggestion || suggestion.status === "adding" || suggestion.status === "added") return

    setSuggestions((prev) =>
      prev.map((s, i) => (i === index ? { ...s, status: "adding" as const } : s))
    )

    try {
      const song = await createSong({
        title: suggestion.title,
        artists: suggestion.artists,
        genres: suggestion.genres,
      })

      const newSongIds = Array.from(new Set([...currentSongIds, ...addedSongIds, song.id]))
      await updateRepertoire(repertoireId, { songIds: newSongIds })
      setAddedSongIds((prev) => [...prev, song.id])

      await Promise.all([
        mutate(swrKeys.songs()),
        mutate(swrKeys.repertoireDetail(repertoireId)),
      ])

      onSongAdded(song.id)

      setSuggestions((prev) =>
        prev.map((s, i) => (i === index ? { ...s, status: "added" as const } : s))
      )
    } catch (err) {
      console.error("[v0] Error accepting AI suggestion:", err)
      setSuggestions((prev) =>
        prev.map((s, i) => (i === index ? { ...s, status: "error" as const } : s))
      )
    }
  }

  function handleGenerateMore() {
    loadSuggestions(seenKeys)
  }

  function handleClose() {
    setSuggestions([])
    setSeenKeys([])
    setAddedSongIds([])
    setError(null)
    onClose()
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md bg-card rounded-2xl border border-border shadow-2xl flex flex-col max-h-[85vh]">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            Sugestões de IA
          </h3>
          <Button variant="ghost" size="icon" className="w-8 h-8" onClick={handleClose} aria-label="Fechar">
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="overflow-y-auto flex-1 px-4 py-4">
          {loading ? (
            <div className="flex flex-col items-center gap-3 py-10 text-center">
              <span className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              <p className="text-sm text-muted-foreground">Buscando músicas na internet...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center gap-3 py-10 text-center">
              <AlertCircle className="w-8 h-8 text-destructive/70" />
              <p className="text-sm text-muted-foreground">{error}</p>
              <Button variant="outline" size="sm" onClick={() => loadSuggestions(seenKeys)}>
                Tentar novamente
              </Button>
            </div>
          ) : suggestions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-10">
              Nenhuma sugestão encontrada.
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {suggestions.map((song, index) => (
                <div
                  key={`${song.title}-${index}`}
                  className="flex items-center gap-3 p-2.5 rounded-lg border border-border"
                >
                  <div className="shrink-0 w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center">
                    <Music className="w-5 h-5 text-primary/50" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{song.title}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {song.artists.join(", ")}
                    </p>
                    <p className="text-xs text-muted-foreground/70 truncate">
                      {song.genres.join(", ")}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant={song.status === "added" ? "secondary" : "outline"}
                    className="shrink-0 gap-1 text-xs"
                    disabled={song.status === "adding" || song.status === "added"}
                    onClick={() => handleAccept(index)}
                  >
                    {song.status === "adding" ? (
                      <span className="w-3.5 h-3.5 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                    ) : (
                      <Check className="w-3.5 h-3.5" />
                    )}
                    {song.status === "added"
                      ? "Adicionada"
                      : song.status === "adding"
                        ? "Adicionando..."
                        : song.status === "error"
                          ? "Tentar de novo"
                          : "Aceitar"}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="px-4 py-3 border-t border-border shrink-0">
          <Button
            variant="outline"
            className="w-full gap-1.5 text-sm"
            onClick={handleGenerateMore}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Gerar novas sugestões
          </Button>
        </div>
      </div>
    </div>
  )
}
