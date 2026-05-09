"use client"

import { useSearchParams } from "next/navigation"
import { useState, useEffect, useRef, useCallback } from "react"
import useSWR from "swr"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { RepertoireCard } from "@/components/repertoire-card"
import { fetchRepertoires, swrKeys } from "@/lib/api"
import type { Repertoire } from "@/lib/api"
import { ListMusic, ArrowLeft, Loader2, SearchX, PlusCircle, Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"

const PAGE_SIZE = 12

export function RepertoiresListClient() {
  const searchParams = useSearchParams()
  const initialQuery = searchParams.get("q") ?? ""
  
  const [query, setQuery] = useState(initialQuery)
  const [inputValue, setInputValue] = useState(initialQuery)
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const loadMoreRef = useRef<HTMLDivElement>(null)

  const { data: repertoires, isLoading } = useSWR(
    swrKeys.repertoires(query),
    () => fetchRepertoires(query)
  )

  const filteredRepertoires: Repertoire[] = repertoires ?? []
  const visibleRepertoires = filteredRepertoires.slice(0, visibleCount)
  const hasMore = visibleCount < filteredRepertoires.length

  // Infinite scroll observer
  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const target = entries[0]
      if (target.isIntersecting && hasMore && !isLoading) {
        setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, filteredRepertoires.length))
      }
    },
    [hasMore, isLoading, filteredRepertoires.length]
  )

  useEffect(() => {
    const element = loadMoreRef.current
    if (!element) return

    const observer = new IntersectionObserver(handleObserver, {
      root: null,
      rootMargin: "100px",
      threshold: 0,
    })

    observer.observe(element)
    return () => observer.disconnect()
  }, [handleObserver])

  // Reset visible count when query changes
  useEffect(() => {
    setVisibleCount(PAGE_SIZE)
  }, [query])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setQuery(inputValue)
  }

  const clearSearch = () => {
    setInputValue("")
    setQuery("")
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6">
        {/* Header da pagina */}
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="ghost" size="icon" className="shrink-0">
                <ArrowLeft className="w-5 h-5" />
                <span className="sr-only">Voltar</span>
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary">
                <ListMusic className="w-5 h-5" />
              </span>
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-foreground">Repertorios</h1>
                <p className="text-sm text-muted-foreground">
                  {isLoading ? "Carregando..." : `${filteredRepertoires.length} ${filteredRepertoires.length === 1 ? "repertorio encontrado" : "repertorios encontrados"}`}
                </p>
              </div>
            </div>
          </div>

          {/* Barra de pesquisa e acoes */}
          <div className="flex flex-col sm:flex-row gap-3">
            <form onSubmit={handleSearch} className="flex-1 flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Buscar repertorios..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  className="pl-9 pr-9"
                />
                {inputValue && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <Button type="submit" variant="secondary">
                Buscar
              </Button>
            </form>
            <Link href="/novo?tipo=repertorio">
              <Button className="gap-2 w-full sm:w-auto">
                <PlusCircle className="w-4 h-4" />
                Novo repertorio
              </Button>
            </Link>
          </div>
        </div>

        {/* Lista de repertorios */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16 gap-3 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm">Carregando repertorios...</span>
          </div>
        ) : filteredRepertoires.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
            <SearchX className="w-12 h-12 text-muted-foreground" />
            <h2 className="text-lg font-semibold text-foreground">Nenhum repertorio encontrado</h2>
            <p className="text-sm text-muted-foreground max-w-sm">
              {query ? "Tente buscar por outro termo." : "Crie seu primeiro repertorio!"}
            </p>
            {query && (
              <Button variant="outline" onClick={clearSearch}>
                Limpar busca
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {visibleRepertoires.map((repertoire) => (
                <RepertoireCard key={repertoire.id} repertoire={repertoire} />
              ))}
            </div>

            {/* Load more trigger */}
            <div ref={loadMoreRef} className="py-8 flex justify-center">
              {hasMore && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Carregando mais...</span>
                </div>
              )}
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  )
}
