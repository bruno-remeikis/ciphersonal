"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { SearchBar, FilterType } from "@/components/search-bar"
import { TrendingSection } from "@/components/trending-section"
import { ResultsSection } from "@/components/results-section"
import { Footer } from "@/components/footer"

export function HomePage() {
  const [query, setQuery] = useState("")
  const [filter, setFilter] = useState<FilterType>("todos")

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <SearchBar
        query={query}
        onQueryChange={setQuery}
        filter={filter}
        onFilterChange={setFilter}
      />
      <div className="flex-1">
        {!query && <TrendingSection />}
        <ResultsSection query={query} filter={filter} />
      </div>
      <Footer />
    </div>
  )
}
