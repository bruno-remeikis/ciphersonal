"use client"

import { Search, X } from "lucide-react"
import { cn } from "@/lib/utils"

export type FilterType = "todos" | "musicas" | "artistas" | "repertorios" | "generos"

const filters: { value: FilterType; label: string }[] = [
  { value: "todos", label: "Todos" },
  { value: "musicas", label: "Músicas" },
  { value: "artistas", label: "Artistas" },
  { value: "repertorios", label: "Repertórios" },
  { value: "generos", label: "Gêneros" },
]

type SearchBarProps = {
  query: string
  onQueryChange: (q: string) => void
  filter: FilterType
  onFilterChange: (f: FilterType) => void
}

export function SearchBar({ query, onQueryChange, filter, onFilterChange }: SearchBarProps) {
  return (
    <section className="bg-primary py-8 md:py-12" aria-label="Busca">
      <div className="max-w-3xl mx-auto px-4 flex flex-col gap-5">
        {/* Heading */}
        <div className="text-center">
          <h1 className="text-2xl md:text-4xl font-bold text-primary-foreground text-balance leading-tight">
            Suas cifras pessoais
          </h1>
          {/* <p className="mt-1 text-sm md:text-base text-primary-foreground/70 text-pretty">
            Mais de 1 milhão de cifras, tabs e letras disponíveis
          </p> */}
        </div>

        {/* Input */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
          <input
            type="search"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Buscar músicas, artistas ou repertórios..."
            className="w-full h-12 md:h-14 pl-11 pr-10 rounded-xl bg-card text-foreground placeholder:text-muted-foreground text-sm md:text-base shadow-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
            aria-label="Campo de pesquisa"
          />
          {query && (
            <button
              onClick={() => onQueryChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Limpar pesquisa"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-0.5 scrollbar-none" role="group" aria-label="Filtrar por categoria">
          {filters.map((f) => (
            <button
              key={f.value}
              onClick={() => onFilterChange(f.value)}
              className={cn(
                "shrink-0 px-4 py-1.5 rounded-full text-sm font-medium border transition-all duration-200",
                filter === f.value
                  ? "bg-card text-primary border-card shadow"
                  : "bg-transparent text-primary-foreground/80 border-primary-foreground/30 hover:bg-primary-foreground/10"
              )}
              aria-pressed={filter === f.value}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
